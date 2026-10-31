CREATE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE FUNCTION immutable_record() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'This evidence is append-only'; END $$;
CREATE TABLE imports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), digest text NOT NULL UNIQUE, source text NOT NULL,
 row_count integer NOT NULL CHECK(row_count>0), original_csv text NOT NULL, actor text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE instances (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id text UNIQUE, name text NOT NULL CHECK(length(trim(name))>0),
 system_name text NOT NULL, environment_group text NOT NULL, owner text NOT NULL,
 lifecycle text NOT NULL DEFAULT 'active' CHECK(lifecycle IN ('active','retired')),
 import_id uuid REFERENCES imports(id), source_row jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX instances_name ON instances(lower(name));
CREATE TABLE checks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), instance_id uuid NOT NULL REFERENCES instances(id),
 version text NOT NULL CHECK(length(trim(version))>0), health text NOT NULL CHECK(health IN ('up','degraded','down','unknown')),
 data_class text NOT NULL CHECK(data_class IN ('synthetic','masked','personal','unknown')),
 evidence text NOT NULL CHECK(length(trim(evidence))>0), reviewer text NOT NULL CHECK(length(trim(reviewer))>0),
 valid_until timestamptz NOT NULL, retention_until date,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, project text NOT NULL, owner text NOT NULL,
 purpose text NOT NULL CHECK(purpose IN ('regression','code-change','config-change')),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL CHECK(ends_at>starts_at),
 status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','confirmed','completed','cancelled')),
 confirmed_by text, confirmed_at timestamptz, resolution text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(status<>'confirmed' OR (confirmed_by IS NOT NULL AND confirmed_at IS NOT NULL))
);
CREATE TABLE booking_instances (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), booking_id uuid NOT NULL REFERENCES bookings(id),
 instance_id uuid NOT NULL REFERENCES instances(id), required_version text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(booking_id,instance_id)
);
CREATE TABLE issues (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), instance_id uuid NOT NULL REFERENCES instances(id),
 name text NOT NULL, owner text NOT NULL, due_date date NOT NULL, blocking boolean NOT NULL DEFAULT true,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')), resolution text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(status<>'closed' OR length(trim(resolution))>0)
);
CREATE TABLE activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), action text NOT NULL, actor text NOT NULL, record_id uuid,
 details jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['imports','instances','checks','bookings','booking_instances','issues','activity'] LOOP
 EXECUTE format('CREATE TRIGGER touch BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated_at()',t);
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON %I FROM PUBLIC',t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['imports','checks','activity'] LOOP
 EXECUTE format('CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION immutable_record()',t);
 END LOOP;
END $$;
CREATE INDEX bookings_dates ON bookings(starts_at,ends_at);
CREATE INDEX booking_instance_lookup ON booking_instances(instance_id);
CREATE INDEX checks_latest ON checks(instance_id,created_at DESC);
CREATE VIEW latest_checks AS
 SELECT DISTINCT ON(instance_id) * FROM checks ORDER BY instance_id,created_at DESC,id DESC;
CREATE VIEW instance_readiness AS
 SELECT i.id,i.name,i.system_name,i.environment_group,i.owner,i.lifecycle,
 c.version,coalesce(c.health,'unknown') health,coalesce(c.data_class,'unknown') data_class,c.valid_until,c.retention_until,c.evidence,c.reviewer,
 (SELECT count(*)::integer FROM issues x WHERE x.instance_id=i.id AND x.status='open' AND x.blocking) blockers,
 CASE WHEN i.lifecycle<>'active' THEN 'retired'
 WHEN i.owner='' OR lower(i.owner)='unassigned' THEN 'owner missing'
 WHEN c.id IS NULL THEN 'evidence missing'
 WHEN c.valid_until<=now() THEN 'evidence expired'
 WHEN c.health<>'up' THEN 'health '||c.health
 WHEN c.data_class NOT IN ('synthetic','masked') THEN 'data review required'
 WHEN EXISTS(SELECT 1 FROM issues x WHERE x.instance_id=i.id AND x.status='open' AND x.blocking) THEN 'open blocker'
 ELSE 'ready' END readiness
 FROM instances i LEFT JOIN latest_checks c ON c.instance_id=i.id;
CREATE VIEW booking_conflicts AS
 SELECT a.id booking_a_id,a.name booking_a,b.id booking_b_id,b.name booking_b,i.id instance_id,i.name instance,
 greatest(a.starts_at,b.starts_at) overlap_start,least(a.ends_at,b.ends_at) overlap_end
 FROM bookings a JOIN booking_instances ar ON ar.booking_id=a.id
 JOIN booking_instances br ON br.instance_id=ar.instance_id
 JOIN bookings b ON b.id=br.booking_id AND a.id<b.id
 JOIN instances i ON i.id=ar.instance_id
 WHERE a.status IN ('requested','confirmed') AND b.status IN ('requested','confirmed')
 AND a.starts_at<b.ends_at AND b.starts_at<a.ends_at;
CREATE VIEW booking_readiness AS
 SELECT b.id booking_id,b.name booking,b.project,b.owner,b.status,b.starts_at,b.ends_at,
 i.id instance_id,i.name instance,r.required_version,i.version recorded_version,i.health,i.data_class,i.blockers,
 CASE WHEN i.readiness<>'ready' THEN i.readiness
 WHEN i.valid_until<b.ends_at THEN 'evidence expires before finish'
 WHEN i.version<>r.required_version THEN 'version drift'
 ELSE 'ready' END readiness
 FROM bookings b JOIN booking_instances r ON r.booking_id=b.id JOIN instance_readiness i ON i.id=r.instance_id;
CREATE VIEW compliance_findings AS
 SELECT id instance_id,name instance,'EVIDENCE' rule,'No current readiness evidence' finding FROM instance_readiness WHERE valid_until IS NULL OR valid_until<=now()
 UNION ALL SELECT id,name,'DATA-SAFETY','Test data classification needs review' FROM instance_readiness WHERE data_class IN ('personal','unknown')
 UNION ALL SELECT id,name,'RETENTION','Personal data retention review missing or due' FROM instance_readiness WHERE data_class='personal' AND (retention_until IS NULL OR retention_until<=current_date)
 UNION ALL SELECT id,name,'OWNER','Assign an accountable owner' FROM instance_readiness WHERE owner='' OR lower(owner)='unassigned';
CREATE VIEW overdue_work AS
 SELECT id,'issue' kind,name,owner,due_date::text due FROM issues WHERE status='open' AND due_date<current_date
 UNION ALL SELECT id,'booking',name,owner,starts_at::text FROM bookings WHERE status='requested' AND starts_at<now()
 UNION ALL SELECT id,'handover',name,owner,ends_at::text FROM bookings WHERE status='confirmed' AND ends_at<now();
