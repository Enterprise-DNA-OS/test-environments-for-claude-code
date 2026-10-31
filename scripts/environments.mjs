#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { parseCsv, pick } from './lib/csv.mjs';
import { table } from './lib/format.mjs';

export const reads = {
 instances:'SELECT name,system_name,environment_group,owner,health,version,readiness FROM instance_readiness ORDER BY name',
 bookings:'SELECT id,name,project,owner,purpose,starts_at,ends_at,status FROM bookings ORDER BY starts_at,name',
 conflicts:'SELECT instance,booking_a,booking_b,overlap_start,overlap_end FROM booking_conflicts ORDER BY overlap_start,instance',
 readiness:"SELECT booking,instance,required_version,recorded_version,readiness FROM booking_readiness WHERE status IN ('requested','confirmed') ORDER BY starts_at,instance",
 drift:"SELECT booking,instance,required_version,recorded_version FROM booking_readiness WHERE status IN ('requested','confirmed') AND (recorded_version IS NULL OR recorded_version<>required_version) ORDER BY booking,instance",
 overdue:'SELECT kind,name,owner,due FROM overdue_work ORDER BY due,name',
 compliance:'SELECT instance,rule,finding FROM compliance_findings ORDER BY instance,rule',
 issues:'SELECT x.id,i.name instance,x.name,x.owner,x.due_date,x.blocking,x.status,x.resolution FROM issues x JOIN instances i ON i.id=x.instance_id ORDER BY x.due_date,x.name',
 demand:"SELECT i.name instance,count(*)::integer open_bookings,count(*) FILTER(WHERE b.status='requested')::integer awaiting_confirmation FROM instances i JOIN booking_instances r ON r.instance_id=i.id JOIN bookings b ON b.id=r.booking_id WHERE b.status IN ('requested','confirmed') AND b.ends_at>now() GROUP BY i.name ORDER BY open_bookings DESC,i.name",
 idle:"SELECT i.name,i.environment_group,i.owner FROM instances i WHERE i.lifecycle='active' AND NOT EXISTS(SELECT 1 FROM booking_instances r JOIN bookings b ON b.id=r.booking_id WHERE r.instance_id=i.id AND b.status IN ('requested','confirmed') AND b.ends_at>now() AND b.starts_at<now()+interval '30 days') ORDER BY i.name",
 activity:'SELECT action,actor,record_id,details,created_at FROM activity ORDER BY created_at,id',
};
const options={
 help:[], ...Object.fromEntries(Object.keys(reads).map(k=>[k,[]])),
 booking:['booking'], available:['start','end'],
 'add-instance':['name','system','group','owner','actor'],
 book:['name','project','owner','purpose','start','end','resources','actor'],
 check:['instance','version','health','data','evidence','until','retention','actor'],
 'log-issue':['instance','name','owner','due','blocking','actor'],
 'close-issue':['issue','resolution','actor'],confirm:['booking','actor'],
 'close-booking':['booking','status','resolution','actor'],
 import:['file','dry-run','actor'],export:['out'],
 'weekly-review':[], 'draft-handover':['booking']
};
export const commands=Object.keys(options);
export function parse(args){
 const positional=[],o={};for(let i=0;i<args.length;i++){const a=args[i];if(a.startsWith('--')){const eq=a.indexOf('=');const k=a.slice(2,eq<0?undefined:eq);if(k in o)throw Error('Repeated option: '+k);o[k]=eq<0?true:a.slice(eq+1);}else positional.push(a);}
 const c=positional[0]||'help';if(!(c in options))throw Error('Unknown command: '+c);
 if(positional.length>(c==='import'?2:1))throw Error('Unexpected positional arguments');
 if(c==='import'&&positional[1]!=='enov8')throw Error('Use import enov8 --file=<instances.csv>');
 for(const k of Object.keys(o))if(![...options[c],'json'].includes(k))throw Error('Unknown option: --'+k);
 for(const k of ['json','dry-run'])if(k in o&&o[k]!==true)throw Error('--'+k+' is a boolean switch');
 return {c,o};
}
function req(o,k){if(typeof o[k]!=='string'||!o[k].trim())throw Error('Required: --'+k+'=<value>');return o[k].trim();}
function stamp(s){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(s)||!Number.isFinite(Date.parse(s))||!validDate(s.slice(0,10)))throw Error('Use a real ISO timestamp with timezone: '+s);return new Date(s).toISOString();}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function date(s){if(!validDate(s))throw Error('Use a real YYYY-MM-DD date');return s;}
function range(o){const start=stamp(req(o,'start')),end=stamp(req(o,'end'));if(end<=start)throw Error('End must be after start');return [start,end];}
const choose=(s,values)=>{if(!values.includes(s))throw Error('Expected '+values.join(', '));return s;};
export async function resolve(db,kind,value){
 if(!['instances','bookings','issues'].includes(kind))throw Error('Invalid lookup');
 let rows=await db.query(`SELECT id,name FROM ${kind} WHERE lower(name)=lower($1) OR id::text=$1 ORDER BY name,id`,[value]);
 if(!rows.length)rows=await db.query(`SELECT id,name FROM ${kind} WHERE position(lower($1) in lower(name))>0 OR id::text LIKE $2 ORDER BY name,id`,[value,value+'%']);
 if(rows.length!==1)throw Error((rows.length?'Ambiguous':'No match')+' '+kind+': '+value+'\n'+rows.map(r=>r.id+' '+r.name).join('\n'));
 return rows[0].id;
}
async function audit(db,action,actor,id,details){await db.query('INSERT INTO activity(action,actor,record_id,details) VALUES($1,$2,$3,$4)',[action,actor,id,JSON.stringify(details)]);}
async function tx(db,fn){await db.exec('BEGIN');try{const out=await fn();await db.exec('COMMIT');return out;}catch(e){await db.exec('ROLLBACK');throw e;}}
function writePrivate(file,text){file=path.resolve(file);fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,text,{mode:0o600,flag:'wx'});return file;}
function draft(name,body){return {file:writePrivate(path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',`${name}-${Date.now()}-${randomUUID().slice(0,8)}.md`),body)};}
function display(rows){if(!rows.length)return '(none)';return table(rows,Object.keys(rows[0]).map(key=>({key,label:key,format:v=>v instanceof Date?v.toISOString():v!==null&&typeof v==='object'?JSON.stringify(v):v})));}
export async function run(db,args){
 const {c,o}=parse(args);
 if(c==='help')return Object.entries(options).map(([command,flags])=>({command,options:flags.map(f=>'--'+f).join(' ')}));
 if(c in reads)return db.query(reads[c]);
 if(c==='booking'){const id=await resolve(db,'bookings',req(o,'booking'));return {booking:(await db.query('SELECT * FROM bookings WHERE id=$1',[id]))[0],readiness:await db.query('SELECT * FROM booking_readiness WHERE booking_id=$1',[id]),conflicts:await db.query('SELECT * FROM booking_conflicts WHERE booking_a_id=$1 OR booking_b_id=$1',[id])};}
 if(c==='available'){const [s,e]=range(o);return db.query("SELECT i.name,i.environment_group,i.version FROM instance_readiness i WHERE i.readiness='ready' AND i.valid_until>=$2 AND NOT EXISTS(SELECT 1 FROM booking_instances r JOIN bookings b ON b.id=r.booking_id WHERE r.instance_id=i.id AND b.status IN ('requested','confirmed') AND b.starts_at<$2 AND b.ends_at>$1) ORDER BY i.name",[s,e]);}
 if(c==='export'){
 const payload={format:'test-environments-v1',exported_at:new Date().toISOString(),records:{}};
 await db.exec('BEGIN READ ONLY');try{for(const t of ['imports','instances','checks','bookings','booking_instances','issues','activity'])payload.records[t]=await db.query(`SELECT * FROM ${t} ORDER BY id`);}finally{await db.exec('ROLLBACK');}
 return {file:writePrivate(req(o,'out'),JSON.stringify(payload,null,2)+'\n'),counts:Object.fromEntries(Object.entries(payload.records).map(([k,v])=>[k,v.length]))};
 }
 if(c==='weekly-review'){const sections=[];for(const k of ['readiness','conflicts','overdue'])sections.push('## '+k+'\n\n'+display(await db.query(reads[k])));return draft('weekly-review','# Weekly environment review\n\nRecorded evidence, not a live health probe.\n\n'+sections.join('\n\n')+'\n');}
 if(c==='draft-handover'){const result=await run(db,['booking','--booking='+req(o,'booking')]);return draft('handover','# Environment handover draft\n\n'+result.booking.name+'\n\n'+display(result.readiness)+'\n\nConflicts\n'+display(result.conflicts)+'\n\nOperator must record test results, reset work and the next owner before closing. Nothing is sent.\n');}
 const actor=req(o,'actor');
 if(c==='import'){
 const raw=fs.readFileSync(req(o,'file'),'utf8'),rows=parseCsv(raw);if(!rows.length)throw Error('CSV contains no records');
 const seen=new Set();const records=rows.map((r,n)=>{
 const value=(...keys)=>pick(r,...keys).trim();const source_id=value('System ID'),name=value('Resource Name'),system=value('System'),group=value('Environment Group');
 if(!source_id||!name||!system||!group)throw Error(`Row ${n+2}: System ID, Resource Name, System, Environment Group are required`);
 if(seen.has(source_id)||seen.has('name:'+name.toLowerCase()))throw Error('Duplicate source ID or resource name in import');seen.add(source_id);seen.add('name:'+name.toLowerCase());
 return {source_id,name,system,group,owner:value('Assigned To')||'Unassigned',row:r};});
 const digest=createHash('sha256').update(raw).digest('hex');
 return tx(db,async()=>{
 await db.exec('LOCK TABLE instances IN SHARE ROW EXCLUSIVE MODE');
 const existing=await db.query('SELECT id,row_count FROM imports WHERE digest=$1',[digest]);if(existing.length)return {already_imported:true,rows:existing[0].row_count};
 for(const r of records){const conflicts=await db.query('SELECT name FROM instances WHERE source_id=$1 OR lower(name)=lower($2)',[r.source_id,r.name]);if(conflicts.length)throw Error('Existing record would be overwritten: '+r.name+'; reconcile it before importing');}
 if(o['dry-run'])return {dry_run:true,rows:records.length,readiness:'Local evidence required for every imported instance'};
 const [batch]=await db.query('INSERT INTO imports(digest,source,row_count,original_csv,actor) VALUES($1,$2,$3,$4,$5) RETURNING id',[digest,'Enov8 environment instance CSV',records.length,raw,actor]);
 for(const r of records)await db.query('INSERT INTO instances(source_id,name,system_name,environment_group,owner,import_id,source_row) VALUES($1,$2,$3,$4,$5,$6,$7)',[r.source_id,r.name,r.system,r.group,r.owner,batch.id,JSON.stringify(r.row)]);
 await audit(db,c,actor,batch.id,{rows:records.length,digest});return {imported:records.length,id:batch.id};
 });
 }
 return tx(db,async()=>{
 let result;
 if(c==='add-instance'){
 [result]=await db.query('INSERT INTO instances(name,system_name,environment_group,owner) VALUES($1,$2,$3,$4) RETURNING *',[req(o,'name'),req(o,'system'),req(o,'group'),req(o,'owner')]);
 }else if(c==='book'){
 const [s,e]=range(o);const resources=JSON.parse(req(o,'resources'));if(!Array.isArray(resources)||!resources.length)throw Error('Resources must be a nonempty JSON array of {instance,version}');
 const refs=[];for(const r of resources){if(!r||typeof r.instance!=='string'||typeof r.version!=='string'||!r.version.trim())throw Error('Each resource needs instance and version');refs.push({id:await resolve(db,'instances',r.instance),version:r.version.trim()});}
 if(new Set(refs.map(r=>r.id)).size!==refs.length)throw Error('Duplicate instance in booking');
 [result]=await db.query('INSERT INTO bookings(name,project,owner,purpose,starts_at,ends_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[req(o,'name'),req(o,'project'),req(o,'owner'),choose(req(o,'purpose'),['regression','code-change','config-change']),s,e]);
 for(const r of refs)await db.query('INSERT INTO booking_instances(booking_id,instance_id,required_version) VALUES($1,$2,$3)',[result.id,r.id,r.version]);
 }else if(c==='check'){
 const id=await resolve(db,'instances',req(o,'instance'));await db.query('SELECT id FROM instances WHERE id=$1 FOR UPDATE',[id]);
 const until=stamp(req(o,'until'));if(Date.parse(until)<=Date.now())throw Error('Evidence expiry must be in the future');
 [result]=await db.query('INSERT INTO checks(instance_id,version,health,data_class,evidence,reviewer,valid_until,retention_until) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[id,req(o,'version'),choose(req(o,'health'),['up','degraded','down','unknown']),choose(req(o,'data'),['synthetic','masked','personal','unknown']),req(o,'evidence'),actor,until,o.retention?date(req(o,'retention')):null]);
 }else if(c==='log-issue'){
 const id=await resolve(db,'instances',req(o,'instance'));await db.query('SELECT id FROM instances WHERE id=$1 FOR UPDATE',[id]);
 [result]=await db.query('INSERT INTO issues(instance_id,name,owner,due_date,blocking) VALUES($1,$2,$3,$4,$5) RETURNING *',[id,req(o,'name'),req(o,'owner'),date(req(o,'due')),o.blocking?choose(req(o,'blocking'),['yes','no'])==='yes':true]);
 }else if(c==='close-issue'){
 const id=await resolve(db,'issues',req(o,'issue'));[result]=await db.query("UPDATE issues SET status='closed',resolution=$2 WHERE id=$1 AND status='open' RETURNING *",[id,req(o,'resolution')]);if(!result)throw Error('Issue is already closed');
 }else if(c==='confirm'){
 const id=await resolve(db,'bookings',req(o,'booking'));const [b]=await db.query('SELECT * FROM bookings WHERE id=$1 FOR UPDATE',[id]);
 if(b.status!=='requested')throw Error('Only requested bookings can be confirmed');if(new Date(b.ends_at)<=new Date())throw Error('Booking has already ended');
 const links=await db.query('SELECT instance_id FROM booking_instances WHERE booking_id=$1 ORDER BY instance_id',[id]);if(!links.length)throw Error('Booking has no instances');
 for(const r of links)await db.query('SELECT id FROM instances WHERE id=$1 FOR UPDATE',[r.instance_id]);
 const bad=await db.query("SELECT instance,readiness FROM booking_readiness WHERE booking_id=$1 AND readiness<>'ready'",[id]);if(bad.length)throw Error('Readiness failed:\n'+display(bad));
 const clashes=await db.query("SELECT DISTINCT b.name FROM bookings b JOIN booking_instances r ON r.booking_id=b.id WHERE b.id<>$1 AND b.status='confirmed' AND b.starts_at<$3 AND b.ends_at>$2 AND r.instance_id IN(SELECT instance_id FROM booking_instances WHERE booking_id=$1)",[id,b.starts_at,b.ends_at]);if(clashes.length)throw Error('Confirmed booking conflict:\n'+display(clashes));
 [result]=await db.query("UPDATE bookings SET status='confirmed',confirmed_by=$2,confirmed_at=now() WHERE id=$1 RETURNING *",[id,actor]);
 }else if(c==='close-booking'){
 const id=await resolve(db,'bookings',req(o,'booking')),status=choose(req(o,'status'),['completed','cancelled']);const [b]=await db.query('SELECT * FROM bookings WHERE id=$1 FOR UPDATE',[id]);
 if(!['requested','confirmed'].includes(b.status)||(status==='completed'&&b.status!=='confirmed'))throw Error('Invalid booking transition');
 [result]=await db.query('UPDATE bookings SET status=$2,resolution=$3 WHERE id=$1 RETURNING *',[id,status,req(o,'resolution')]);
 }else throw Error('No handler for '+c);
 await audit(db,c,actor,result.id,result);return result;
 });
}
export async function main(args=process.argv.slice(2)){
 let db;try{const {o}=parse(args);db=await getDb();const result=await run(db,args);console.log(o.json?JSON.stringify(result,null,2):Array.isArray(result)?display(result):JSON.stringify(result,null,2));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await main();
