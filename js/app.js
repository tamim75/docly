(function(){
'use strict';
/* ================= Data ================= */
const CFG = window.DOCLY_CONFIG || {};
const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
const TODAY = LIVE ? new Date() : new Date(2026, 8, 9, 12); // demo mode pins "today" to 9 Sep 2026 so the sample data reads right
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pd = s => { const [y,m,d] = String(s).split('-').map(Number); return new Date(y, (m||1)-1, d||1); };
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const dm = s => { const d = pd(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };
const dmy = s => { const d = pd(s); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const my = s => { const d = pd(s); return `${MON[d.getMonth()]} ${d.getFullYear()}`; };
const dd = s => String(pd(s).getDate()).padStart(2,'0');
const mon = s => MON[pd(s).getMonth()].toUpperCase();
const days = s => Math.round((pd(s) - new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()))/864e5);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const taka = n => n == null || n === '' ? 'Not added' : '৳' + Number(n).toLocaleString('en-US');
const plural = (n, w, p) => `${n} ${n === 1 ? w : (p || w + 's')}`;
const uid = p => p + Math.random().toString(36).slice(2, 8);

function seed(){
  return {
    v: 3, signedIn: false, email: 'rafi@example.com', active: 'p1',
    profiles: [
      { id:'p1', name:'Rafi Ahmed', short:'Rafi', rel:'you', tone:'teal', blood:'B+', age:34 },
      { id:'p2', name:'Amina Ahmed', short:'Amina', rel:'mother', tone:'sky', blood:'O+', age:61 },
      { id:'p3', name:'Tahmid Ahmed', short:'Tahmid', rel:'son', tone:'ink', blood:'', age:8 },
    ],
    doctors: [
      { id:'d1', pid:'p1', name:'Dr. Rafiqul Haque', spec:'Cardiologist', tone:'teal', links:['Website','YouTube','Square Hospital'],
        chambers:[{name:'Square Hospital', info:'Panthapath · Sat–Wed, 6–8 PM'},{name:'Popular Diagnostic', info:'Dhanmondi · Fri, 4–6 PM'}] },
      { id:'d2', pid:'p1', name:'Dr. Shirin Akhter', spec:'Dermatologist', tone:'sky', links:['Labaid Hospital'], chambers:[{name:'Labaid Hospital', info:'Dhanmondi · Sun–Thu, 5–8 PM'}] },
      { id:'d3', pid:'p1', name:'Dr. Masud Iqbal', spec:'General physician', tone:'ink', links:[], chambers:[{name:'City Care Clinic', info:'Mirpur 10 · Daily, 7–10 PM'}] },
      { id:'d4', pid:'p1', name:'Dr. Nasrin Chowdhury', spec:'Endocrinologist', tone:'teal', links:['Website'], chambers:[{name:'Popular Diagnostic', info:'Dhanmondi · Sat, Mon, 3–6 PM'}] },
      { id:'d5', pid:'p2', name:'Dr. Kamal Hossain', spec:'Rheumatologist', tone:'ink', links:[], chambers:[{name:'Ibn Sina Hospital', info:'Dhanmondi · Sun–Wed, 5–7 PM'}] },
      { id:'d6', pid:'p2', name:'Dr. Farhana Islam', spec:'Ophthalmologist', tone:'sky', links:[], chambers:[{name:'Ispahani Islamia Eye', info:'Farmgate · Sat–Thu, 4–7 PM'}] },
      { id:'d7', pid:'p2', name:'Dr. Rafiqul Haque', spec:'Cardiologist', tone:'teal', links:[], chambers:[{name:'Square Hospital', info:'Panthapath · Sat–Wed, 6–8 PM'}] },
      { id:'d8', pid:'p3', name:'Dr. Selina Parvin', spec:'Paediatrician', tone:'sky', links:[], chambers:[{name:'Evercare Hospital', info:'Bashundhara · Sat–Thu, 10 AM–1 PM'}] },
    ],
    visits: [
      { id:'v1', pid:'p1', doc:'d1', date:'2026-08-12', time:'18:40', chamber:'Square Hospital', reason:'Follow-up, BP check', cond:'Hypertension', cost:800, follow:'2026-09-12',
        said:'BP still a bit high, 140/90. Reduce salt, continue Amlodipine 5mg. Come back in one month with the lipid profile.', short:'BP still high · continue Amlodipine', pages:[{},{}] },
      { id:'v2', pid:'p1', doc:'d2', date:'2026-07-03', time:'19:15', chamber:'Labaid Hospital', reason:'Rash review', cond:'Skin allergy', cost:1000, follow:'',
        said:'Skin is clear now. Stop the cream. Come back only if the rash returns.', short:'Skin clear · stop the cream', pages:[{}] },
      { id:'v3', pid:'p1', doc:'d3', date:'2026-06-19', time:'20:10', chamber:'City Care Clinic', reason:'Fever and sore throat', cond:'', cost:500, follow:'',
        said:'Throat infection. Amoxicillin for 7 days, plenty of fluids. Do a CBC.', short:'Throat infection · 7 days Amoxicillin', pages:[{}] },
      { id:'v4', pid:'p1', doc:'d1', date:'2026-06-14', time:'18:20', chamber:'Square Hospital', reason:'Started Amlodipine', cond:'Hypertension', cost:800, follow:'',
        said:'BP 150/95 on two readings. Start Amlodipine 5mg once daily after breakfast. Walk 30 minutes a day.', short:'BP 150/95 · start Amlodipine', pages:[{},{}] },
      { id:'v5', pid:'p1', doc:'d4', date:'2026-04-02', time:'16:00', chamber:'Popular Diagnostic', reason:'Thyroid and sugar check', cond:'Thyroid', cost:1200, follow:'2026-08-28',
        said:'TSH slightly high. Started Metformin, recheck in 3 months.', short:'TSH slightly high · recheck TSH', pages:[{},{}] },
      { id:'v6', pid:'p1', doc:'d1', date:'2026-03-10', time:'17:30', chamber:'Popular Diagnostic', reason:'First visit, chest pain', cond:'Hypertension', cost:1000, follow:'',
        said:'Chest pain is not from the heart. ECG is normal. BP is borderline, keep a log for two months.', short:'ECG normal · log BP', pages:[{}] },
      { id:'v7', pid:'p2', doc:'d5', date:'2026-08-20', time:'17:00', chamber:'Ibn Sina Hospital', reason:'Knee pain', cond:'Osteoarthritis', cost:1000, follow:'2026-10-20',
        said:'Early osteoarthritis in both knees. Physiotherapy twice a week. X-ray report looks fine.', short:'Physiotherapy twice a week', pages:[{}] },
      { id:'v8', pid:'p2', doc:'d6', date:'2026-07-11', time:'18:00', chamber:'Ispahani Islamia Eye', reason:'Blurred vision', cond:'Cataract', cost:700, follow:'', said:'Early cataract in the left eye. No surgery yet. Check again in 6 months.', short:'Early cataract · recheck in 6 months', pages:[{}] },
      { id:'v9', pid:'p2', doc:'d7', date:'2026-05-02', time:'19:00', chamber:'Square Hospital', reason:'BP check', cond:'Hypertension', cost:800, follow:'', said:'BP is under control. Continue Losartan 50mg.', short:'BP controlled · continue Losartan', pages:[{}] },
      { id:'v10', pid:'p3', doc:'d8', date:'2026-08-30', time:'11:00', chamber:'Evercare Hospital', reason:'Vaccination', cond:'', cost:1500, follow:'', said:'Typhoid booster given. Next vaccine at age 9.', short:'Typhoid booster given', pages:[{}] },
    ],
    tests: [
      { id:'t1', pid:'p1', name:'Lipid profile', doc:'d1', visit:'v1', status:'advised', date:'2026-09-15', venue:'Popular Diagnostic', cost:null, report:null },
      { id:'t2', pid:'p1', name:'ECG', doc:'d1', visit:'v1', status:'done', date:'2026-08-12', venue:'Square Hospital', cost:600, report:null },
      { id:'t3', pid:'p1', name:'CBC', doc:'d3', visit:'v3', status:'attached', date:'2026-06-19', venue:'City Care Clinic', cost:400, report:{name:'CBC report.pdf'} },
      { id:'t4', pid:'p1', name:'TSH', doc:'d4', visit:'v5', status:'attached', date:'2026-04-02', venue:'Popular Diagnostic', cost:900, report:{name:'TSH report.pdf'} },
      { id:'t5', pid:'p2', name:'Knee X-ray', doc:'d5', visit:'v7', status:'attached', date:'2026-08-20', venue:'Ibn Sina Hospital', cost:800, report:{name:'Knee X-ray.pdf'} },
      { id:'t6', pid:'p2', name:'Vitamin D', doc:'d5', visit:'v7', status:'advised', date:'2026-09-20', venue:'Ibn Sina Hospital', cost:null, report:null },
    ],
    meds: [
      { id:'m1', pid:'p1', name:'Amlodipine 5mg', dose:'Once daily, after breakfast', freq:'Once daily', doc:'d1', since:'2026-06-14', visit:'v4', status:'current' },
      { id:'m2', pid:'p1', name:'Metformin 500mg', dose:'Twice daily, with meals', freq:'Twice daily', doc:'d4', since:'2026-04-02', visit:'v5', status:'current' },
      { id:'m3', pid:'p1', name:'Amoxicillin 500mg', dose:'3 times daily, 7 days', freq:'3 times daily', doc:'d3', since:'2026-06-19', until:'2026-06-26', visit:'v3', status:'stopped' },
      { id:'m4', pid:'p2', name:'Losartan 50mg', dose:'Once daily, at night', freq:'Once daily', doc:'d7', since:'2026-05-02', visit:'v9', status:'current' },
    ],
    conds: [
      { id:'c1', pid:'p1', name:'Hypertension', status:'active', since:'2026-03-10' },
      { id:'c2', pid:'p1', name:'Thyroid', full:'Thyroid (Hypothyroidism)', status:'active', since:'2026-04-02' },
      { id:'c3', pid:'p1', name:'Skin allergy', status:'resolved', since:'2026-06-01', until:'2026-07-03' },
      { id:'c4', pid:'p2', name:'Osteoarthritis', status:'active', since:'2026-08-20' },
      { id:'c5', pid:'p2', name:'Cataract', status:'active', since:'2026-07-11' },
      { id:'c6', pid:'p2', name:'Hypertension', status:'active', since:'2026-05-02' },
    ],
    activity: [
      { day:'2026-09-09', icon:'note_add', text:'Added visit · Dr. Rafiqul Haque', who:'Rafi', time:'2:14 PM', href:'visit-v1' },
      { day:'2026-09-09', icon:'photo_camera', text:'Attached report to CBC', who:'Amina', time:'11:02 AM', href:'test-t3' },
      { day:'2026-09-08', icon:'arrow_forward', text:'Shared summary · all doctors', who:'Rafi', time:'6:40 PM · expires in 18h', href:'share' },
      { day:'2026-09-08', icon:'science', text:'Lipid profile set to Advised', who:'Rafi', time:'6:38 PM', href:'test-t1' },
      { day:'2026-09-07', icon:'group', text:'Added profile Tahmid (son)', who:'Rafi', time:'9:15 AM', href:'profiles' },
      { day:'2026-09-07', icon:'medical_services', text:'Added Dr. Nasrin Chowdhury', who:'Amina', time:'9:02 AM', href:'doctor-d4' },
    ],
    shares: [ { id:'s1', scope:'All doctors', created:'Created yesterday', exp:'expires in 18h', code:'8f2k91' } ],
  };
}
const KEY = 'docly-proto-v3';
const lsGet = k => { try { return localStorage.getItem(k); } catch(e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} };
function emptyState(){ return { v:3, live:true, signedIn:false, loading:true, isAdmin:false, email:'', active: lsGet('docly-active') || '', profiles:[], doctors:[], visits:[], tests:[], meds:[], conds:[], activity:[], shares:[] }; }
let S;
if (LIVE) S = emptyState();
else { try { S = JSON.parse(lsGet(KEY) || 'null'); } catch(e) { S = null; } if (!S || S.v !== 3) S = seed(); }
function save(){ if (LIVE) { lsSet('docly-active', S.active || ''); return; } try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) { /* storage full or blocked: keep in memory */ } }

/* UI state (not persisted) */
const U = { sheet:null, toast:null, otpErr:'', tries:3, expired:false, resendAt:0, authMode:'signin', emailErr:'', testFilter:'all', testQuery:'', medFilter:'current',
  viewerPage:0, draft:null, confirmDelete:false, shareScope:'all', shareDoc:'', newLink:null, revoke:null, newDoc:false, formErr:{}, busy:false,
  shared:null, admin:{ tab:'overview', q:'' }, adminRec:{}, adminFiles:{}, accessLog:null, confirmAdminDelete:null };

/* Selectors scoped to active profile */
const prof = () => S.profiles.find(p => p.id === S.active) || S.profiles[0] || { id:'', name:'', short:'', rel:'you', tone:'teal' };
const mine = arr => arr.filter(x => x.pid === S.active);
const docs = () => mine(S.doctors);
const visits = () => mine(S.visits).sort((a,b) => b.date.localeCompare(a.date));
const tests = () => mine(S.tests);
const meds = () => mine(S.meds);
const conds = () => mine(S.conds);
const doc = id => S.doctors.find(d => d.id === id);
const visit = id => S.visits.find(v => v.id === id);
const test = id => S.tests.find(t => t.id === id);
const docVisits = id => visits().filter(v => v.doc === id);
const pendingTests = () => tests().filter(t => t.status !== 'attached');
const recordCount = () => { const vs = visits(); return vs.length + vs.reduce((n,v) => n + (v.pages||[]).length, 0) + tests().length + tests().filter(t => t.report).length + meds().length; };
const lastAdded = () => { const v = visits()[0]; return v ? dm(v.date) : ''; };
function followUps(){
  // latest visit per doctor that has a follow-up date
  const seen = {}, out = [];
  visits().forEach(v => { if (seen[v.doc]) return; seen[v.doc] = 1; if (v.follow) out.push(v); });
  return out.sort((a,b) => a.follow.localeCompare(b.follow));
}
function testStatus(t){
  if (t.status === 'attached') return { label:'Attached', tone:'teal' };
  if (t.status === 'done') return { label:'Done', tone:'grey' };
  return { label:'Advised', tone:'blue' };
}
function greeting(){ const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

/* ================= Data layer: Supabase when configured, this browser otherwise ================= */
let sb = null, USER = null;
const TONES = ['teal','sky','ink'];
const firstName = n => String(n || '').trim().split(/\s+/)[0] || '';
const ageFrom = dob => { if (!dob) return null; const b = pd(dob), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };
const shortOf = (said, reason) => said ? said.split(/[.,]/)[0].slice(0, 48) : (reason || 'Visit');
const isoOf = ts => iso(new Date(ts));
function relTime(ts){ const m = Math.round((Date.now() - new Date(ts)) / 6e4); if (m < 2) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + 'h ago'; return dm(isoOf(ts)); }
function friendly(err){ const m = (err && (err.message || err.error_description || String(err))) || 'Something went wrong'; if (/network|fetch/i.test(m)) return 'No connection. Check your internet and try again.'; return m; }
async function must(q){ const { data, error } = await q; if (error) throw error; return data; }

const MAP = {
  profile: r => ({ id:r.id, name:r.name, short:firstName(r.name), rel:r.rel || 'you', tone:r.tone || 'teal', blood:r.blood || '', dob:r.dob || '', age:ageFrom(r.dob) }),
  doctor: r => ({ id:r.id, pid:r.profile_id, name:r.name, spec:r.spec || 'Doctor', tone:r.tone || 'teal', links:r.links || [], chambers:r.chambers || [] }),
  page: (r, urls) => ({ id:r.id, path:r.path, kind:r.kind, name:r.name, url:urls[r.path] || '', img: r.kind === 'image' ? (urls[r.path] || '') : undefined, pdf: r.kind === 'pdf' ? (r.name || 'Document.pdf') : undefined, position:r.position }),
  visit: (r, pages) => ({ id:r.id, pid:r.profile_id, doc:r.doctor_id, date:r.date, time:(r.time || '').slice(0,5), chamber:r.chamber || '', reason:r.reason || '', cond:r.cond || '', cost:r.cost, follow:r.follow || '', said:r.said || '', short:shortOf(r.said, r.reason), pages }),
  test: (r, urls) => ({ id:r.id, pid:r.profile_id, name:r.name, doc:r.doctor_id || '', visit:r.visit_id || '', status:r.status, date:r.date || isoOf(r.created_at), venue:r.venue || '', cost:r.cost,
    report: r.report_path ? { name:r.report_name || 'Report', path:r.report_path, kind:r.report_kind, url:urls[r.report_path] || '', img: r.report_kind === 'image' ? (urls[r.report_path] || '') : undefined } : null }),
  med: r => ({ id:r.id, pid:r.profile_id, name:r.name, dose:r.dose || 'Not added', freq:(r.dose || '').split(',')[0], doc:r.doctor_id || '', visit:r.visit_id || '', since:r.since || isoOf(r.created_at), until:r.until || '', status:r.status }),
  cond: r => ({ id:r.id, pid:r.profile_id, name:r.name, full:r.full_name || '', status:r.status, since:r.since || isoOf(r.created_at), until:r.until || '' }),
  act: r => ({ id:r.id, day:isoOf(r.created_at), icon:r.icon, text:r.text, who:r.who || '', time:new Date(r.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}), href:r.href || '' }),
  share: r => { const d = S.doctors.find(x => x.id === r.doctor_id); const h = Math.max(0, Math.round((new Date(r.expires_at) - Date.now()) / 36e5));
    return { id:r.id, pid:r.profile_id, scope: d ? d.name : 'All doctors', created:'Created ' + relTime(r.created_at), exp: h ? 'expires in ' + h + 'h' : 'expires soon', code:r.token, token:r.token }; },
};
async function signUrls(paths){
  const out = {}; const list = paths.filter(Boolean); if (!list.length) return out;
  for (let i = 0; i < list.length; i += 100) {
    const { data } = await sb.storage.from('records').createSignedUrls(list.slice(i, i + 100), 60 * 60 * 6);
    (data || []).forEach(x => { if (x.signedUrl) out[x.path] = x.signedUrl; });
  }
  return out;
}
async function toBlob(fd){ if (fd.file && !fd.img) return fd.file; const r = await fetch(fd.img); return r.blob(); }
async function upload(fd){
  const isImg = !!fd.img, ext = isImg ? 'jpg' : ((fd.pdf || '').split('.').pop() || 'pdf').toLowerCase();
  const path = `${USER.id}/${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2)}.${ext}`;
  const blob = await toBlob(fd);
  const { error } = await sb.storage.from('records').upload(path, blob, { contentType: isImg ? 'image/jpeg' : (fd.file && fd.file.type) || 'application/pdf', upsert:false });
  if (error) throw error;
  const urls = await signUrls([path]);
  return { path, kind: isImg ? 'image' : 'pdf', name: isImg ? (fd.name || 'Photo.jpg') : fd.pdf, url: urls[path] || '' };
}

function client(){ if (!sb) sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:'implicit' } }); return sb; }
const API = {
  async boot(){
    client();
    const fromLink = /(^|&)(access_token|error)=/.test(CUR || '');
    const linkErr = fromLink && /(^|&)error=/.test(CUR) ? (new URLSearchParams(CUR).get('error_description') || 'That sign-in link is no longer valid.') : '';
    const { data } = await sb.auth.getSession();
    if (fromLink) { CUR = ''; STACK.length = 0; STACK.push(''); try { history.replaceState(null, '', location.pathname + location.search); } catch(e) {} }
    if (linkErr) U.toast = linkErr.replace(/\+/g, ' ').replace(/\.?$/, '.') + ' Ask for a new code.';
    if (data && data.session) { USER = data.session.user; S.email = USER.email; S.signedIn = true; try { await API.loadAll(); } catch(e) { U.toast = 'Could not load your records. ' + friendly(e); } }
    S.loading = false;
    sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT' && S.signedIn) { S = emptyState(); S.loading = false; render(true); } });
  },
  async loadAll(){
    const all = t => must(sb.from(t).select('*').order('created_at', { ascending:true }).limit(5000));
    const [p, d, v, vp, t, m, c, a, sh] = await Promise.all(['profiles','doctors','visits','visit_pages','tests','meds','conditions','activity','shares'].map(all));
    const urls = await signUrls([...vp.map(x => x.path), ...t.map(x => x.report_path)]);
    S.profiles = p.map(MAP.profile); S.doctors = d.map(MAP.doctor);
    S.visits = v.map(r => MAP.visit(r, vp.filter(x => x.visit_id === r.id).sort((a,b) => a.position - b.position).map(x => MAP.page(x, urls))));
    S.tests = t.map(r => MAP.test(r, urls)); S.meds = m.map(MAP.med); S.conds = c.map(MAP.cond);
    S.activity = a.slice().reverse().slice(0, 200).map(MAP.act);
    S.shares = sh.filter(x => !x.revoked && new Date(x.expires_at) > new Date()).reverse().map(MAP.share);
    if (!S.profiles.find(x => x.id === S.active)) S.active = (S.profiles.find(x => x.rel === 'you') || S.profiles[0] || {}).id || '';
    try { S.isAdmin = (await sb.rpc('is_admin')).data === true; } catch(e) { S.isAdmin = false; }
    save();
  },
  async sendCode(email){ if (!LIVE) return; const { error } = await sb.auth.signInWithOtp({ email, options:{ shouldCreateUser:true, emailRedirectTo: location.origin + location.pathname } }); if (error) throw error; },
  async verify(email, code){
    if (!LIVE) return true;
    const { data, error } = await sb.auth.verifyOtp({ email, token:code, type:'email' });
    if (error) throw error;
    USER = data.user; S.email = USER.email; return true;
  },
  async signInPassword(email, password){
    if (!LIVE) { if (!S.hasPass) throw new Error('Invalid login credentials'); return true; }
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    USER = data.user; S.email = USER.email; return true;
  },
  async setPassword(password){
    if (!LIVE) { S.hasPass = true; save(); return; }
    const { data, error } = await sb.auth.updateUser({ password, data:{ has_password:true } });
    if (error) throw error;
    if (data && data.user) USER = data.user;
  },
  async signOut(){ if (LIVE) await sb.auth.signOut(); },
  log(icon, text, href){
    const who = (S.profiles.find(x => x.rel === 'you') || prof()).short;
    S.activity.unshift({ day: iso(new Date(LIVE ? Date.now() : TODAY)), icon, text, who, time: new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}), href });
    if (LIVE) sb.from('activity').insert({ profile_id: S.active || null, icon, text, href, who }).then(() => {});
  },
  async createProfile(f){
    if (!LIVE) { const p = { id: uid('p'), name:f.name, short:firstName(f.name), rel:f.rel, tone:TONES[S.profiles.length % 3], blood:f.blood || '', age:ageFrom(f.dob), dob:f.dob || '' }; S.profiles.push(p); return p; }
    const r = await must(sb.from('profiles').insert({ name:f.name, rel:f.rel, tone:TONES[S.profiles.length % 3], blood:f.blood || null, dob:f.dob || null }).select().single());
    const p = MAP.profile(r); S.profiles.push(p); return p;
  },
  async createDoctor(f){
    const row = { profile_id:S.active, name:f.name, spec:f.spec || 'Doctor', tone:TONES[S.doctors.length % 3], chambers:f.chambers || [], links:f.links || [] };
    if (!LIVE) { const d = { id: uid('d'), pid:row.profile_id, name:row.name, spec:row.spec, tone:row.tone, links:row.links, chambers:row.chambers }; S.doctors.push(d); return d; }
    const d = MAP.doctor(await must(sb.from('doctors').insert(row).select().single())); S.doctors.push(d); return d;
  },
  async updateDoctor(d, patch){
    if (LIVE) await must(sb.from('doctors').update({ name:patch.name ?? d.name, spec:patch.spec ?? d.spec, chambers:patch.chambers ?? d.chambers, links:patch.links ?? d.links }).eq('id', d.id));
    Object.assign(d, patch); return d;
  },
  async ensureCondition(name, since){
    if (!name || conds().find(c => c.name.toLowerCase() === name.toLowerCase())) return;
    if (!LIVE) { S.conds.push({ id: uid('c'), pid:S.active, name, status:'active', since }); return; }
    S.conds.push(MAP.cond(await must(sb.from('conditions').insert({ profile_id:S.active, name, status:'active', since:since || null }).select().single())));
  },
  async savePages(v, draftPages){
    // draftPages: existing pages (with id/path) plus new ones ({img}|{pdf,file}) in the order shown
    if (!LIVE) { v.pages = draftPages.map(p => p.img ? { img:p.img } : p.pdf ? { pdf:p.pdf } : p); return; }
    const keep = draftPages.filter(p => p.id).map(p => p.id);
    const removed = (v.pages || []).filter(p => p.id && !keep.includes(p.id));
    if (removed.length) { await must(sb.from('visit_pages').delete().in('id', removed.map(p => p.id))); await sb.storage.from('records').remove(removed.map(p => p.path)); }
    const out = [];
    for (let i = 0; i < draftPages.length; i++) {
      const p = draftPages[i];
      if (p.id) { out.push(p); if (p.position !== i) await sb.from('visit_pages').update({ position:i }).eq('id', p.id); continue; }
      const up = await upload(p);
      const r = await must(sb.from('visit_pages').insert({ visit_id:v.id, path:up.path, kind:up.kind, name:up.name, position:i }).select().single());
      out.push(MAP.page(r, { [up.path]: up.url }));
    }
    v.pages = out;
  },
  async saveVisit(id, data){
    const row = { profile_id:S.active, doctor_id:data.doc, date:data.date, time:data.time || null, chamber:data.chamber || null, reason:data.reason || null, cond:data.cond || null, cost:data.cost, follow:data.follow || null, said:data.said || null };
    if (!LIVE) {
      if (id) { const v = visit(id); Object.assign(v, data); return v; }
      const v = { id: uid('v'), pid:S.active, ...data, pages:[] }; S.visits.push(v); return v;
    }
    if (id) { const r = await must(sb.from('visits').update(row).eq('id', id).select().single()); const v = visit(id); Object.assign(v, MAP.visit(r, v.pages)); return v; }
    const v = MAP.visit(await must(sb.from('visits').insert(row).select().single()), []); S.visits.push(v); return v;
  },
  async createTest(f){
    const row = { profile_id:S.active, doctor_id:f.doc || null, visit_id:f.visit || null, name:f.name, status:f.status || 'advised', date:f.date || null, venue:f.venue || null };
    if (!LIVE) { const t = { id: uid('t'), pid:S.active, name:f.name, doc:f.doc || '', visit:f.visit || '', status:row.status, date:f.date || iso(TODAY), venue:f.venue || '', cost:null, report:null }; S.tests.push(t); return t; }
    const t = MAP.test(await must(sb.from('tests').insert(row).select().single()), {}); S.tests.push(t); return t;
  },
  async updateTest(t, patch){
    if (LIVE) { const m = {}; if ('status' in patch) m.status = patch.status; if ('date' in patch) m.date = patch.date; await must(sb.from('tests').update(m).eq('id', t.id)); }
    Object.assign(t, patch); return t;
  },
  async attachReport(t, fd){
    let report;
    if (!LIVE) report = fd.img ? { name:`${t.name} report.jpg`, img:fd.img } : { name:fd.pdf };
    else {
      const up = await upload(fd);
      const old = t.report && t.report.path;
      await must(sb.from('tests').update({ report_path:up.path, report_name: up.kind === 'image' ? `${t.name} report.jpg` : up.name, report_kind:up.kind, status:'attached', date: days(t.date) > 0 ? iso(new Date()) : t.date }).eq('id', t.id));
      if (old) sb.storage.from('records').remove([old]);
      report = { name: up.kind === 'image' ? `${t.name} report.jpg` : up.name, path:up.path, kind:up.kind, url:up.url, img: up.kind === 'image' ? up.url : undefined };
    }
    t.report = report; t.status = 'attached'; if (days(t.date) > 0) t.date = iso(LIVE ? new Date() : TODAY);
  },
  async createMed(f){
    const row = { profile_id:S.active, name:f.name, dose:f.dose || null, doctor_id:f.doc || null, visit_id:f.visit || null, since:f.since || null, status:f.status };
    if (!LIVE) { S.meds.push({ id: uid('m'), pid:S.active, name:f.name, dose:f.dose || 'Not added', freq:(f.dose || '').split(',')[0], doc:f.doc, since:f.since || iso(TODAY), visit:f.visit, status:f.status }); return; }
    S.meds.push(MAP.med(await must(sb.from('meds').insert(row).select().single())));
  },
  async updateMed(m, patch){
    if (LIVE) await must(sb.from('meds').update({ status:patch.status, until:patch.until || null }).eq('id', m.id));
    Object.assign(m, patch);
  },
  async createShare(docId){
    if (!LIVE) { const code = Math.random().toString(36).slice(2, 8); const scope = docId ? (doc(docId)?.name || 'One doctor') : 'All doctors'; S.shares.unshift({ id: uid('s'), scope, created:'Created just now', exp:'expires in 24h', code, token:code }); return code; }
    const r = await must(sb.from('shares').insert({ profile_id:S.active, doctor_id:docId || null }).select().single());
    S.shares.unshift(MAP.share(r)); return r.token;
  },
  async revokeShare(id){ if (LIVE) await must(sb.from('shares').update({ revoked:true }).eq('id', id)); S.shares = S.shares.filter(x => x.id !== id); },
  async shared(token){ const { data, error } = await client().rpc('get_shared_summary', { p_token: token }); if (error) throw error; return data; },
  async deleteAccount(){
    if (!LIVE) return;
    const files = await sb.storage.from('records').list(USER.id, { limit:1000 });
    const paths = (files.data || []).map(f => `${USER.id}/${f.name}`);
    if (paths.length) await sb.storage.from('records').remove(paths);
    await must(sb.rpc('delete_my_account'));
    await sb.auth.signOut();
  },
  async myAccessLog(){ if (!LIVE) return []; return must(sb.from('admin_access_log').select('what,reason,created_at').eq('user_id', USER.id).order('created_at', { ascending:false }).limit(20)); },
  /* Admin */
  adminOverview: () => must(sb.rpc('admin_overview')),
  adminUsers: () => must(sb.rpc('admin_users')),
  adminLog: () => must(sb.from('admin_access_log').select('*').order('created_at', { ascending:false }).limit(200)),
  adminRecords: (user, reason) => must(sb.rpc('admin_user_records', { p_user:user, p_reason:reason })),
  async adminFileUrl(user, path, reason){ await must(sb.rpc('admin_log', { p_user:user, p_what:'file: ' + path.split('/').pop(), p_reason:reason || null })); const { data, error } = await sb.storage.from('records').createSignedUrl(path, 300); if (error) throw error; return data.signedUrl; },
  async adminDelete(user){
    const files = await sb.storage.from('records').list(user, { limit:1000 });
    const paths = (files.data || []).map(f => `${user}/${f.name}`);
    if (paths.length) await sb.storage.from('records').remove(paths);
    await must(sb.rpc('admin_delete_user', { p_user:user }));
  },
};
async function busy(fn){
  if (U.busy) return; U.busy = true;
  try { await fn(); } catch(e) { console.error(e); U.busy = false; toast("Couldn't save. " + friendly(e)); return; }
  U.busy = false;
}

