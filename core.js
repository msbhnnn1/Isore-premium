/* ============================================
   iStore Premium - Core Utilities
   Storage, Toast, Modal, Helpers
   ============================================ */

'use strict';

// ======= STORAGE ENGINE =======
const Store = {
  KEY: 'istore_data',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return null;
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
      return true;
    } catch(e) {
      console.error('Storage failed:', e);
      return false;
    }
  },

  async init() {
    let data = this.load();
    if (!data) {
      // Coba fetch dari store.json (butuh web server)
      try {
        const resp = await fetch('./store.json');
        if (resp.ok) {
          data = await resp.json();
          console.log('✅ Data dimuat dari store.json');
        }
      } catch (e) {
        console.log('ℹ️ store.json tidak bisa di-fetch, pakai data default.');
      }
      // Fallback ke defaultData() jika fetch gagal
      if (!data) data = this.defaultData();
      this.save(data);
    }
    return data;
  },

  defaultData() {
    return {
      settings: {
        storeName: "iStore Premium",
        storeDescription: "Toko iPhone terpercaya dengan produk original, iBox, dan inter-beacukai berkualitas tinggi.",
        address: "Jl. Raya No. 123, Surabaya, Jawa Timur",
        whatsapp: "6281234567890",
        whatsappLabel: "Chat Admin",
        instagram: "istorepremuim",
        tiktok: "",
        facebook: "",
        bankAccounts: [
          { id: "ba1", bank: "BCA", accountNumber: "1234567890", accountName: "iStore Premium", logo: "🏦" },
          { id: "ba2", bank: "Mandiri", accountNumber: "0987654321", accountName: "iStore Premium", logo: "🏦" }
        ],
        adminPin: "1234",
        heroTagline: "iPhone Berkualitas, Harga Terbaik",
        heroSubtext: "Tersedia seri iPhone 11 hingga 17 Pro Max, garansi resmi & terpercaya.",
        logo: null
      },
      products: [
        {
          id: "p001",
          type: "iPhone 15 Pro Max",
          series: "15",
          internal: "256GB",
          color: "Natural Titanium",
          category: "iBox",
          batteryHealth: 100,
          price: 22500000,
          priceOld: 24000000,
          stock: 3,
          sold: 12,
          description: "iPhone 15 Pro Max dengan chip A17 Pro terbaru. Desain titanium premium, kamera 48MP dengan periskop tetraprism 5x optical zoom. Layar Super Retina XDR 6.7 inci dengan ProMotion 120Hz.",
          featured: true,
          active: true,
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "p002",
          type: "iPhone 15 Pro",
          series: "15",
          internal: "128GB",
          color: "Black Titanium",
          category: "iBox",
          batteryHealth: 100,
          price: 18500000,
          priceOld: null,
          stock: 5,
          sold: 8,
          description: "iPhone 15 Pro dengan chip A17 Pro. Rangka titanium grade 5, kamera utama 48MP zoom optis 3x. Layar Super Retina XDR 6.1 inci ProMotion 120Hz.",
          featured: true,
          active: true,
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "p003",
          type: "iPhone 14",
          series: "14",
          internal: "128GB",
          color: "Midnight",
          category: "Inter Beacukai",
          batteryHealth: 95,
          price: 11500000,
          priceOld: 13000000,
          stock: 2,
          sold: 20,
          description: "iPhone 14 kondisi mulus baterai health 95%. Sudah inter-beacukai resmi Indonesia. Chip A15 Bionic, kamera dual 12MP.",
          featured: false,
          active: true,
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "p004",
          type: "iPhone 13",
          series: "13",
          internal: "256GB",
          color: "Pink",
          category: "Refurbish",
          batteryHealth: 88,
          price: 8500000,
          priceOld: null,
          stock: 4,
          sold: 35,
          description: "iPhone 13 refurbish kondisi A+, body mulus. Chip A15 Bionic, dual kamera 12MP Ceramic Shield.",
          featured: false,
          active: true,
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "p005",
          type: "iPhone 11",
          series: "11",
          internal: "64GB",
          color: "White",
          category: "Refurbish",
          batteryHealth: 82,
          price: 4500000,
          priceOld: null,
          stock: 6,
          sold: 47,
          description: "iPhone 11 refurbish harga terjangkau. Chip A13 Bionic, dual kamera Wide + Ultra Wide.",
          featured: false,
          active: true,
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      chats: [],
      transactions: [],
      visitors: 0
    };
  },

  get(key) {
    const data = this.load();
    return key ? data?.[key] : data;
  },

  set(key, value) {
    const data = this.load() || this.defaultData();
    data[key] = value;
    return this.save(data);
  },

  update(key, updater) {
    const data = this.load() || this.defaultData();
    data[key] = updater(data[key]);
    return this.save(data);
  }
};

// ======= TOAST SYSTEM =======
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3500) {
    this.init();
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span style="font-size:16px;width:20px;text-align:center">${icons[type] || 'ℹ'}</span>
      <span style="flex:1">${message}</span>
    `;
    this.container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  success(msg, dur) { this.show(msg, 'success', dur); },
  error(msg, dur)   { this.show(msg, 'error', dur); },
  info(msg, dur)    { this.show(msg, 'info', dur); },
  warning(msg, dur) { this.show(msg, 'warning', dur); }
};

// ======= MODAL SYSTEM =======
const Modal = {
  openModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
};

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    Modal.closeAll();
  }
  if (e.target.closest('[data-modal-close]')) {
    Modal.closeAll();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') Modal.closeAll();
});

// ======= FORMAT HELPERS =======
const Fmt = {
  currency(n) {
    if (!n && n !== 0) return '-';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  },

  number(n) {
    return Number(n).toLocaleString('id-ID');
  },

  date(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },

  datetime(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d} hari lalu`;
    if (h > 0) return `${h} jam lalu`;
    if (m > 0) return `${m} menit lalu`;
    return 'Baru saja';
  },

  batteryColor(v) {
    if (v >= 90) return 'var(--success)';
    if (v >= 75) return 'var(--warning)';
    return 'var(--danger)';
  },

  categoryBadge(cat) {
    const map = {
      'iBox': 'badge-success',
      'Inter Beacukai': 'badge-info',
      'Refurbish': 'badge-warning'
    };
    return map[cat] || 'badge-muted';
  }
};

