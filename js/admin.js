// /js/admin.js — Admin Dashboard (tabs, filters, pagination, row details, status actions, charts)

// --- Supabase client (uses your project + anon key) ---
const SUPABASE_URL = 'https://qfldkqowlqkokpqwqdpl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbGRrcW93bHFrb2twcXdxZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0ODIxNTMsImV4cCI6MjA3MzA1ODE1M30.TtzlGJIl0Vmn2nI2plqnNvq4NaVH1urNgch982glytg';
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// --- Gate: only admins may view ---
(async function gate() {
  const { data: { user } } = await supa.auth.getUser();
  if (!user) { location.href = '/login.html?next=/admin.html'; return; }
  const role = user.user_metadata?.role;
  if (role !== 'admin') { location.href = '/dashboard.html'; return; }
})();

// --- Tabs, filters, pagination ---
const panels = {
  waitlist: { el: document.getElementById('panel-waitlist'), table: document.getElementById('tbl-waitlist') },
  contacts: { el: document.getElementById('panel-contacts'), table: document.getElementById('tbl-contacts') },
  bookings: { el: document.getElementById('panel-bookings'), table: document.getElementById('tbl-bookings') },
  groomers: { el: document.getElementById('panel-groomers'), table: document.getElementById('tbl-groomers') },
  pets:     { el: document.getElementById('panel-pets'), table: document.getElementById('tbl-pets') },
};
let active = 'waitlist';
document.querySelectorAll('.tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs .tab').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const tab = btn.dataset.tab;
    Object.entries(panels).forEach(([k, p]) => p.el.hidden = (k !== tab));
    active = tab;
    page = 1;
    fetchAndRender();
  });
});

document.getElementById('refresh').addEventListener('click', fetchAndRender);
document.getElementById('days').addEventListener('change', () => { page = 1; fetchAndRender(); });
document.getElementById('q').addEventListener('input', debounce(() => { page = 1; fetchAndRender(); }, 300));
document.getElementById('export').addEventListener('click', exportCSV);

let page = 1, pageSize = 25, totalRows = 0;
document.getElementById('prev').addEventListener('click', () => { if (page>1){ page--; fetchAndRender(); }});
document.getElementById('next').addEventListener('click', () => { const maxPage = Math.ceil(totalRows/pageSize)||1; if (page<maxPage){ page++; fetchAndRender(); }});

