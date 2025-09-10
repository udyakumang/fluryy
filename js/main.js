
// Fluryy main.js — v1.2.3
// Supabase OTP auth + CRUD (pets, groomers, bookings) + role metadata + dashboard counts
// Optional Razorpay checkout after booking insert
(function(){
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }

  let deferredPrompt = null;
  let supa = null;

  async function init(){
    await loadSupabase();
    await initSupabaseClient();
    setContact();
    bindAnchors();
    bindMobileNav();
    bindBookingModal();
    registerPWA();
    await ensureRoleMetadata();
    renderAuthNav();
    await gateProtected();
    bindAuthForms();
    hydrateDashboard();
    setupInstallPrompt();
    loadSavedPet();
    bindSupabaseForms();
    loadRazorpay();
  }

  // ---------- Config ----------
  function supaUrl(){ return 'https://qfldkqowlqkokpqwqdpl.supabase.co'; }
  function supaKey(){ return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbGRrcW93bHFrb2twcXdxZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0ODIxNTMsImV4cCI6MjA3MzA1ODE1M30.TtzlGJIl0Vmn2nI2plqnNvq4NaVH1urNgch982glytg'; }
  function razorpayKey(){
    const meta = document.querySelector('meta[name="razorpay-key"]');
    return meta ? meta.getAttribute('content') : null;
  }

  // ---------- Libs ----------
  async function loadSupabase(){
    if(window.supabase) return;
    await new Promise((resolve, reject)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
    });
  }
  async function initSupabaseClient(){
    if(!window.supabase) return;
    supa = window.supabase.createClient(supaUrl(), supaKey());
  }
  function loadRazorpay(){
    if(razorpayKey() && !window.Razorpay){
      const s=document.createElement('script');
      s.src='https://checkout.razorpay.com/v1/checkout.js';
      document.head.appendChild(s);
    }
  }

  // ---------- Contact (obfuscated) ----------
  function buildEmail(){ return String.fromCharCode(104,101,108,108,111,64,102,108,117,114,121,121,46,99,111,109); }
  // +91 8657369309
  function buildPhone(){ return String.fromCharCode(43,57,49,56,54,53,55,51,54,57,51,48,57); }
  function setContact(){
    const emailEl=document.querySelector('[data-email]');
    const phoneEl=document.querySelector('[data-phone]');
    const email=buildEmail(), phone=buildPhone();
    if(emailEl){
      emailEl.addEventListener('click', (e)=>{ e.preventDefault(); location.href='mailto:'+email+'?subject=Fluryy%20Enquiry'; });
    }
    if(phoneEl){
      phoneEl.addEventListener('click', (e)=>{
        e.preventDefault();
        const wa='https://wa.me/'+phone.replace('+','')+'?text='+encodeURIComponent('Hi Fluryy, I want to book pet grooming.');
        window.open(wa,'_blank');
      });
    }
  }

  // ---------- UI basics ----------
  function bindAnchors(){
    document.querySelectorAll('a[href^=\"#\"]').forEach(a=>a.addEventListener('click',e=>{
      const id=a.getAttribute('href'); const el=document.querySelector(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    }));
  }
  function bindMobileNav(){
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if(toggle && nav){
      toggle.addEventListener('click',()=>{
        const open = nav.classList.toggle('nav--open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }
  function registerPWA(){
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }

  // ---------- Booking modal ----------
  function openBookingModal(){
    const modal=document.getElementById('booking-modal');
    if(!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    const first=modal.querySelector('input,select,textarea,button');
    if(first) first.focus();
  }
  function closeBookingModal(){
    const modal=document.getElementById('booking-modal');
    if(!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }
  function bindBookingModal(){
    document.addEventListener('click', (e)=>{
      const opener = e.target.closest('[data-open-booking]');
      if(opener){ e.preventDefault(); openBookingModal(); }
      const closer = e.target.closest('[data-close]');
      if(closer){ e.preventDefault(); closeBookingModal(); }
    });
    const modal=document.getElementById('booking-modal');
    if(modal){
      modal.addEventListener('click',(e)=>{ if(e.target === modal) closeBookingModal(); });
      document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeBookingModal(); });
    }
  }

  // ---------- Auth helpers ----------
  async function getSession(){
    if(!supa) return null;
    const { data:{ session } } = await supa.auth.getSession();
    return session;
  }
  async function ensureRoleMetadata(){
    const desired = localStorage.getItem('fluryy:desired-role');
    const session = await getSession();
    if(!session || !desired) return;
    try{
      await supa.auth.updateUser({ data: { role: desired } });
    }catch(_){}
  }
  async function renderAuthNav(){
    const account = document.querySelector('[data-account]');
    if(!account) return;
    const session = await getSession();
    if(session && session.user){
      account.innerHTML = '<a href=\"/dashboard.html\">Dashboard</a> <button class=\"btn secondary\" data-logout>Logout</button> <a class=\"cta\" href=\"/install.html\">Install App</a>';
      account.querySelector('[data-logout]').addEventListener('click', async ()=>{ await supa.auth.signOut(); location.href='/'; });
    } else {
      account.innerHTML = '<a href=\"/login.html\">Login</a> <a class=\"cta\" href=\"/register.html\">Sign up</a> <a class=\"cta\" href=\"/install.html\">Install App</a>';
    }
  }
  async function gateProtected(){
    const needAuth = document.body.hasAttribute('data-protected');
    if(!needAuth) return;
    const session = await getSession();
    if(!session){ location.href='/login.html?next='+encodeURIComponent(location.pathname); }
  }
  function bindAuthForms(){
    const login = document.getElementById('login-form');
    if(login){
      login.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const fd = new FormData(login);
        const email = fd.get('email');
        const next = new URLSearchParams(location.search).get('next') || '/dashboard.html';
        const { error } = await supa.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + next } });
        const msg = login.querySelector('[data-msg]');
        if(error) msg.textContent = 'Error: '+error.message;
        else msg.textContent = 'Check your email for the login link.';
      });
    }
    const reg = document.getElementById('register-form');
    if(reg){
      reg.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const fd = new FormData(reg);
        const email = fd.get('email');
        const role = fd.get('role') || 'parent';
        localStorage.setItem('fluryy:desired-role', role);
        const { error } = await supa.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + '/dashboard.html' } });
        const msg = reg.querySelector('[data-msg]');
        if(error) msg.textContent = 'Error: '+error.message;
        else msg.textContent = 'Check your email to confirm & continue.';
      });
    }
  }

  // ---------- Forms -> Supabase ----------
  function bindSupabaseForms(){
    // Pets (pets.html)
    const pet = document.getElementById('pet-add-form');
    if(pet){
      pet.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const fd = new FormData(pet);
        const row = Object.fromEntries(fd.entries());
        // Keep legacy preview
        localStorage.setItem('fluryy:pet-add-form', JSON.stringify({data: row, ts: Date.now()}));
        try{
          const session = await getSession();
          const owner = session?.user?.id || null;
          const { error } = await supa.from('pets').insert([{ owner_id: owner, name: row.name, species: row.species, breed: row.breed, birthdate: row.birthdate, weight: row.weight, notes: row.notes }]);
          if(error) throw error;
          pet.reset();
          alert('Pet saved!');
        }catch(err){
          console.warn('Supabase pets insert failed:', err?.message);
          pet.submit(); // fallback to Formspree
        }
      });
    }

    // Groomer profile (providers.html)
    const g = document.getElementById('groomer-form');
    if(g){
      g.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const fd = new FormData(g);
        const data = Object.fromEntries(fd.entries());
        try{
          const session = await getSession();
          const uid = session?.user?.id || null;
          const payload = {
            user_id: uid,
            name: data.name, phone: data.phone, email: data.email,
            exp: parseInt(data.exp||'0',10),
            areas: data.areas,
            skills: (Array.isArray(data.skills) ? data.skills : [data.skills]).filter(Boolean),
            bio: data.bio,
            avail_from: data.avail_from, avail_to: data.avail_to
          };
          // upsert on user_id
          const { error } = await supa.from('groomers').upsert(payload, { onConflict: 'user_id' });
          if(error) throw error;
          alert('Profile saved!');
        }catch(err){
          console.warn('Supabase groomer upsert failed:', err?.message);
          g.submit(); // fallback to Formspree
        }
      });
    }

    // Booking modal (index.html)
    const b = document.getElementById('booking-form');
    if(b){
      b.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const fd = new FormData(b);
        const row = Object.fromEntries(fd.entries());
        try{
          const session = await getSession();
          const uid = session?.user?.id || null;
          const { data, error } = await supa.from('bookings').insert([{
            user_id: uid, name: row.name, email: row.email, phone: row.phone,
            service: row.service, date: row.date, time: row.time, address: row.address, status: 'pending'
          }]).select().single();
          if(error) throw error;
          // Razorpay if configured
          if(razorpayKey() && window.Razorpay){
            const rzp = new window.Razorpay({
              key: razorpayKey(),
              amount: 50000, currency: 'INR', name: 'Fluryy', description: row.service,
              prefill: { name: row.name, email: row.email, contact: row.phone },
              handler: async function (resp){
                await supa.from('bookings').update({ status: 'paid', razorpay_payment_id: resp.razorpay_payment_id }).eq('id', data.id);
                location.href = '/thanks.html';
              }
            });
            rzp.open();
          } else {
            location.href = '/thanks.html';
          }
        }catch(err){
          console.warn('Supabase booking insert failed:', err?.message);
          b.submit(); // fallback to Formspree
        }
      });
    }
  }

  // ---------- Dashboard ----------
  function hydrateDashboard(){
    const dash = document.getElementById('dashboard');
    if(!dash) return;
    getSession().then(async (session)=>{
      const email = session?.user?.email || 'there';
      const role = session?.user?.user_metadata?.role || (localStorage.getItem('fluryy:desired-role')||'Parent');
      const roleFormatted = (typeof role === 'string' && role.length) ? role[0].toUpperCase()+role.slice(1) : 'Parent';
      const nameEl = dash.querySelector('[data-name]');
      const roleEl = dash.querySelector('[data-role]');
      if(nameEl) nameEl.textContent = email;
      if(roleEl) roleEl.textContent = roleFormatted;

      // Simple counts
      try{
        const uid = session?.user?.id || null;
        const { count: petsCount } = await supa.from('pets').select('id', { count:'exact', head:true }).eq('owner_id', uid);
        const { count: bookingsCount } = await supa.from('bookings').select('id', { count:'exact', head:true }).eq('user_id', uid);
        const petsEl = document.querySelector('[data-count-pets]');
        const bookEl = document.querySelector('[data-count-bookings]');
        if(petsEl) petsEl.textContent = petsCount ?? 0;
        if(bookEl) bookEl.textContent = bookingsCount ?? 0;
      }catch(_){}
    });
  }

  // ---------- Install prompt ----------
  function setupInstallPrompt(){
    const headerBtn = document.querySelector('[data-install]');
    const mobileBtn = document.querySelector('[data-install-mobile]');
    const banner = document.querySelector('[data-install-banner]');
    const bannerBtn = document.querySelector('[data-install-banner-btn]');

    window.addEventListener('beforeinstallprompt', (e)=>{
      e.preventDefault();
      deferredPrompt = e;
      if(headerBtn) headerBtn.style.display = 'inline-block';
      if(mobileBtn) mobileBtn.style.display = 'inline-block';
      if(banner) banner.classList.add('is-visible');
    });

    function triggerInstall(e){
      e.preventDefault();
      if(deferredPrompt){
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(()=>{ deferredPrompt=null; });
      } else {
        location.href = '/install.html';
      }
    }
    if(headerBtn) headerBtn.addEventListener('click', triggerInstall);
    if(mobileBtn) mobileBtn.addEventListener('click', triggerInstall);
    if(bannerBtn) bannerBtn.addEventListener('click', triggerInstall);
  }

  // ---------- Saved pet preview ----------
  function loadSavedPet(){
    const t = document.getElementById('pet-list');
    if(!t) return;
    const raw = localStorage.getItem('fluryy:pet-add-form');
    if(!raw) return;
    try {
      const {data} = JSON.parse(raw);
      const row = t.insertRow(-1);
      ['name','species','breed','birthdate','weight','notes'].forEach(k=>{
        const cell = row.insertCell(-1);
        cell.textContent = data?.[k]||'-';
      });
    } catch(_) {}
  }
})();