/* ================= Icons & atoms ================= */
const I = (n, cls='') => `<span class="mi ${cls}" aria-hidden="true">${n}</span>`;
const LOGO_MARK = (dark) => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.2" y="1.5" width="7.6" height="21" rx="2.6" fill="${dark ? '#FFFFFF' : '#0A7D84'}"/><path d="M4.1 8.2h7.7v7.6H4.1a2.6 2.6 0 0 1-2.6-2.6v-2.4a2.6 2.6 0 0 1 2.6-2.6Z" fill="${dark ? '#E6F06A' : '#4BA6CC'}"/><path d="M12.2 8.2h7.7a2.6 2.6 0 0 1 2.6 2.6v2.4a2.6 2.6 0 0 1-2.6 2.6h-7.7Z" fill="${dark ? '#FFFFFF' : '#0A7D84'}"/></svg>`;
const logo = (dark) => `<span class="logo ${dark ? 'on-dark' : ''}">${LOGO_MARK(dark)}docly</span>`;
const av = (name, tone, cls='') => `<span class="av ${tone || 'teal'} ${cls}">${esc((name.replace(/^Dr\.\s*/,'')[0] || '?').toUpperCase())}</span>`;
const dtile = (date, dark) => `<span class="dtile ${dark ? 'dark' : ''} num"><b>${dd(date)}</b><small>${mon(date)}</small></span>`;
const tile = (icon, ink) => `<span class="tile${ink || icon === 'science' ? '' : ' teal'}">${I(icon)}</span>`;
const pill = (label, tone) => `<span class="pill ${tone}">${esc(label)}</span>`;
const chev = () => I('chevron_right', 'chev');
const secH = (title, link, href) => `<div class="sec-h"><h2>${esc(title)}</h2>${link ? `<a class="link" href="#${href}">${esc(link)}</a>` : ''}</div>`;
const row = ({ lead='', t, s='', end='', href, act, attrs='' }) => {
  const inner = `${lead}<span class="body"><span class="t">${t}</span>${s ? `<span class="s">${s}</span>` : ''}</span>${end}`;
  if (href) return `<a class="row" href="#${href}" ${attrs}>${inner}</a>`;
  if (act) return `<button type="button" class="row" data-act="${act}" ${attrs}>${inner}</button>`;
  return `<div class="row" ${attrs}>${inner}</div>`;
};
const emptyRow = (text, cta, href) => `<div class="empty">${esc(text)}${cta ? `<div style="margin-top:13px"><a class="btn btn-white btn-sm" href="#${href}">${I('add')}${esc(cta)}</a></div>` : ''}</div>`;

