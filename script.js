const menu=document.getElementById('menu');
const nav=document.getElementById('nav');
if(menu&&nav){
  menu.addEventListener('click',()=>nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
}
const rupiah=n=>'Rp'+Number(n).toLocaleString('id-ID');
const CART_KEY='geezmos_supply_cart_v1';
let cart=[];
try{cart=JSON.parse(localStorage.getItem(CART_KEY)||'[]');if(!Array.isArray(cart))cart=[];}catch(e){cart=[];}
const drawer=document.getElementById('cartDrawer');
const backdrop=document.getElementById('cartBackdrop');
const itemsEl=document.getElementById('cartItems');
const countEls=[document.getElementById('cartCount'),document.getElementById('headerCartCount')].filter(Boolean);
function saveCart(){try{localStorage.setItem(CART_KEY,JSON.stringify(cart));}catch(e){}}
function itemCount(){return cart.reduce((sum,p)=>sum+p.qty,0);}
function total(){return cart.reduce((sum,p)=>sum+p.price*p.qty,0);}
function renderCart(){
  const count=itemCount();
  countEls.forEach(el=>el.textContent=count);
  const totalText=rupiah(total());
  ['cartTotal','drawerTotal'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=totalText;});
  const cartText=document.getElementById('cartText');
  if(cartText)cartText.textContent=count?`${count} barang dipilih.`:'Belum ada produk di keranjang.';
  if(!itemsEl)return;
  if(!cart.length){itemsEl.innerHTML='<p class="cart-empty">Keranjang masih kosong. Yuk, pilih produk favoritmu.</p>';return;}
  itemsEl.innerHTML=cart.map((p,i)=>`
    <article class="cart-row">
      <div><h3>${escapeHTML(p.name)}</h3><p>${rupiah(p.price)} / item</p></div>
      <div class="cart-row-side"><strong>${rupiah(p.price*p.qty)}</strong>
        <div class="qty-controls">
          <button type="button" data-action="minus" data-index="${i}" aria-label="Kurangi jumlah">−</button>
          <span>${p.qty}</span>
          <button type="button" data-action="plus" data-index="${i}" aria-label="Tambah jumlah">+</button>
        </div>
        <button class="remove-item" type="button" data-action="remove" data-index="${i}">Hapus</button>
      </div>
    </article>`).join('');
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(msg){
  const old=document.querySelector('.toast');if(old)old.remove();
  const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>t.remove(),2200);
}
function addProduct(btn){
  const name=btn.dataset.name;const price=Number(btn.dataset.price);
  if(!name||!Number.isFinite(price)||price<=0)return;
  const found=cart.find(p=>p.name===name);
  if(found)found.qty+=1;else cart.push({name,price,qty:1});
  saveCart();renderCart();toast('Produk berhasil ditambahkan ke keranjang.');
}
document.querySelectorAll('.add').forEach(btn=>btn.addEventListener('click',()=>addProduct(btn)));
function openCart(){
  drawer.classList.add('open');backdrop.classList.add('show');drawer.setAttribute('aria-hidden','false');document.body.classList.add('cart-locked');
  document.getElementById('cartClose').focus();
}
function closeCart(){
  drawer.classList.remove('open');backdrop.classList.remove('show');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('cart-locked');
}
document.getElementById('cartTrigger')?.addEventListener('click',openCart);
document.getElementById('cartClose')?.addEventListener('click',closeCart);
backdrop?.addEventListener('click',closeCart);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))closeCart();});
itemsEl?.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-action]');if(!btn)return;
  const i=Number(btn.dataset.index);if(!cart[i])return;
  if(btn.dataset.action==='plus')cart[i].qty+=1;
  if(btn.dataset.action==='minus'){cart[i].qty-=1;if(cart[i].qty<=0)cart.splice(i,1);}
  if(btn.dataset.action==='remove')cart.splice(i,1);
  saveCart();renderCart();
});
function checkoutWhatsApp(){
  if(!cart.length){toast('Keranjang masih kosong.');return;}
  const phone='6281200000000'; // Ganti dengan nomor WhatsApp toko yang aktif.
  const lines=cart.map(p=>`- ${p.name} x${p.qty} = ${rupiah(p.price*p.qty)}`).join('\n');
  const message=`Halo Geezmo's Supply, saya ingin memesan:\n${lines}\n\nTotal: ${rupiah(total())}\nMohon konfirmasi ketersediaan dan biaya pengiriman.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,'_blank','noopener');
}
document.getElementById('drawerCheckout')?.addEventListener('click',checkoutWhatsApp);
document.getElementById('checkout')?.addEventListener('click',openCart);
document.getElementById('contactForm')?.addEventListener('submit',e=>{
  e.preventDefault();const d=new FormData(e.target);
  const subject=encodeURIComponent("Pesan dari website Geezmo's Supply");
  const body=encodeURIComponent(`Nama: ${d.get('name')}\nKontak: ${d.get('contact')}\nPesan: ${d.get('message')}`);
  window.location.href=`mailto:hello@geezmossupply.com?subject=${subject}&body=${body}`;
});
renderCart();
// Reveal content smoothly as visitors scroll.
const revealTargets=document.querySelectorAll('.section .kicker,.two-col,.values,.section-heading,.product-card,.service-list article,.policy-grid article,.checkout,.contact-grid');
revealTargets.forEach(el=>el.classList.add('reveal-ready'));
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}});
  },{threshold:.12});
  revealTargets.forEach(el=>observer.observe(el));
}else{revealTargets.forEach(el=>el.classList.add('revealed'));}


// ===== Interactive animation enhancements =====
(function(){
  const progress=document.getElementById('scrollProgress');
  const header=document.querySelector('.header');
  const topButton=document.getElementById('backToTop');
  let ticking=false;
  function updateScrollUI(){
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const pct=max>0?(window.scrollY/max)*100:0;
    if(progress)progress.style.width=pct+'%';
    if(header)header.classList.toggle('is-scrolled',window.scrollY>24);
    if(topButton)topButton.classList.toggle('visible',window.scrollY>420);
    ticking=false;
  }
  window.addEventListener('scroll',()=>{
    if(!ticking){window.requestAnimationFrame(updateScrollUI);ticking=true;}
  },{passive:true});
  updateScrollUI();
  topButton?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Open a clean, full-screen preview when a product image is clicked.
  const lightbox=document.getElementById('imageLightbox');
  const lightboxImage=document.getElementById('lightboxImage');
  const lightboxCaption=document.getElementById('lightboxCaption');
  const closeLightbox=()=>{
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden','true');
    document.body.classList.remove('lightbox-locked');
  };
  document.querySelectorAll('.product-photo .product-image').forEach(img=>{
    img.setAttribute('tabindex','0');
    img.setAttribute('role','button');
    img.setAttribute('aria-label','Perbesar '+(img.alt||'foto produk'));
    const open=()=>{
      if(!lightbox||!lightboxImage)return;
      lightboxImage.src=img.src;
      lightboxImage.alt=img.alt;
      if(lightboxCaption)lightboxCaption.textContent=img.alt.toUpperCase();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
      document.body.classList.add('lightbox-locked');
      document.getElementById('lightboxClose')?.focus();
    };
    img.addEventListener('click',open);
    img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  });
  document.getElementById('lightboxClose')?.addEventListener('click',closeLightbox);
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();});

  // Give add-to-cart buttons a brief confirmation animation.
  document.querySelectorAll('.add').forEach(btn=>{
    btn.addEventListener('click',()=>{
      btn.classList.add('added');
      const previous=btn.textContent;
      btn.textContent='✓';
      window.setTimeout(()=>{btn.classList.remove('added');btn.textContent=previous;},650);
    });
  });

  // Gentle pointer tilt on product cards (disabled for touch/reduced motion).
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(!reduceMotion&&finePointer){
    document.querySelectorAll('.product-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(900px) rotateY(${x*3}deg) rotateX(${-y*3}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave',()=>{card.style.transform='';});
    });
  }
})();
