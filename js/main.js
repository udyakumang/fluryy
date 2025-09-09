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

// WhatsApp CTA
document.querySelectorAll('[data-whatsapp]').forEach(btn=>btn.addEventListener('click',()=>{
  const url='https://wa.me/919999999999?text=Hi%20Fluryy%2C%20I%20want%20to%20book%20pet%20grooming.';
  window.open(url,'_blank');
}));

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
    if(msg) msg.textContent = 'Saved locally. (Connect backend later)';
  });
}
['waitlist-form','groomer-form','contact-form','provider-edit-form','pet-add-form'].forEach(saveForm);

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
