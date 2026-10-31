INSERT INTO instances(id,source_id,name,system_name,environment_group,owner) VALUES
 ('10000000-0000-4000-8000-000000000001','DEMO-1','Portal UAT','Customer Portal','UAT','Mira'),
 ('10000000-0000-4000-8000-000000000002','DEMO-2','Orders UAT','Order Service','UAT','Tane'),
 ('10000000-0000-4000-8000-000000000003','DEMO-3','Portal SIT','Customer Portal','SIT','Mira'),
 ('10000000-0000-4000-8000-000000000004','DEMO-4','Analytics PERF','Analytics','PERF','Unassigned') ON CONFLICT DO NOTHING;
INSERT INTO checks(id,instance_id,version,health,data_class,evidence,reviewer,valid_until,retention_until) VALUES
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','4.8.0','up','synthetic','DEMO: synthetic fixture and smoke report','Ravi',now()+interval '30 days',NULL),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','2.13.9','degraded','masked','DEMO: masking review and failed order check','Ravi',now()+interval '20 days',NULL),
 ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','4.7.2','up','personal','DEMO: old copy awaiting purge review','Mira',now()-interval '2 days',current_date-3) ON CONFLICT DO NOTHING;
INSERT INTO bookings(id,name,project,owner,purpose,starts_at,ends_at,status,confirmed_by,confirmed_at) VALUES
 ('30000000-0000-4000-8000-000000000001','November regression','Portal Refresh','Aroha','regression',current_date+interval '2 days 9 hours',current_date+interval '3 days 17 hours','confirmed','Mira',now()),
 ('30000000-0000-4000-8000-000000000002','Partner acceptance','Partner Launch','Leo','config-change',current_date+interval '3 days 9 hours',current_date+interval '4 days 17 hours','requested',NULL,NULL),
 ('30000000-0000-4000-8000-000000000003','Orders upgrade','Order Release','Leo','code-change',current_date-interval '1 day',current_date+interval '5 days','requested',NULL,NULL),
 ('30000000-0000-4000-8000-000000000004','Last release handover','Portal Refresh','Aroha','regression',current_date-interval '4 days',current_date-interval '2 days','confirmed','Mira',now()-interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO booking_instances(id,booking_id,instance_id,required_version) VALUES
 ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','4.8.0'),
 ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','4.8.0'),
 ('40000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','2.14.1'),
 ('40000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','4.8.0') ON CONFLICT DO NOTHING;
INSERT INTO issues(id,instance_id,name,owner,due_date,blocking) VALUES
 ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','Order callback fails after refresh','Tane',current_date-2,true),
 ('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','Review retained customer copy','Mira',current_date-4,true) ON CONFLICT DO NOTHING;
