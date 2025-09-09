
(function(){
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  let deferredPrompt = null;

  function init(){
    setContact();
    bindAnchors();
    bindMobileNav();
    bindBookingModal();
    registerPWA();
    renderAuthNav();
    gateProtected();
    bindAuthForms();
    hydrateDashboard();
    setupInstallPrompt();
    loadSavedPet();
  }

  // Contact obfuscated
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

  // Anchors
  function bindAnchors(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
      const id=a.getAttribute('href'); const el=document.querySelector(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    }));
  }

  // Mobile nav
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

  // Booking modal
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

  // PWA
  function registerPWA(){
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }

  // Auth (client demo)
  const AUTH_KEY='fluryy:user';
  function getUser(){ try{ return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; }catch(_){ return null; } }
  function setUser(u){ localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
  function clearUser(){ localStorage.removeItem(AUTH_KEY); }

  function renderAuthNav(){
    const account = document.querySelector('[data-account]');
    if(!account) return;
    const u=getUser();
    if(u){
      account.innerHTML = '<a href="/dashboard.html">Dashboard</a> <button class="btn secondary" data-logout>Logout</button> <a class="cta" href="/install.html">Install App</a>';
      account.querySelector('[data-logout]').addEventListener('click',()=>{ clearUser(); location.href='/'; });
    }else{
      account.innerHTML = '<a href="/login.html">Login</a> <a class="cta" href="/register.html">Sign up</a> <a class="cta" href="/install.html">Install App</a>';
    }
  }

  function gateProtected(){
    const needAuth = document.body.hasAttribute('data-protected');
    if(!needAuth) return;
    const u=getUser();
    if(!u){ location.href='/login.html?next='+encodeURIComponent(location.pathname); }
  }

  function bindAuthForms(){
    const login = document.getElementById('login-form');
    if(login){
      login.addEventListener('submit',(e)=>{
        e.preventDefault();
        const data = Object.fromEntries(new FormData(login).entries());
        const role = data.role || 'parent';
        setUser({email:data.email, name:data.name||'User', role});
        const next = new URLSearchParams(location.search).get('next') || '/dashboard.html';
        location.href = next;
      });
    }
    const reg = document.getElementById('register-form');
    if(reg){
      reg.addEventListener('submit',(e)=>{
        e.preventDefault();
        const data = Object.fromEntries(new FormData(reg).entries());
        const role = data.role || 'parent';
        setUser({email:data.email, name:data.name||'User', role});
        location.href = '/dashboard.html';
      });
    }
  }

  function hydrateDashboard(){
    const dash = document.getElementById('dashboard');
    if(!dash) return;
    const u=getUser();
    const name = u?.name || 'there';
    const role = u?.role || 'guest';
    dash.querySelector('[data-name]').textContent = name;
    dash.querySelector('[data-role]').textContent = role.charAt(0).toUpperCase()+role.slice(1);
    dash.querySelectorAll('[data-panel]').forEach(el=>{
      const r = el.getAttribute('data-panel');
      el.style.display = (r===role || r==='all' || (role==='admin' && r!=='guest')) ? 'block' : 'none';
    });
  }

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

  // Install prompt handling
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
})(); 
