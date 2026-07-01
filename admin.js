/* ============================================
   iStore Premium - Admin Panel JS
   Complete admin system
   ============================================ */

'use strict';

let adminData = null;
let currentPin = '';
let isLoggedIn = false;
let currentChatSession = null;
let bankFieldCount = 0;

// ======= INIT =======
async function initAdmin() {
  adminData = await Store.init();
  
  if (isLoggedIn || sessionStorage.getItem('admin_logged_in')) {
    isLoggedIn = true;
    showDashboard();
  } else {
    showLoginScreen();
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

// ======= TIME UPDATE =======
function updateTime() {
  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('topbarTime').textContent = time;
}

// ======= LOGIN ======= 
function showLoginScreen() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('adminLayout').classList.add('hidden');
  document.getElementById('loginStoreName').textContent = adminData.settings?.storeName || 'iStore Premium';
  
  // PIN Keypad
  document.querySelectorAll('.pin-key').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const val = e.target.dataset.v;
      if (val === 'clear') {
        currentPin = '';
        updatePinDisplay();
      } else if (val === 'del') {
        currentPin = currentPin.slice(0, -1);
        updatePinDisplay();
      } else {
        if (currentPin.length < 4) {
          currentPin += val;
          updatePinDisplay();
          if (currentPin.length === 4) checkPin();
        }
      }
    });
  });
}

function updatePinDisplay() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < currentPin.length);
  });
}

function checkPin() {
  const correctPin = adminData.settings?.adminPin || '1234';
  if (currentPin === correctPin) {
    isLoggedIn = true;
    sessionStorage.setItem('admin_logged_in', 'true');
    showDashboard();
  } else {
    currentPin = '';
    updatePinDisplay();
    Toast.error('PIN salah, coba lagi');
  }
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminLayout').classList.remove('hidden');
  
  // Update store name
  const storeName = adminData.settings?.storeName || 'iStore Premium';
  document.getElementById('sidebarStoreName').textContent = storeName;
  
  // Render dashboard
  renderDashboard();
  initAdminUI();
}

// ======= NAVIGATION ======= 
function initAdminUI() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    isLoggedIn = false;
    currentPin = '';
    sessionStorage.removeItem('admin_logged_in');
    showLoginScreen();
  });
  
  // Sidebar mobile toggle
  document.getElementById('sidebarMobileBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  
  // Close sidebar on link click
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });
  
  // Close modal on backdrop
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
      Modal.closeAll();
    }
  });
}

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected
  document.getElementById(`tab-${tabName}`)?.classList.add('active');
  
  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });
  
  // Update breadcrumb
  const labels = {
    dashboard: 'Dashboard',
    products: 'Manajemen Produk',
    chat: 'Pesan Pelanggan',
    transactions: 'Transaksi',
    analytics: 'Analitik',
    settings: 'Pengaturan'
  };
  document.getElementById('topbarBreadcrumb').textContent = labels[tabName] || tabName;
  
  // Render specific tab
  if (tabName === 'products') renderProductsTab();
  else if (tabName === 'chat') renderChatTab();
  else if (tabName === 'transactions') renderTransactionsTab();
  else if (tabName === 'analytics') renderAnalyticsTab();
  else if (tabName === 'settings') renderSettingsTab();
}