// ======= ID GENERATOR =======
function genId(prefix = 'id') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ======= IMAGE HELPERS =======
const Img = {
  toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async multiUpload(fileList, maxSize = 3 * 1024 * 1024) {
    const results = [];
    for (const file of fileList) {
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        Toast.warning(`${file.name}: Format tidak didukung (gunakan JPG/PNG)`);
        continue;
      }
      if (file.size > maxSize) {
        Toast.warning(`${file.name}: Ukuran terlalu besar (maks 3MB)`);
        continue;
      }
      const b64 = await this.toBase64(file);
      results.push({ name: file.name, data: b64, size: file.size });
    }
    return results;
  },

  render(photo, cls = '') {
    if (photo && photo.data) {
      return `<img src="${photo.data}" alt="Product" class="${cls}" style="object-fit:cover">`;
    }
    return `<div class="img-placeholder ${cls}">📱</div>`;
  }
};

// ======= WHATSAPP =======
function openWhatsApp(number, message = '') {
  const clean = number.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank');
}

// ======= SERIES OPTIONS =======
const IPHONE_SERIES = ['11', '12', '13', '14', '15', '16', '17'];
const IPHONE_TYPES = {
  '11': ['iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max'],
  '12': ['iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max'],
  '13': ['iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max'],
  '14': ['iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max'],
  '15': ['iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max'],
  '16': ['iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max'],
  '17': ['iPhone 17', 'iPhone 17 Plus', 'iPhone 17 Pro', 'iPhone 17 Pro Max']
};
const INTERNAL_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const COLOR_OPTIONS = [
  'Natural Titanium', 'Black Titanium', 'White Titanium', 'Blue Titanium',
  'Midnight', 'Starlight', 'Purple', 'Blue', 'Green', 'Yellow', 'Pink', 'Red',
  'Space Gray', 'Space Black', 'Silver', 'Gold', 'Deep Purple'
];
const CATEGORIES = ['iBox', 'Inter Beacukai', 'Refurbish'];

// Expose globals
window.Store = Store;
window.Toast = Toast;
window.Modal = Modal;
window.Fmt = Fmt;
window.genId = genId;
window.Img = Img;
window.openWhatsApp = openWhatsApp;
window.IPHONE_SERIES = IPHONE_SERIES;
window.IPHONE_TYPES = IPHONE_TYPES;
window.INTERNAL_OPTIONS = INTERNAL_OPTIONS;
window.COLOR_OPTIONS = COLOR_OPTIONS;
window.CATEGORIES = CATEGORIES;