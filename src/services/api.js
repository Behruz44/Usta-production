const API_BASE = import.meta.env.VITE_API_URL || '/api';
const USE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true';

// Local demo data is allowed only in development when VITE_USE_MOCKS=true.
const localCategories = [
  { id: 1, name: 'Гипсокартон', count: 48, desc: 'Листовые материалы для стен и перегородок' },
  { id: 2, name: 'Сухие смеси', count: 62, desc: 'Штукатурки, шпатлевки и кладочные смеси' },
  { id: 3, name: 'Саморезы', count: 120, desc: 'Крепежные изделия различных размеров' },
  { id: 4, name: 'Профиль', count: 35, desc: 'Металлические профили для каркасов' },
  { id: 5, name: 'Генераторы', count: 18, desc: 'Бензиновые и дизельные генераторы' },
  { id: 6, name: 'Инструменты', count: 94, desc: 'Электроинструменты и ручной инструмент' },
  { id: 7, name: 'Краски', count: 45, desc: 'Краски и лакокрасочные материалы' },
  { id: 8, name: 'Утеплители', count: 28, desc: 'Изоляционные материалы' },
];

const localProducts = [
  {
    id: 1,
    name: 'Гипсокартон настенный KNAUF',
    nameRu: 'Гипсокартон настенный KNAUF',
    category: 'Гипсокартон',
    categoryId: 1,
    desc: 'Стандартный настенный гипсокартон для жилых помещений. Размер 1200×2500 мм, толщина 12.5 мм.',
    price: 18000,
    stock: 25,
    unit: 'шт',
    badge: 'hot',
    images: [],
    specs: { 'Размер': '1200×2500 мм', 'Толщина': '12.5 мм', 'Тип': 'Стандартный' }
  },
  {
    id: 2,
    name: 'Штукатурка гипсовая KNAUF Rotband',
    nameRu: 'Штукатурка гипсовая KNAUF Rotband',
    category: 'Сухие смеси',
    categoryId: 2,
    desc: 'Универсальная гипсовая штукатурка для внутренних работ. 25 кг.',
    price: 850,
    stock: 100,
    unit: 'мешок',
    badge: 'new',
    images: [],
    specs: { 'Вес': '25 кг', 'Тип': 'Гипсовая', 'Расход': '8-10 кг/м²' }
  },
  {
    id: 3,
    name: 'Саморезы по гипсокартону 3.5×25 мм',
    nameRu: 'Саморезы по гипсокартону 3.5×25 мм',
    category: 'Саморезы',
    categoryId: 3,
    desc: 'Черные саморезы с острым концом для гипсокартона. 1000 шт.',
    price: 450,
    stock: 200,
    unit: 'упак',
    badge: null,
    images: [],
    specs: { 'Размер': '3.5×25 мм', 'Количество': '1000 шт', 'Покрытие': 'Черное' }
  },
  {
    id: 4,
    name: 'Профиль потолочный 60×27 ПП',
    nameRu: 'Профиль потолочный 60×27 ПП',
    category: 'Профиль',
    categoryId: 4,
    desc: 'Оцинкованный потолочный профиль для подвесных потолков. 3 метра.',
    price: 380,
    stock: 80,
    unit: 'шт',
    badge: null,
    images: [],
    specs: { 'Размер': '60×27 мм', 'Длина': '3 м', 'Толщина': '0.4 мм' }
  },
  {
    id: 5,
    name: 'Генератор бензиновый 5 кВт',
    nameRu: 'Генератор бензиновый 5 кВт',
    category: 'Генераторы',
    categoryId: 5,
    desc: 'Бензиновый генератор для дачи и стройки. 5000 Вт.',
    price: 45000,
    stock: 7,
    unit: 'шт',
    badge: 'power',
    images: [],
    specs: { 'Мощность': '5 кВт', 'Топливо': 'Бензин', 'Объем бака': '15 л' }
  },
  {
    id: 6,
    name: 'Перфоратор SDS-Plus 800 Вт',
    nameRu: 'Перфоратор SDS-Plus 800 Вт',
    category: 'Инструменты',
    categoryId: 6,
    desc: 'Мощный перфоратор для сверления и долбления. 800 Вт.',
    price: 12500,
    stock: 12,
    unit: 'шт',
    badge: 'hot',
    images: [],
    specs: { 'Мощность': '800 Вт', 'Патрон': 'SDS-Plus', 'Режимы': '3' }
  },
];

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeSpecs = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

