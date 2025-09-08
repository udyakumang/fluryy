
const newsletterForm=document.querySelector('#newsletter-form');
if(newsletterForm){newsletterForm.addEventListener('submit',e=>{e.preventDefault();const t=newsletterForm.querySelector('input[type="email"]').value.trim();if(!t)return;const s=document.querySelector('#newsletter-msg');s.textContent='Thanks! You’re on the list. (Connect to SES/Mailchimp to go live)';s.setAttribute('aria-live','polite');newsletterForm.reset()})}
if('serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const id=a.getAttribute('href');const el=document.querySelector(id);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'})}})})
document.querySelectorAll('[data-whatsapp]').forEach(btn=>{btn.addEventListener('click',()=>{const url='https://wa.me/919999999999?text=Hi%20Udyak%2C%20I%27m%20interested%20in%20social%20media%20growth%20services.';window.open(url,'_blank')})});
