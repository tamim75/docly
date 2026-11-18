// In-memory stand-in for the parts of supabase-js that Docly uses. For local testing only.
(function(){
  const DB = JSON.parse(localStorage.getItem('fakedb') || 'null') || { tables:{}, files:{}, session:null, admins:[] };
  const persist = () => localStorage.setItem('fakedb', JSON.stringify(DB));
  const T = n => (DB.tables[n] = DB.tables[n] || []);
  const uuid = () => crypto.randomUUID();
  const now = () => new Date().toISOString();
  const uidNow = () => DB.session && DB.session.user.id;
  const own = rows => rows.filter(r => r.owner === uidNow());
  const DEF = { shares: () => ({ token: Math.random().toString(16).slice(2, 26), expires_at: new Date(Date.now() + 864e5).toISOString(), revoked:false }),
    doctors: () => ({ links:[], chambers:[] }), tests: () => ({ status:'advised' }), meds: () => ({ status:'current' }), conditions: () => ({ status:'active' }) };
  function Q(table){ this.t = table; this.op = 'select'; this.f = []; this.one = false; this.sel = false; }
  Q.prototype.select = function(){ this.sel = true; return this; };
  Q.prototype.order = function(){ return this; };
  Q.prototype.limit = function(){ return this; };
  Q.prototype.eq = function(k, v){ this.f.push(r => r[k] === v); return this; };
  Q.prototype.in = function(k, vs){ this.f.push(r => vs.includes(r[k])); return this; };
  Q.prototype.single = function(){ this.one = true; return this; };
  Q.prototype.insert = function(row){ this.op = 'insert'; this.row = row; return this; };
  Q.prototype.update = function(p){ this.op = 'update'; this.patch = p; return this; };
  Q.prototype.delete = function(){ this.op = 'delete'; return this; };
  Q.prototype.then = function(res, rej){ return Promise.resolve().then(() => this.run()).then(res, rej); };
  Q.prototype.run = function(){
    if (!uidNow()) return { data:null, error:{ message:'Not signed in' } };
    const rows = T(this.t), mine = r => this.t === 'admin_access_log' ? (r.user_id === uidNow() || DB.admins.includes(uidNow())) : r.owner === uidNow();
    let out;
    if (this.op === 'insert') { const r = Object.assign({ id: uuid(), owner: uidNow(), created_at: now() }, (DEF[this.t] || (() => ({})))(), this.row); rows.push(r); out = [r]; }
    else { const hit = rows.filter(mine).filter(r => this.f.every(f => f(r)));
      if (this.op === 'update') hit.forEach(r => Object.assign(r, this.patch));
      if (this.op === 'delete') DB.tables[this.t] = rows.filter(r => !hit.includes(r));
      out = hit; }
    if (this.op !== 'select') persist();
    return { data: this.one ? JSON.parse(JSON.stringify(out[0] || null)) : JSON.parse(JSON.stringify(out)), error:null };
  };
  const isAdmin = () => DB.admins.includes(uidNow());
  const user = id => (T('_users').find(u => u.id === id) || {});
  const RPC = {
    is_admin: () => isAdmin(),
    get_shared_summary: ({ p_token }) => { const s = T('shares').find(x => x.token === p_token && !x.revoked && new Date(x.expires_at) > new Date()); if (!s) return null;
      const p = T('profiles').find(x => x.id === s.profile_id); const dn = id => (T('doctors').find(d => d.id === id) || {}).name;
      return { name:p.name, blood:p.blood, expires_at:s.expires_at, conditions:T('conditions').filter(c => c.profile_id === p.id).map(c => c.name),
        meds:T('meds').filter(m => m.profile_id === p.id && m.status === 'current').map(m => ({ name:m.name, dose:m.dose, since:m.since, doctor:dn(m.doctor_id) })),
        visits:T('visits').filter(v => v.profile_id === p.id).map(v => ({ date:v.date, doctor:dn(v.doctor_id), said:v.said })),
        reports:T('tests').filter(t => t.profile_id === p.id && t.status === 'attached').map(t => ({ name:t.name, date:t.date, doctor:dn(t.doctor_id) })) }; },
    delete_my_account: () => { const id = uidNow(); Object.keys(DB.tables).forEach(k => { DB.tables[k] = DB.tables[k].filter(r => r.owner !== id && r.id !== id); }); DB.session = null; return null; },
    admin_overview: () => { if (!isAdmin()) throw { message:'Admins only' }; return { users:T('_users').length, new_7d:T('_users').length, active_7d:1, profiles:T('profiles').length, visits:T('visits').length, visits_7d:T('visits').length, tests:T('tests').length, meds:T('meds').length, files:Object.keys(DB.files).length, storage_bytes:Object.values(DB.files).reduce((a,f) => a + f.size, 0), shares_active:T('shares').length, signups_by_day:[{ day:now().slice(0,10), n:T('_users').length }] }; },
    admin_users: () => { if (!isAdmin()) throw { message:'Admins only' }; return T('_users').map(u => { const c = t => T(t).filter(r => r.owner === u.id).length; const fs = Object.keys(DB.files).filter(k => k.startsWith(u.id));
      return { user_id:u.id, email:u.email, signed_up:u.created_at, last_sign_in:u.created_at, profiles:c('profiles'), doctors:c('doctors'), visits:c('visits'), tests:c('tests'), meds:c('meds'), files:fs.length, storage_bytes:fs.reduce((a,k) => a + DB.files[k].size, 0), last_activity:now() }; }); },
    admin_log: ({ p_user, p_what, p_reason }) => { T('admin_access_log').push({ id: uuid(), admin_id: uidNow(), admin_email: user(uidNow()).email, user_id: p_user, what: p_what, reason: p_reason, created_at: now() }); return null; },
    admin_user_records: ({ p_user, p_reason }) => { if (!isAdmin()) throw { message:'Admins only' }; RPC.admin_log({ p_user, p_what:'all records', p_reason }); const of = t => T(t).filter(r => r.owner === p_user);
      return { email:user(p_user).email, profiles:of('profiles'), doctors:of('doctors'), visits:of('visits'), visit_pages:of('visit_pages'), tests:of('tests'), meds:of('meds'), conditions:of('conditions') }; },
    admin_delete_user: ({ p_user }) => { Object.keys(DB.tables).forEach(k => { DB.tables[k] = DB.tables[k].filter(r => r.owner !== p_user && r.id !== p_user && r.user_id !== p_user); }); return null; },
  };
  const listeners = [];
  window.supabase = { createClient(url, key){
    if (!url || !key) throw new Error('missing config');
    return {
      auth: {
        async getSession(){ return { data:{ session: DB.session }, error:null }; },
        async signInWithOtp({ email }){ if (!/@/.test(email)) return { error:{ message:'Invalid email' } }; DB.pending = email; persist(); return { data:{}, error:null }; },
        async verifyOtp({ email, token }){ if (token === '999999') return { data:null, error:{ message:'Token has expired or is invalid' } }; if (token !== '123456') return { data:null, error:{ message:'Token has expired or is invalid' } };
          let u = T('_users').find(x => x.email === email); if (!u) { u = { id: uuid(), email, created_at: now() }; T('_users').push(u); }
          DB.session = { user:u }; if (email.startsWith('admin')) DB.admins.push(u.id); persist(); return { data:{ user:u, session:DB.session }, error:null }; },
        async signOut(){ DB.session = null; persist(); listeners.forEach(f => f('SIGNED_OUT')); return { error:null }; },
        onAuthStateChange(f){ listeners.push(f); return { data:{ subscription:{ unsubscribe(){} } } }; },
      },
      from: t => new Q(t),
      async rpc(name, args){ try { const data = RPC[name](args || {}); if (/delete|log|records/.test(name)) persist(); return { data, error:null }; } catch(e) { return { data:null, error:e }; } },
      storage: { from(){ return {
        async upload(path, blob){ if (!path.startsWith(uidNow() + '/')) return { error:{ message:'Not allowed' } }; DB.files[path] = { size: blob.size || 1 }; persist(); return { data:{ path }, error:null }; },
        async createSignedUrls(paths){ return { data: paths.map(p => ({ path:p, signedUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2230%22 height=%2240%22%3E%3Crect width=%2230%22 height=%2240%22 fill=%22%23cde%22/%3E%3C/svg%3E#' + p })), error:null }; },
        async createSignedUrl(p){ return { data:{ signedUrl:'https://example.com/signed/' + p }, error:null }; },
        async list(prefix){ return { data: Object.keys(DB.files).filter(k => k.startsWith(prefix + '/')).map(k => ({ name: k.split('/')[1] })), error:null }; },
        async remove(paths){ paths.forEach(p => delete DB.files[p]); persist(); return { data:[], error:null }; },
      }; } },
    };
  } };
})();
