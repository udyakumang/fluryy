
// No JS form handler—native POSTs to Formspree endpoints.
// Smooth anchors
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href'); const el=document.querySelector(id);
  if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
}));
// WhatsApp CTA
document.querySelectorAll('[data-whatsapp]').forEach(btn=>btn.addEventListener('click',()=>{
  const url='https://wa.me/919999999999?text=Hi%20Fluryy%2C%20I%20want%20to%20book%20pet%20grooming.';
  window.open(url,'_blank');
}));
// PWA registration
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}
