
// Demo forms (replace with SES/Mailchimp later)
document.querySelectorAll('form[data-demo]').forEach(form=>{
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const msg=form.querySelector('[data-msg]');
    if(msg){ msg.textContent='Thanks! We will reach out shortly. (Hook to SES/Mailchimp)'; msg.setAttribute('aria-live','polite'); }
    form.reset();
  });
});
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
