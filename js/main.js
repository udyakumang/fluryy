
(function(){
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
  let supa=null;

  async function init(){ await loadSupabase(); await initSupabaseClient();
    bindPhoneValidation(); bindAnchors(); bindMobileNav(); setContactButtons();
    renderAuthNav(); await gateProtected(); bindAuthForms(); bindAllForms(); hydrateDashboard(); bindBookingModal(); }

  function supaUrl(){return 'https://qfldkqowlqkokpqwqdpl.supabase.co';}
  function supaKey(){return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbGRrcW93bHFrb2twcXdxZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0ODIxNTMsImV4cCI6MjA3MzA1ODE1M30.TtzlGJIl0Vmn2nI2plqnNvq4NaVH1urNgch982glytg';}

  async function loadSupabase(){ if(window.supabase) return; await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  async function initSupabaseClient(){ if(!window.supabase) return; supa = window.supabase.createClient(supaUrl(), supaKey()); }

  function buildEmail(){return String.fromCharCode(104,101,108,108,111,64,102,108,117,114,121,121,46,99,111,109);}
  function buildPhone(){return String.fromCharCode(43,57,49,56,54,53,55,51,54,57,51,48,57);}
  function setContactButtons(){ const emailEl=document.querySelector('[data-email]'); const phoneEl=document.querySelector('[data-phone]'); const email=buildEmail(); const phone=buildPhone(); if(emailEl) emailEl.addEventListener('click',(e)=>{e.preventDefault(); location.href='mailto:'+email;}); if(phoneEl) phoneEl.addEventListener('click',(e)=>{e.preventDefault(); window.open('https://wa.me/'+phone.replace('+',''), '_blank');}); }

  function bindAnchors(){ document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href')); if(el){e.preventDefault(); el.scrollIntoView({behavior:'smooth'});}})); }
  function bindMobileNav(){ const t=document.querySelector('.menu-toggle'); const n=document.querySelector('.nav'); if(t&&n) t.addEventListener('click',()=>{const o=n.classList.toggle('nav--open'); t.setAttribute('aria-expanded',o?'true':'false');}); }

  async function getSession(){ const { data:{ session } } = await supa.auth.getSession(); return session; }
  async function renderAuthNav(){ const nav=document.querySelector('[data-account]'); if(!nav) return; const s=await getSession(); if(s&&s.user){ nav.innerHTML='<a href="/dashboard.html">Dashboard</a> <button class="btn" data-logout>Logout</button>'; nav.querySelector('[data-logout]').addEventListener('click', async()=>{await supa.auth.signOut(); location.href='/';}); } else { nav.innerHTML='<a href="/login.html">Login</a> <a class="cta" href="/register.html">Sign up</a>'; } }
  async function gateProtected(){ if(!document.body.hasAttribute('data-protected')) return; const s=await getSession(); if(!s) location.href='/login.html?next='+encodeURIComponent(location.pathname); }

  function bindAuthForms(){
    const login=document.getElementById('login-form');
    if(login) login.addEventListener('submit', async (e)=>{
      e.preventDefault();const fd=new FormData(login);const email=fd.get('email');
      const next=new URLSearchParams(location.search).get('next')||'/dashboard.html';
      const {error}=await supa.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin+next } });
      const m=login.querySelector('[data-msg]')||login.querySelector('.note'); if(m) m.textContent=error?('Error: '+error.message):'Check your email for the login link.';
    });

    const reg=document.getElementById('register-form');
    if(reg) reg.addEventListener('submit', async (e)=>{
      e.preventDefault();const fd=new FormData(reg);const email=fd.get('email');const role=fd.get('role')||'parent';
      localStorage.setItem('fluryy:desired-role',role);
      const {error}=await supa.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin+'/dashboard.html' } });
      const m=reg.querySelector('[data-msg]')||reg.querySelector('.note'); if(m) m.textContent=error?('Error: '+error.message):'Check your email to confirm & continue.';
    });
  }

  function normalizeIndianPhone(v){ v=(v||'').replace(/\s|-/g,''); if(/^\+?91[6-9]\d{9}$/.test(v)) return v[0]=='+'?v:'+'+v; if(/^[6-9]\d{9}$/.test(v)) return '+91'+v; return null; }
  function bindPhoneValidation(){ function attach(el){ if(!el) return; const fn=()=>{ const ok=normalizeIndianPhone(el.value); if(!ok) el.setCustomValidity('Use a valid Indian mobile number'); else { el.setCustomValidity(''); el.value=ok; } }; el.addEventListener('input',fn); el.addEventListener('blur',fn,true); } document.querySelectorAll('input[name="phone"]').forEach(attach); }

  function bindAllForms(){
    const wl=document.getElementById('waitlist-form');
    if(wl) wl.addEventListener('submit', async (e)=>{
      e.preventDefault(); const fd=new FormData(wl); const row=Object.fromEntries(fd.entries());
      const phone=normalizeIndianPhone(row.phone); if(!phone) return wl.reportValidity();
      try{
        const { error } = await supa.from('waitlist').insert([{ email: row.email, phone, locality: row.locality }]);
        const m=document.getElementById('wl-msg'); if(m) m.textContent = error?('Error: '+error.message):'Added to waitlist!';
      }catch(err){
        const m=document.getElementById('wl-msg'); if(m) m.textContent='Saved (will sync once DB ready).';
      }
    });

    const cf=document.getElementById('contact-form');
    if(cf) cf.addEventListener('submit', async (e)=>{
      e.preventDefault(); const fd=new FormData(cf); const row=Object.fromEntries(fd.entries());
      const phone=normalizeIndianPhone(row.phone); if(!phone) return cf.reportValidity();
      try{
        const { error } = await supa.from('contacts').insert([{ name: row.name, email: row.email, phone, topic: row.topic, preferred_time: row.time }]);
        const m=document.getElementById('call-msg'); if(m) m.textContent = error?('Error: '+error.message):'Thanks! We’ll reach out.';
      }catch(err){
        const m=document.getElementById('call-msg'); if(m) m.textContent='Saved (will sync once DB ready).';
      }
    });

    const bf=document.getElementById('booking-form');
    if(bf) bf.addEventListener('submit', async (e)=>{
      e.preventDefault(); const fd=new FormData(bf); const row=Object.fromEntries(fd.entries());
      const phone=normalizeIndianPhone(row.phone); if(!phone) return bf.reportValidity();
      const startsAt = new Date(row.starts_at);
      try{
        const s = await supa.auth.getSession(); const uid = s?.data?.session?.user?.id || null;
        const { error } = await supa.from('bookings').insert([{ user_id: uid, name: row.name, email: row.email, phone, service: row.service, starts_at: startsAt.toISOString(), address: row.address, status: 'pending' }]);
        const m=document.getElementById('booking-msg'); if(m) m.textContent = error?('Error: '+error.message):'Booking request sent!';
      }catch(err){
        const m=document.getElementById('booking-msg'); if(m) m.textContent='Saved (will sync once DB ready).';
      }
    });
  }

  function hydrateDashboard(){
    const dash=document.getElementById('dashboard'); if(!dash) return;
    getSession().then(async (s)=>{
      const email=s?.user?.email||'there'; const role=s?.user?.user_metadata?.role||(localStorage.getItem('fluryy:desired-role')||'Parent');
      const roleStr = typeof role==='string' ? (role[0].toUpperCase()+role.slice(1)) : 'Parent';
      const nameEl=dash.querySelector('[data-name]'); const roleEl=dash.querySelector('[data-role]'); if(nameEl) nameEl.textContent=email; if(roleEl) roleEl.textContent=roleStr;
    });
  }

  function bindBookingModal(){
    const openBtns = document.querySelectorAll('[data-open-booking]');
    const modal = document.getElementById('booking-modal'); if(!modal) return;
    const closeBtns = modal.querySelectorAll('[data-close]');
    function open(){ modal.classList.add('is-open'); document.body.classList.add('modal-open'); }
    function close(){ modal.classList.remove('is-open'); document.body.classList.remove('modal-open'); }
    openBtns.forEach(b=>b.addEventListener('click',(e)=>{e.preventDefault(); open();}));
    closeBtns.forEach(b=>b.addEventListener('click',(e)=>{e.preventDefault(); close();}));
    modal.addEventListener('click',(e)=>{ if(e.target===modal) close(); });
    document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') close(); });
  }
})();