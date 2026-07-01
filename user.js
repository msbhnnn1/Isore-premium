/* ============================================
   iStore Premium - User/Storefront JS
   ============================================ */

'use strict';

let storeData = null;
let allProducts = [];
let filteredProducts = [];
let currentProduct = null;
let currentPhotoIndex = 0;
let chatHistory = [];
let chatName = '';

// ======= INIT =======
async function initStore() {
  storeData = await Store.init();
  allProducts = (storeData.products || []).filter(p => p.active);
  filteredProducts = [...allProducts];

  renderSettings();
  renderFilters();
  renderProducts();
  renderBanks();
  renderSocials();
  initChat();
  initNavbar();
  initWaButtons();
  renderStats();
  trackVisit();
}

// ======= SETTINGS =======
function renderSettings() {
  const s = storeData.settings || {};
  const name = s.storeName || 'iStore Premium';

  const ids = ['nav-store-name', 'footerStoreName', 'footerStoreNameBottom', 'aboutStoreNameDisplay'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = name;
  });

  const titleEl = document.querySelector('title');
  if (titleEl) titleEl.textContent = name;

  document.getElementById('heroTitle').textContent = s.heroTagline || 'iPhone Berkualitas, Harga Terbaik';
  document.getElementById('heroSub').textContent = s.heroSubtext || '';
  document.getElementById('footerDesc').textContent = s.storeDescription || '';
  document.getElementById('aboutDesc').textContent = s.storeDescription || '';
  document.getElementById('chatStoreName').textContent = name;

  const addr = s.address;
  const addrWrap = document.getElementById('aboutAddressWrap');
  if (addr && addr.trim()) {
    document.getElementById('aboutAddress').textContent = addr;
    addrWrap.classList.remove('hidden');
  }
  document.getElementById('footerYear').textContent = new Date().getFullYear();
}

// ======= STATS =======
function renderStats() {
  const active = allProducts.filter(p => p.active);
  const totalSold = active.reduce((a, p) => a + (p.sold || 0), 0);
  animateCount('statProducts', active.length);
  const soldEl = document.getElementById('statSold');
  if (soldEl) soldEl.textContent = totalSold + '+';
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(timer);
  }, 50);
}

// ======= VISIT TRACKING =======
function trackVisit() {
  const key = 'istore_visited_' + new Date().toDateString();
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    Store.update('visitors', v => (v || 0) + 1);
  }
}

// ======= NAVBAR =======
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ======= WA BUTTONS =======
function initWaButtons() {
  const s = storeData.settings || {};
  const wa = s.whatsapp || '';
  const storeName = s.storeName || 'iStore Premium';

  const msg = `Halo kak, saya tertarik membeli iPhone di ${storeName}. Boleh saya tanya-tanya dulu? 😊`;

  const ids = ['navWaBtn', 'heroWaBtn', 'aboutWaBtn', 'ctaWaBtn', 'waFab', 'chatWaBtn'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => openWhatsApp(wa, msg));
  });
}

