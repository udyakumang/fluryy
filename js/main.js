
// --- Helpers: build contact safely (no raw creds) ---
function buildEmail(){
  // "hello@fluryy.com"
  const codes=[104,101,108,108,111,64,102,108,117,114,121,121,46,99,111,109];
  return String.fromCharCode(...codes);
}
function buildPhone(){
  // "+919999999999"
  const codes=[43,57,49,57,57,57,57,57,57,57,57,57];
  return String.fromCharCode(...codes);
}
function setContact(){
  const emailEl=document.querySelector('[data-email]');
  const phoneEl=document.querySelector('[data-phone]');
  const email=buildEmail(), phone=buildPhone();
  if(emailEl){
    emailEl.addEventListener('click',()=>{
      navigator.clipboard.writeText(email).then(()=>{ emailEl.textContent='Email copied'; });
    });
  }
  if(phoneEl){
    phoneEl.addEventListener('click',()=>{
      navigator.clipboard.writeText(phone).then(()=>{ phoneEl.textContent='Phone copied'; });
    });
  }
  // WhatsApp button & mailto link (set at click-time)
  document.querySelectorAll('[data-whatsapp]').forEach(btn=>btn.addEventListener('click',()=>{
    const wa='https://wa.me/'+phone.replace('+','')+'?text='+encodeURIComponent('Hi Fluryy, I want to book pet grooming.');
    window.open(wa,'_blank');
  }));
  const mailBtns=document.querySelectorAll('[data-mailto]');
  mailBtns.forEach(b=>b.addEventListener('click',()=>{
    location.href='mailto:'+email+'?subject=Fluryy%20Enquiry';
  }));
}

// Smooth anchors
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href'); const el=document.querySelector(id);
  if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
}));

// Mobile nav toggle
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if(toggle && nav){
  toggle.addEventListener('click',()=>{
    const open = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Sticky CTA buttons
function openBookingModal(){
  const modal=document.getElementById('booking-modal');
  if(modal){ modal.setAttribute('open',''); modal.querySelector('[name=name]')?.focus(); }
}
document.getElementById('sticky-book')?.addEventListener('click',openBookingModal);
document.getElementById('sticky-waitlist')?.addEventListener('click',openBookingModal);
document.querySelectorAll('[data-open-booking]').forEach(el=>el.addEventListener('click',openBookingModal));

// Booking modal close
(function(){
  const modal=document.getElementById('booking-modal');
  if(!modal) return;
  const close=()=>modal.removeAttribute('open');
  modal.querySelector('[data-close]')?.addEventListener('click',close);
  modal.addEventListener('click',e=>{ if(e.target===modal) close(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
})();

// Demo local save for forms (replace with backend later)
function saveForm(id) {
  const form = document.getElementById(id);
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    const msg = form.querySelector('[data-msg]');
    if(!form.hasAttribute('data-demo')) return;
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem('fluryy:'+id, JSON.stringify({data, ts:Date.now()}));
    if(msg) msg.textContent = 'Saved. We will contact you shortly.';
  });
}
['waitlist-form','groomer-form','contact-form','provider-edit-form','pet-add-form','booking-form'].forEach(saveForm);

// Load saved pet to table (demo)
(function(){
  const t = document.getElementById('pet-list');
  if(!t) return;
  const raw = localStorage.getItem('fluryy:pet-add-form');
  if(!raw) return;
  const {data} = JSON.parse(raw);
  const row = t.insertRow(-1);
  ['name','species','breed','birthdate','weight','notes'].forEach(k=>{
    const cell = row.insertCell(-1);
    cell.textContent = data[k]||'-';
  });
})();

// PWA (optional)
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

// Initialize last
setContact();