// ======= DASHBOARD ======= 
function renderDashboard() {
  const greeting = getGreeting();
  document.getElementById('dashGreeting').textContent = greeting;
  
  // Stats
  const products = adminData.products.filter(p => p.active);
  const totalSold = products.reduce((a, p) => a + (p.sold || 0), 0);
  const totalIncome = products.reduce((a, p) => a + (p.price * (p.sold || 0)), 0);
  const lowStockCount = products.filter(p => p.stock <= 2).length;
  const unreadChats = adminData.chats?.filter(c => !c.read && c.sender === 'user').length || 0;
  
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-label">📱 Total Produk</div>
      <div class="stat-card-value">${products.length}</div>
      <div class="stat-card-subtext">${products.filter(p => p.stock > 0).length} tersedia</div>
    </div>
    <div class="stat-card success">
      <div class="stat-card-label">✓ Total Terjual</div>
      <div class="stat-card-value">${totalSold}</div>
      <div class="stat-card-subtext">${Fmt.number(products.filter(p => p.sold).length)} produk terjual</div>
    </div>
    <div class="stat-card danger">
      <div class="stat-card-label">💰 Est. Pendapatan</div>
      <div class="stat-card-value">${Fmt.currency(totalIncome).split('Rp ')[1]}</div>
      <div class="stat-card-subtext">Dari penjualan aktif</div>
    </div>
    <div class="stat-card" style="border-color:var(--warning);background:rgba(255,214,10,0.05)">
      <div class="stat-card-label">⚠️ Stok Rendah</div>
      <div class="stat-card-value" style="color:var(--warning)">${lowStockCount}</div>
      <div class="stat-card-subtext">Produk <= 2 unit</div>
    </div>
    <div class="stat-card info">
      <div class="stat-card-label">💬 Pesan Baru</div>
      <div class="stat-card-value">${unreadChats}</div>
      <div class="stat-card-subtext">Chat yang belum dibaca</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">👥 Pengunjung</div>
      <div class="stat-card-value">${adminData.visitors || 0}</div>
      <div class="stat-card-subtext">Hari ini</div>
    </div>
  `;
  
  // Low stock list
  const lowStock = products.filter(p => p.stock <= 2).sort((a, b) => a.stock - b.stock).slice(0, 5);
  document.getElementById('lowStockList').innerHTML = lowStock.length
    ? lowStock.map(p => `
        <div class="dash-item">
          <span class="dash-item-name">${p.type}</span>
          <span class="badge badge-warning">${p.stock}x</span>
        </div>
      `).join('')
    : '<div class="dash-empty">Tidak ada stok rendah 🎉</div>';
  
  // Recent chats
  const chats = (adminData.chats || []).slice(-3).reverse();
  const sessions = new Map();
  chats.forEach(c => {
    if (!sessions.has(c.sessionId)) sessions.set(c.sessionId, []);
    sessions.get(c.sessionId).push(c);
  });
  
  document.getElementById('recentChats').innerHTML = sessions.size
    ? Array.from(sessions.values()).map(msgs => {
        const lastMsg = msgs[msgs.length - 1];
        const preview = lastMsg.message.substring(0, 40) + (lastMsg.message.length > 40 ? '...' : '');
        return `
          <div class="dash-item">
            <div>
              <div style="color:var(--text-primary);font-weight:600;margin-bottom:2px">Sesi ${lastMsg.sessionId.slice(-4)}</div>
              <div style="font-size:12px;color:var(--text-muted)">${preview}</div>
            </div>
            <span style="font-size:11px">${Fmt.timeAgo(lastMsg.timestamp)}</span>
          </div>
        `;
      }).join('')
    : '<div class="dash-empty">Belum ada pesan</div>';
  
  // Featured products
  const featured = products.filter(p => p.featured).slice(0, 5);
  document.getElementById('featuredList').innerHTML = featured.length
    ? featured.map(p => `
        <div class="dash-item">
          <span class="dash-item-name">⭐ ${p.type}</span>
          <span class="badge badge-gold">${Fmt.currency(p.price)}</span>
        </div>
      `).join('')
    : '<div class="dash-empty">Belum ada produk unggulan</div>';
  
  // Recent transactions
  const txs = adminData.transactions?.slice(-3).reverse() || [];
  document.getElementById('recentTx').innerHTML = txs.length
    ? txs.map(tx => `
        <div class="dash-item">
          <div>
            <div style="color:var(--text-primary);font-weight:600;margin-bottom:2px">${tx.product}</div>
            <div style="font-size:12px;color:var(--text-muted)">${tx.buyer}</div>
          </div>
          <span class="badge badge-success">${Fmt.currency(tx.price)}</span>
        </div>
      `).join('')
    : '<div class="dash-empty">Belum ada transaksi</div>';
  
  updateBadges();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat Pagi! 🌅';
  if (h < 15) return 'Selamat Siang! ☀️';
  if (h < 18) return 'Selamat Sore! 🌤️';
  return 'Selamat Malam! 🌙';
}

function updateBadges() {
  const products = adminData.products.filter(p => p.active);
  document.getElementById('navBadgeProducts').textContent = products.filter(p => p.stock === 0).length || '';
  document.getElementById('navBadgeProducts').classList.toggle('hidden', 
    products.filter(p => p.stock === 0).length === 0);
  
  const unread = adminData.chats?.filter(c => !c.read && c.sender === 'user').length || 0;
  document.getElementById('navBadgeChats').textContent = unread || '';
  document.getElementById('navBadgeChats').classList.toggle('hidden', unread === 0);
}

// ======= PRODUCTS TAB ======= 
function renderProductsTab() {
  const products = adminData.products;
  const tbody = document.getElementById('productsTableBody');
  
  const search = document.getElementById('adminSearchProduct')?.value.toLowerCase() || '';
  const series = document.getElementById('adminFilterSeries')?.value || '';
  const status = document.getElementById('adminFilterStatus')?.value || '';
  
  let filtered = products.filter(p => {
    if (search && !`${p.type} ${p.series} ${p.color}`.toLowerCase().includes(search)) return false;
    if (series && p.series !== series) return false;
    if (status === 'active' && !p.active) return false;
    if (status === 'inactive' && p.active) return false;
    return true;
  });
  
  // Populate series filter
  const seriesSelect = document.getElementById('adminFilterSeries');
  if (seriesSelect && !seriesSelect.dataset.loaded) {
    seriesSelect.dataset.loaded = 'true';
    const series = new Set(products.map(p => p.series).filter(Boolean));
    [...series].sort((a, b) => Number(a) - Number(b)).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = `iPhone ${s}`;
      seriesSelect.appendChild(opt);
    });
    
    seriesSelect.addEventListener('change', renderProductsTab);
    document.getElementById('adminSearchProduct')?.addEventListener('input', renderProductsTab);
    document.getElementById('adminFilterStatus')?.addEventListener('change', renderProductsTab);
  }
  
  tbody.innerHTML = filtered.map((p, i) => {
    const photo = p.photos?.[0]?.data || null;
    const stocked = p.stock > 0 ? '✓' : '✕';
    return `
      <tr>
        <td><div class="table-photo">${photo ? `<img src="${photo}">` : '📱'}</div></td>
        <td>
          <div style="font-weight:600">${p.type}</div>
          <div style="font-size:11px;color:var(--text-muted)">${p.internal} • ${p.color}</div>
        </td>
        <td><span class="badge ${Fmt.categoryBadge(p.category)}">${p.category}</span></td>
        <td style="font-weight:600">${Fmt.currency(p.price)}</td>
        <td style="font-weight:600;color:${p.stock > 0 ? 'var(--success)' : 'var(--danger)'}">${stocked} ${p.stock}</td>
        <td>
          <div style="width:30px;height:20px;background:var(--bg-secondary);border-radius:4px;overflow:hidden">
            <div style="width:${p.batteryHealth}%;height:100%;background:${Fmt.batteryColor(p.batteryHealth)}"></div>
          </div>
        </td>
        <td>
          <span class="badge ${p.active ? 'badge-success' : 'badge-muted'}">
            ${p.active ? 'Aktif' : 'Non-aktif'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="table-btn" onclick="editProduct('${p.id}')" title="Edit">✏️</button>
            <button class="table-btn table-btn-danger" onclick="confirmDeleteProduct('${p.id}')" title="Hapus">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddProduct() {
  document.getElementById('formProductId').value = '';
  document.getElementById('productFormTitle').textContent = 'Tambah Produk Baru';
  
  // Reset form
  document.getElementById('fSeries').value = '';
  document.getElementById('fType').value = '';
  document.getElementById('fInternal').value = '';
  document.getElementById('fColor').value = '';
  document.getElementById('fCategory').value = '';
  document.getElementById('fBattery').value = '100';
  document.getElementById('fPrice').value = '';
  document.getElementById('fPriceOld').value = '';
  document.getElementById('fStock').value = '0';
  document.getElementById('fSold').value = '0';
  document.getElementById('fDescription').value = '';
  document.getElementById('fActive').checked = true;
  document.getElementById('fFeatured').checked = false;
  document.getElementById('photoPreviewGrid').innerHTML = '';
  
  populateProductOptions();
  Modal.openModal('productFormModal');
}

function populateProductOptions() {
  const seriesSelect = document.getElementById('fSeries');
  const typeSelect = document.getElementById('fType');
  const internalSelect = document.getElementById('fInternal');
  const colorSelect = document.getElementById('fColor');
  const catSelect = document.getElementById('fCategory');
  
  if (!seriesSelect.dataset.filled) {
    seriesSelect.dataset.filled = '1';
    
    IPHONE_SERIES.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = `iPhone ${s}`;
      seriesSelect.appendChild(opt);
    });
    
    INTERNAL_OPTIONS.forEach(i => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      internalSelect.appendChild(opt);
    });
    
    COLOR_OPTIONS.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      colorSelect.appendChild(opt);
    });
    
    CATEGORIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      catSelect.appendChild(opt);
    });
  }
  
  // Update types when series changes
  seriesSelect.addEventListener('change', () => {
    const series = seriesSelect.value;
    typeSelect.innerHTML = '<option value="">-- Pilih --</option>';
    if (series && IPHONE_TYPES[series]) {
      IPHONE_TYPES[series].forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        typeSelect.appendChild(opt);
      });
    }
  });
}