// --- Fetchers per tab ---
const tableFetchers = {
  async waitlist(filter) {
    let q = supa.from('waitlist')
      .select('created_at,email,phone,locality,source', { count: 'exact' })
      .order('created_at', { ascending:false });
    if (filter.since) q = q.gte('created_at', filter.since);
    if (filter.search) q = q.or(`email.ilike.%${filter.search}%,phone.ilike.%${filter.search}%,locality.ilike.%${filter.search}%`);
    q = q.range((page-1)*pageSize, (page*pageSize)-1);
    const { data, count } = await q;
    totalRows = count||0;
    return data||[];
  },
  async contacts(filter) {
    let q = supa.from('contacts')
      .select('id,created_at,name,email,phone,topic,preferred_time,status', { count: 'exact' })
      .order('created_at', { ascending:false });
    if (filter.since) q = q.gte('created_at', filter.since);
    if (filter.search) q = q.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,phone.ilike.%${filter.search}%,topic.ilike.%${filter.search}%`);
    q = q.range((page-1)*pageSize, (page*pageSize)-1);
    const { data, count } = await q;
    totalRows = count||0;
    return data||[];
  },
  async bookings(filter) {
    let q = supa.from('bookings')
      .select('id,created_at,name,email,phone,service,starts_at,address,status', { count: 'exact' })
      .order('created_at', { ascending:false });
    if (filter.since) q = q.gte('created_at', filter.since);
    if (filter.search) q = q.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,phone.ilike.%${filter.search}%,service.ilike.%${filter.search}%,address.ilike.%${filter.search}%`);
    q = q.range((page-1)*pageSize, (page*pageSize)-1);
    const { data, count } = await q;
    totalRows = count||0;
    return data||[];
  },
  async groomers(filter) {
    let q = supa.from('groomers')
      .select('updated_at,name,email,phone,experience,areas,skills', { count: 'exact' })
      .order('updated_at', { ascending:false });
    if (filter.since) q = q.gte('updated_at', filter.since);
    if (filter.search) q = q.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,phone.ilike.%${filter.search}%,areas.ilike.%${filter.search}%,skills.ilike.%${filter.search}%`);
    q = q.range((page-1)*pageSize, (page*pageSize)-1);
    const { data, count } = await q;
    totalRows = count||0;
    return data||[];
  },
  async pets(filter) {
    let q = supa.from('pets')
      .select('created_at,owner_name,species,breed,birthdate,weight,notes', { count: 'exact' })
      .order('created_at', { ascending:false });
    if (filter.since) q = q.gte('created_at', filter.since);
    if (filter.search) q = q.or(`owner_name.ilike.%${filter.search}%,species.ilike.%${filter.search}%,breed.ilike.%${filter.search}%,notes.ilike.%${filter.search}%`);
    q = q.range((page-1)*pageSize, (page*pageSize)-1);
    const { data, count } = await q;
    totalRows = count||0;
    return data||[];
  },
};

// --- Renderers ---
async function fetchAndRender() {
  const days = Number(document.getElementById('days').value);
  const search = document.getElementById('q').value.trim();
  const since = days > 0 ? new Date(Date.now() - days*24*3600*1000).toISOString() : null;
  const filter = { since, search };
  const data = await tableFetchers[active](filter);
  renderTable(active, data);
  renderCharts();
  document.getElementById('page').textContent = `Page ${page} / ${Math.max(1, Math.ceil(totalRows/pageSize))}`;
}

function renderTable(kind, rows) {
  const table = panels[kind].table;
  const tbody = table.querySelector('tbody');
  if (!rows || !rows.length) {
    tbody.innerHTML = `<tr><td colspan="${table.querySelectorAll('th').length}" class="empty">No records.</td></tr>`;
    return;
  }
  const html = rows.map(r => {
    if (kind === 'waitlist') return `<tr>
      <td>${d(r.created_at)}</td><td>${esc(r.email)}</td><td>${esc(r.phone)}</td><td>${esc(r.locality)}</td><td>${esc(r.source||'')}</td>
      <td class="row-actions"><button class="btn btn-outline" data-view='waitlist' data-id='${esc(r.email)}'>View</button></td>
    </tr>`;
    if (kind === 'contacts') return `<tr>
      <td>${d(r.created_at)}</td><td>${esc(r.name||'')}</td><td>${esc(r.email||'')}</td><td>${esc(r.phone||'')}</td><td>${esc(r.topic||'')}</td><td>${esc(r.preferred_time||'')}</td>
      <td>${esc(r.status||'new')}</td>
      <td class="row-actions">
        <button class="btn btn-outline" data-view='contacts' data-id='${r.id}'>View</button>
        <button class="btn" data-status='contacts' data-id='${r.id}' data-val='contacted'>Mark contacted</button>
      </td>
    </tr>`;
    if (kind === 'bookings') return `<tr>
      <td>${d(r.created_at)}</td><td>${esc(r.name||'')}</td><td>${esc(r.email||'')}</td><td>${esc(r.phone||'')}</td><td>${esc(r.service||'')}</td><td>${d(r.starts_at)||''}</td><td>${esc(r.address||'')}</td>
      <td>${esc(r.status||'new')}</td>
      <td class="row-actions">
        <button class="btn btn-outline" data-view='bookings' data-id='${r.id}'>View</button>
        <button class="btn" data-status='bookings' data-id='${r.id}' data-val='confirmed'>Confirm</button>
        <button class="btn btn-outline" data-status='bookings' data-id='${r.id}' data-val='cancelled'>Cancel</button>
      </td>
    </tr>`;
    if (kind === 'groomers') return `<tr>
      <td>${d(r.updated_at)}</td><td>${esc(r.name||'')}</td><td>${esc(r.email||'')}</td><td>${esc(r.phone||'')}</td><td>${esc(r.experience||'')}</td><td>${esc(r.areas||'')}</td><td>${esc(r.skills||'')}</td>
    </tr>`;
    if (kind === 'pets') return `<tr>
      <td>${d(r.created_at)}</td><td>${esc(r.owner_name||'')}</td><td>${esc(r.species||'')}</td><td>${esc(r.breed||'')}</td><td>${d(r.birthdate)||''}</td><td>${esc(r.weight||'')}</td><td>${esc(r.notes||'')}</td>
    </tr>`;
  }).join('');
  tbody.innerHTML = html;

  // Row actions
  tbody.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const table = btn.getAttribute('data-status');
      const id = btn.getAttribute('data-id');
      const val = btn.getAttribute('data-val');
      await supa.from(table).update({ status: val }).eq('id', id);
      fetchAndRender();
    });
  });
  tbody.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const table = btn.getAttribute('data-view');
      const id = btn.getAttribute('data-id');
      let q;
      if (table === 'waitlist') q = supa.from('waitlist').select('*').eq('email', id).single();
      else q = supa.from(table).select('*').eq('id', id).single();
      const { data } = await q;
      alert(JSON.stringify(data, null, 2));
    });
  });
}

// --- Utils ---
function esc(s){ return (s??'').toString().replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function d(x){ if(!x) return ''; try { const t = new Date(x); return t.toLocaleString(); } catch { return x; } }
function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a),ms); }; }

// --- CSV export (visible rows only) ---
function exportCSV(){
  const table = panels[active].table;
  const rows = [...table.querySelectorAll('tr')].map(tr => [...tr.children].map(td => `"${(td.textContent||'').replace(/"/g,'""')}"`).join(','));
  const blob = new Blob([rows.join('\n')], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `fluryy_${active}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// --- Charts (last 30 days + top localities) ---
let chartLeads, chartLocality;
async function renderCharts(){
  const since = new Date(Date.now() - 30*24*3600*1000).toISOString();
  const [w,c,b] = await Promise.all([
    supa.from('waitlist').select('created_at').gte('created_at', since),
    supa.from('contacts').select('created_at').gte('created_at', since),
    supa.from('bookings').select('created_at').gte('created_at', since),
  ]);
  const buckets = {};
  [w.data||[], c.data||[], b.data||[]].flat().forEach(r => {
    const d = new Date(r.created_at); const k = d.toISOString().slice(0,10);
    buckets[k] = (buckets[k]||0)+1;
  });
  const labels = Object.keys(buckets).sort();
  const values = labels.map(k => buckets[k]);

  const ctx1 = document.getElementById('chartLeads').getContext('2d');
  chartLeads?.destroy();
  chartLeads = new Chart(ctx1, { type:'line', data: { labels, datasets: [{ label:'Leads', data: values }] }, options: { responsive:true, plugins:{legend:{display:false}} } });

  const wl = await supa.from('waitlist').select('locality');
  const m = {}; (wl.data||[]).forEach(r => { const k=(r.locality||'').trim().toLowerCase(); if(!k) return; m[k]=(m[k]||0)+1; });
  const top = Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const labels2 = top.map(x=>x[0]); const values2 = top.map(x=>x[1]);
  const ctx2 = document.getElementById('chartLocality').getContext('2d');
  chartLocality?.destroy();
  chartLocality = new Chart(ctx2, { type:'bar', data: { labels: labels2, datasets: [{ label:'Waitlist', data: values2 }] }, options: { responsive:true, plugins:{legend:{display:false}} } });
}

// Initial load
fetchAndRender();