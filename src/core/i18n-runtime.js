const DEFAULT_LOCALE = 'en';
const RTL_LOCALES = new Set(['ar']);

export const localeDictionaries = {
  en: {
    appTitle: 'International Camel Equivalents',
    appSubtitle: "Quick calculator powered by the repository's core conversion engine.",
    convert: 'Convert',
    allCategories: 'All categories',
    allSources: 'All sources',
    referenceOnly: 'Reference only',
    extensionOnly: 'Extensions only',
    filterPlaceholder: 'Filter proxies by name',
    referencePlaceholder: 'Search reference proxies',
    proxyNamePlaceholder: 'Proxy name',
    ratePlaceholder: 'Rate per camel',
    categoryPlaceholder: 'Category',
    descriptionPlaceholder: 'Description',
    overrideRatePlaceholder: 'Override rate per camel (optional)',
    buildShareText: 'Build share text',
    copyShareText: 'Copy share text',
    openMailDraft: 'Open mail draft',
    openSmsDraft: 'Open SMS draft',
    openTwitterDraft: 'Open Twitter draft',
    openWhatsappDraft: 'Open WhatsApp draft',
    archiveBid: 'Archive this bid',
    formalizeMessage: 'Formalize message',
    proxyPandemonium: 'Unleash the Proxy Pandemonium!',
    showingProxies: ({ showing, total }) => `Showing ${showing} of ${total} proxies.`,
    noResultMessage: 'Run a valid conversion first to generate a message.',
    reducedMotionOn: 'Reduced motion: On',
    reducedMotionOff: 'Reduced motion: Off',
    highContrastOn: 'High contrast: On',
    highContrastOff: 'High contrast: Off',
    proxyFallbackA: 'Proxy A',
    proxyFallbackB: 'Proxy B',
    resultSummary: ({ amount, unit, camelValue }) => `${amount} ${unit} equals ${camelValue} camels.`,
    resultMeta: ({ baseCamelValue, visible, total }) => `Base ICE: ${baseCamelValue} camels. Showing ${visible} of ${total} matching equivalents.`,
    proxyColumn: 'Proxy',
    equivalentQuantityColumn: 'Equivalent Quantity',
  },
  ar: {
    appTitle: 'المعادلات الدولية للإبل',
    appSubtitle: 'آلة حاسبة سريعة مدعومة بمحرك التحويل الأساسي في المستودع.',
    convert: 'حوّل',
    allCategories: 'كل الفئات',
    allSources: 'كل المصادر',
    referenceOnly: 'المرجع فقط',
    extensionOnly: 'الإضافات فقط',
    filterPlaceholder: 'رشّح الوكلاء بالاسم',
    referencePlaceholder: 'ابحث في وكلاء المرجع',
    proxyNamePlaceholder: 'اسم الوكيل',
    ratePlaceholder: 'المعدل لكل جمل',
    categoryPlaceholder: 'الفئة',
    descriptionPlaceholder: 'الوصف',
    overrideRatePlaceholder: 'تجاوز المعدل لكل جمل (اختياري)',
    buildShareText: 'أنشئ نص المشاركة',
    copyShareText: 'انسخ نص المشاركة',
    openMailDraft: 'افتح مسودة البريد',
    openSmsDraft: 'افتح مسودة SMS',
    openTwitterDraft: 'افتح مسودة تويتر',
    openWhatsappDraft: 'افتح مسودة واتساب',
    archiveBid: 'أرشف هذا العرض',
    formalizeMessage: 'صياغة الرسالة',
    proxyPandemonium: 'أطلق فوضى الوكلاء!',
    showingProxies: ({ showing, total }) => `عرض ${showing} من ${total} من الوكلاء.`,
    noResultMessage: 'نفّذ تحويلاً صالحًا أولاً لتوليد رسالة.',
    reducedMotionOn: 'تقليل الحركة: تشغيل',
    reducedMotionOff: 'تقليل الحركة: إيقاف',
    highContrastOn: 'تباين عالٍ: تشغيل',
    highContrastOff: 'تباين عالٍ: إيقاف',
    proxyFallbackA: 'الوكيل أ',
    proxyFallbackB: 'الوكيل ب',
    resultSummary: ({ amount, unit, camelValue }) => `${camelValue} من الإبل تساوي ${amount} ${unit}.`,
    resultMeta: ({ baseCamelValue, visible, total }) => `ICE الأساسي: ${baseCamelValue} من الإبل. عرض ${visible} من ${total} من النتائج المطابقة.`,
    proxyColumn: 'الوكيل',
    equivalentQuantityColumn: 'الكمية المكافئة',
  },
  es: {},
  fr: {},
  sw: {},
};

export function createI18n(initialLocale = DEFAULT_LOCALE) {
  let locale = resolveLocale(initialLocale);

  function t(key, params) {
    const dict = localeDictionaries[locale] ?? {};
    const fallbackDict = localeDictionaries[DEFAULT_LOCALE];
    const value = dict[key] ?? fallbackDict[key] ?? key;
    return typeof value === 'function' ? value(params ?? {}) : value;
  }

  function setLocale(nextLocale) {
    locale = resolveLocale(nextLocale);
    return locale;
  }

  return {
    t,
    get locale() {
      return locale;
    },
    setLocale,
    isRtl() {
      return RTL_LOCALES.has(locale);
    },
  };
}

function resolveLocale(locale) {
  if (typeof locale !== 'string') return DEFAULT_LOCALE;
  return localeDictionaries[locale] ? locale : DEFAULT_LOCALE;
}

export function getLocaleDirection(locale) {
  return RTL_LOCALES.has(resolveLocale(locale)) ? 'rtl' : 'ltr';
}
