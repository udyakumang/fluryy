
(function(){
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  function init(){
    setContact();
    bindAnchors();
    bindMobileNav();
    bindBookingModal();
    setupLocalSaves();
    loadSavedPet();
    registerPWA();
  }

  function buildEmail(){ return String.fromCharCode(104,101,108,108,111,64,102,108,117,114,121,121,46,99,111,109); }
  function buildPhone(){ return String.fromCharCode(43,57,49,57,57,57,57,57,57,57,57,57); }
  function setContact(){
    const emailEl=document.querySelector('[data-email]');
    const phoneEl=document.querySelector('[data-phone]');
    const email=buildEmail(), phone=buildPhone();
    if(emailEl){
      emailEl.addEventListener('click', (e)=>{
        e.preventDefault();
        location.href='mailto:'+email+'?subject=Fluryy%20Enquiry';
      });
    }
    if(phoneEl){
      phoneEl.addEventListener('click', (e)=>{
        e.preventDefault();
        const wa='https://wa.me/'+phone.replace('+','')+'?text='+encodeURIComponent('Hi Fluryy, I want to book pet grooming.');
        window.open(wa,'_blank');
      });
    }
    document.querySelectorAll('[data-whatsapp]').forEach(btn=>btn.addEventListener('click',(e)=>{
      e.preventDefault();
      const wa='https://wa.me/'+phone.replace('+','')+'?text='+encodeURIComponent('Hi Fluryy, I want to book pet grooming.');
      window.open(wa,'_blank');
    }));
  }

  function bindAnchors(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
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
      if(opener){
        e.preventDefault();
        openBookingModal();
      }
      const closer = e.target.closest('[data-close]');
      if(closer){
        e.preventDefault();
        closeBookingModal();
      }
    });
    const modal=document.getElementById('booking-modal');
    if(modal){
      modal.addEventListener('click',(e)=>{
        if(e.target === modal) closeBookingModal();
      });
      document.addEventListener('keydown',(e)=>{
        if(e.key==='Escape') closeBookingModal();
      });
    }
  }

  function setupLocalSaves(){
    ['waitlist-form','groomer-form','contact-form','provider-edit-form','pet-add-form','booking-form'].forEach(id=>{
      const form = document.getElementById(id);
      if(!form) return;
      form.addEventListener('submit', (e)=>{
        const isDemo=form.hasAttribute('data-demo');
        const msg = form.querySelector('[data-msg]');
        if(isDemo){
          e.preventDefault();
          const data = Object.fromEntries(new FormData(form).entries());
          localStorage.setItem('fluryy:'+id, JSON.stringify({data, ts:Date.now()}));
          if(msg) msg.textContent = 'Saved. We will contact you shortly.';
          if(id==='booking-form') closeBookingModal();
        }
      });
    });
  }

  function loadSavedPet(){
    const t = document.getElementById('pet-list');
    if(!t) return;
    const raw = localStorage.getItem('fluryy:pet-add-form');
    if(!raw) return;
    const {data} = JSON.parse(raw);
    const row = t.insertRow(-1);
    ['name','species','breed','birthdate','weight','notes'].forEach(k=>{
      const cell = row.insertCell(-1);
      cell.textContent = data?.[k]||'-';
    });
  }

  function registerPWA(){
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }
})();