function editProduct(pid) {
  const p = adminData.products.find(x => x.id === pid);
  if (!p) return;
  
  document.getElementById('formProductId').value = pid;
  document.getElementById('productFormTitle').textContent = 'Edit Produk';
  
  populateProductOptions();
  
  document.getElementById('fSeries').value = p.series;
  
  // Trigger change to populate types
  document.getElementById('fSeries').dispatchEvent(new Event('change'));
  setTimeout(() => {
    document.getElementById('fType').value = p.type;
  }, 100);
  
  document.getElementById('fInternal').value = p.internal;
  document.getElementById('fColor').value = p.color;
  document.getElementById('fCategory').value = p.category;
  document.getElementById('fBattery').value = p.batteryHealth;
  document.getElementById('fPrice').value = p.price;
  document.getElementById('fPriceOld').value = p.priceOld || '';
  document.getElementById('fStock').value = p.stock;
  document.getElementById('fSold').value = p.sold || 0;
  document.getElementById('fDescription').value = p.description;
  document.getElementById('fActive').checked = p.active;
  document.getElementById('fFeatured').checked = p.featured;
  
  // Show existing photos
  const grid = document.getElementById('photoPreviewGrid');
  grid.innerHTML = (p.photos || []).map((photo, i) => `
    <div class="photo-preview">
      <img src="${photo.data}">
      <button type="button" class="photo-remove-btn" onclick="removePhoto(${i})">✕</button>
    </div>
  `).join('');
  
  Modal.openModal('productFormModal');
}

