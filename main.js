/* ============================================================
   GLAMSITE PRO — JavaScript principal
   ============================================================ */

'use strict';

/* ── NAVBAR : hamburger + sticky ── */
(function () {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    // Fermer si on clique ailleurs
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }

  // Lien actif
  const links = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
})();

/* ── PROMO BANNER ── */
(function () {
  const btn = document.querySelector('.promo-close');
  const banner = document.querySelector('.promo-banner');
  if (btn && banner) {
    btn.addEventListener('click', () => {
      banner.style.display = 'none';
      sessionStorage.setItem('promo-closed', '1');
    });
    if (sessionStorage.getItem('promo-closed')) banner.style.display = 'none';
  }
})();

/* ── SCROLL TO TOP ── */
(function () {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── FADE IN ON SCROLL ── */
(function () {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();

/* ── WHATSAPP WIDGET ── */
(function () {
  const widget = document.getElementById('wa-widget');
  const floatBtn = document.getElementById('wa-float');
  if (!widget || !floatBtn) return;

  // Afficher le widget après 5 secondes si pas déjà fermé
  const waKey = 'wa-widget-closed';
  if (!sessionStorage.getItem(waKey)) {
    setTimeout(() => { widget.classList.add('show'); }, 5000);
  }

  // Fermer le widget
  const closeBtn = widget.querySelector('.wa-widget__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      widget.classList.remove('show');
      sessionStorage.setItem(waKey, '1');
    });
  }

  // Clic sur le bouton flottant : ouvre/ferme le widget
  floatBtn.addEventListener('click', () => {
    widget.classList.toggle('show');
  });
})();

/* ── TOAST ── */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
window.showToast = showToast;

/* ── MODAL GÉNÉRIQUE ── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
window.openModal  = openModal;
window.closeModal = closeModal;

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (e.target.classList.contains('modal-close')) {
    const overlay = e.target.closest('.modal-overlay');
    if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
  }
});

/* ── PANIER ── */
const Cart = (function () {
  let items = JSON.parse(localStorage.getItem('glamcart') || '[]');

  function save() { localStorage.setItem('glamcart', JSON.stringify(items)); }
  function count() { return items.reduce((s, i) => s + i.qty, 0); }
  function total() { return items.reduce((s, i) => s + i.price * i.qty, 0); }

  function updateBadge() {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;
    const n = count();
    badge.textContent = n;
    badge.classList.toggle('visible', n > 0);
  }

  function renderSidebar() {
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!list) return;
    if (items.length === 0) {
      list.innerHTML = '<p class="cart-empty">🛒 Votre panier est vide.</p>';
    } else {
      list.innerHTML = items.map((item, idx) => `
        <div class="cart-item">
          <div class="cart-item__icon">${item.icon}</div>
          <div class="cart-item__info">
            <div class="cart-item__name">${item.name}</div>
            <div class="cart-item__price">${(item.price * item.qty).toFixed(2)} €</div>
            <div class="cart-item__qty">
              <button class="qty-btn" onclick="Cart.changeQty(${idx}, -1)">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="Cart.changeQty(${idx}, 1)">+</button>
            </div>
          </div>
          <button class="cart-remove" onclick="Cart.remove(${idx})" title="Supprimer">✕</button>
        </div>`).join('');
    }
    if (totalEl) totalEl.textContent = total().toFixed(2) + ' €';
    updateBadge();
  }

  function add(product) {
    const existing = items.find(i => i.id === product.id);
    if (existing) { existing.qty++; }
    else { items.push({ ...product, qty: 1 }); }
    save();
    renderSidebar();
    showToast('✅ ' + product.name + ' ajouté au panier !');
    openCart();
  }

  function remove(idx) {
    items.splice(idx, 1);
    save();
    renderSidebar();
  }

  function changeQty(idx, delta) {
    items[idx].qty += delta;
    if (items[idx].qty <= 0) items.splice(idx, 1);
    save();
    renderSidebar();
  }

  function openCart() {
    document.getElementById('cart-sidebar')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderSidebar();
  }

  function closeCart() {
    document.getElementById('cart-sidebar')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function checkout() {
    if (items.length === 0) { showToast('Votre panier est vide !', 'error'); return; }
    // Ici on pourrait rediriger vers une vraie page de paiement
    showToast('🎉 Commande passée ! Merci pour votre achat.', 'success');
    items = [];
    save();
    renderSidebar();
    closeCart();
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    updateBadge();
    document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
    document.getElementById('cart-icon-btn')?.addEventListener('click', openCart);
    document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
    document.getElementById('cart-checkout-btn')?.addEventListener('click', checkout);
  });

  return { add, remove, changeQty, openCart, closeCart, checkout };
})();
window.Cart = Cart;

/* ── TABS (filtres boutique) ── */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('[data-category]').forEach(el => {
          el.style.display = (filter === 'all' || el.dataset.category === filter) ? '' : 'none';
        });
      });
    });
  });
}
document.addEventListener('DOMContentLoaded', initTabs);

/* ── FORMULAIRE RÉSERVATION ── */
(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  // Bloquer les dates passées
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    // Validation simple
    if (!data.prenom || !data.nom || !data.email || !data.telephone || !data.prestation || !data.date || !data.heure) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(data.email)) {
      showToast('Adresse email invalide.', 'error');
      return;
    }

    // Simulation envoi
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '⏳ Envoi en cours...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Réserver mon rendez-vous';
      btn.disabled = false;
      showToast('✅ Rendez-vous réservé ! Un email de confirmation vous a été envoyé.', 'success');
      form.reset();
      openModal('modal-confirm');
    }, 1800);
  });
})();

/* ── FORMULAIRE CONTACT ── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '⏳ Envoi...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Envoyer le message';
      btn.disabled = false;
      showToast('✅ Message envoyé ! Nous vous répondons sous 24h.', 'success');
      form.reset();
    }, 1500);
  });
})();

/* ── FORMULAIRE NEWSLETTER ── */
(function () {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (!email) return;
    showToast('✅ Merci ! Vous êtes inscrite à notre newsletter.', 'success');
    form.reset();
  });
})();

/* ── HORAIRE OUVERT/FERMÉ ── */
(function () {
  const badge = document.getElementById('open-status');
  if (!badge) return;
  const now = new Date();
  const day = now.getDay(); // 0=dim, 1=lun…6=sam
  const hour = now.getHours() + now.getMinutes() / 60;
  // Lun-Ven 9h-19h, Sam 9h-17h, Dim fermé
  let isOpen = false;
  if (day >= 1 && day <= 5 && hour >= 9 && hour < 19) isOpen = true;
  if (day === 6 && hour >= 9 && hour < 17) isOpen = true;
  badge.textContent = isOpen ? '🟢 Ouvert maintenant' : '🔴 Fermé actuellement';
  badge.className = isOpen ? 'badge-day badge-open' : 'badge-day badge-close';
})();

/* ── GALERIE LIGHTBOX ── */
(function () {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;
  items.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const overlay = document.getElementById('lightbox');
      if (!overlay) return;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.addEventListener('click', () => {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
})();

/* ── FORMULAIRE DEVIS ── */
(function () {
  const form = document.getElementById('devis-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '⏳ Envoi...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Envoyer ma demande de devis';
      btn.disabled = false;
      showToast('✅ Demande envoyée ! Nous vous répondrons sous 24h.', 'success');
      form.reset();
    }, 1500);
  });
})();