/* ================= Routing ================= */
const AUTH = ['welcome','login','code'];
let CUR = null;
function hashNow(){ try { return decodeURIComponent((location.hash || '').replace(/^#/, '')); } catch(e) { return ''; } }
function setHash(h){ CUR = h; try { history.replaceState(null, '', '#' + h); } catch(e) { /* sandboxed frame: keep route in memory */ } }
function parse(){
  const h = CUR != null ? CUR : hashNow();
  const m = h.match(/^(doctor|visit|test|photo|editdoctor|editvisit|adminuser|s)-(.+)$/i);
  if (m) return { name: m[1], id: m[2] };
  return { name: h || '' };
}
const mq = window.matchMedia('(min-width: 900px)');
let depth = 0;
const STACK = [];
function go(h){ if (h === CUR) { render(true); return; } CUR = h; try { history.pushState(null, '', '#' + h); } catch(e) { /* sandboxed frame: route in memory */ } onRoute(); }

const TAB_OF = { home:'home', tests:'tests', test:'tests', doctors:'doctors', doctor:'doctors', visit:'doctors', photo:'doctors', 'add-visit':'doctors', editvisit:'doctors', 'add-doctor':'doctors', editdoctor:'doctors',
  me:'me', password:'me', admin:'admin', adminuser:'admin', history:'me', activity:'me', share:'me', profiles:'me', 'add-profile':'me', meds:'me', 'add-med':'me', 'add-test':'tests' };

function render(scrollTop){
  const desk = mq.matches;
  let r = parse();
  if (r.name === 'shared' || r.name === 's') { draw(sharedView(r), scrollTop); return; }
  if (S.loading) { draw(loadingView(), scrollTop); return; }
  if (!S.signedIn) {
    if (!AUTH.includes(r.name)) { r = { name: desk ? 'login' : 'welcome' }; setHash(r.name); }
    if (desk && r.name === 'welcome') r = { name:'login' };
    draw(authView(r.name, desk), scrollTop); return;
  }
  if (LIVE && !S.profiles.length) { draw(setupView(desk), scrollTop); return; }
  if ((r.name === 'admin' || r.name === 'adminuser') && !S.isAdmin) r = { name:'home' };
  if (AUTH.includes(r.name) || !VIEWS[r.name]) { r = { name:'home' }; setHash('home'); }
  if (desk && r.name === 'profiles') r = { name:'me' };
  const v = VIEWS[r.name](r, desk);
  draw(desk ? deskShell(r, v) : mobShell(r, v), scrollTop);
}
function draw(html, scrollTop){
  const app = document.getElementById('app');
  app.innerHTML = html + sheetHtml() + toastHtml();
  if (scrollTop) window.scrollTo(0, 0);
  afterDraw();
}

/* ================= Shells ================= */
const NAV = [
  ['home','home','Home','Dashboard'], ['tests','science','Tests','Advised & reports'],
  ['doctors','medical_services','Doctors','Visits & chambers'], ['me','person','Me','Profiles, history, sharing'] ];
function deskShell(r, v){
  const tab = TAB_OF[r.name] || 'home';
  const p = prof();
  return `<div class="dapp">
    <aside class="side">
      <a href="#home" aria-label="Docly home">${logo()}</a>
      <button class="pswitch" type="button" data-act="switch">${av(p.name, p.tone)}<span class="body"><b>${esc(p.name)}</b><small>Switch profile</small></span>${I('expand_more')}</button>
      <a class="btn btn-primary btn-block" href="#add-visit" style="height:48px">${I('add')}Add visit</a>
      <nav class="nav">${NAV.concat(S.isAdmin ? [['admin','admin_panel_settings','Admin','Users and activity']] : []).map(([k,ic,t,s]) => `<a href="#${k}" class="${tab===k?'on':''}">${I(ic)}<span><b>${t}</b><small>${s}</small></span></a>`).join('')}</nav>
      <div class="foot">Signed in as<b>${esc(S.email)}</b></div>
    </aside>
    <main class="dmain"><div class="dwrap">${v.desk || v.body}</div></main>
  </div>${v.overlay || ''}`;
}
function mobShell(r, v){
  const top = ['home','tests','doctors','me'].includes(r.name);
  const tab = TAB_OF[r.name] || 'home';
  const cls = ['mapp', top ? 'tabs' : '', v.stick ? 'stick' : '', r.name === 'home' ? 'mhome' : ''].join(' ');
  const head = v.noHead ? '' : mHead(v);
  return `<div class="${cls}">${head}<div class="mpad mbody">${v.body}</div></div>
    ${v.stick ? `<div class="mstick">${v.stick}</div>` : ''}
    ${top ? tabbar(tab) : ''}${v.overlay || ''}`;
}
function mHead(v){
  const back = v.back != null ? `<button type="button" class="icon-btn" data-act="back" data-fallback="${v.back}" aria-label="Back">${I('arrow_back')}</button>` : '';
  return `<header class="mpad mhead ${v.back == null ? 'top' : ''}"><div class="hrow">${back}<div class="body"><h1>${v.title}</h1>${v.sub ? `<p>${v.sub}</p>` : ''}</div>${v.action || ''}</div></header>`;
}
function tabbar(tab){
  const a = (k, ic, t) => `<a href="#${k}" class="${tab===k?'on':''}">${I(ic)}${t}</a>`;
  return `<nav class="tabbar" aria-label="Main">${a('home','home','Home')}${a('tests','science','Tests')}<button type="button" class="fab" data-act="fab" aria-label="Add">${I('add')}</button>${a('doctors','medical_services','Doctors')}${a('me','person','Me')}</nav>`;
}

/* ================= Auth ================= */
function authView(name, desk){
  if (desk) {
    const panel = `<div class="auth-d">
      <section class="brandp">${logo(true).replace('class="logo on-dark"','class="logo on-dark" style="font-size:28px"')}
        <h1>Every doctor visit, in one place.</h1>
        <ul><li>Prescriptions, tests and advice, filed by doctor</li><li>Follow-ups and pending tests in one view</li><li>A 24-hour read-only link for any new doctor</li></ul>
      </section>
      <section class="formp"><div class="inner">${loginForm(true)}</div></section></div>`;
    if (name !== 'code') return panel;
    return panel + `<div class="scrim center" data-act="noop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="codeH">
      <button type="button" class="x" data-act="go" data-href="login" aria-label="Close">${I('close')}</button>
      ${codeBlock(true)}</div></div>`;
  }
  if (name === 'welcome') return `<div class="auth-m welcome"><div class="grow">
      <img class="welcome-art" src="welcome.svg" width="138" height="142" alt="">
      <div class="atext"><h1>All your health records. <span>One place.</span></h1>
      <p class="lead">Prescriptions, test reports and visits, kept safe for you and your family.</p></div></div>
      <div class="bottom"><a class="btn btn-primary btn-block" href="#login">Get started${I('arrow_forward')}</a>
      <span class="small-link">Already have an account? <a class="link" href="#login">Sign in</a></span></div></div>`;
  if (name === 'login') return `<form class="auth-m" data-form="login" novalidate><div class="grow">${loginForm(false)}</div>
      <div class="bottom">${loginBtn()}${passSwitch()}
      <span class="small-link">${U.authMode === 'signin' ? `New to Docly? <a class="link" href="#" data-act="mode">Create an account</a>` : `Have an account? <a class="link" href="#" data-act="mode">Sign in</a>`}</span></div></form>`;
  return `<form class="auth-m" data-form="code" novalidate><div class="grow">${codeBlock(false, true)}</div>
      <div class="bottom"><button class="btn btn-primary btn-block" type="submit">Verify${I('arrow_forward')}</button>
      <span class="small-link">Wrong email? <a class="link" href="#login">Change email</a></span></div></form>`;
}
function hasPass(){ return LIVE ? !!(USER && USER.user_metadata && USER.user_metadata.has_password) : !!S.hasPass; }
const NUDGEKEY = 'docly_pass_nudge_off';
function passNudgeOff(){ try { return localStorage.getItem(NUDGEKEY) === (LIVE && USER ? USER.id : 'demo'); } catch(e) { return !!U.nudgeOff; } }
function passNudge(){
  if (hasPass() || passNudgeOff()) return '';
  return `<div class="card nudge" role="note">${tile('key')}<div class="nt"><b>Add a password</b><span>Sign in on a new device without waiting for an email.</span></div>
    <a class="btn btn-primary btn-sm" href="#password">Add password</a><button type="button" class="x" data-act="nudgeoff" aria-label="Not now">${I('close')}</button></div>`;
}
function loginBtn(){ const pw = U.usePass && U.authMode === 'signin';
  return `<button class="btn btn-primary btn-block" type="submit"${!pw && LIVE && mailLeft() ? ' disabled' : ''}>${pw ? 'Sign in' : 'Send code'}${I('arrow_forward')}</button>`; }
function passSwitch(){ if (U.authMode !== 'signin') return '';
  return `<span class="small-link" style="text-align:center">${U.usePass ? `Forgot it? <a class="link" href="#" data-act="usepass">Use an email code instead</a>` : `Have a password? <a class="link" href="#" data-act="usepass">Sign in with password</a>`}</span>`; }
const MAILKEY = 'docly_mail_wait';
function mailLeft(){ let t = 0; try { t = +localStorage.getItem(MAILKEY) || 0; } catch(e) { t = U.mailUntil || 0; } return Math.max(0, t - Date.now()); }
function setMailWait(ms){ const until = Date.now() + ms; U.mailUntil = until; try { localStorage.setItem(MAILKEY, String(until)); } catch(e) {} }
function mmss(ms){ const t = Math.ceil(ms/1000); return Math.floor(t/60) + ':' + String(t%60).padStart(2,'0'); }
function loginForm(desk){
  const wait = LIVE ? mailLeft() : 0;
  const errHtml = wait ? `<span class="err-text" id="emailErr" role="status">${wait > 300000 ? 'Limit: 2 emails per hour.' : 'Please wait.'} Try again in <b id="mailWait">${mmss(wait)}</b>.</span>` : (U.emailErr ? `<span class="err-text" id="emailErr">${esc(U.emailErr)}</span>` : '');
  const pw = U.usePass && U.authMode === 'signin';
  const title = U.authMode === 'signin' ? 'Welcome back.' : 'Create your account.';
  const lead = pw ? 'Enter your email and password.' : "Enter your email. We'll send you a 6-digit code, no password needed.";
  const pwField = pw ? `<div class="field"><label for="password">Password</label>
      <div class="pw"><input class="input ${U.passErr ? 'err' : ''}" id="password" name="password" type="${U.showPw ? 'text' : 'password'}" autocomplete="current-password" placeholder="Your password" aria-describedby="passErr">
      <button type="button" class="eye" data-act="showpw" aria-label="${U.showPw ? 'Hide password' : 'Show password'}">${I(U.showPw ? 'visibility_off' : 'visibility')}</button></div>
      ${U.passErr ? `<span class="err-text" id="passErr">${esc(U.passErr)}</span>` : ''}</div>` : '';
  const fields = `<div class="field"><label for="email">Your Email</label>
      <input class="input ${U.emailErr || wait ? 'err' : ''}" id="email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="name@email.com" value="${esc(U.emailDraft || '')}" aria-describedby="emailErr">
      ${pw ? (U.emailErr ? `<span class="err-text" id="emailErr">${esc(U.emailErr)}</span>` : '') : errHtml}</div>${pwField}`;
  if (!desk) return `<div class="ahead">${logo()}<div class="atext"><h1>${title}</h1><p class="lead">${lead}</p></div></div><div class="afields">${fields}</div>`;
  return `<form data-form="login" class="form" novalidate style="gap:21px"><div><h2>${title}</h2><p class="lead" style="margin-top:8px">${lead}</p></div>
    ${fields}${loginBtn()}${passSwitch()}
    <span class="small-link" style="text-align:center">${U.authMode === 'signin' ? `New to Docly? <a class="link" href="#" data-act="mode">Create an account</a>` : `Have an account? <a class="link" href="#" data-act="mode">Sign in</a>`}</span></form>`;
}
function codeBlock(desk, inForm){
  const bad = U.otpErr || U.expired;
  const boxes = `<div class="otp ${bad ? 'bad' : ''}" role="group" aria-label="6-digit code">${[0,1,2,3,4,5].map(i => `<input inputmode="numeric" autocomplete="${i===0?'one-time-code':'off'}" maxlength="1" aria-label="Digit ${i+1}" data-otp="${i}">`).join('')}</div>`;
  const left = Math.max(0, Math.ceil((U.resendAt - Date.now())/1000));
  const status = U.expired ? `<span class="err-text">This code has expired.</span><a href="#" class="link" style="font-size:12px" data-act="resend">Send a new code</a>`
    : U.otpErr ? `<span class="err-text">${esc(U.otpErr)}</span>${LIVE ? `<a href="#" class="link" style="font-size:12px" data-act="resend">Send a new code</a>` : ''}`
    : `<span class="hint" id="resend">${left > 0 ? `Resend code in 0:${String(left).padStart(2,'0')}` : `<a href="#" class="link" data-act="resend">Resend code</a>`}</span>`;
  const body = `<div style="display:flex;flex-direction:column;gap:8px"><h2 id="codeH" style="${desk ? '' : 'font-size:28px;font-weight:700;letter-spacing:-.02em'}">Check your email</h2>
      <p class="lead" style="color:var(--ink-80);font-size:14px">We sent a 6-digit code to <b>${esc(S.email)}</b>. It expires in 10 minutes. If the email has a sign-in link instead, open it on this device.</p></div>
      ${boxes}<div style="display:flex;flex-direction:column;gap:5px">${status}</div>
      ${LIVE ? `<p class="hint" style="font-size:11px">Can't find it? Check your spam folder.</p>` : `<p class="hint" style="font-size:11px">Demo: any 6 digits signs you in. 000000 shows the wrong-code state.</p>`}`;
  if (!desk) return `<div class="ahead">${logo()}<div class="atext"><h1 id="codeH">Check your email</h1>
      <p class="lead">We sent a 6-digit code to ${esc(S.email)}. It expires in 10 minutes.</p></div></div>
      <div class="acode">${boxes}<div class="astatus">${status}</div>${LIVE ? `<p class="hint">Got a sign-in link instead? Open it on this device.</p>` : ''}</div>`;
  return `<form data-form="code" class="form" novalidate style="gap:21px">${body}<button class="btn btn-primary btn-block" type="submit">Verify${I('arrow_forward')}</button>
    <span class="small-link" style="text-align:center">Wrong email? <a class="link" href="#login">Change email</a></span></form>`;
}
function welcomeArt(){
  return `<svg class="welcome-art" viewBox="0 0 120 120" aria-hidden="true">
    <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3D0"/><stop offset="1" stop-color="#2FA7A8"/></linearGradient>
    <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CC2C2"/><stop offset="1" stop-color="#1E8E92"/></linearGradient></defs>
    <rect x="22" y="38" width="76" height="62" rx="10" fill="url(#fb)"/>
    <rect x="34" y="12" width="52" height="44" rx="6" fill="#fff" stroke="#DCEAF0"/>
    <rect x="41" y="20" width="38" height="5" rx="2.5" fill="#BEE3F0"/><rect x="41" y="30" width="30" height="5" rx="2.5" fill="#D6EDF5"/><rect x="41" y="40" width="34" height="5" rx="2.5" fill="#D6EDF5"/>
    <path d="M22 54a8 8 0 0 1 8-8h22l6 6h32a8 8 0 0 1 8 8v30a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10Z" fill="url(#fg)"/>
    <circle cx="60" cy="76" r="13" fill="#fff" opacity=".95"/><rect x="57" y="68" width="6" height="16" rx="2" fill="#2FA7A8"/><rect x="52" y="73" width="16" height="6" rx="2" fill="#2FA7A8"/></svg>`;
}

/* ================= Views ================= */
const VIEWS = {};

/* ---- Home ---- */
VIEWS.home = (r, desk) => desk ? homeDesk() : homeMob();
VIEWS[''] = VIEWS.home;
function homeDesk(){
  const p = prof(), vs = visits(), fu = followUps(), pt = pendingTests(), cm = meds().filter(m => m.status === 'current'), ds = docs();
  const overdue = fu.filter(v => days(v.follow) < 0);
  const stat = (n, label, sub, href) => `<a class="card stat" href="#${href}"><b class="num">${n}</b><span>${label}</span><small>${esc(sub) || '&nbsp;'}</small></a>`;
  const attn = fu.length ? fu.map(v => { const dl = days(v.follow), d = doc(v.doc);
      return row({ lead: dtile(v.follow, dl < 0), t: esc(d.name), s: `${esc(d.spec)} · ${dl < 0 ? 'follow-up overdue' : 'follow-up'}`, end: dl < 0 ? pill(`${-dl} days late`, 'red') : pill('Upcoming','teal'), href:`visit-${v.id}` }); }).join('')
    : emptyRow('No follow-ups due.');
  const ptRows = pt.length ? pt.slice(0,3).map(t => { const st = testStatus(t);
      return row({ lead: tile('science'), t: esc(t.name), s: `${esc(doc(t.doc)?.name || '')} · ${t.status === 'done' ? 'report not attached' : 'advised, not done'}`,
        end: `<span class="end"><span class="s num">${t.status === 'advised' ? 'Due ' : ''}${dm(t.date)}</span>${pill(st.label, st.tone)}</span>`, href:`test-${t.id}` }); }).join('')
    : emptyRow('Nothing pending.');
  const rv = vs.length ? vs.slice(0,2).map(v => row({ lead: dtile(v.date), t: esc(doc(v.doc).name), s: esc(v.short || v.reason), end: chev(), href:`visit-${v.id}` })).join('')
    : emptyRow('No visits yet.', 'Add your first visit', 'add-visit');
  const mr = cm.length ? cm.slice(0,3).map(m => row({ lead: tile('medication'), t: esc(m.name), s: `${esc(doc(m.doc)?.name || '')} · since ${dm(m.since)}`, end: chev(), href:'meds' })).join('')
    : emptyRow('No current medications.', 'Add medication', 'add-med');
  const hr = conds().length ? conds().slice(0,3).map(c => { const v = visits().filter(x => x.cond === c.name).pop(); const d = v ? doc(v.doc) : null;
      return row({ lead: tile('monitor_heart'), t: esc(c.name), s: `Since ${my(c.since)}${d ? ' · ' + esc(d.name) : ''}`, end: chev(), href:'history' }); }).join('')
    : emptyRow('Built from your visits as you add them.');
  return { desk: `
    <header class="dhead"><div><h1>${greeting()}, ${esc(p.short)}</h1><p>${plural(recordCount(),'health record')}${vs.length ? ' · last added ' + lastAdded() : ''}</p></div>
      <div class="acts"><button type="button" class="btn btn-white" data-act="snap">${I('photo_camera')}Snap report</button><a class="btn btn-primary" href="#add-visit">${I('add')}Add visit</a></div></header>
    ${passNudge()}
    <div class="stats">
      ${stat(overdue.length, overdue.length === 1 ? 'Overdue follow-up' : 'Overdue follow-ups', overdue.map(v => doc(v.doc).name).join(', '), overdue[0] ? 'visit-' + overdue[0].id : 'doctors')}
      ${stat(pt.length, 'Tests pending', pt.map(t => t.name).join(', '), 'tests')}
      ${stat(cm.length, 'Current meds', cm.map(m => m.name.split(' ')[0]).join(', '), 'meds')}
      ${stat(ds.length, ds.length === 1 ? 'Doctor' : 'Doctors', vs.length ? 'Last visit ' + lastAdded() : 'None added yet', 'doctors')}
    </div>
    <div class="hgrid">
      <section class="card">${secH('Needs attention','See all','doctors')}<div class="list">${attn}</div></section>
      <section class="card">${secH('Current medications','See all','meds')}<div class="list">${mr}</div></section>
      <section class="card">${secH('Pending tests','See all','tests')}<div class="list">${ptRows}</div></section>
      <section class="card">${secH('Medical history','View all','history')}<div class="list">${hr}</div></section>
      <section class="card">${secH('Recent visits','All doctors','doctors')}<div class="list">${rv}</div></section>
      <section class="card share-card"><h3>Seeing a new doctor?</h3><p>Send a read-only summary of meds, visits and reports. The link expires in 24 hours.</p><a class="btn btn-white btn-md" href="#share" style="height:48px">Create share link</a></section>
    </div>` };
}
function homeMob(){
  const p = prof(), vs = visits(), fu = followUps(), pt = pendingTests();
  const n = recordCount();
  const recent = vs.filter(v => days(v.date) >= -30);
  const newCount = recent.length + recent.reduce((k,v) => k + (v.pages||[]).length, 0) + tests().filter(t => t.report && days(t.date) >= -30).length;
  const first = esc(p.short || (p.name || '').split(' ')[0] || 'there');
  const top = `<div class="h2-top"><button type="button" class="who" data-act="switch">${av(p.name, p.tone)}<b>${esc(p.name)}${I('expand_more')}</b></button>
      <a class="h2-bell" href="#activity" aria-label="Activity">${I('notifications')}</a></div>`;
  const greet = `<h1 class="h2-greet"><span>Hi ${first},</span><br>all your records,<br>in one place.</h1>`;
  const ds = docs().slice(0, 3);
  const hero = `<section class="rcard"><div class="rhero">
      <div class="rtop"><div><small>Health records</small><b>${esc(p.name)}${p.blood ? ' · ' + esc(p.blood) : ''}</b></div><a class="ropen" href="#history" aria-label="Open medical history">${I('chevron_right')}</a></div>
      <div class="rcount num"><b>${n}</b><span>${n === 1 ? 'record' : 'records'}</span></div>
      <div class="rbot">${ds.length ? `<a class="avstack" href="#doctors" aria-label="Doctors">${ds.map(d => av(d.name, d.tone)).join('')}</a>` : `<span class="rhint">Add your first visit to start</span>`}
        ${newCount ? `<span class="pill white">+${newCount} this month</span>` : ''}</div>
    </div>
    <div class="ractions"><a class="obtn" href="#add-visit">${I('note_add')}Add visit</a><button type="button" class="obtn" data-act="snap">${I('photo_camera')}Snap report</button></div></section>`;
  const head = `${top}${greet}${hero}${passNudge()}`;
  if (!vs.length && !tests().length) {
    return { noHead:true, body: `${head}<section>${secH('What Docly keeps')}<div class="card list div">
      ${row({ lead: tile('note_add'), t:'Visits', s:'Doctor, date and notes', end: chev(), href:'add-visit' })}
      ${row({ lead: tile('photo_camera'), t:'Tests and reports', s:'Snap a page or upload a file', end: chev(), href:'add-test' })}
      ${row({ lead: tile('medication'), t:'Medications', s:'What you take and who prescribed it', end: chev(), href:'add-med' })}</div></section>` };
  }
  const rv = vs.slice(0,2).map(v => row({ lead: dtile(v.date), t: esc(doc(v.doc).name), s: esc(v.short || v.reason), end: chev(), href:`visit-${v.id}` })).join('');
  const att = fu.map(v => { const dl = days(v.follow), d = doc(v.doc);
    return `<div class="card list">${row({ lead: dtile(v.follow, dl < 0), t: esc(d.name), s: esc(v.follow && dl < 0 ? 'Recheck · follow-up overdue' : 'Follow-up visit'), end: dl < 0 ? pill(`${-dl} days late`,'red') : pill('Upcoming','teal'), href:`visit-${v.id}` })}</div>`; }).join('');
  const pts = pt.length ? `<div class="card list div">${pt.slice(0,3).map(t => row({ lead: tile(t.name === 'ECG' ? 'monitor_heart' : 'science'), t: esc(t.name),
      s: t.status === 'done' ? 'Report not added yet' : `Advised by ${esc(doc(t.doc)?.name || '')}`,
      end: `<span class="end"><span class="s num">${t.status === 'advised' ? 'Due ' : ''}${dm(t.date)}</span>${t.status === 'advised' ? pill('To do','blue') : pill('Done','teal')}</span>`, href:`test-${t.id}` })).join('')}</div>` : '';
  return { noHead:true, body: `${head}
    <section>${secH('Recent visits','See all','doctors')}<div class="card list div">${rv}</div></section>
    ${att || pts ? `<section>${secH('Needs attention')}<div class="stack-sm">${att}${pts}</div></section>` : ''}` };
}

/* ---- Doctors ---- */
VIEWS.doctors = (r, desk) => desk ? doctorsDesk(docs()[0]?.id) : doctorsMob();
VIEWS.doctor = (r, desk) => { const d = doc(r.id); if (!d) return VIEWS.doctors(r, desk); return desk ? doctorsDesk(d.id) : doctorMob(d); };
function docSub(d){ const vs = docVisits(d.id); return `${esc(d.spec)}${vs.length ? ' · ' + plural(vs.length,'visit') + ' since ' + my(vs[vs.length-1].date) : ''}`; }
function docListRows(sel){
  return docs().map(d => { const vs = docVisits(d.id); const pend = pendingTests().filter(t => t.doc === d.id).length;
    return row({ lead: av(d.name, d.tone), t: esc(d.name), s: `${esc(d.spec)}${vs[0] ? ' · ' + dm(vs[0].date) : ''}`, end: pend ? pill(`${pend} pending`,'blue') : chev(), href:`doctor-${d.id}`, attrs: sel === d.id ? 'aria-current="true"' : '' }).replace('class="row"', `class="row${sel === d.id ? ' sel' : ''}"`); }).join('');
}
function doctorBlocks(d, desk){
  const vs = docVisits(d.id), last = vs[0], pt = pendingTests().filter(t => t.doc === d.id);
  const lks = (d.links || []).filter(l => !(l && l.note != null));
  const links = lks.length ? `<div class="chips">${lks.map(l => { const L = typeof l === 'string' ? { label:l } : l;
      return L.url && /^https?:\/\//.test(L.url) ? `<a class="chip ext" href="${esc(L.url)}" target="_blank" rel="noopener">${esc(L.label || 'Link')}<span class="emo" aria-hidden="true">↗️</span></a>`
        : `<span class="chip ext">${esc(L.label)}<span class="emo" aria-hidden="true">↗️</span></span>`; }).join('')}</div>` : '';
  const lastB = last ? `<section>${secH(`Last visit · ${dm(last.date)}`,'Open',`visit-${last.id}`)}<div class="card quote">“${esc(last.said)}”</div></section>` : '';
  const hist = `<section>${secH('Visit history','Add visit',`add-visit`).replace('href="#add-visit"', `href="#add-visit" data-act="addvisit" data-doc="${d.id}"`)}<div class="card list div">${vs.length ? vs.map(v => row({ lead: dtile(v.date), t: esc(v.reason || 'Visit'), s: `${esc(v.chamber)} · ${taka(v.cost)}`, end: chev(), href:`visit-${v.id}` })).join('') : emptyRow('No visits with this doctor yet.')}</div></section>`;
  const tst = pt.length ? `<section>${secH('Pending tests')}<div class="card list div">${pt.map(t => row({ lead: tile(t.status === 'done' ? 'note_add' : 'science'), t: esc(t.name), s: t.status === 'done' ? 'Report not attached' : 'Not done yet', end: t.status === 'done' ? pill('Attach report','red') : pill('Advised','blue'), href:`test-${t.id}` })).join('')}</div></section>` : '';
  const ch = d.chambers.length ? `<section>${secH('Chambers')}<div class="card list div">${d.chambers.map(c => row({ lead: tile('medical_services'), t: esc(c.name), s: esc([c.info, c.phone].filter(Boolean).join(' · ')), end: chev() })).join('')}</div></section>` : '';
  return `${links}${lastB}${hist}${tst}${ch}`;
}
function doctorsDesk(selId){
  const ds = docs(), d = doc(selId);
  const pend = pendingTests().length;
  return { desk: `<header class="dhead"><div><h1>Doctors</h1></div>
      <div class="acts"><a class="btn btn-ghost" href="#add-doctor">${I('add')}Add doctor</a></div></header>
    ${ds.length ? `<div class="split"><div class="card list div doclist">${docListRows(selId)}</div>
      <div class="stack">
        <div class="dhero">${av(d.name, d.tone)}<div class="body"><h2>${esc(d.name)}</h2><p class="s">${docSub(d)}</p></div>
          <a class="btn btn-white btn-md" href="#editdoctor-${d.id}">Edit</a><button type="button" class="btn btn-primary btn-md" data-act="addvisit" data-doc="${d.id}">${I('add')}Add visit</button></div>
        ${doctorBlocks(d, true)}</div></div>`
      : `<div class="card">${emptyRow('Add a doctor, or add a visit and the doctor is saved with it.','Add doctor','add-doctor')}</div>`}` };
}
function doctorsMob(){
  const ds = docs();
  return { title:'Doctors', sub:'Everyone you see, with their visits and prescriptions.',
    action:`<a class="icon-btn" href="#add-doctor" aria-label="Add doctor">${I('add')}</a>`,
    body: ds.length ? `<div class="card list div doclist">${docListRows()}</div>` : `<div class="card">${emptyRow('No doctors yet.','Add doctor','add-doctor')}</div>` };
}
function doctorMob(d){
  return { title: esc(d.name), sub: docSub(d), back:'doctors', action:`<button type="button" class="icon-btn" data-act="doctormore" data-id="${d.id}" aria-label="Add visit or edit doctor">${I('add')}</button>`,
    body: `${doctorBlocks(d, false)}`, stick:`<button type="button" class="btn btn-primary btn-block" data-act="addvisit" data-doc="${d.id}">Add visit</button>` };
}

/* ---- Visit ---- */
VIEWS.visit = (r, desk) => { const v = visit(r.id); if (!v) return VIEWS.doctors(r, desk); return visitView(v, desk); };
VIEWS.photo = (r, desk) => { const v = visit(r.id); if (!v) return VIEWS.doctors(r, desk); const base = visitView(v, desk); base.overlay = viewer(v); return base; };
function pageThumb(v, pg, i){
  if (pg.img) return `<a class="page img" href="#photo-${v.id}" data-act="page" data-i="${i}" style="background-image:url('${pg.img}')"><span>Page ${i+1}</span></a>`;
  if (pg.pdf) return `<a class="page pdf" href="#photo-${v.id}" data-act="page" data-i="${i}">${I('picture_as_pdf')}<span>${esc(pg.pdf)}</span></a>`;
  return `<a class="page" href="#photo-${v.id}" data-act="page" data-i="${i}"><i class="w1" style="width:80%"></i><i class="w2" style="width:62%"></i><i class="w1" style="width:88%"></i><i class="w2" style="width:55%"></i><i class="w1" style="width:74%"></i><span style="margin-top:5px">Page ${i+1}</span></a>`;
}
function visitView(v, desk){
  const d = doc(v.doc), ts = tests().filter(t => t.visit === v.id), pages = v.pages || [];
  const details = `<section>${secH('Details')}<div class="card"><dl class="kv">
      <div><dt>Chamber</dt><dd>${esc(v.chamber || 'Not added')}</dd></div><div><dt>Reason</dt><dd>${esc(v.reason || 'Not added')}</dd></div>
      <div><dt>Condition</dt><dd>${esc(v.cond || 'None')}</dd></div><div><dt>Cost</dt><dd class="num">${taka(v.cost)}</dd></div>
      <div><dt>Next follow-up</dt><dd class="num">${v.follow ? dmy(v.follow) : 'None'}</dd></div></dl></div></section>`;
  const said = `<section>${secH('What the doctor said')}<div class="card quote">${v.said ? '“' + esc(v.said) + '”' : '<span class="muted">Nothing noted.</span>'}</div></section>`;
  const tst = `<section>${secH('Tests ordered')}<div class="card list div">${ts.length ? ts.map(t => { const st = testStatus(t);
      return row({ lead: tile(t.name === 'ECG' ? 'monitor_heart' : 'science'), t: esc(t.name), s: `${t.status === 'advised' ? 'Est. ' : ''}${dm(t.date)} · ${esc(t.venue || '')}`, end: pill(st.label, st.tone), href:`test-${t.id}` }); }).join('') : emptyRow('No tests ordered.')}</div></section>`;
  const pres = `<section>${secH('Prescription', pages.length ? plural(pages.length,'page') : '', `photo-${v.id}`)}
      ${pages.length ? `<div class="pages">${pages.map((pg,i) => pageThumb(v,pg,i)).join('')}</div>` : `<div class="card">${emptyRow('No prescription added yet.')}</div>`}
      <div class="btns2 donly" style="margin-top:13px"><button type="button" class="btn btn-teal" data-act="pick" data-kind="visit-photo" data-id="${v.id}">${I('photo_camera')}Take photo</button>
      <button type="button" class="btn btn-white" data-act="pick" data-kind="visit-file" data-id="${v.id}">${I('upload')}Upload file</button></div></section>`;
  if (desk) return { desk: `<header class="dhead"><div><p class="crumb"><a href="#doctors">Doctors</a> / <a href="#doctor-${d.id}">${esc(d.name)}</a></p><h1>Visit · ${dmy(v.date)}</h1></div>
      <div class="acts"><a class="btn btn-white btn-md" href="#editvisit-${v.id}">${I('edit')}Edit</a></div></header>
      <div class="split-r"><div class="stack">${details}${said}${tst}</div><div class="stack">${pres}</div></div>` };
  return { title:`Visit · ${dm(v.date)}`, sub: `${esc(d.name)} · ${esc(d.spec)}`, back:`doctor-${d.id}`, action:`<button type="button" class="icon-btn" data-act="visitmore" data-id="${v.id}" aria-label="Add pages or edit visit">${I('add')}</button>`,
    body: `${pres}${said}${details}${tst}` };
}
function viewer(v){
  const pages = v.pages || [], n = pages.length, i = Math.min(U.viewerPage, Math.max(0, n-1)), pg = pages[i] || {};
  const d = doc(v.doc);
  const paper = pg.img ? `<div class="paper" style="background-image:url('${pg.img}')"></div>`
    : pg.pdf ? `<div class="paper" style="align-items:center;justify-content:center;color:var(--ink)">${I('picture_as_pdf')}<b>${esc(pg.pdf)}</b>${pg.url ? `<a class="btn btn-white btn-md" href="${esc(pg.url)}" target="_blank" rel="noopener">${I('open_in_new')}Open PDF</a>` : `<span class="hint">PDF preview opens in the real app</span>`}</div>`
    : `<div class="paper">${[72,52,82,40,66,58,46,74,34,54].map(w => `<i style="width:${w}%"></i>`).join('')}</div>`;
  return `<div class="viewer" role="dialog" aria-modal="true" aria-label="Prescription viewer">
    <div class="bar"><button type="button" class="vb" data-act="back" data-fallback="visit-${v.id}" aria-label="Close">${I('arrow_back')}</button>
      <div class="body"><b>Prescription</b><small>${esc(d.name)} · ${dmy(v.date)}</small></div></div>
    ${n ? paper : `<div class="paper" style="align-items:center;justify-content:center;color:var(--ink-62)">No pages yet</div>`}
    <div class="foot">${n > 1 ? `<button type="button" class="vb" data-act="vpage" data-d="-1" aria-label="Previous page">${I('chevron_left')}</button>` : ''}
      <span>Page ${n ? i+1 : 0} of ${n}</span>${n > 1 ? `<button type="button" class="vb" data-act="vpage" data-d="1" aria-label="Next page">${I('chevron_right')}</button>` : ''}</div></div>`;
}

/* ---- Add / edit visit ---- */
VIEWS['add-visit'] = (r, desk) => visitForm(null, desk);
VIEWS.editvisit = (r, desk) => visitForm(visit(r.id), desk);
function ensureDraft(v){
  const key = v ? v.id : 'new';
  if (U.draft && U.draft.key === key) return U.draft;
  const firstDoc = U.pendingDoc || docs()[0]?.id || '';
  U.pendingDoc = null;
  U.draft = v ? { key, doc:v.doc, pages:[...(v.pages||[])], tests:[], cond:v.cond || '' } : { key, doc:firstDoc, pages:[], tests:[], cond:'' };
  U.newDoc = !U.draft.doc;
  return U.draft;
}
function visitForm(v, desk){
  const D = ensureDraft(v), ds = docs(), d = doc(D.doc), err = U.formErr;
  const docChips = `<div class="chips${desk ? '' : ' scroll'}">${ds.map(x => `<button type="button" class="chip ${!U.newDoc && D.doc === x.id ? 'on' : ''}" data-act="pickdoc" data-id="${x.id}">${esc(x.name)}</button>`).join('')}
      <button type="button" class="chip ${U.newDoc ? 'on' : ''}" data-act="newdoc">${desk ? I('add') + 'New' : '+ New'}</button></div>
      ${U.newDoc ? `<div class="grid2" style="margin-top:8px"><input class="input" id="nd_name" name="nd_name" placeholder="Doctor's name" value="${esc(U.ndName||'')}"><input class="input" id="nd_spec" name="nd_spec" placeholder="Speciality, e.g. Cardiologist" value="${esc(U.ndSpec||'')}"></div>` : ''}
      ${err.doc ? `<span class="err-text">${esc(err.doc)}</span>` : ''}`;
  const chambers = (!U.newDoc && d ? d.chambers : []);
  const condNames = [...new Set(conds().map(c => c.name).concat(['Hypertension','Diabetes','Thyroid']))].slice(0, Math.max(3, conds().length));
  const fields = `
    <div class="field"><span class="label">Doctor</span>${docChips}</div>
    <div class="field"><label for="f_ch">Chamber</label>${chambers.length ? `<select class="input" id="f_ch" name="chamber">${chambers.map(c => `<option ${v && v.chamber === c.name ? 'selected' : ''} value="${esc(c.name)}">${esc(c.name)}, ${esc(c.info.split(' · ')[0])}</option>`).join('')}<option value="__other">Other…</option></select>`
        : `<input class="input" id="f_ch" name="chamber" placeholder="e.g. Square Hospital" value="${esc(v?.chamber || '')}">`}</div>
    <div class="grid2"><div class="field"><label for="f_date">Date</label><span class="ifield">${I('calendar_today')}<input class="input ${err.date ? 'err' : ''}" type="date" id="f_date" name="date" value="${v?.date || iso(TODAY)}" max="${iso(TODAY)}"></span></div>
      <div class="field"><label for="f_time">Time</label><span class="ifield">${I('schedule')}<input class="input" type="time" id="f_time" name="time" value="${v?.time || '18:40'}"></span></div></div>
    <div class="field"><label for="f_reason">Reason</label><input class="input" id="f_reason" name="reason" placeholder="e.g. Follow-up, BP check" value="${esc(v?.reason || '')}"></div>
    <div class="field"><label for="f_cond">Condition <span class="opt">(groups your medical history)</span></label><input class="input" id="f_cond" name="cond" placeholder="e.g. Hypertension" value="${esc(D.cond)}">
      ${condNames.length ? `<div class="chips">${condNames.map(c => `<button type="button" class="chip ${D.cond === c ? 'on' : ''}" data-act="pickcond" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}</div>
    <div class="field"><label for="f_said">What the doctor said</label><textarea class="input grow" id="f_said" name="said" rows="${desk ? 2 : 1}" placeholder="BP still high, reduce salt, back in 1 month">${esc(v?.said || '')}</textarea></div>
    <div class="field"><span class="label">Prescription</span>
      ${D.pages.length ? `<div class="thumbs">${D.pages.map((p,i) => `<div class="thumb" style="${p.img ? `background-image:url('${p.img}')` : ''}">${p.img ? '' : p.pdf ? 'PDF' : 'Page ' + (i+1)}<button type="button" data-act="rmpage" data-i="${i}" aria-label="Remove page">${I('close')}</button></div>`).join('')}</div>` : ''}
      <div class="btns2"><button type="button" class="btn btn-teal" data-act="pick" data-kind="draft-photo">${I('photo_camera')}Take photo</button><button type="button" class="btn btn-white" data-act="pick" data-kind="draft-file">${I('upload')}Upload file</button></div></div>
    ${v ? '' : `<div class="field"><label for="f_test">Tests advised</label>
      ${desk ? `<div style="display:flex;gap:8px"><input class="input" id="f_test" placeholder="Test name, e.g. Lipid profile" data-enter="addtest"><button type="button" class="btn btn-white" data-act="addtest" style="flex:none">${I('add')}Add</button></div>`
        : `<input class="input" id="f_test" placeholder="Test name" data-enter="addtest"><button type="button" class="btn btn-text" data-act="addtest">Add test</button>`}
      ${D.tests.length ? `<div class="added-tests">${D.tests.map((t,i) => `<span class="chip">${I('science')}${esc(t)}<button type="button" data-act="rmtest" data-i="${i}" aria-label="Remove ${esc(t)}">${I('close')}</button></span>`).join('')}</div>` : ''}</div>`}
    <div class="grid2"><div class="field"><label for="f_cost">Doctor&#39;s fee</label><div class="affix"><span class="pre">৳</span><input class="input" id="f_cost" name="cost" inputmode="numeric" placeholder="0" value="${v?.cost ?? ''}"></div></div>
      <div class="field"><label for="f_follow">Next follow-up</label><span class="ifield">${I('calendar_today')}<input class="input" type="date" id="f_follow" name="follow" value="${v?.follow || ''}"></span></div></div>`;
  const title = v ? 'Edit visit' : 'Add visit';
  const crumb = d ? `<a href="#doctors">Doctors</a> / <a href="#doctor-${d.id}">${esc(d.name)}</a>` : `<a href="#doctors">Doctors</a>`;
  if (desk) return { desk: `<form data-form="visit" data-id="${v?.id || ''}" novalidate class="stack" style="gap:34px">
      <header class="dhead"><div><p class="crumb">${crumb}</p><h1>${title}</h1><p>Save what the doctor said and the prescription.</p></div>
      <div class="acts"><button type="button" class="btn btn-white btn-md" data-act="back" data-fallback="${v ? 'visit-' + v.id : 'home'}">Cancel</button><button class="btn btn-primary btn-md" type="submit">Save visit</button></div></header>
      <div class="card formcard form">${fields}</div></form>` };
  return { title, sub:'Save what the doctor said and the prescription.', back: v ? 'visit-' + v.id : 'home',
    body: `<form data-form="visit" id="visitForm" data-id="${v?.id || ''}" novalidate class="form">${fields}</form>`,
    stick: `<button class="btn btn-primary btn-block" type="submit" form="visitForm">Save visit</button>` };
}

/* ---- Tests ---- */
VIEWS.tests = (r, desk) => desk ? testsDesk(filteredTests()[0]?.id) : testsMob();
VIEWS.test = (r, desk) => { const t = test(r.id); if (!t) return VIEWS.tests(r, desk); return desk ? testsDesk(t.id) : testMob(t); };
function filteredTests(){
  const q = U.testQuery.trim().toLowerCase();
  return tests().filter(t => (U.testFilter === 'all' || t.status === U.testFilter) && (!q || t.name.toLowerCase().includes(q) || (doc(t.doc)?.name || '').toLowerCase().includes(q)))
    .sort((a,b) => b.date.localeCompare(a.date));
}
function testsSub(){ const ts = tests(); const adv = ts.filter(t => t.status === 'advised').length, wait = ts.filter(t => t.status === 'done').length; return `${plural(ts.length,'test')} · ${adv} advised, ${wait} waiting for a report`; }
function testFilters(){
  const f = [['all','All'],['advised','Advised'],['done','Done'],['attached','Attached']];
  return `<div class="chips">${f.map(([k,l]) => `<button type="button" class="chip ${U.testFilter === k ? 'on' : ''}" data-act="tfilter" data-f="${k}">${l}</button>`).join('')}</div>`;
}
const searchBox = () => `<label class="search"><span class="sr">Search tests</span>${I('search')}<input class="input" id="tq" type="search" placeholder="Search tests" value="${esc(U.testQuery)}" data-live="tq"></label>`;
function testDetail(t){
  const d = doc(t.doc), v = visit(t.visit), st = testStatus(t);
  const rep = t.report ? `<div class="card list">${row({ lead: t.report.img ? `<span class="tile" style="background:center/cover url('${t.report.img}')"></span>` : tile('picture_as_pdf'), t: esc(t.report.name), s: `Attached · ${dm(t.date)}${t.report.url ? ` · <a class="link" href="${esc(t.report.url)}" target="_blank" rel="noopener">Open</a>` : ''}`, end: `<button type="button" class="btn btn-white btn-sm" data-act="pick" data-kind="test-file" data-id="${t.id}">Replace</button>` })}</div>`
    : `<div class="card pad noreport">${tile('note_add')}<b>No report yet</b><p>Snap it or upload the PDF when it's ready.</p>
       <div class="btns2" style="width:100%"><button type="button" class="btn btn-teal btn-md" data-act="pick" data-kind="test-photo" data-id="${t.id}">${I('photo_camera')}Take photo</button><button type="button" class="btn btn-white btn-md" data-act="pick" data-kind="test-file" data-id="${t.id}">${I('upload')}Upload PDF</button></div></div>`;
  const linked = `<section>${secH('Linked to')}<div class="card list div">${d ? row({ lead: av(d.name, d.tone), t: esc(d.name), s: esc(d.spec), end: chev(), href:`doctor-${d.id}` }) : ''}${v ? row({ lead: dtile(v.date), t:`Visit · ${dmy(v.date)}`, s: esc(v.reason), end: chev(), href:`visit-${v.id}` }) : ''}</div></section>`;
  const det = `<section>${secH('Details')}<div class="card"><dl class="kv"><div><dt>Status</dt><dd>${st.label}</dd></div><div><dt>${t.status === 'advised' ? 'Est. date' : 'Date'}</dt><dd class="num">${dmy(t.date)}</dd></div>
      <div><dt>Venue</dt><dd>${esc(t.venue || 'Not added')}</dd></div><div><dt>Cost</dt><dd class="num">${taka(t.cost)}</dd></div></dl>
      ${t.status === 'advised' ? `<div class="donly" style="padding:0 21px 21px"><button type="button" class="btn btn-white btn-sm" data-act="markdone" data-id="${t.id}">${I('check')}Mark as done</button></div>` : ''}</div></section>`;
  return `<section>${secH('Report')}${rep}</section>${linked}${det}`;
}
function testsDesk(selId){
  const ts = filteredTests(), t = test(selId) && ts.find(x => x.id === selId) ? test(selId) : ts[0];
  const table = ts.length ? `<div class="card table-wrap" style="overflow:hidden"><table class="t"><thead><tr><th>TEST</th><th>DOCTOR</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>
      ${ts.map(x => { const st = testStatus(x); return `<tr class="${t && x.id === t.id ? 'sel' : ''}" data-act="go" data-href="test-${x.id}" tabindex="0"><td class="name">${esc(x.name)}</td><td>${esc(doc(x.doc)?.name || '')}</td><td class="num">${x.status === 'advised' ? 'Est. ' : ''}${dm(x.date)}</td><td>${pill(st.label, st.tone)}</td></tr>`; }).join('')}
      </tbody></table></div>` : `<div class="card">${emptyRow('No tests match.')}</div>`;
  return { desk: `<header class="dhead"><div><h1>Tests</h1><p>${testsSub()}</p></div><div class="acts"><a class="btn btn-primary btn-md" href="#add-test">${I('add')}Add test</a></div></header>
    <div class="toolbar">${testFilters()}${searchBox()}</div>
    <div class="split-r">${table}${t ? `<div class="stack"><div><h2 style="font-size:26px;font-weight:700;letter-spacing:-.02em">${esc(t.name)}</h2><p class="hint" style="margin-top:3px">${t.status === 'advised' ? 'Advised' : 'Ordered'} by ${esc(doc(t.doc)?.name || '')}${visit(t.visit) ? ' · ' + dmy(visit(t.visit).date) : ''}</p></div>${testDetail(t)}</div>` : ''}</div>` };
}
function testsMob(){
  const ts = filteredTests();
  return { title:'Tests', sub: 'Every test a doctor advised, with its report.', action:`<a class="icon-btn" href="#add-test" aria-label="Add test">${I('add')}</a>`,
    body: `<div class="mstack"><div class="chips scroll">${[['all','All'],['advised','Advised'],['done','Done'],['attached','Attached']].map(([k,l]) => `<button type="button" class="chip ${U.testFilter === k ? 'on' : ''}" data-act="tfilter" data-f="${k}">${l}</button>`).join('')}</div>
      <div class="card list div">${ts.length ? ts.map(t => { const st = testStatus(t); return row({ lead: tile(t.name === 'ECG' ? 'monitor_heart' : 'science'), t: esc(t.name), s: `${esc(doc(t.doc)?.name || '')} · ${dm(t.date)}`, end: pill(st.label, st.tone), href:`test-${t.id}` }); }).join('') : emptyRow('No tests match.')}</div></div>` };
}
function testMob(t){
  return { title: esc(t.name), sub: `${t.status === 'advised' ? 'Advised' : 'Ordered'} by ${esc(doc(t.doc)?.name || '')}`, back:'tests',
    action:`<button type="button" class="icon-btn" data-act="testmore" data-id="${t.id}" aria-label="Add report or update test">${I('add')}</button>`, body: testDetail(t) };
}

/* ---- Add test / doctor ---- */
VIEWS['add-test'] = (r, desk) => {
  const ds = docs();
  const f = `<div class="field"><label for="t_name">Test name</label><input class="input ${U.formErr.name ? 'err' : ''}" id="t_name" name="name" placeholder="e.g. Lipid profile">${U.formErr.name ? `<span class="err-text">${esc(U.formErr.name)}</span>` : ''}</div>
    <div class="field"><label for="t_doc">Advised by</label><select class="input" id="t_doc" name="doc">${ds.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></div>
    <div class="field"><span class="label">Status</span><div class="chips" data-radio="status"><button type="button" class="chip on" data-act="radio" data-v="advised">Advised</button><button type="button" class="chip" data-act="radio" data-v="done">Done</button></div><input type="hidden" name="status" value="advised"></div>
    <div class="grid2"><div class="field"><label for="t_date">Date</label><input class="input" type="date" id="t_date" name="date" value="${iso(TODAY)}"></div><div class="field"><label for="t_venue">Venue <span class="opt">(optional)</span></label><input class="input" id="t_venue" name="venue" placeholder="e.g. Popular Diagnostic"></div></div>`;
  return simpleForm('test', 'Add test', 'Track a test a doctor advised. Attach the report later.', f, 'Save test', 'tests', desk);
};
VIEWS['add-doctor'] = (r, desk) => doctorForm(null, desk);
VIEWS.editdoctor = (r, desk) => doctorForm(doc(r.id), desk);
function doctorForm(d, desk){
  const key = d ? d.id : 'new';
  if (U.chKey !== key) { U.chKey = key; U.chN = Math.max(1, d?.chambers?.length || 0); }
  const links = (d?.links || []).map(l => typeof l === 'string' ? { label:l } : l);
  const site = links.find(l => l.url && !l.note), notes = links.find(l => l.note != null);
  const fld = (id, name, label, ph, val, opt) => `<div class="field"><label for="${id}">${label}${opt ? ' <span class="opt">(optional)</span>' : ''}</label><input class="input" id="${id}" name="${name}" placeholder="${ph}" value="${esc(val || '')}"></div>`;
  const chambers = Array.from({ length: U.chN }, (_, i) => { const c = d?.chambers?.[i] || {};
    return `<div class="chgroup">${secH('Chamber ' + (i + 1))}${fld('ch_' + i, 'ch_' + i, 'Chamber name', 'e.g. Square Hospital', c.name)}${fld('ph_' + i, 'ph_' + i, 'Phone', 'Chamber phone', c.phone)}${fld('in_' + i, 'in_' + i, 'Days and time', 'e.g. Sat–Wed, 6–8 PM', c.info)}</div>`; }).join('');
  const f = `<div class="fgroup"><div class="field"><label for="d_name">Name</label><input class="input ${U.formErr.name ? 'err' : ''}" id="d_name" name="name" placeholder="Dr. full name" value="${esc(d?.name || '')}">${U.formErr.name ? `<span class="err-text">${esc(U.formErr.name)}</span>` : ''}</div>
    ${fld('d_spec', 'spec', 'Specialty', 'e.g. Cardiologist', d?.spec)}</div>
    <div class="fgroup chambers">${chambers}<button type="button" class="btn btn-white btn-block" data-act="addchamber">Add another chamber</button></div>
    <div class="fgroup tight">${fld('d_url', 'url', 'Website or link', 'https://', site?.url, true)}${fld('d_notes', 'notes', 'Notes', 'Anything worth remembering', notes?.note, true)}</div>`;
  return simpleForm('doctor', d ? 'Edit doctor' : 'Add doctor', 'Their visits, prescriptions and tests stay together.', f, d ? 'Save changes' : 'Save doctor', d ? 'doctor-' + d.id : 'doctors', desk, d?.id);
}
function simpleForm(kind, title, sub, fields, cta, back, desk, id=''){
  if (desk) return { desk: `<form data-form="${kind}" data-id="${id}" novalidate class="stack" style="gap:34px"><header class="dhead"><div class="dtitle"><button type="button" class="icon-btn" data-act="back" data-fallback="${back}" aria-label="Back">${I('arrow_back')}</button><div><h1>${title}</h1><p>${sub}</p></div></div>
      <div class="acts"><button type="button" class="btn btn-white btn-md" data-act="back" data-fallback="${back}">Cancel</button><button class="btn btn-primary btn-md" type="submit">${cta}</button></div></header>
      <div class="card formcard form">${fields}</div></form>` };
  return { title, sub, back, body:`<form data-form="${kind}" data-id="${id}" id="sf" novalidate class="form">${fields}</form>`, stick:`<button class="btn btn-primary btn-block" type="submit" form="sf">${cta}</button>` };
}

/* ---- Medications ---- */
VIEWS.meds = (r, desk) => {
  const all = meds(), cur = all.filter(m => m.status === 'current'), stp = all.filter(m => m.status === 'stopped');
  const sub = `${cur.length} current · ${stp.length} stopped`;
  if (desk) {
    const list = all.filter(m => U.medFilter === 'all' || m.status === U.medFilter);
    const f = [['current','Current'],['stopped','Stopped'],['all','All']];
    return { desk: `<header class="dhead"><div><p class="crumb"><a href="#home">Home</a> / Medications</p><h1>Medications</h1><p>${sub}</p></div><div class="acts"><a class="btn btn-primary btn-md" href="#add-med">${I('add')}Add medication</a></div></header>
      <div class="chips">${f.map(([k,l]) => `<button type="button" class="chip ${U.medFilter === k ? 'on' : ''}" data-act="mfilter" data-f="${k}">${l}</button>`).join('')}</div>
      ${list.length ? `<div class="card table-wrap" style="overflow:hidden"><table class="t"><thead><tr><th>MEDICINE</th><th>DOSE &amp; TIMING</th><th>PRESCRIBED BY</th><th>SINCE</th><th>LINKED VISIT</th><th>STATUS</th></tr></thead><tbody>
      ${list.map(m => `<tr data-act="med" data-id="${m.id}" tabindex="0"><td class="name">${esc(m.name)}</td><td>${esc(m.dose)}</td><td>${esc(doc(m.doc)?.name || '')}</td><td class="num">${dmy(m.since)}</td><td class="num">${m.visit && visit(m.visit) ? dmy(visit(m.visit).date) : '—'}</td><td>${m.status === 'current' ? pill('Current','teal') : pill('Stopped','grey')}</td></tr>`).join('')}
      </tbody></table></div>` : `<div class="card">${emptyRow('Nothing here yet.','Add medication','add-med')}</div>`}` };
  }
  const mrow = m => row({ lead: tile('medication'), t: esc(m.name), s: `${esc(doc(m.doc)?.name || '')} · ${m.status === 'current' ? 'since ' + dm(m.since) : dm(m.since) + '–' + (m.until ? dm(m.until) : '')}`,
      end: `<span class="end"><span class="s">${esc(m.freq || '')}</span>${m.status === 'current' ? pill('Taking','teal') : pill('Stopped','grey')}</span>`, act:'med', attrs:`data-id="${m.id}"` });
  return { title:'Medications', sub:'', back:'home', action:`<a class="icon-btn" href="#add-med" aria-label="Add medication">${I('add')}</a>`,
    body: `<section>${secH('Current')}<div class="card list div compact">${cur.length ? cur.map(mrow).join('') : emptyRow('No current medications.')}</div></section>
      ${stp.length ? `<section>${secH('Stopped')}<div class="card list div compact">${stp.map(mrow).join('')}</div></section>` : ''}` };
};
VIEWS['add-med'] = (r, desk) => {
  const ds = docs(), vs = visits();
  const f = `<div class="field"><label for="m_name">Medicine name</label><input class="input ${U.formErr.name ? 'err' : ''}" id="m_name" name="name" placeholder="e.g. Amlodipine 5mg">${U.formErr.name ? `<span class="err-text">${esc(U.formErr.name)}</span>` : ''}</div>
    <div class="field"><label for="m_dose">Dose and timing</label><input class="input" id="m_dose" name="dose" placeholder="e.g. Once daily, after breakfast"></div>
    <div class="field"><label for="m_doc">Prescribed by</label><select class="input" id="m_doc" name="doc">${ds.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}<option value="">Not from a doctor</option></select></div>
    <div class="field"><label for="m_visit">Linked visit <span class="opt">(optional)</span></label><select class="input" id="m_visit" name="visit"><option value="">None</option>${vs.map(v => `<option value="${v.id}">${dmy(v.date)} · ${esc(doc(v.doc).name)}</option>`).join('')}</select><span class="hint">Link it to a visit so it stays with that record.</span></div>
    <div class="field"><span class="label">Status</span><div class="chips" data-radio="status"><button type="button" class="chip on" data-act="radio" data-v="current">Taking now</button><button type="button" class="chip" data-act="radio" data-v="stopped">Stopped</button></div><input type="hidden" name="status" value="current"></div>
    <div class="field"><label for="m_since">Started on</label><input class="input" type="date" id="m_since" name="since" value="${iso(TODAY)}"></div>`;
  return simpleForm('med', 'Add medication', 'Link it to a visit so it stays with that record.', f, 'Save medication', 'meds', desk);
};

/* ---- Me, profiles, history, activity, share ---- */
const ME_TABS = [['me','Profile & account'],['history','Medical history'],['activity','Activity'],['share','Share']];
const meTabs = (cur, mob) => `<div class="chips ${mob ? 'scroll' : ''}">${ME_TABS.map(([k,l]) => `<a class="chip ${cur === k ? 'on' : ''}" href="#${k}">${l}</a>`).join('')}</div>`;
function profileRows(){
  return S.profiles.map(p => { const n = S.doctors.filter(d => d.pid === p.id).length, pt = S.tests.filter(t => t.pid === p.id && t.status !== 'attached').length;
    const label = `${esc(p.short)} (${esc(p.rel)})`;
    return row({ lead: av(p.name, p.tone), t: label, s: `${plural(n,'doctor')}${pt ? ' · ' + plural(pt,'pending test') : ''}`, end: p.id === S.active ? pill('Active','teal') : chev(), act:'useprofile', attrs:`data-id="${p.id}"` }); }).join('');
}
function meWrap(cur, title, sub, inner, desk, action){
  if (desk) return { desk: `<header class="dhead"><div><h1>${title}</h1><p>${sub}</p></div>${action ? `<div class="acts">${action}</div>` : ''}</header>${meTabs(cur)}${inner}` };
  return { title, sub, body: inner, back: cur === 'me' ? null : 'me' };
}
VIEWS.me = (r, desk) => {
  const del = U.confirmDelete ? `<div class="confirm" role="alert">Delete everything for every profile? This can't be undone.<div class="acts"><button type="button" class="btn btn-danger solid btn-sm" data-act="dodelete">Delete account</button><button type="button" class="btn btn-white btn-sm" data-act="canceldelete">Keep my account</button></div></div>` : '';
  if (LIVE && U.accessLog == null) { U.accessLog = 'loading'; API.myAccessLog().then(r => { U.accessLog = r; render(); }).catch(() => { U.accessLog = []; }); }
  const viewed = !LIVE ? '' : `<section>${secH('Who viewed my records')}<div class="card list div">${!Array.isArray(U.accessLog) ? emptyRow('Loading…')
      : U.accessLog.length ? U.accessLog.slice(0, 5).map(a => row({ lead: tile('visibility'), t: `Docly support viewed ${esc(a.what === 'all records' ? 'your records' : 'a file')}`, s: `${esc(fmtWhen(a.created_at))}${a.reason ? ' · ' + esc(a.reason) : ''}` })).join('')
      : emptyRow('No one at Docly has opened your records.')}</div></section>`;
  const right = `<div class="stack">${S.isAdmin ? `<section>${secH('Admin')}<div class="card list">${row({ lead: tile('admin_panel_settings'), t:'Admin', s:'Users, records and access log', end: chev(), href:'admin' })}</div></section>` : ''}<section>${secH('Account')}<div class="card list div">${row({ lead: tile('key'), t: hasPass() ? 'Change password' : 'Add a password', s: hasPass() ? 'Sign in with email and password' : 'Not set · sign in without waiting for an email', end: chev(), href:'password' })}${row({ lead: tile('arrow_back'), t:'Sign out', end: chev(), act:'signout' })}</div></section>${viewed}
    <section>${secH('Danger zone')}<div class="card pad" style="text-align:center"><button type="button" class="btn btn-danger btn-block btn-md" data-act="askdelete">Delete account</button><p class="hint" style="margin-top:13px;font-size:11px">Erases every profile, visit and report. This can't be undone.</p>${del}</div></section></div>`;
  const left = `<div class="stack"><div class="card list div">${profileRows()}</div>${desk ? '' : `<a class="btn btn-primary btn-block" href="#add-profile">${I('add')}Add profile</a>
     <section>${secH('Records')}<div class="card list div">${row({ lead: tile('medication'), t:'Medications', s:`${meds().filter(m => m.status==='current').length} current`, end: chev(), href:'meds' })}${row({ lead: tile('monitor_heart'), t:'Medical history', s:'Built from your visits', end: chev(), href:'history' })}</div></section>`}</div>`;
  if (!desk) {
    const recs = `<section>${secH('Records')}<div class="card list">
      ${row({ lead: tile('group'), t:'Manage profiles', s: esc(S.profiles.map(p => p.short).join(', ')), end: chev(), href:'profiles' })}
      ${row({ lead: tile('monitor_heart'), t:'Medical history', s:'Built from your visits and tests', end: chev(), href:'history' })}
      ${row({ lead: tile('medication', true), t:'Medications', s:'Current and past, with doses', end: chev(), href:'meds' })}
      ${row({ lead: tile('notifications'), t:'Activity log', s:'Every change, by who and when', end: chev(), href:'activity' })}
      ${row({ lead: tile('arrow_forward'), t:'Share a summary', s:'Read-only link for a new doctor', end: chev(), href:'share' })}
      ${row({ lead: tile('note_add'), t:'Export all data', s:'Download everything as one file', end: chev(), act:'export' })}</div></section>`;
    const acct = `<section>${secH('Account')}<div class="card list">${S.isAdmin ? row({ lead: tile('admin_panel_settings'), t:'Admin', s:'Users, records and access log', end: chev(), href:'admin' }) : ''}
      ${row({ lead: tile('key'), t: hasPass() ? 'Change password' : 'Add a password', s: hasPass() ? 'Sign in with email and password' : 'Sign in without waiting for an email', end: chev(), href:'password' })}
      ${row({ lead: tile('arrow_back'), t:'Sign out', end: chev(), act:'signout' })}</div></section>`;
    const danger = `<section>${secH('Danger zone')}<div class="card pad danger"><button type="button" class="btn btn-white btn-block danger-btn" data-act="askdelete">Delete account</button><p>Erases every profile, visit and report. This can't be undone.</p>${del}</div></section>`;
    return { title:'Me', sub:`Signed in as ${esc(S.email)}`, body: `${recs}${acct}${viewed}${danger}` };
  }
  const inner = `<div class="split-r" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)">${left}${right}</div>`;
  return meWrap('me', 'Me', `Signed in as ${esc(S.email)}`, inner, desk, `<a class="btn btn-white btn-md" href="#add-profile">${I('add')}Add profile</a>`);
};
VIEWS.password = (r, desk) => {
  const e = U.formErr || {}, has = hasPass();
  const f = `<div class="field"><label for="np1">New password</label><input class="input ${e.p1 ? 'err' : ''}" id="np1" name="p1" type="${U.showPw ? 'text' : 'password'}" autocomplete="new-password" placeholder="At least 8 characters" value="${esc((U.pwDraft || [])[0] || '')}">
      ${e.p1 ? `<span class="err-text">${esc(e.p1)}</span>` : `<span class="hint">At least 8 characters. Use letters and numbers.</span>`}</div>
    <div class="field"><label for="np2">Confirm password</label><input class="input ${e.p2 ? 'err' : ''}" id="np2" name="p2" type="${U.showPw ? 'text' : 'password'}" autocomplete="new-password" placeholder="Type it again" value="${esc((U.pwDraft || [])[1] || '')}">
      ${e.p2 ? `<span class="err-text">${esc(e.p2)}</span>` : ''}</div>
    <label class="check"><input type="checkbox" data-act="showpw2"${U.showPw ? ' checked' : ''}> Show passwords</label>`;
  return simpleForm('password', has ? 'Change password' : 'Add a password',
    has ? 'Pick a new password. You can still sign in with an email code any time.' : 'Sign in on any device with your email and this password. Email codes keep working too.',
    f, has ? 'Update password' : 'Save password', 'me', desk);
};
VIEWS.profiles = (r, desk) => ({ title:'Profiles', sub:"Pick who you're managing. The whole app switches to that person.", back:'home',
  body: `<div class="card list div compact">${profileRows()}</div><a class="btn btn-primary btn-block" href="#add-profile" style="margin-top:-2px">Add profile</a>` });
VIEWS['add-profile'] = (r, desk) => {
  const f = `<div class="field"><label for="p_name">Name</label><input class="input ${U.formErr.name ? 'err' : ''}" id="p_name" name="name" placeholder="Full name">${U.formErr.name ? `<span class="err-text">${esc(U.formErr.name)}</span>` : ''}</div>
    <div class="field"><label for="p_rel">Relationship</label><input class="input" id="p_rel" name="rel" placeholder="e.g. Mother, son, self"></div>
    <div class="field"><label for="p_dob">Date of birth <span class="opt">(optional)</span></label><input class="input" type="date" id="p_dob" name="dob"></div>
    <div class="field"><label for="p_blood">Blood group <span class="opt">(optional)</span></label><select class="input" id="p_blood" name="blood"><option value="">Select</option>${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => `<option>${b}</option>`).join('')}</select></div>`;
  return simpleForm('profile', 'Add profile', 'Only the name is required. You can add the rest later.', f, 'Save profile', desk ? 'me' : 'profiles', desk);
};
VIEWS.history = (r, desk) => {
  const cs = conds();
  const cards = cs.length ? `<div class="hcards">${cs.map(c => { const vs = visits().filter(v => v.cond === c.name); const vids = vs.map(v => v.id);
      const nt = tests().filter(t => vids.includes(t.visit)).length, nm = meds().filter(m => vids.includes(m.visit)).length;
      const last = vs[vs.length-1], d = last ? doc(last.doc) : null;
      const when = c.status === 'resolved' && c.until ? `${MON[pd(c.since).getMonth()]} – ${my(c.until)}` : `Since ${my(c.since)}`;
      return `<article class="card hcard"><div class="top"><h3>${esc(c.full || c.name)}</h3>${c.status === 'active' ? pill('Active','teal') : pill('Resolved','grey')}</div>
        <p>${when}${d ? ' · ' + esc(d.name) : ''}${last ? ' · ' + esc(last.chamber) : ''}</p><div class="divider" style="margin:5px 0"></div>
        <div class="chips">${vs[0] ? `<a class="chip" href="#visit-${vs[0].id}">${plural(vs.length,'visit')}</a>` : `<span class="chip">0 visits</span>`}<a class="chip" href="#tests">${plural(nt,'test')}</a><a class="chip" href="#meds">${plural(nm,'medication')}</a></div></article>`; }).join('')}</div>`
    : `<div class="card">${emptyRow('Add a condition when you save a visit, and it shows up here.','Add visit','add-visit')}</div>`;
  return meWrap('history', 'Medical history', `${esc(prof().short)} · built from your visits and tests`, cards, desk);
};
VIEWS.activity = (r, desk) => {
  const groups = {};
  S.activity.forEach(a => { (groups[a.day] = groups[a.day] || []).push(a); });
  const label = d => { const n = days(d); return n === 0 ? 'Today' : n === -1 ? 'Yesterday' : dm(d); };
  const inner = Object.keys(groups).sort().reverse().map(day => `<section>${secH(label(day))}<div class="card list">${groups[day].map(a => row({ lead: tile(a.icon), t: esc(a.text), s: `${esc(a.who)} · ${esc(a.time)}`, end: chev(), href: a.href })).join('')}</div></section>`).join('');
  return meWrap('activity', 'Activity', 'Every change, by who and when.', `<div class="stack" style="max-width:${desk ? '100%' : 'none'}">${inner}</div>`, desk);
};
VIEWS.share = (r, desk) => {
  const ds = docs();
  const link = U.newLink ? `<div class="field"><span class="label">Share link</span><div class="copybox"><span>${esc(shareUrl(U.newLink).replace(/^https?:\/\//, ''))}</span><button type="button" class="btn btn-teal btn-sm" data-act="copy">Copy link</button></div>
      <a class="link" href="#${LIVE ? 's-' + U.newLink : 'shared'}" style="font-size:12px">Preview what the doctor sees <span class="mi" aria-hidden="true" style="font-size:14px;vertical-align:-3px">arrow_forward</span></a></div>` : '';
  const active = S.shares.length ? `<section>${secH('Active links')}<div class="card list div">${S.shares.map(s => row({ lead: tile('arrow_forward'), t: esc(s.scope), s:`${esc(s.created)} · ${esc(s.exp)}`,
      end: U.revoke === s.id ? `<span style="display:flex;gap:5px"><button type="button" class="pill red" data-act="dorevoke" data-id="${s.id}">Revoke now</button><button type="button" class="pill grey" data-act="norevoke">Keep</button></span>` : `<button type="button" class="pill red" data-act="revoke" data-id="${s.id}">Revoke</button>` })).join('')}</div></section>` : '';
  const inner = `<div class="narrow"><div class="scope"><div class="field"><span class="label">What to share</span><div class="chips"><button type="button" class="chip ${U.shareScope === 'all' ? 'on' : ''}" data-act="scope" data-v="all">All doctors</button><button type="button" class="chip ${U.shareScope === 'one' ? 'on' : ''}" data-act="scope" data-v="one">One doctor</button></div>
      ${U.shareScope === 'one' ? `<select class="input" id="shareDoc" data-live="sd">${ds.map(d => `<option value="${d.id}" ${U.shareDoc === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select>` : ''}</div>
    <button type="button" class="btn btn-primary btn-block" data-act="genlink">Generate link</button></div>${link}${active}</div>`;
  return meWrap('share', desk ? 'Share a summary' : 'Share', 'A read-only link for a new doctor. It expires after 24 hours.', inner, desk);
};


/* ---- Admin (only for accounts in the admins table) ---- */
function adminLoad(){
  const A = U.admin;
  if (A.loading || A.loaded) return;
  A.loading = true;
  Promise.all([API.adminOverview(), API.adminUsers(), API.adminLog()]).then(([o, u, l]) => { Object.assign(U.admin, { overview:o, users:u, log:l, loaded:true, loading:false }); render(); },
    e => { U.admin.loading = false; U.admin.loaded = true; U.admin.err = friendly(e); render(); });
}
const mb = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(0, Math.round(n / 1024)) + ' KB';
const shortDate = ts => ts ? `${new Date(ts).getDate()} ${MON[new Date(ts).getMonth()]} ${new Date(ts).getFullYear()}` : '—';
function adminWrap(title, sub, inner, desk, back){
  if (desk) return { desk: `<header class="dhead"><div>${back ? `<p class="crumb"><a href="#admin">Admin</a> / Users</p>` : ''}<h1>${title}</h1><p>${sub}</p></div><div class="acts"><button type="button" class="btn btn-white btn-md" data-act="arefresh">${I('refresh')}Refresh</button></div></header>${inner}` };
  return { title, sub, back: back || 'me', body: inner };
}
VIEWS.admin = (r, desk) => {
  adminLoad(); const A = U.admin;
  if (!A.loaded) return adminWrap('Admin', 'Loading…', `<div class="card">${emptyRow('Loading users and activity…')}</div>`, desk);
  if (A.err) return adminWrap('Admin', 'Something went wrong', `<div class="card">${emptyRow(A.err)}</div>`, desk);
  const o = A.overview || {};
  const tabs = `<div class="chips ${desk ? '' : 'scroll'}">${[['overview','Overview'],['users','Users'],['log','Access log']].map(([k,l]) => `<button type="button" class="chip ${A.tab === k ? 'on' : ''}" data-act="atab" data-t="${k}">${l}</button>`).join('')}</div>`;
  let inner = '';
  if (A.tab === 'overview') {
    const stat = (n, label, sub) => `<div class="card stat"><b class="num">${n}</b><span>${label}</span><small>${sub || '&nbsp;'}</small></div>`;
    const byDay = {}; (o.signups_by_day || []).forEach(d => { byDay[String(d.day).slice(0,10)] = d.n; });
    const days30 = Array.from({ length:30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); const k = iso(d); return { day:k, n: byDay[k] || 0 }; });
    const max = Math.max(1, ...days30.map(d => d.n));
    const chart = (o.users || 0) ? `<div class="card pad"><div class="sec-h"><h2>Sign-ups, last 30 days</h2></div><div style="display:flex;align-items:flex-end;gap:4px;height:120px">${days30.map(d => `<div title="${dm(d.day)}: ${d.n}" style="flex:1;min-width:4px;height:${d.n ? Math.max(6, d.n / max * 100) : 2}%;background:${d.n ? 'var(--teal)' : 'var(--ink-12)'};border-radius:4px 4px 0 0"></div>`).join('')}</div></div>` : '';
    inner = `<div class="stats">${stat(o.users ?? 0, 'Users', `${o.new_7d ?? 0} new this week`)}${stat(o.active_7d ?? 0, 'Active this week', 'Signed in in the last 7 days')}${stat(o.visits ?? 0, 'Visits saved', `${o.visits_7d ?? 0} this week`)}${stat(o.files ?? 0, 'Files stored', mb(o.storage_bytes || 0))}</div>
      <div class="stats">${stat(o.profiles ?? 0, 'Profiles', 'People being tracked')}${stat(o.tests ?? 0, 'Tests', '')}${stat(o.meds ?? 0, 'Medications', '')}${stat(o.shares_active ?? 0, 'Live share links', 'Not expired or revoked')}</div>${chart}`;
  } else if (A.tab === 'users') {
    const q = (A.q || '').toLowerCase(), us = (A.users || []).filter(u => !q || (u.email || '').toLowerCase().includes(q));
    inner = `<label class="search" style="width:100%;max-width:360px"><span class="sr">Search users</span>${I('search')}<input class="input" id="aq" type="search" placeholder="Search by email" value="${esc(A.q || '')}" data-live="aq"></label>
      <div class="card table-wrap"><table class="t"><thead><tr><th>EMAIL</th><th>SIGNED UP</th><th>LAST SIGN-IN</th><th>PROFILES</th><th>VISITS</th><th>TESTS</th><th>MEDS</th><th>FILES</th><th>STORAGE</th></tr></thead><tbody>
      ${us.map(u => `<tr data-act="go" data-href="adminuser-${u.user_id}" tabindex="0"><td class="name" style="font-size:14px">${esc(u.email)}</td><td>${shortDate(u.signed_up)}</td><td>${shortDate(u.last_sign_in)}</td><td class="num">${u.profiles}</td><td class="num">${u.visits}</td><td class="num">${u.tests}</td><td class="num">${u.meds}</td><td class="num">${u.files}</td><td class="num">${mb(u.storage_bytes || 0)}</td></tr>`).join('') || `<tr><td colspan="9">No users match.</td></tr>`}
      </tbody></table></div>`;
  } else {
    inner = `<div class="card table-wrap"><table class="t"><thead><tr><th>WHEN</th><th>ADMIN</th><th>USER</th><th>OPENED</th><th>REASON</th></tr></thead><tbody>
      ${(A.log || []).map(l => { const u = (A.users || []).find(x => x.user_id === l.user_id); return `<tr><td>${esc(fmtWhen(l.created_at))}</td><td>${esc(l.admin_email || '')}</td><td>${esc(u ? u.email : l.user_id)}</td><td>${esc(l.what)}</td><td style="white-space:normal;min-width:200px">${esc(l.reason || '')}</td></tr>`; }).join('') || `<tr><td colspan="5">No one has opened any records yet.</td></tr>`}
      </tbody></table></div>`;
  }
  return adminWrap('Admin', `${o.users ?? 0} users · ${o.visits ?? 0} visits saved`, `${tabs}${inner}`, desk);
};
VIEWS.adminuser = (r, desk) => {
  adminLoad(); const A = U.admin, user = r.id;
  const u = (A.users || []).find(x => x.user_id === user);
  if (!A.loaded) return adminWrap('User', 'Loading…', `<div class="card">${emptyRow('Loading…')}</div>`, desk, 'admin');
  if (!u) return adminWrap('User not found', 'They may have been deleted.', `<a class="btn btn-white btn-md" href="#admin">Back to users</a>`, desk, 'admin');
  const del = U.confirmAdminDelete === user ? `<div class="confirm" role="alert">Delete ${esc(u.email)} and every profile, visit and file they saved? This can't be undone.<div class="acts"><button type="button" class="btn btn-danger solid btn-sm" data-act="adelyes" data-user="${user}">${U.busy ? 'Deleting…' : 'Delete user'}</button><button type="button" class="btn btn-white btn-sm" data-act="adelno">Cancel</button></div></div>` : '';
  const facts = `<div class="card"><dl class="kv"><div><dt>Signed up</dt><dd>${shortDate(u.signed_up)}</dd></div><div><dt>Last sign-in</dt><dd>${shortDate(u.last_sign_in)}</dd></div><div><dt>Last activity</dt><dd>${shortDate(u.last_activity)}</dd></div>
    <div><dt>Profiles · visits · tests · meds</dt><dd class="num">${u.profiles} · ${u.visits} · ${u.tests} · ${u.meds}</dd></div><div><dt>Files</dt><dd class="num">${u.files} · ${mb(u.storage_bytes || 0)}</dd></div></dl>
    <div style="padding:0 21px 21px"><button type="button" class="btn btn-danger btn-sm" data-act="adel" data-user="${user}">${I('delete')}Delete user</button>${del}</div></div>`;
  const R = U.adminRec[user];
  let recs;
  if (!R) recs = `<form data-form="adminopen" data-user="${user}" class="card pad form" novalidate style="gap:13px"><div><b>Open this user's health records</b><p class="hint" style="margin-top:5px">The user sees that Docly support viewed their records, with the reason you write here. Every file you open is logged too.</p></div>
      <div class="field"><label for="a_reason">Reason</label><input class="input ${U.formErr.reason ? 'err' : ''}" id="a_reason" name="reason" placeholder="e.g. User asked for help with a missing report">${U.formErr.reason ? `<span class="err-text">${esc(U.formErr.reason)}</span>` : ''}</div>
      <button class="btn btn-primary btn-md" type="submit">${I('lock_open')}${U.busy ? 'Opening…' : 'Open records'}</button></form>`;
  else {
    const x = R.rec, dname = id => (x.doctors.find(d => d.id === id) || {}).name || '';
    const pname = id => (x.profiles.find(p => p.id === id) || {}).name || '';
    const file = (path, label) => U.adminFiles[path] ? `<a class="btn btn-white btn-sm" href="${esc(U.adminFiles[path])}" target="_blank" rel="noopener">${I('open_in_new')}Open ${esc(label)}</a>` : `<button type="button" class="btn btn-white btn-sm" data-act="afile" data-user="${user}" data-path="${esc(path)}">${I('visibility')}View ${esc(label)}</button>`;
    const sec = (t, body) => `<section>${secH(t)}<div class="card list div">${body || emptyRow('None.')}</div></section>`;
    recs = `<p class="hint">Opened for: ${esc(R.reason)}. This view is logged.</p>
      ${sec('Profiles', x.profiles.map(p => row({ lead: av(p.name, p.tone), t: esc(p.name), s: `${esc(p.rel)}${p.blood ? ' · ' + esc(p.blood) : ''}${p.dob ? ' · born ' + dmy(p.dob) : ''}` })).join(''))}
      ${sec('Visits', x.visits.map(v => { const pages = x.visit_pages.filter(pg => pg.visit_id === v.id);
        return `<div class="row" style="align-items:flex-start">${dtile(v.date)}<div class="body"><span class="t">${esc(dname(v.doctor_id))} · ${esc(v.reason || 'Visit')}</span><span class="s">${esc(pname(v.profile_id))}${v.chamber ? ' · ' + esc(v.chamber) : ''}${v.cond ? ' · ' + esc(v.cond) : ''}</span>${v.said ? `<p style="margin-top:5px;font-size:13px">“${esc(v.said)}”</p>` : ''}${pages.length ? `<div class="chips" style="margin-top:8px">${pages.map((pg, i) => file(pg.path, 'page ' + (i + 1))).join('')}</div>` : ''}</div></div>`; }).join(''))}
      ${sec('Tests', x.tests.map(t => row({ lead: tile('science'), t: esc(t.name), s: `${esc(pname(t.profile_id))} · ${esc(dname(t.doctor_id))}${t.date ? ' · ' + dm(t.date) : ''} · ${esc(t.status)}`, end: t.report_path ? file(t.report_path, 'report') : '' })).join(''))}
      ${sec('Medications', x.meds.map(m => row({ lead: tile('medication'), t: esc(m.name), s: `${esc(pname(m.profile_id))} · ${esc(m.dose || '')} · ${esc(m.status)}` })).join(''))}
      ${sec('Conditions', x.conditions.map(c => row({ lead: tile('monitor_heart'), t: esc(c.name), s: `${esc(pname(c.profile_id))} · ${esc(c.status)}` })).join(''))}`;
  }
  const inner = desk ? `<div class="split-r"><div class="stack">${recs}</div><div class="stack">${facts}</div></div>` : `${facts}${recs}`;
  return adminWrap(esc(u.email), `Joined ${shortDate(u.signed_up)}`, inner, desk, 'admin');
};

/* ---- Shared (doctor view) ---- */
function sharedFromLocal(){
  const p = prof();
  return { name: p.name, age: p.age, blood: p.blood, shared_by: p.short, expires_at: null,
    conditions: conds().filter(c => c.status === 'active').map(c => c.name),
    meds: meds().filter(m => m.status === 'current').map(m => ({ name: m.name, dose: m.dose, since: m.since, doctor: doc(m.doc)?.name || '' })),
    visits: visits().slice(0, 5).map(v => ({ date: v.date, doctor: doc(v.doc)?.name || '', said: v.said })),
    reports: tests().filter(t => t.report).map(t => ({ name: t.name, date: t.date, doctor: doc(t.doc)?.name || '' })) };
}
function sharedView(r){
  let D;
  if (LIVE) {
    const token = r.id || '';
    if (!U.shared || U.shared.token !== token) { U.shared = { token, loading:true }; API.shared(token).then(d => { U.shared = { token, data:d }; render(); }).catch(() => { U.shared = { token, data:null }; render(); }); }
    if (U.shared.loading) return loadingView();
    D = U.shared.data;
    if (!D) return `<div class="shared"><div class="top">${logo()}</div><div class="col"><div class="card pad" style="text-align:center"><h1 style="font-size:21px">This link has expired</h1><p class="hint" style="margin-top:8px;font-size:14px">Shared summaries last 24 hours, or until the owner revokes them. Ask them to send a new link.</p></div></div></div>`;
  } else D = sharedFromLocal();
  const hrs = D.expires_at ? Math.max(1, Math.round((new Date(D.expires_at) - Date.now()) / 36e5)) : 23;
  const sub = [D.shared_by ? 'Shared by ' + D.shared_by : 'Shared summary', ...(D.conditions || []), D.blood ? 'Blood group ' + D.blood : ''].filter(Boolean).join(' · ');
  return `<div class="shared"><div class="top">${logo()}<span class="pill teal" style="height:26px;padding:0 13px">Read-only · expires in ${hrs}h</span></div>
    <div class="col"><div><h1>${esc(D.name)}${D.age ? ', ' + D.age : ''}</h1><p class="hint" style="font-size:14px;margin-top:5px">${esc(sub)}</p></div>
    <section>${secH('Current medications')}<div class="card list">${D.meds.length ? D.meds.map(m => row({ lead: tile('medication'), t: esc(m.name), s: `${esc(m.dose || '')}${m.doctor ? ' · ' + esc(m.doctor) : ''}${m.since ? ' · since ' + dm(m.since) : ''}` })).join('') : emptyRow('None.')}</div></section>
    <section>${secH('Recent visits')}<div class="card list">${D.visits.length ? D.visits.map(v => row({ lead: dtile(v.date), t: esc(v.doctor), s: esc(v.said || '') })).join('') : emptyRow('None.')}</div></section>
    <section>${secH('Test reports')}<div class="card list">${D.reports.length ? D.reports.map(t => row({ lead: tile('science'), t: esc(t.name), s: `${t.date ? dm(t.date) : ''}${t.doctor ? ' · ' + esc(t.doctor) : ''}` })).join('') : emptyRow('None.')}</div></section>
    <p class="hint" style="text-align:center">Shared via Docly${S.signedIn ? ` · <a class="link" href="#share">Back to the app</a>` : ''}</p></div></div>`;
}
function shareUrl(token){ return location.href.split('#')[0] + (LIVE ? '#s-' + token : '#shared'); }
function loadingView(){ return `<div style="min-height:100vh;display:grid;place-items:center"><div style="display:flex;flex-direction:column;align-items:center;gap:13px">${logo()}<span class="hint">Loading your records…</span></div></div>`; }
function fmtWhen(ts){ const d = new Date(ts); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`; }

/* ---- First sign-in: create your own profile ---- */
function setupView(desk){
  const body = `<form data-form="setup" class="form" novalidate>
      <div class="field"><label for="su_name">Your name</label><input class="input ${U.formErr.name ? 'err' : ''}" id="su_name" name="name" autocomplete="name" placeholder="Full name">${U.formErr.name ? `<span class="err-text">${esc(U.formErr.name)}</span>` : ''}</div>
      <div class="grid2"><div class="field"><label for="su_dob">Date of birth <span class="opt">(optional)</span></label><input class="input" type="date" id="su_dob" name="dob"></div>
      <div class="field"><label for="su_blood">Blood group <span class="opt">(optional)</span></label><select class="input" id="su_blood" name="blood"><option value="">Select</option>${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => `<option>${b}</option>`).join('')}</select></div></div>
      <button class="btn btn-primary btn-block" type="submit">${U.busy ? 'Saving…' : 'Continue'}${I('arrow_forward')}</button></form>`;
  return `<div class="auth-m"><div class="grow">${logo()}<div style="display:flex;flex-direction:column;gap:8px"><h1>Let's set up your records.</h1><p class="lead">Start with your own profile. You can add family members later.</p></div>${body}</div></div>`;
}

/* ================= Sheet & toast ================= */
function sheetHtml(){
  const s = U.sheet; if (!s) return '';
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(s.title)}" data-act="noop"><div class="grab"></div>
    <h3>${esc(s.title)}</h3>${s.sub ? `<p class="sub">${esc(s.sub)}</p>` : ''}<div class="list div">${s.items.map(it => row({ lead: it.lead || tile(it.icon), t: esc(it.label), s: it.sub ? esc(it.sub) : '', end: it.end || chev(), act: it.act, attrs: it.attrs || '' })).join('')}</div></div></div>`;
}
let toastTimer;
function toastHtml(){ return U.toast ? `<div class="toast" role="status">${I('check_circle','fill')}${esc(U.toast)}</div>` : ''; }
function toast(msg){ U.toast = msg; clearTimeout(toastTimer); render(); toastTimer = setTimeout(() => { U.toast = null; const t = document.querySelector('.toast'); if (t) t.remove(); }, 2600); }
function openSheet(s){ U.sheet = s; render(); }
function closeSheet(){ U.sheet = null; render(); }
function log(icon, text, href){ API.log(icon, text, href); }

/* ================= Files ================= */
let pickCtx = null;
function pick(kind, id, el){
  const f = document.getElementById('fileIn');
  pickCtx = { kind, id };
  const photo = /photo|snap/.test(kind);
  f.accept = photo ? 'image/*' : 'image/*,application/pdf';
  if (photo && !mq.matches) f.setAttribute('capture','environment'); else f.removeAttribute('capture');
  f.value = '';
  f.click();
}
function readImage(file){
  return new Promise(res => {
    if (!file.type.startsWith('image/')) { res({ pdf: file.name, file }); return; }
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { const max = 900, k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width*k); c.height = Math.round(img.height*k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res({ img: c.toDataURL('image/jpeg', .72), name: file.name }); };
    img.onerror = () => res({ pdf: file.name, file });
    img.src = url;
  });
}
document.getElementById('fileIn').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file || !pickCtx) return;
  const data = await readImage(file); const { kind, id } = pickCtx; pickCtx = null;
  if (kind.startsWith('visit')) { const v = visit(id); toast('Uploading…'); busy(async () => { await API.savePages(v, [...(v.pages || []), data]); log('photo_camera', `Added prescription page · ${doc(v.doc).name}`, 'visit-' + v.id); save(); toast('Page added to prescription'); }); }
  else if (kind.startsWith('draft')) { snapshotForm(); U.draft.pages.push(data); render(); restoreForm(); }
  else if (kind.startsWith('test')) { attachReport(id, data); }
  else if (kind === 'snap') { U.snapData = data; const pt = pendingTests();
    openSheet({ title:'Attach this report to', sub:'Pick the test it belongs to.', items: [...pt.map(t => ({ icon:'science', label:t.name, sub:`${doc(t.doc)?.name || ''} · ${testStatus(t).label}`, act:'snapto', attrs:`data-id="${t.id}"` })),
      { icon:'add', label:'New test', sub:'Save it as a new test report', act:'snapnew' }] }); }
});
function attachReport(id, data){
  const t = test(id); if (LIVE) toast('Uploading…');
  return busy(async () => { await API.attachReport(t, data); log('photo_camera', `Attached report to ${t.name}`, 'test-' + t.id); save(); toast(`Report attached to ${t.name}`); });
}

/* Keep typed values across re-renders of the visit form */
function snapshotForm(){
  const f = document.querySelector('form[data-form="visit"]'); if (!f) return;
  U.snap = {}; f.querySelectorAll('input[name],select[name],textarea[name]').forEach(el => { U.snap[el.name] = el.value; });
  const nn = f.querySelector('#nd_name'), ns = f.querySelector('#nd_spec'); if (nn) U.ndName = nn.value; if (ns) U.ndSpec = ns.value;
  if (U.draft) U.draft.cond = (f.querySelector('#f_cond') || {}).value || U.draft.cond;
}
function restoreForm(){
  const f = document.querySelector('form[data-form="visit"]'); if (!f || !U.snap) return;
  Object.entries(U.snap).forEach(([k,v]) => { const el = f.querySelector(`[name="${k}"]`); if (!el || k === 'cond') return; if (el.tagName === 'SELECT' && ![...el.options].some(o => o.value === v)) return; el.value = v; });
  U.snap = null;
}

/* ================= Events ================= */
const ACTS = {
  noop(){},
  back(el){ STACK.pop(); const prev = STACK.pop(); go(prev != null ? prev : (el.dataset.fallback || 'home')); },
  go(el){ go(el.dataset.href); },
  toast(el, e){ e.preventDefault(); toast(el.dataset.msg); },
  usepass(el, e){ e.preventDefault(); U.emailDraft = document.getElementById('email')?.value || U.emailDraft; U.usePass = !U.usePass; U.passErr = ''; render(); document.getElementById(U.usePass ? 'password' : 'email')?.focus(); },
  showpw(el, e){ e.preventDefault(); const v = document.getElementById('password')?.value || ''; U.showPw = !U.showPw; render(); const i = document.getElementById('password'); if (i) { i.value = v; i.focus(); } },
  showpw2(el){ U.showPw = el.checked; ['np1','np2'].forEach(id => { const i = document.getElementById(id); if (i) i.type = el.checked ? 'text' : 'password'; }); },
  nudgeoff(){ U.nudgeOff = true; try { localStorage.setItem(NUDGEKEY, LIVE && USER ? USER.id : 'demo'); } catch(e) {} render(); },
  mode(el, e){ e.preventDefault(); U.authMode = U.authMode === 'signin' ? 'signup' : 'signin'; render(); },
  resend(el, e){ e.preventDefault(); API.sendCode(S.email).then(() => { U.resendAt = Date.now() + 60000; U.otpErr = ''; U.expired = false; U.tries = 3; toast('New code sent'); }, err => { U.otpErr = friendly(err); render(); }); },
  fab(){ openSheet({ title:'Add a record', items:[
    { icon:'note_add', label:'Add visit', sub:'Doctor, prescription and advice', act:'go', attrs:'data-href="add-visit"' },
    { icon:'photo_camera', label:'Snap report', sub:'Photo of a test report', act:'snap' },
    { icon:'science', label:'Add test', sub:'A test a doctor advised', act:'go', attrs:'data-href="add-test"' },
    { icon:'medication', label:'Add medication', sub:'What you take and who prescribed it', act:'go', attrs:'data-href="add-med"' } ] }); },
  closesheet(el, e){ if (e.target === el) closeSheet(); },
  switch(){ openSheet({ title:'Switch profile', sub:'The whole app switches to that person.', items:[
    ...S.profiles.map(p => ({ lead: av(p.name, p.tone, 'sm'), label: `${p.short} (${p.rel})`, end: p.id === S.active ? pill('Active','teal') : chev(), act:'useprofile', attrs:`data-id="${p.id}"` })),
    { icon:'add', label:'Add profile', act:'go', attrs:'data-href="add-profile"' } ] }); },
  useprofile(el){ S.active = el.dataset.id; save(); U.sheet = null; U.draft = null; toast(`Now viewing ${prof().short}`); },
  snap(){ U.sheet = null; render(); pick('snap'); },
  snapto(el){ U.sheet = null; attachReport(el.dataset.id, U.snapData); },
  snapnew(){ U.sheet = null; const d = U.snapData; busy(async () => { const t = await API.createTest({ name: 'Report · ' + dm(iso(new Date(LIVE ? Date.now() : TODAY))), doc: docs()[0]?.id || '', status:'done', date: iso(LIVE ? new Date() : TODAY) });
    U.busy = false; await attachReport(t.id, d); go('test-' + t.id); }); },
  addchamber(){ const f = document.querySelector('form[data-form="doctor"]'); const snap = {}; f.querySelectorAll('input[name]').forEach(i => { snap[i.name] = i.value; });
    U.chN = (U.chN || 1) + 1; render(); const g = document.querySelector('form[data-form="doctor"]'); Object.entries(snap).forEach(([k,v]) => { const el = g.querySelector(`[name="${k}"]`); if (el) el.value = v; });
    g.querySelector(`#ch_${U.chN - 1}`)?.focus(); },
  pick(el){ U.sheet = null; pick(el.dataset.kind, el.dataset.id, el); },
  doctormore(el){ const id = el.dataset.id; openSheet({ title: doc(id).name, items:[
    { icon:'note_add', label:'Add visit', sub:'Prescription, advice and tests', act:'addvisit', attrs:`data-doc="${id}"` },
    { icon:'edit', label:'Edit doctor', sub:'Name, speciality and chamber', act:'go', attrs:`data-href="editdoctor-${id}"` } ] }); },
  testmore(el){ const t = test(el.dataset.id); openSheet({ title: t.name, items:[
    { icon:'photo_camera', label:'Take photo', sub:'Snap the report', act:'pick', attrs:`data-kind="test-photo" data-id="${t.id}"` },
    { icon:'upload', label:'Upload PDF', sub:'Or a photo from your files', act:'pick', attrs:`data-kind="test-file" data-id="${t.id}"` },
    ...(t.status === 'advised' ? [{ icon:'check', label:'Mark as done', sub:'The test is done, report comes later', act:'markdone', attrs:`data-id="${t.id}"` }] : []) ] }); },
  export(){ const data = { exported: new Date().toISOString(), account: S.email, profiles: S.profiles, doctors: S.doctors, visits: S.visits, tests: S.tests, meds: S.meds, conditions: S.conds, activity: S.activity };
    const strip = o => JSON.parse(JSON.stringify(o, (k, v) => (k === 'img' && typeof v === 'string' && v.startsWith('data:')) ? '[image]' : (k === 'file' ? undefined : v)));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(strip(data), null, 2)], { type:'application/json' }));
    a.download = `docly-export-${iso(new Date())}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Export downloaded'); },
  visitmore(el){ const id = el.dataset.id; openSheet({ title:'Visit', items:[
    { icon:'photo_camera', label:'Take photo', sub:'Add a prescription page', act:'pick', attrs:`data-kind="visit-photo" data-id="${id}"` },
    { icon:'upload', label:'Upload file', sub:'Photo or PDF', act:'pick', attrs:`data-kind="visit-file" data-id="${id}"` },
    { icon:'edit', label:'Edit visit', sub:'Doctor, date, notes and fee', act:'go', attrs:`data-href="editvisit-${id}"` } ] }); },
  page(el){ U.viewerPage = Number(el.dataset.i) || 0; },
  vpage(el){ const v = visit(parse().id); const n = (v.pages||[]).length; U.viewerPage = (U.viewerPage + Number(el.dataset.d) + n) % n; render(); },
  addvisit(el, e){ e.preventDefault(); U.sheet = null; U.draft = null; U.pendingDoc = el.dataset.doc; go('add-visit'); },
  pickdoc(el){ snapshotForm(); U.draft.doc = el.dataset.id; U.newDoc = false; U.formErr = {}; render(); restoreForm(); },
  newdoc(){ snapshotForm(); U.newDoc = true; U.draft.doc = ''; render(); restoreForm(); setTimeout(() => document.getElementById('nd_name')?.focus(), 0); },
  pickcond(el){ snapshotForm(); U.draft.cond = U.draft.cond === el.dataset.c ? '' : el.dataset.c; render(); restoreForm(); },
  addtest(){ const i = document.getElementById('f_test'); const v = i.value.trim(); if (!v) { i.focus(); return; } snapshotForm(); U.draft.tests.push(v); render(); restoreForm(); setTimeout(() => document.getElementById('f_test')?.focus(), 0); },
  rmtest(el){ snapshotForm(); U.draft.tests.splice(Number(el.dataset.i), 1); render(); restoreForm(); },
  rmpage(el){ snapshotForm(); U.draft.pages.splice(Number(el.dataset.i), 1); render(); restoreForm(); },
  tfilter(el){ U.testFilter = el.dataset.f; render(); },
  mfilter(el){ U.medFilter = el.dataset.f; render(); },
  markdone(el){ U.sheet = null; const t = test(el.dataset.id); busy(async () => { await API.updateTest(t, { status:'done', date: iso(LIVE ? new Date() : TODAY) }); log('science', `${t.name} set to Done`, 'test-' + t.id); save(); toast(`${t.name} marked as done`); }); },
  med(el){ const m = S.meds.find(x => x.id === el.dataset.id); openSheet({ title: m.name, sub: `${m.dose} · ${doc(m.doc)?.name || ''}`, items:[
    m.status === 'current' ? { icon:'block', label:'Mark as stopped', sub:'Moves it to Stopped', act:'medstatus', attrs:`data-id="${m.id}" data-v="stopped"` } : { icon:'replay', label:'Mark as taking', sub:'Moves it to Current', act:'medstatus', attrs:`data-id="${m.id}" data-v="current"` },
    ...(m.visit && visit(m.visit) ? [{ icon:'event', label:'Open linked visit', sub: dmy(visit(m.visit).date), act:'go', attrs:`data-href="visit-${m.visit}"` }] : []) ] }); },
  medstatus(el){ const m = S.meds.find(x => x.id === el.dataset.id); const st = el.dataset.v; U.sheet = null; busy(async () => { await API.updateMed(m, { status:st, until: st === 'stopped' ? iso(LIVE ? new Date() : TODAY) : '' }); log('medication', `${m.name} marked ${m.status === 'current' ? 'as taking' : 'as stopped'}`, 'meds'); save(); toast(m.status === 'current' ? 'Moved to Current' : 'Moved to Stopped'); }); },
  radio(el){ const g = el.closest('[data-radio]'); g.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el)); g.parentElement.querySelector(`input[name="${g.dataset.radio}"]`).value = el.dataset.v; },
  signout(){ API.signOut().finally(() => { if (LIVE) { S = emptyState(); S.loading = false; } else { S.signedIn = false; save(); } U.otpErr = ''; U.expired = false; U.accessLog = null; go('login'); }); },
  askdelete(){ U.confirmDelete = true; render(); },
  canceldelete(){ U.confirmDelete = false; render(); },
  dodelete(){ busy(async () => { await API.deleteAccount(); U.confirmDelete = false; if (LIVE) { S = emptyState(); S.loading = false; lsSet('docly-active', ''); go('login'); toast('Your account and every record were deleted.'); } else { const email = S.email; S = seed(); S.email = email; save(); go('login'); toast('Account deleted. Demo data reset.'); } }); },
  scope(el){ U.shareScope = el.dataset.v; if (!U.shareDoc) U.shareDoc = docs()[0]?.id || ''; render(); },
  genlink(){ const docId = U.shareScope === 'all' ? null : (U.shareDoc || docs()[0]?.id); const scope = docId ? (doc(docId)?.name || 'One doctor') : 'all doctors';
    busy(async () => { U.newLink = await API.createShare(docId); log('arrow_forward', `Shared summary · ${scope}`, 'share'); save(); toast('Link ready. It expires in 24 hours.'); }); },
  copy(){ const url = shareUrl(U.newLink);
    const done = () => toast('Link copied');
    try { navigator.clipboard.writeText(url).then(done, () => toast('Copy blocked here. Long-press the link to copy.')); } catch(e) { toast('Copy blocked here. Long-press the link to copy.'); } },
  revoke(el){ U.revoke = el.dataset.id; render(); },
  norevoke(){ U.revoke = null; render(); },
  dorevoke(el){ const id = el.dataset.id; busy(async () => { await API.revokeShare(id); U.revoke = null; save(); toast('Link revoked. It no longer opens.'); }); },
  atab(el){ U.admin.tab = el.dataset.t; render(); },
  arefresh(){ U.admin = { tab: U.admin.tab, q: U.admin.q }; render(); },
  afile(el){ const uidv = el.dataset.user, path = el.dataset.path; API.adminFileUrl(uidv, path, (U.adminRec[uidv] || {}).reason).then(url => { U.adminFiles[path] = url; render(); }, e => toast(friendly(e))); },
  adel(el){ U.confirmAdminDelete = el.dataset.user; render(); },
  adelno(){ U.confirmAdminDelete = null; render(); },
  adelyes(el){ const user = el.dataset.user; busy(async () => { await API.adminDelete(user); U.confirmAdminDelete = null; delete U.adminRec[user]; U.admin = { tab:'users', q:'' }; toast('User and all their records deleted.'); go('admin'); }); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  const fn = el && ACTS[el.dataset.act];
  if (fn && el.dataset.act !== 'noop') fn(el, e);
  // Submit buttons: run the form handler directly (sandboxed frames may block real submission)
  const sb = e.target.closest('button[type="submit"]');
  if (sb) { const f = sb.form || sb.closest('form'); if (f && f.dataset.form) { e.preventDefault(); FORMS[f.dataset.form](f); return; } }
  // In-app links: route ourselves so sandboxed frames never navigate away
  const a = e.target.closest('a[href^="#"]');
  if (a && !e.defaultPrevented) { e.preventDefault(); const h = a.getAttribute('href').slice(1); if (h) go(h); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('tr[data-act]')) e.target.click();
  if (e.key === 'Enter' && e.target.matches('input') && !e.target.dataset.enter && e.target.dataset.otp == null && e.target.form && e.target.form.dataset.form) { e.preventDefault(); FORMS[e.target.form.dataset.form](e.target.form); return; }
  if (e.key === 'Enter' && e.target.dataset.enter === 'addtest') { e.preventDefault(); ACTS.addtest(); }
  if (e.key === 'Escape') { if (U.sheet) closeSheet(); else if (parse().name === 'photo' || parse().name === 'code') ACTS.back({ dataset:{ fallback: parse().name === 'code' ? 'login' : 'visit-' + parse().id } }); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.live === 'aq') { U.admin.q = t.value; const pos = t.selectionStart; render(); const n = document.getElementById('aq'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch(_){} } }
  if (t.dataset.live === 'tq') { U.testQuery = t.value; const pos = t.selectionStart; render(); const n = document.getElementById('tq'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch(_){} } }
  if (t.dataset.otp != null) {
    const v = t.value.replace(/\D/g, '');
    if (v.length > 1) { fillOtp(v); return; }
    t.value = v;
    if (v && t.nextElementSibling) t.nextElementSibling.focus();
    if (U.otpErr || U.expired) { U.otpErr = ''; t.closest('.otp').classList.remove('bad'); }
    const all = [...document.querySelectorAll('[data-otp]')].map(i => i.value).join('');
    if (all.length === 6) submitCode(all);
  }
});
document.addEventListener('change', e => { if (e.target.dataset.live === 'sd') U.shareDoc = e.target.value; });
document.addEventListener('keydown', e => {
  const t = e.target; if (t.dataset.otp == null) return;
  if (e.key === 'Backspace' && !t.value && t.previousElementSibling) { t.previousElementSibling.focus(); t.previousElementSibling.value = ''; e.preventDefault(); }
  if (e.key === 'ArrowLeft' && t.previousElementSibling) t.previousElementSibling.focus();
  if (e.key === 'ArrowRight' && t.nextElementSibling) t.nextElementSibling.focus();
});
document.addEventListener('paste', e => { const t = e.target; if (t.dataset && t.dataset.otp != null) { e.preventDefault(); fillOtp((e.clipboardData.getData('text') || '').replace(/\D/g, '')); } });
function fillOtp(v){ const ins = [...document.querySelectorAll('[data-otp]')]; v.slice(0,6).split('').forEach((c,i) => { ins[i].value = c; }); (ins[Math.min(v.length,5)] || ins[5]).focus(); if (v.length >= 6) submitCode(v.slice(0,6)); }
async function afterSignIn(){
  U.busy = false; U.otpErr = ''; U.passErr = ''; U.tries = 3; S.signedIn = true; S.loading = true; render();
  if (LIVE) { try { await API.loadAll(); } catch(e) { U.toast = 'Could not load your records. ' + friendly(e); } }
  S.loading = false; save(); go('home');
}
function submitCode(code){
  if (U.expired || U.busy) return;
  if (LIVE) {
    U.busy = true;
    API.verify(S.email, code).then(async () => {
      U.busy = false; U.otpErr = ''; U.tries = 3; S.signedIn = true; S.loading = true; render();
      try { await API.loadAll(); } catch(e) { U.toast = 'Could not load your records. ' + friendly(e); }
      S.loading = false; go('home');
    }, err => {
      U.busy = false; const m = friendly(err);
      U.otpErr = /token|otp|invalid|expired/i.test(m) ? "That code isn't right, or it has expired. Check your latest email." : m;
      render(); setTimeout(() => document.querySelector('[data-otp="0"]')?.select(), 0);
    });
    return;
  }
  if (code === '111111') { U.expired = true; render(); return; }
  if (code === '000000') { U.tries -= 1; if (U.tries <= 0) { U.expired = true; U.otpErr = ''; } else U.otpErr = `That code isn't right. ${plural(U.tries,'try','tries')} left.`; render(); setTimeout(() => document.querySelector('[data-otp="0"]')?.select(), 0); return; }
  S.signedIn = true; U.otpErr = ''; U.tries = 3; save(); go('home');
}

/* Forms */
const FORMS = {
  login(f){ const v = (f.querySelector('#email').value || '').trim(); U.emailDraft = v;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { U.emailErr = v ? 'That email looks incomplete. Check it and try again.' : 'Enter your email to get a code.'; render(); document.getElementById('email')?.focus(); return; }
    U.emailErr = ''; S.email = v.toLowerCase();
    if (U.usePass && U.authMode === 'signin') { const pwv = f.querySelector('#password')?.value || '';
      if (!pwv) { U.passErr = 'Enter your password.'; render(); document.getElementById('password')?.focus(); return; }
      U.passErr = ''; if (U.busy) return; U.busy = true;
      API.signInPassword(S.email, pwv).then(afterSignIn, err => { U.busy = false; const m = friendly(err);
        U.passErr = /invalid login|credentials/i.test(m) ? "Wrong email or password. No password yet? Use an email code instead." : /confirm/i.test(m) ? 'Confirm your email first. Use an email code instead.' : m;
        render(); document.getElementById('password')?.select(); });
      return; }
    if (LIVE && mailLeft()) { render(); return; }
    if (!LIVE) { save(); U.resendAt = Date.now() + 30000; U.otpErr = ''; U.expired = false; U.tries = 3; go('code'); return; }
    if (U.busy) return; U.busy = true;
    API.sendCode(S.email).then(() => { U.busy = false; U.resendAt = Date.now() + 60000; U.otpErr = ''; U.expired = false; U.tries = 3; go('code'); },
      err => { U.busy = false; const m = friendly(err); const secs = /(\d+)\s*seconds/i.exec((err && err.message) || m); const limited = err && (err.status === 429 || /rate|too many|seconds/i.test((err.message || '') + m));
        if (limited) { setMailWait(secs ? (+secs[1] + 1) * 1000 : 3600000); U.emailErr = ''; } else U.emailErr = m; render(); }); },
  code(f){ const code = [...f.querySelectorAll('[data-otp]')].map(i => i.value).join(''); if (code.length < 6) { U.otpErr = 'Enter all 6 digits.'; render(); return; } submitCode(code); },
  visit(f){
    snapshotForm(); const D = U.draft, val = n => (f.querySelector(`[name="${n}"]`) || {}).value || '';
    U.formErr = {};
    if (U.newDoc && !(U.ndName || '').trim()) { U.formErr.doc = "Add the doctor's name, or pick a doctor."; render(); restoreForm(); return; }
    if (!U.newDoc && !D.doc) { U.formErr.doc = 'Pick a doctor.'; render(); restoreForm(); return; }
    const id = f.dataset.id;
    if (LIVE) toast('Saving…');
    busy(async () => {
      let docId = D.doc;
      if (U.newDoc) { const nm = U.ndName.trim(); docId = (await API.createDoctor({ name: /^dr\.?\s/i.test(nm) ? nm : 'Dr. ' + nm, spec: (U.ndSpec || '').trim() })).id; }
      let chamber = val('chamber'); if (chamber === '__other') chamber = '';
      const d = doc(docId);
      if (chamber && !d.chambers.find(c => c.name === chamber)) await API.updateDoctor(d, { chambers: [...d.chambers, { name: chamber, info: '' }] });
      const cond = (val('cond') || '').trim();
      await API.ensureCondition(cond, val('date'));
      const said = val('said').trim();
      const data = { doc: docId, date: val('date') || iso(LIVE ? new Date() : TODAY), time: val('time'), chamber, reason: val('reason').trim(), cond, cost: val('cost') ? Number(String(val('cost')).replace(/[^\d.]/g,'')) : null,
        follow: val('follow'), said, short: shortOf(said, val('reason').trim()) };
      const v = await API.saveVisit(id, data);
      await API.savePages(v, D.pages);
      if (!id) for (const n of D.tests) await API.createTest({ name:n, doc:docId, visit:v.id, status:'advised', date: v.follow || v.date, venue: chamber });
      log(id ? 'edit' : 'note_add', `${id ? 'Edited' : 'Added'} visit · ${d.name}`, 'visit-' + v.id);
      save(); U.draft = null; U.ndName = U.ndSpec = ''; U.newDoc = false;
      setHash('visit-' + v.id); render(true); toast(id ? 'Visit updated' : 'Visit saved');
    });
  },
  test(f){ const fd = new FormData(f), name = (fd.get('name') || '').trim(); if (!name) { U.formErr = { name:'Add the test name.' }; render(); return; } U.formErr = {};
    busy(async () => { const t = await API.createTest({ name, doc: fd.get('doc'), status: fd.get('status'), date: fd.get('date') || iso(LIVE ? new Date() : TODAY), venue: (fd.get('venue')||'').trim() });
      log('science', `Added test · ${name}`, 'test-' + t.id); save(); setHash('test-' + t.id); render(true); toast('Test saved'); }); },
  doctor(f){ const fd = new FormData(f), name = (fd.get('name') || '').trim(); if (!name) { U.formErr = { name:"Add the doctor's name." }; render(); return; } U.formErr = {};
    const spec = (fd.get('spec') || '').trim(), url = (fd.get('url') || '').trim(), note = (fd.get('notes') || '').trim();
    const chambers = Array.from({ length: U.chN || 1 }, (_, i) => ({ name: (fd.get('ch_' + i) || '').trim(), phone: (fd.get('ph_' + i) || '').trim(), info: (fd.get('in_' + i) || '').trim() }))
      .filter(c => c.name).map(c => c.phone ? c : { name: c.name, info: c.info });
    const href = url && !/^https?:\/\//i.test(url) ? 'https://' + url : url;
    busy(async () => {
      let d = f.dataset.id ? doc(f.dataset.id) : null;
      const old = (d?.links || []).map(l => typeof l === 'string' ? { label:l } : l);
      const keep = old.filter(l => l.note == null && !(l.url && l === old.find(x => x.url && x.note == null)));
      const links = [...(href ? [{ label:'Website', url: href }] : []), ...keep, ...(note ? [{ label:'Notes', note }] : [])];
      if (d) { await API.updateDoctor(d, { name, spec: spec || d.spec, chambers, links }); }
      else { d = await API.createDoctor({ name: /^dr\.?\s/i.test(name) ? name : 'Dr. ' + name, spec, chambers, links }); log('medical_services', `Added ${d.name}`, 'doctor-' + d.id); }
      U.chKey = null;
      save(); setHash('doctor-' + d.id); render(true); toast(f.dataset.id ? 'Doctor updated' : 'Doctor saved');
    }); },
  med(f){ const fd = new FormData(f), name = (fd.get('name') || '').trim(); if (!name) { U.formErr = { name:'Add the medicine name.' }; render(); return; } U.formErr = {};
    busy(async () => { await API.createMed({ name, dose:(fd.get('dose') || '').trim(), doc: fd.get('doc'), visit: fd.get('visit'), since: fd.get('since') || iso(LIVE ? new Date() : TODAY), status: fd.get('status') });
      log('medication', `Added ${name}`, 'meds'); save(); U.medFilter = fd.get('status'); setHash('meds'); render(true); toast('Medication saved'); }); },
  password(f){ const a = f.querySelector('#np1').value, b = f.querySelector('#np2').value, err = {};
    if (a.length < 8) err.p1 = 'Use at least 8 characters.'; else if (!/[a-z]/i.test(a) || !/\d/.test(a)) err.p1 = 'Use both letters and numbers.';
    if (!err.p1 && a !== b) err.p2 = "Passwords don't match.";
    U.formErr = err; if (err.p1 || err.p2) { U.pwDraft = [a, b]; render(); return; } U.pwDraft = null;
    const had = hasPass();
    busy(async () => { await API.setPassword(a); U.showPw = false; log('key', had ? 'Changed password' : 'Added a password', 'me'); save(); setHash('me'); render(true); toast(had ? 'Password updated' : 'Password saved. You can now sign in with it.'); }); },
  profile(f){ const fd = new FormData(f), name = (fd.get('name') || '').trim(); if (!name) { U.formErr = { name:'Add a name.' }; render(); return; } U.formErr = {};
    busy(async () => { const p = await API.createProfile({ name, rel: (fd.get('rel') || '').trim().toLowerCase() || 'family', blood: fd.get('blood') || '', dob: fd.get('dob') || '' });
      S.active = p.id; log('group', `Added profile ${p.short} (${p.rel})`, 'profiles'); save(); setHash('home'); render(true); toast(`Now viewing ${p.short}. Add their first visit.`); }); },
  setup(f){ const fd = new FormData(f), name = (fd.get('name') || '').trim(); if (!name) { U.formErr = { name:'Add your name to continue.' }; render(); return; } U.formErr = {};
    busy(async () => { const p = await API.createProfile({ name, rel:'you', blood: fd.get('blood') || '', dob: fd.get('dob') || '' }); S.active = p.id; save(); setHash('home'); render(true); toast(`Welcome, ${p.short}. Add your first visit.`); }); },
  adminopen(f){ const fd = new FormData(f), reason = (fd.get('reason') || '').trim(), user = f.dataset.user;
    if (!reason) { U.formErr = { reason:'Write why you need to open these records. The user can see this.' }; render(); return; } U.formErr = {};
    busy(async () => { const rec = await API.adminRecords(user, reason); U.adminRec[user] = { reason, rec }; render(); }); },
};
document.addEventListener('submit', e => { const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); FORMS[f.dataset.form](f); });

/* Resend countdown */
let tick;
let mailTick;
function afterDraw(){
  clearInterval(tick); clearInterval(mailTick);
  if (document.getElementById('mailWait')) mailTick = setInterval(() => { const left = mailLeft(); const el = document.getElementById('mailWait');
    if (!el || !left) { clearInterval(mailTick); if (el) render(); return; } el.textContent = mmss(left); }, 1000);
  if (parse().name === 'code' && !S.signedIn) {
    const first = document.querySelector('[data-otp="0"]'); if (first && !document.activeElement?.dataset?.otp) first.focus();
    tick = setInterval(() => { const el = document.getElementById('resend'); if (!el) return; const left = Math.max(0, Math.ceil((U.resendAt - Date.now())/1000));
      el.innerHTML = left > 0 ? `Resend code in 0:${String(left).padStart(2,'0')}` : `<a href="#" class="link" data-act="resend">Resend code</a>`; if (!left) clearInterval(tick); }, 1000);
  }
}

window.addEventListener('hashchange', () => { const h = hashNow(); if (h === CUR) return; CUR = h; onRoute(); });
window.addEventListener('popstate', () => { const h = hashNow(); if (h === CUR) return; CUR = h; onRoute(); });
function onRoute(){
  depth++;
  const cur = CUR != null ? CUR : hashNow();
  if (STACK[STACK.length-1] !== cur) STACK.push(cur);
  if (STACK.length > 50) STACK.shift();
  const n = parse().name;
  if (n !== 'add-visit' && n !== 'editvisit') { U.draft = null; U.newDoc = false; }
  U.formErr = {}; U.sheet = null; U.confirmDelete = false; U.revoke = null; U.confirmAdminDelete = null;
  if (n !== 'share') U.newLink = null;
  if (n !== 'photo') U.viewerPage = U.viewerPage;
  render(n !== 'photo');
}
(mq.addEventListener ? mq.addEventListener('change', () => render()) : mq.addListener(() => render()));
window.__go = go;
CUR = hashNow(); STACK.push(CUR);
if (LIVE) { render(true); API.boot().then(() => render(true), e => { S.loading = false; U.toast = friendly(e); render(true); }); }
else { S.loading = false; render(true); }
})();