function removePhoto(idx) {
  const pid = document.getElementById('formProductId').value;
  if (pid) {
    const p = adminData.products.find(x => x.id === pid);
    if (p && p.photos) {
      p.photos.splice(idx, 1);
      Store.save(adminData);
      editProduct(pid); // Refresh form
    }
  }
}

function setupPhotoUpload() {
  const area = document.getElementById('photoUploadArea');
  const input = document.getElementById('fPhotos');
  const placeholder = document.getElementById('photoPlaceholder');
  
  area.addEventListener('click', () => input.click());
  
  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.style.borderColor = 'var(--gold)';
  });
  
  area.addEventListener('dragleave', () => {
    area.style.borderColor = 'var(--border)';
  });
  
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.style.borderColor = 'var(--border)';
    handlePhotoSelect(e.dataTransfer.files);
  });
  
  input.addEventListener('change', (e) => {
    handlePhotoSelect(e.target.files);
  });
}

async function handlePhotoSelect(fileList) {
  const results = await Img.multiUpload(fileList);
  const grid = document.getElementById('photoPreviewGrid');
  
  results.forEach(photo => {
    const div = document.createElement('div');
    div.className = 'photo-preview';
    div.innerHTML = `
      <img src="${photo.data}">
      <button type="button" class="photo-remove-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    grid.appendChild(div);
  });
}

async function saveProduct() {
  const pid = document.getElementById('formProductId').value;
  
  const series = document.getElementById('fSeries').value;
  const type = document.getElementById('fType').value;
  const internal = document.getElementById('fInternal').value;
  const color = document.getElementById('fColor').value;
  const category = document.getElementById('fCategory').value;
  const battery = parseInt(document.getElementById('fBattery').value) || 100;
  const price = parseInt(document.getElementById('fPrice').value) || 0;
  const priceOld = parseInt(document.getElementById('fPriceOld').value) || null;
  const stock = parseInt(document.getElementById('fStock').value) || 0;
  const sold = parseInt(document.getElementById('fSold').value) || 0;
  const desc = document.getElementById('fDescription').value;
  const active = document.getElementById('fActive').checked;
  const featured = document.getElementById('fFeatured').checked;
  
  // Validation
  if (!series || !type || !internal || !color || !category || price <= 0 || !desc) {
    Toast.warning('Lengkapi semua field yang wajib!');
    return;
  }
  
  // Collect photos
  const photos = [];
  document.querySelectorAll('.photo-preview img').forEach(img => {
    photos.push({ data: img.src });
  });
  
  if (!photos.length && !pid) {
    Toast.warning('Minimum upload 1 foto produk!');
    return;
  }
  
  if (pid) {
    // Edit existing
    const idx = adminData.products.findIndex(p => p.id === pid);
    if (idx >= 0) {
      const p = adminData.products[idx];
      p.type = type;
      p.series = series;
      p.internal = internal;
      p.color = color;
      p.category = category;
      p.batteryHealth = battery;
      p.price = price;
      p.priceOld = priceOld;
      p.stock = stock;
      p.sold = sold;
      p.description = desc;
      p.active = active;
      p.featured = featured;
      if (photos.length) p.photos = photos;
      p.updatedAt = new Date().toISOString();
    }
  } else {
    // Add new
    adminData.products.push({
      id: genId('p'),
      type, series, internal, color, category,
      batteryHealth: battery,
      price, priceOld,
      stock, sold,
      description: desc,
      featured,
      active,
      photos,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  Store.save(adminData);
  Toast.success(pid ? '✓ Produk diperbarui!' : '✓ Produk ditambahkan!');
  Modal.closeAll();
  renderProductsTab();
  renderDashboard();
}

function confirmDeleteProduct(pid) {
  const p = adminData.products.find(x => x.id === pid);
  Modal.openModal('confirmModal');
  document.getElementById('confirmTitle').textContent = 'Hapus Produk?';
  document.getElementById('confirmMsg').textContent = `Yakin hapus "${p.type}"? Tindakan ini tidak bisa dibatalkan.`;
  document.getElementById('confirmOkBtn').onclick = () => {
    adminData.products = adminData.products.filter(x => x.id !== pid);
    Store.save(adminData);
    Toast.success('✓ Produk dihapus');
    Modal.closeAll();
    renderProductsTab();
    renderDashboard();
  };
}

// ======= CHAT TAB ======= 
function renderChatTab() {
  const chats = adminData.chats || [];
  const sessions = new Map();
  
  chats.forEach(c => {
    if (!sessions.has(c.sessionId)) sessions.set(c.sessionId, []);
    sessions.get(c.sessionId).push(c);
  });
  
  const list = document.getElementById('chatSessionsList');
  
  if (!sessions.size) {
    list.innerHTML = '<div class="dash-empty" style="padding:20px">Belum ada pesan</div>';
    return;
  }
  
  list.innerHTML = Array.from(sessions.values()).reverse().map((msgs, i) => {
    const sid = msgs[0].sessionId;
    const lastMsg = msgs[msgs.length - 1];
    const unread = msgs.filter(m => !m.read && m.sender === 'user').length;
    const preview = lastMsg.message.substring(0, 35);
    
    return `
      <div class="chat-session ${currentChatSession === sid ? 'active' : ''}" onclick="openChatSession('${sid}')">
        <div class="chat-session-name">Sesi ${sid.slice(-4)} ${unread ? `(${unread})` : ''}</div>
        <div class="chat-session-preview">${preview}</div>
      </div>
    `;
  }).join('');
}

function openChatSession(sid) {
  currentChatSession = sid;
  const chats = (adminData.chats || []).filter(c => c.sessionId === sid);
  
  document.querySelectorAll('.chat-session').forEach(s => {
    s.classList.toggle('active', s.textContent.includes(sid.slice(-4)));
  });
  
  // Mark as read
  chats.forEach(c => {
    if (c.sender === 'user') c.read = true;
  });
  Store.save(adminData);
  
  // Display conversation
  const body = document.getElementById('chatConvBody');
  body.innerHTML = chats.map(c => {
    if (c.sender === 'admin') {
      return `
        <div class="chat-msg admin">
          <div class="chat-msg-avatar">🍎</div>
          <div class="chat-msg-content">
            <div class="chat-msg-bubble">${c.message}</div>
            <div class="chat-msg-time">${Fmt.datetime(c.timestamp)}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="chat-msg user">
          <div class="chat-msg-content">
            <div class="chat-msg-bubble">${c.message}</div>
            <div class="chat-msg-time">${Fmt.datetime(c.timestamp)}</div>
          </div>
          <div class="chat-msg-avatar">👤</div>
        </div>
      `;
    }
  }).join('');
  
  body.scrollTop = body.scrollHeight;
  
  // Show input
  document.getElementById('chatConvInput').classList.remove('hidden');
  document.getElementById('chatConvHeader').innerHTML = `Sesi ${sid.slice(-4)} • ${chats.length} pesan`;
  
  // Setup send
  document.getElementById('adminChatSendBtn').onclick = sendAdminMessage;
  document.getElementById('adminChatInput').onkeydown = (e) => {
    if (e.key === 'Enter') sendAdminMessage();
  };
}

function sendAdminMessage() {
  const input = document.getElementById('adminChatInput');
  const msg = input.value.trim();
  
  if (!msg || !currentChatSession) return;
  
  adminData.chats.push({
    id: genId('msg'),
    sessionId: currentChatSession,
    sender: 'admin',
    message: msg,
    timestamp: new Date().toISOString(),
    read: true
  });
  
  Store.save(adminData);
  input.value = '';
  openChatSession(currentChatSession);
  Toast.success('✓ Pesan dikirim');
  updateBadges();
}

// ======= TRANSACTIONS TAB ======= 
function renderTransactionsTab() {
  const txs = adminData.transactions || [];
  const tbody = document.getElementById('txTableBody');
  const empty = document.getElementById('txEmpty');
  
  if (!txs.length) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  
  empty.classList.add('hidden');
  
  tbody.innerHTML = txs.reverse().map(tx => {
    const statusColors = {
      'Lunas': 'badge-success',
      'DP': 'badge-warning',
      'Pending': 'badge-info',
      'Batal': 'badge-danger'
    };
    return `
      <tr>
        <td><small>${tx.id.slice(-6)}</small></td>
        <td>${tx.product}</td>
        <td>
          <div>${tx.buyer}</div>
          <small style="color:var(--text-muted)">${tx.phone || '-'}</small>
        </td>
        <td style="font-weight:600">${Fmt.currency(tx.price)}</td>
        <td><span class="badge ${statusColors[tx.status] || 'badge-muted'}">${tx.status}</span></td>
        <td><small>${Fmt.date(tx.date)}</small></td>
        <td>
          <div class="table-actions">
            <button class="table-btn" onclick="editTx('${tx.id}')" title="Edit">✏️</button>
            <button class="table-btn table-btn-danger" onclick="deleteTx('${tx.id}')" title="Hapus">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddTx() {
  document.getElementById('txFormId').value = '';
  
  const select = document.getElementById('txProduct');
  select.innerHTML = '<option value="">-- Pilih Produk --</option>';
  adminData.products.filter(p => p.active).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.type;
    opt.textContent = `${p.type} (${p.internal})`;
    select.appendChild(opt);
  });
  
  document.getElementById('txBuyer').value = '';
  document.getElementById('txPhone').value = '';
  document.getElementById('txPrice').value = '';
  document.getElementById('txMethod').value = 'Transfer';
  document.getElementById('txStatus').value = 'Lunas';
  document.getElementById('txNotes').value = '';
  
  Modal.openModal('txFormModal');
}

function saveTx() {
  const pid = document.getElementById('txFormId').value;
  const product = document.getElementById('txProduct').value;
  const buyer = document.getElementById('txBuyer').value;
  const phone = document.getElementById('txPhone').value;
  const price = parseInt(document.getElementById('txPrice').value) || 0;
  const method = document.getElementById('txMethod').value;
  const status = document.getElementById('txStatus').value;
  const notes = document.getElementById('txNotes').value;
  
  if (!product || !buyer || price <= 0) {
    Toast.warning('Lengkapi field wajib!');
    return;
  }
  
  if (!adminData.transactions) adminData.transactions = [];
  
  if (pid) {
    const idx = adminData.transactions.findIndex(t => t.id === pid);
    if (idx >= 0) {
      const tx = adminData.transactions[idx];
      tx.product = product;
      tx.buyer = buyer;
      tx.phone = phone;
      tx.price = price;
      tx.method = method;
      tx.status = status;
      tx.notes = notes;
    }
  } else {
    adminData.transactions.push({
      id: genId('tx'),
      product, buyer, phone, price, method, status, notes,
      date: new Date().toISOString()
    });
  }
  
  Store.save(adminData);
  Toast.success(pid ? '✓ Transaksi diperbarui' : '✓ Transaksi dicatat');
  Modal.closeAll();
  renderTransactionsTab();
  renderDashboard();
}

function editTx(tid) {
  const tx = adminData.transactions?.find(t => t.id === tid);
  if (!tx) return;
  
  document.getElementById('txFormId').value = tid;
  document.getElementById('txProduct').value = tx.product;
  document.getElementById('txBuyer').value = tx.buyer;
  document.getElementById('txPhone').value = tx.phone || '';
  document.getElementById('txPrice').value = tx.price;
  document.getElementById('txMethod').value = tx.method || 'Transfer';
  document.getElementById('txStatus').value = tx.status || 'Lunas';
  document.getElementById('txNotes').value = tx.notes || '';
  
  Modal.openModal('txFormModal');
}

function deleteTx(tid) {
  adminData.transactions = adminData.transactions?.filter(t => t.id !== tid) || [];
  Store.save(adminData);
  Toast.success('✓ Transaksi dihapus');
  renderTransactionsTab();
}

// ======= ANALYTICS TAB ======= 
function renderAnalyticsTab() {
  const products = adminData.products.filter(p => p.active);
  const txs = adminData.transactions || [];
  
  // Summary stats
  const totalIncome = txs.reduce((a, t) => a + t.price, 0);
  const totalTx = txs.length;
  const avgOrder = totalTx ? (totalIncome / totalTx) : 0;
  const totalProfit = products.reduce((a, p) => a + (p.price * (p.sold || 0)), 0);
  
  document.getElementById('analyticsGrid').innerHTML = `
    <div class="analytics-card">
      <div class="analytics-card-title">💰 Total Transaksi</div>
      <div style="font-size:24px;font-weight:900;color:var(--gold)">${Fmt.currency(totalIncome)}</div>
    </div>
    <div class="analytics-card">
      <div class="analytics-card-title">📊 Jumlah Order</div>
      <div style="font-size:24px;font-weight:900;color:var(--success)">${totalTx}</div>
    </div>
    <div class="analytics-card">
      <div class="analytics-card-title">💵 Rata-rata Order</div>
      <div style="font-size:20px;font-weight:900;color:var(--info)">${Fmt.currency(avgOrder)}</div>
    </div>
    <div class="analytics-card">
      <div class="analytics-card-title">📈 Est. Profit</div>
      <div style="font-size:24px;font-weight:900;color:var(--warning)">${Fmt.currency(totalProfit)}</div>
    </div>
  `;
  
  // Category breakdown
  const categories = {};
  products.forEach(p => {
    if (!categories[p.category]) categories[p.category] = 0;
    categories[p.category] += p.sold || 0;
  });
  
  document.getElementById('categoryChart').innerHTML = Object.entries(categories).map(([cat, count]) => {
    const maxCount = Math.max(...Object.values(categories), 1);
    const pct = (count / maxCount) * 100;
    return `
      <div class="analytics-item">
        <span>${cat} (${count}x)</span>
        <div class="analytics-bar-wrap">
          <div class="analytics-bar" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
  
  // Top products
  const top = products.sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
  document.getElementById('topProducts').innerHTML = top.map(p => `
    <div class="analytics-item">
      <div>
        <div style="font-weight:600">${p.type}</div>
        <small style="color:var(--text-muted)">${p.internal} • ${p.color}</small>
      </div>
      <span style="font-weight:700;color:var(--gold)">${p.sold || 0}x</span>
    </div>
  `).join('');
  
  // Stock summary
  const inStock = products.filter(p => p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const avgBattery = products.length ? (products.reduce((a, p) => a + p.batteryHealth, 0) / products.length).toFixed(1) : 0;
  
  document.getElementById('stockSummary').innerHTML = `
    <div class="analytics-item">
      <span>Produk Tersedia</span>
      <span style="font-weight:700;color:var(--success)">${inStock}</span>
    </div>
    <div class="analytics-item">
      <span>Stok Habis</span>
      <span style="font-weight:700;color:var(--danger)">${outOfStock}</span>
    </div>
    <div class="analytics-item">
      <span>Rata-rata Battery Health</span>
      <span style="font-weight:700;color:var(--info)">${avgBattery}%</span>
    </div>
    <div class="analytics-item">
      <span>Total Stok (unit)</span>
      <span style="font-weight:700;color:var(--gold)">${products.reduce((a, p) => a + p.stock, 0)}</span>
    </div>
  `;
}

// ======= SETTINGS TAB ======= 
function renderSettingsTab() {
  const s = adminData.settings || {};
  
  // Store info
  document.getElementById('setStoreName').value = s.storeName || '';
  document.getElementById('setAddress').value = s.address || '';
  document.getElementById('setDescription').value = s.storeDescription || '';
  document.getElementById('setHeroTagline').value = s.heroTagline || '';
  document.getElementById('setHeroSubtext').value = s.heroSubtext || '';
  
  // Contact
  document.getElementById('setWhatsapp').value = s.whatsapp || '';
  document.getElementById('setWaLabel').value = s.whatsappLabel || '';
  document.getElementById('setInstagram').value = s.instagram || '';
  document.getElementById('setTiktok').value = s.tiktok || '';
  document.getElementById('setFacebook').value = s.facebook || '';
  
  // Banks
  renderBankSettings(s.bankAccounts || []);
}

function renderBankSettings(banks) {
  const list = document.getElementById('bankSettingsList');
  list.innerHTML = banks.map((b, i) => `
    <div class="bank-setting-item">
      <input type="text" class="input" placeholder="BCA, Mandiri..." value="${b.bank}">
      <input type="text" class="input" placeholder="Nomor rekening" value="${b.accountNumber}">
      <input type="text" class="input" placeholder="Atas nama" value="${b.accountName}">
      <button type="button" class="btn btn-danger btn-sm" onclick="removeBankField(${i})">✕</button>
    </div>
  `).join('');
  bankFieldCount = banks.length;
}

function addBankField() {
  const list = document.getElementById('bankSettingsList');
  const div = document.createElement('div');
  div.className = 'bank-setting-item';
  div.innerHTML = `
    <input type="text" class="input" placeholder="BCA, Mandiri...">
    <input type="text" class="input" placeholder="Nomor rekening">
    <input type="text" class="input" placeholder="Atas nama">
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">✕</button>
  `;
  list.appendChild(div);
}

function removeBankField(i) {
  document.querySelectorAll('.bank-setting-item')[i]?.remove();
}

function saveStoreSettings() {
  adminData.settings.storeName = document.getElementById('setStoreName').value;
  adminData.settings.address = document.getElementById('setAddress').value;
  adminData.settings.storeDescription = document.getElementById('setDescription').value;
  adminData.settings.heroTagline = document.getElementById('setHeroTagline').value;
  adminData.settings.heroSubtext = document.getElementById('setHeroSubtext').value;
  
  Store.save(adminData);
  Toast.success('✓ Info toko disimpan');
  renderSettingsTab();
}

function saveContactSettings() {
  adminData.settings.whatsapp = document.getElementById('setWhatsapp').value;
  adminData.settings.whatsappLabel = document.getElementById('setWaLabel').value;
  adminData.settings.instagram = document.getElementById('setInstagram').value;
  adminData.settings.tiktok = document.getElementById('setTiktok').value;
  adminData.settings.facebook = document.getElementById('setFacebook').value;
  
  Store.save(adminData);
  Toast.success('✓ Kontak disimpan');
}

function saveBankSettings() {
  const items = document.querySelectorAll('.bank-setting-item');
  const banks = [];
  
  items.forEach(item => {
    const inputs = item.querySelectorAll('input');
    const bank = inputs[0].value.trim();
    const num = inputs[1].value.trim();
    const name = inputs[2].value.trim();
    
    if (bank && num && name) {
      banks.push({
        id: genId('bank'),
        bank, accountNumber: num, accountName: name, logo: '🏦'
      });
    }
  });
  
  adminData.settings.bankAccounts = banks;
  Store.save(adminData);
  Toast.success('✓ Rekening bank disimpan');
}

function changePin() {
  const current = document.getElementById('setPinCurrent').value;
  const newPin = document.getElementById('setPinNew').value;
  const confirm = document.getElementById('setPinConfirm').value;
  
  const correctPin = adminData.settings?.adminPin || '1234';
  
  if (!current || !newPin || !confirm) {
    Toast.warning('Lengkapi semua field PIN');
    return;
  }
  
  if (current !== correctPin) {
    Toast.error('PIN saat ini salah');
    return;
  }
  
  if (newPin !== confirm) {
    Toast.error('PIN baru tidak cocok');
    return;
  }
  
  if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
    Toast.warning('PIN harus 4 digit angka');
    return;
  }
  
  adminData.settings.adminPin = newPin;
  Store.save(adminData);
  
  document.getElementById('setPinCurrent').value = '';
  document.getElementById('setPinNew').value = '';
  document.getElementById('setPinConfirm').value = '';
  
  Toast.success('✓ PIN berhasil diubah!');
}

function confirmReset() {
  Modal.openModal('confirmModal');
  document.getElementById('confirmTitle').textContent = '⚠️ Reset Semua Data?';
  document.getElementById('confirmMsg').textContent = 'Semua data toko, produk, pesan, dan transaksi akan dihapus. Ini tidak bisa dibatalkan!';
  document.getElementById('confirmOkBtn').textContent = 'Ya, Reset Semuanya';
  document.getElementById('confirmOkBtn').onclick = () => {
    adminData = Store.defaultData();
    Store.save(adminData);
    Toast.success('✓ Semua data berhasil direset!');
    Modal.closeAll();
    renderDashboard();
    renderSettingsTab();
  };
}

// ======= INIT ======= 
document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
  setupPhotoUpload();
});

// Window resize handler for responsive
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024 && document.getElementById('sidebar').classList.contains('open')) {
    document.getElementById('sidebar').classList.remove('open');
  }
});