export const normalizeProduct = (product) => {
  if (!product) return product;
  const categoryName = typeof product.category === 'object'
    ? product.category?.name
    : product.category;

  return {
    ...product,
    id: Number(product.id),
    categoryId: product.categoryId != null ? Number(product.categoryId) : product.categoryId,
    category: categoryName || product.categoryName || '',
    name: product.nameRu || product.name || product.nameKg || '',
    desc: product.descRu || product.desc || product.descKg || '',
    price: Number(product.price || 0),
    oldPrice: product.oldPrice != null ? Number(product.oldPrice) : null,
    stock: product.stock == null ? null : Number(product.stock),
    views: Number(product.views || 0),
    images: parseJsonArray(product.images),
    specs: normalizeSpecs(product.specs)
  };
};

const normalizeProductsResponse = (payload) => {
  if (Array.isArray(payload)) return payload.map(normalizeProduct);
  return {
    ...payload,
    products: Array.isArray(payload?.products) ? payload.products.map(normalizeProduct) : []
  };
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `API request failed (${response.status})`);
  }

  return payload;
};

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  return query.toString();
};

export const api = {
  localCategories: USE_MOCKS ? localCategories : [],
  localProducts: USE_MOCKS ? localProducts.map(normalizeProduct) : [],
  useMocks: USE_MOCKS,

  getCategories: async () => {
    try {
      return await requestJson(`${API_BASE}/categories`);
    } catch (error) {
      if (USE_MOCKS) return localCategories;
      throw error;
    }
  },

  getProducts: async (params = {}) => {
    try {
      const queryString = buildQuery(params);
      const payload = await requestJson(`${API_BASE}/products${queryString ? `?${queryString}` : ''}`);
      return normalizeProductsResponse(payload);
    } catch (error) {
      if (!USE_MOCKS) throw error;

      let filtered = localProducts.map(normalizeProduct);
      const categoryId = params.category || params.categoryId;
      if (categoryId) filtered = filtered.filter((product) => Number(product.categoryId) === Number(categoryId));
      if (params.search) {
        const searchLower = String(params.search).toLowerCase();
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchLower) ||
          String(product.category).toLowerCase().includes(searchLower)
        );
      }
      return filtered;
    }
  },

  getProduct: async (id) => {
    try {
      const product = await requestJson(`${API_BASE}/products/${id}`);
      return normalizeProduct(product);
    } catch (error) {
      if (!USE_MOCKS) throw error;
      const product = localProducts.find((item) => Number(item.id) === Number(id));
      if (product) return normalizeProduct(product);
      throw new Error('Product not found');
    }
  },

  createProduct: async (productData, imageFile) => {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      formData.append(key, key === 'specs' ? JSON.stringify(productData[key]) : productData[key]);
    });
    if (imageFile) formData.append('images', imageFile);

    return requestJson(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      body: formData
    });
  },

  updateProduct: async (id, productData, imageFile) => {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      formData.append(key, key === 'specs' ? JSON.stringify(productData[key]) : productData[key]);
    });
    if (imageFile) formData.append('images', imageFile);

    return requestJson(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      body: formData
    });
  },

  deleteProduct: async (id) => requestJson(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
  }),

  updateCategory: async (id, categoryData) => requestJson(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: JSON.stringify(categoryData)
  })
};