// ======= FILTER DROPDOWNS =======
function renderFilters() {
  const seriesEl = document.getElementById('filterSeries');
  const internalEl = document.getElementById('filterInternal');

  // Unique series from active products
  const seriesSet = new Set(allProducts.map(p => p.series).filter(Boolean));
  const seriesSorted = [...seriesSet].sort((a, b) => Number(a) - Number(b));
  seriesSorted.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = `iPhone ${s}`;
    seriesEl.appendChild(opt);
  });

  // Internal options
  INTERNAL_OPTIONS.forEach(v => {
    const used = allProducts.some(p => p.internal === v);
    if (used) {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      internalEl.appendChild(opt);
    }
  });

  // Listeners
  ['searchInput','filterSeries','filterInternal','filterCategory','filterSort'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', applyFilters);
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const series = document.getElementById('filterSeries').value;
  const internal = document.getElementById('filterInternal').value;
  const category = document.getElementById('filterCategory').value;
  const sort = document.getElementById('filterSort').value;

  filteredProducts = allProducts.filter(p => {
    if (series && p.series !== series) return false;
    if (internal && p.internal !== internal) return false;
    if (category && p.category !== category) return false;
    if (search) {
      const haystack = `${p.type} ${p.series} ${p.internal} ${p.color} ${p.category} ${p.description}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  if (sort === 'price-low') filteredProducts.sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') filteredProducts.sort((a, b) => b.price - a.price);
  else if (sort === 'newest') filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'popular') filteredProducts.sort((a, b) => (b.sold || 0) - (a.sold || 0));

  renderProducts();
}

// ======= PRODUCTS =======
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('noProducts');

  if (!filteredProducts.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = filteredProducts.map((p, i) => buildProductCard(p, i)).join('');

  // Attach click events
  grid.querySelectorAll('.product-card').forEach((el, i) => {
    el.addEventListener('click', (e) => {
      if (!e.target.closest('.btn')) openProductModal(filteredProducts[i]);
    });
  });
  grid.querySelectorAll('.card-wa-btn').forEach((el, i) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = filteredProducts[i];
      const s = storeData.settings || {};
      const msg = `Halo kak, saya tertarik dengan *${p.type} ${p.internal} ${p.color}* seharga *${Fmt.currency(p.price)}*. Apakah masih tersedia? 😊`;
      openWhatsApp(s.whatsapp || '', msg);
    });
  });
  grid.querySelectorAll('.card-chat-btn').forEach((el, i) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = filteredProducts[i];
      openChatWithProduct(p);
    });
  });
}

function buildProductCard(p, i) {
  const photo = p.photos && p.photos[0];
  const discount = p.priceOld ? Math.round((1 - p.price / p.priceOld) * 100) : 0;
  const battColor = Fmt.batteryColor(p.batteryHealth);
  const catClass = Fmt.categoryBadge(p.category);
  const stockLabel = p.stock <= 0 ? '<span class="badge badge-danger">Habis</span>'
    : p.stock <= 2 ? `<span class="badge badge-warning">Sisa ${p.stock}</span>`
    : '';

  return `
    <div class="product-card" style="animation-delay:${i * 50}ms">
      <div class="card-image">
        ${photo ? `<img src="${photo.data}" alt="${p.type}" loading="lazy">` : '<div class="card-placeholder">📱</div>'}
        <div class="card-badge-wrap">
          <span class="badge ${catClass}">${p.category}</span>
          ${p.featured ? '<span class="badge badge-gold">⭐ Pilihan</span>' : ''}
          ${stockLabel}
        </div>
        ${discount > 0 ? `<span class="card-discount">-${discount}%</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${p.type}</div>
        <div class="card-meta">
          <span>💾 ${p.internal}</span>
          <span>🎨 ${p.color}</span>
        </div>
        <div class="card-battery">
          <span style="font-size:12px;color:var(--text-muted)">Baterai</span>
          <div class="battery-bar">
            <div class="battery-fill" style="width:${p.batteryHealth}%;background:${battColor}"></div>
          </div>
          <span style="font-size:12px;font-weight:700;color:${battColor}">${p.batteryHealth}%</span>
        </div>
        <div class="card-price-row">
          <div>
            <div class="card-price">${Fmt.currency(p.price)}</div>
            ${p.priceOld ? `<div class="card-price-old">${Fmt.currency(p.priceOld)}</div>` : ''}
          </div>
          <div class="card-stock">Stok: ${p.stock}</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm card-chat-btn">💬 Chat</button>
          <button class="btn btn-primary btn-sm card-wa-btn">📲 WhatsApp</button>
        </div>
      </div>
    </div>
  `;
}

// ======= PRODUCT MODAL =======
function openProductModal(p) {
  currentProduct = p;
  currentPhotoIndex = 0;
  document.getElementById('modalProductName').textContent = p.type;

  const discount = p.priceOld ? Math.round((1 - p.price / p.priceOld) * 100) : 0;
  const battColor = Fmt.batteryColor(p.batteryHealth);
  const catClass = Fmt.categoryBadge(p.category);

  // Gallery
  renderGallery(p);

  // Info
  const s = storeData.settings || {};
  const waMsg = `Halo kak, saya tertarik dengan *${p.type} ${p.internal} ${p.color}* seharga *${Fmt.currency(p.price)}*. Apakah masih tersedia? 😊`;

  document.getElementById('detailInfo').innerHTML = `
    <h2 class="detail-title">${p.type}</h2>
    <div class="detail-badges">
      <span class="badge ${catClass}">${p.category}</span>
      ${p.featured ? '<span class="badge badge-gold">⭐ Pilihan</span>' : ''}
      ${p.stock <= 0 ? '<span class="badge badge-danger">Stok Habis</span>' : p.stock <= 2 ? `<span class="badge badge-warning">Sisa ${p.stock} unit</span>` : '<span class="badge badge-success">Tersedia</span>'}
    </div>
    <div class="detail-price-block">
      <span class="detail-price">${Fmt.currency(p.price)}</span>
      ${p.priceOld ? `<span class="detail-price-old">${Fmt.currency(p.priceOld)}</span>` : ''}
      ${discount > 0 ? `<span class="badge badge-danger">-${discount}%</span>` : ''}
    </div>
    <div class="detail-specs">
      <div class="spec-item">
        <div class="spec-label">Seri</div>
        <div class="spec-value">iPhone ${p.series}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Storage</div>
        <div class="spec-value">${p.internal}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Warna</div>
        <div class="spec-value">${p.color}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Kategori</div>
        <div class="spec-value">${p.category}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Stok</div>
        <div class="spec-value">${p.stock} unit</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Terjual</div>
        <div class="spec-value">${p.sold || 0} unit</div>
      </div>
    </div>
    <div class="detail-battery-wrap">
      <div class="detail-battery-label">
        <span style="font-size:13px;color:var(--text-muted)">🔋 Battery Health</span>
        <span style="font-weight:700;color:${battColor}">${p.batteryHealth}%</span>
      </div>
      <div class="detail-battery-bar">
        <div class="detail-battery-fill" style="width:${p.batteryHealth}%;background:${battColor}"></div>
      </div>
    </div>
    <div class="detail-desc">${p.description || 'Tidak ada deskripsi.'}</div>
    <div class="detail-actions">
      <button class="btn btn-primary" onclick="openWhatsApp('${s.whatsapp || ''}', \`${waMsg.replace(/`/g, "'")}\`)">
        📲 Beli via WhatsApp
      </button>
      <button class="btn btn-secondary" onclick="openChatWithProduct(currentProduct)">
        💬 Tanya di Chat
      </button>
    </div>
  `;

  Modal.openModal('productModal');
}

function renderGallery(p) {
  const main = document.getElementById('galleryMain');
  const thumbs = document.getElementById('galleryThumbs');

  if (!p.photos || !p.photos.length) {
    main.innerHTML = `<div class="img-placeholder" style="height:100%;font-size:80px">📱</div>`;
    thumbs.innerHTML = '';
    return;
  }

  const renderMain = (idx) => {
    main.innerHTML = `<img src="${p.photos[idx].data}" alt="${p.type}" style="width:100%;height:100%;object-fit:cover">`;
  };

  renderMain(0);

  thumbs.innerHTML = p.photos.map((photo, i) => `
    <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
      <img src="${photo.data}" alt="">
    </div>
  `).join('');

  thumbs.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.idx);
      renderMain(idx);
      thumbs.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

// ======= BANKS =======
function renderBanks() {
  const banks = storeData.settings?.bankAccounts || [];
  const list = document.getElementById('bankList');

  if (!banks.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1">Belum ada rekening ditambahkan. Hubungi admin.</p>';
    return;
  }

  list.innerHTML = banks.map(b => `
    <div class="bank-card">
      <div class="bank-header">
        <span class="bank-icon">${b.logo || '🏦'}</span>
        <span class="bank-name">${b.bank}</span>
      </div>
      <div class="bank-detail">
        <div class="bank-number">${b.accountNumber}</div>
        <div class="bank-holder">a.n. ${b.accountName}</div>
      </div>
      <button class="bank-copy-btn" onclick="copyBank('${b.accountNumber}', '${b.bank}')">
        📋 Salin Nomor Rekening
      </button>
    </div>
  `).join('');
}

function copyBank(num, bank) {
  navigator.clipboard.writeText(num).then(() => {
    Toast.success(`✓ Nomor rekening ${bank} disalin!`);
  }).catch(() => {
    Toast.info(`Rekening ${bank}: ${num}`);
  });
}
window.copyBank = copyBank;

// ======= SOCIALS =======
function renderSocials() {
  const s = storeData.settings || {};
  const socials = [];

  if (s.whatsapp) socials.push({ icon: '📱', platform: 'WhatsApp', handle: '+' + s.whatsapp, href: `https://wa.me/${s.whatsapp}` });
  if (s.instagram) socials.push({ icon: '📸', platform: 'Instagram', handle: '@' + s.instagram, href: `https://instagram.com/${s.instagram}` });
  if (s.tiktok) socials.push({ icon: '🎵', platform: 'TikTok', handle: '@' + s.tiktok, href: `https://tiktok.com/@${s.tiktok}` });
  if (s.facebook) socials.push({ icon: '👥', platform: 'Facebook', handle: s.facebook, href: `https://facebook.com/${s.facebook}` });

  const listHtml = socials.map(sc => `
    <a href="${sc.href}" target="_blank" rel="noopener" class="social-item">
      <span class="social-icon">${sc.icon}</span>
      <div class="social-info">
        <span class="social-platform">${sc.platform}</span>
        <span class="social-handle">${sc.handle}</span>
      </div>
    </a>
  `).join('');

  document.getElementById('socialsList').innerHTML = listHtml || '<p style="color:var(--text-muted);font-size:13px">Belum ada sosmed ditambahkan</p>';

  // Footer
  const footerSocials = document.getElementById('footerSocials');
  if (footerSocials) {
    footerSocials.innerHTML = socials.slice(0, 3).map(sc => `
      <a href="${sc.href}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);transition:color 0.2s;margin-bottom:6px">
        <span>${sc.icon}</span> ${sc.handle}
      </a>
    `).join('');
  }
}

// ======= LIVE CHAT =======
function initChat() {
  const sendBtn = document.getElementById('chatSendBtn');
  const chatInput = document.getElementById('chatInput');

  sendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
}

function openChatWithProduct(p) {
  Modal.closeAll();
  setTimeout(() => {
    Modal.openModal('chatModal');
    const msg = `Halo, saya tertarik dengan ${p.type} ${p.internal} ${p.color}. Apakah masih tersedia?`;
    document.getElementById('chatInput').value = msg;
    document.getElementById('chatInput').focus();
  }, 200);
}
window.openChatWithProduct = openChatWithProduct;

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Save to store
  const chatData = Store.load();
  if (!chatData.chats) chatData.chats = [];

  const sessionId = sessionStorage.getItem('istore_chat_id') || genId('chat');
  sessionStorage.setItem('istore_chat_id', sessionId);

  const chatEntry = {
    id: genId('msg'),
    sessionId,
    sender: 'user',
    message: msg,
    timestamp: new Date().toISOString(),
    read: false
  };
  chatData.chats.push(chatEntry);
  Store.save(chatData);

  // Render user msg
  appendChatMsg(msg, 'user', now);

  // Auto-reply
  setTimeout(() => {
    const replies = [
      'Terima kasih sudah menghubungi kami! 😊 Kami akan segera balas pesan Anda.',
      'Halo! Pesan Anda sudah kami terima. Admin akan segera merespon. Untuk respon lebih cepat, silakan chat via WhatsApp ya!',
      'Terima kasih atas pertanyaannya! Kami sedang mengecek ketersediaan stok untuk Anda.',
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const replyNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Save admin reply
    const replyEntry = {
      id: genId('msg'),
      sessionId,
      sender: 'admin',
      message: reply,
      timestamp: new Date().toISOString(),
      read: true
    };
    chatData.chats.push(replyEntry);
    Store.save(chatData);

    appendChatMsg(reply, 'admin', replyNow);
  }, 1200);
}

function appendChatMsg(msg, sender, time) {
  const messagesEl = document.getElementById('chatMessages');
  const div = document.createElement('div');

  if (sender === 'admin') {
    div.innerHTML = `
      <div class="chat-msg-admin">
        <div class="chat-avatar" style="width:28px;height:28px;font-size:14px">🍎</div>
        <div>
          <div class="chat-bubble chat-admin">${msg}</div>
          <div class="chat-time">${time}</div>
        </div>
      </div>
    `;
  } else {
    div.innerHTML = `
      <div class="chat-msg-user">
        <div>
          <div class="chat-bubble chat-user">${msg}</div>
          <div class="chat-time">${time}</div>
        </div>
      </div>
    `;
  }

  messagesEl.appendChild(div);
  const chatWindow = document.getElementById('chatWindow');
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ======= BOOT =======
document.addEventListener('DOMContentLoaded', initStore);