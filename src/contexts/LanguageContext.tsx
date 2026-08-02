import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export type Language = 'en' | 'fa';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.title': 'Divine Style',
    'nav.account': 'Account',
    'nav.menu': 'Menu',
    'nav.menu.shop': 'Shop',
    'nav.menu.collections': 'Collections',
    'nav.menu.blog': 'Journal',
    'nav.menu.about': 'About Us',
    'nav.menu.contact': 'Contact',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.prev': 'Previous',
    'common.next': 'Next',
    'cat.viewAll': 'View all categories',
    'cart.emptyCta': 'Start shopping',
    'loading': 'Loading...',
    'empty': 'No products found',
    'product.not_found': 'Product not found',
    'product.select_color': 'Color',
    'checkout.paymentMethod': 'Payment gateway',
    'checkout.selectAddress': 'Select a shipping address to continue',
    'checkout.selectShipping': 'Select a shipping method to continue',
    'hero.headline.1': 'Your best',
    'hero.headline.2': 'vintage',
    'hero.headline.3': 'dresses',
    'hero.cta': 'Shop Collection',
    'collection.title': 'Curated Collection',
    'home.intro': 'Intro',
    'cart.title': 'Your Bag',
    'cart.empty': 'Your bag is empty.',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.remove': 'Remove',
    'cart.qty': 'Qty',
    'checkout.title': 'Checkout',
    'checkout.cart': 'Cart items',
    'checkout.address': 'Shipping address',
    'checkout.manageAddresses': 'Manage addresses',
    'checkout.noAddress': 'No address found. Please add one in your profile.',
    'checkout.summary': 'Order summary',
    'checkout.subtotal': 'Subtotal',
    'checkout.shipping': 'Shipping',
    'checkout.discount': 'Discount',
    'checkout.payable': 'Payable',
    'checkout.discountCode': 'Discount code',
    'checkout.apply': 'Apply',
    'checkout.pay': 'Pay',
    'payment.success.title': 'Payment successful',
    'payment.success.subtitle': 'Your order has been registered successfully.',
    'payment.failed.title': 'Payment failed',
    'payment.failed.subtitle': 'Payment was not completed. You can try again.',
    'payment.orderCode': 'Order code',
    'payment.goToOrders': 'View orders',
    'payment.goHome': 'Back to home',
    'payment.tryAgain': 'Try again',
    'payment.pending.title': 'Checking payment status…',
    'payment.pending.subtitle': 'This may take a few seconds.',
    'payment.pending.timeout.title': 'Still confirming your payment',
    'payment.pending.timeout.subtitle': 'This is taking longer than usual. You can check again, or view it later in your orders.',
    'payment.checkAgain': 'Check again',
    'payment.checkFailed': 'Could not fetch order status.',
    'product.category.Dresses': 'Dresses',
    'product.category.Gowns': 'Gowns',
    'product.category.Tops': 'Tops',
    // Shop Page
    'shop.hero.tag': '#featured',
    'shop.hero.title': 'we introducing our latest summer dress collection',
    'shop.hero.subtitle': 'Dress with confidence, dress with taste, dress with us, follow us...',
    'shop.mid.tag': '#new products',
    'shop.mid.title': 'From classics to modern trends,',
    'shop.mid.desc': 'we have everything you need to express your individuality.',
    'shop.mid.card.title': 'delicate fabrics and sophisticated silhouettes',
    'shop.bottom.title': 'the embodiment of modern style,',
    'shop.bottom.subtitle': 'combining comfort and elegance.',
    'shop.btn.buy': 'Buy Now',
    'product.out_of_stock': 'Out of stock',
    // Collection Stack
    'collection.light.tag': '#light dresses and shirts',
    'collection.light.desc': 'delicate fabrics and sophisticated silhouettes created for those who value style and comfort.',
    'collection.evening.tag': '#evening elegance',
    'collection.evening.desc': 'luxurious velvet and timeless lace designed for unforgettable nights.',
    'collection.casual.tag': '#everyday vintage',
    'collection.casual.desc': 'classic cuts reimaged for the modern wardrobe, perfect for daily wear.',
    // Categories
    'shop.cat.title': 'Shop by Category',
    'shop.cat.pants': 'Trousers & Pants',
    'shop.cat.lingerie': 'Lingerie',
    'shop.cat.sleepwear': 'Sleepwear',
    'shop.cat.tops': 'Tops',
    'shop.cat.shoes': 'Shoes',
    'shop.cat.accessories': 'Accessories',
    // Category Page (Rack)
    'cat.filter': 'Filter',
    'cat.sort': 'Sort',
    'cat.aisle': 'Aisle',
    'cat.sale': 'Clearance Bin',
    'cat.spotlight': 'Spotlight',
    'cat.rack': 'The Rack',
    'cat.filter.price': 'Price',
    'cat.sort.new': 'Newest',
    'cat.sort.price_asc': 'Price: Low to High',
    'cat.sort.price_desc': 'Price: High to Low',
    // Product Details
    'product.fabric': 'Fabric & Material',
    'product.composition': 'Composition',
    'product.select_size': 'Select Size',
    'product.size_guide': 'Measurement Details (cm)',
    'product.view_gallery': '3D Gallery',
    'product.watch_video': 'Watch Film',
    'product.close_view': 'Close View',
    'measure.bust': 'Bust',
    'measure.waist': 'Waist',
    'measure.hips': 'Hips',
    'measure.length': 'Length',
    'measure.sleeve': 'Sleeve',
    // Styling Page
    'style.cta': 'How to Style This',
    'style.title': 'Style Inspiration',
    'style.looks': 'Curated Looks',
    'style.video': 'In Motion',
    'style.back': 'Back to Product',
    'style.related': 'You May Also Like',
    'style.related_sub': 'Curated Selection',
    // Reviews
    'reviews.title': 'What People Say',
    'reviews.write': 'Write a Review',
    'reviews.placeholder': 'Share your thoughts about this product...',
    'reviews.submit': 'Submit Review',
    'reviews.role.verified': 'Verified Buyer',
    'reviews.stars': 'Rating',
    'reviews.cancel': 'Cancel',
    // Auth
    'auth.login.title': 'Login to your account',
    'auth.login.phone': 'Phone Number',
    'auth.login.placeholder': '+1 (555) 000-0000',
    'auth.login.btn': 'Send Code',
    'auth.login.footer': 'Dont have an account?',
    'auth.login.signup': 'Sign up now',
    'auth.otp.title': 'Verify your number',
    'auth.otp.desc': 'Please enter the 5-digit code sent to',
    'auth.otp.btn': 'Verify & Sign In',
    'auth.otp.resend': 'Resend Code',
    'auth.otp.back': 'Change Number',
    'auth.otp.digit': 'Digit',
    'profile.title': 'My Profile',
    'profile.logout': 'Logout',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.name': 'First name',
    'profile.lastName': 'Last name',
    'profile.mobile': 'Mobile',
    'profile.job': 'Job',
    'profile.nationalCode': 'National code',
    'profile.address.title': 'Address',
    'profile.address.province': 'Province',
    'profile.address.city': 'City',
    'profile.address.line': 'Address',
    'profile.address.plaque': 'Plaque',
    'profile.address.unit': 'Unit',
    'profile.address.postalCode': 'Postal code',
    'profile.address.add': 'Add address',
    'profile.address.save': 'Save address',
    'profile.address.cancel': 'Cancel',
    'profile.address.remove': 'Remove',
    'profile.address.default': 'Default',
    'profile.address.addNew': 'Add new address',
    'profile.address.edit': 'Edit address',
    'profile.address.confirmDelete': 'Delete this address? This cannot be undone.',
    'profile.saved': 'Profile updated successfully.',
    'dashboard.menu.profile': 'Profile',
    'dashboard.menu.addresses': 'Addresses',
    'dashboard.menu.orders': 'Orders',
    'dashboard.menu.adminOrders': 'All orders',
    'dashboard.menu.favorites': 'Favorites',
    'dashboard.menu.cart': 'Shopping List',
    'dashboard.orders.title': 'My Orders',
    'dashboard.orders.empty': 'You have no orders yet.',
    'dashboard.admin.exit': 'Exit admin panel',
    'dashboard.orders.orderCode': 'Order code',
    'dashboard.orders.date': 'Date',
    'dashboard.orders.status': 'Status',
    'dashboard.orders.total': 'Total',
    'dashboard.orders.payable': 'Payable',
    'dashboard.orders.items': 'Items',
    'order.status.PAID': 'Paid',
    'order.status.PENDING': 'Pending',
    'order.status.FAILED': 'Failed',
    'order.orderStatus.PENDING_PAYMENT': 'Pending payment',
    'order.orderStatus.PAID': 'Paid',
    'order.orderStatus.CONFIRMED': 'Confirmed',
    'order.orderStatus.SHIPPED': 'Shipped',
    'order.orderStatus.DELIVERED': 'Delivered',
    'order.orderStatus.CANCELED': 'Canceled',
    'dashboard.favorites.title': 'Favorites',
    'dashboard.favorites.empty': 'Your favorites list is empty.',
    'dashboard.cart.title': 'Shopping List',
    'dashboard.cart.empty': 'Your bag is empty.',
    'dashboard.shopping_list.empty': 'Your shopping list is empty.',
    'product.shopping_list.add': 'Add to Shopping List',
    'product.shopping_list.remove': 'Remove from List',
    'product.shopping_list.login_to_add': 'Login to save to list'
  },
  fa: {
    'nav.title': 'دیواین استایل',
    'nav.account': 'حساب کاربری',
    'nav.menu': 'منو',
    'nav.menu.shop': 'فروشگاه',
    'nav.menu.collections': 'مجموعه‌ها',
    'nav.menu.blog': 'مجله مد',
    'nav.menu.about': 'درباره ما',
    'nav.menu.contact': 'تماس با ما',
    'common.back': 'بازگشت',
    'common.close': 'بستن',
    'common.prev': 'قبلی',
    'common.next': 'بعدی',
    'cat.viewAll': 'مشاهده همه دسته‌بندی‌ها',
    'cart.emptyCta': 'برو به فروشگاه',
    'loading': 'در حال بارگذاری...',
    'empty': 'محصولی یافت نشد',
    'product.not_found': 'محصول یافت نشد',
    'product.select_color': 'رنگ',
    'checkout.paymentMethod': 'درگاه پرداخت',
    'checkout.selectAddress': 'برای ادامه، آدرس ارسال را انتخاب کنید',
    'checkout.selectShipping': 'برای ادامه، روش ارسال را انتخاب کنید',
    'hero.headline.1': 'برای زنی که آرومه،',
    'hero.headline.2': ' اما دیده',
    'hero.headline.3': ' می‌شه',
    'hero.cta': 'مشاهده مجموعه',
    'collection.title': 'مجموعه منتخب',
    'home.intro': 'اینترو',
    'cart.title': 'سبد خرید',
    'cart.empty': 'سبد خرید شما خالی است.',
    'cart.total': 'جمع کل',
    'cart.checkout': 'مشاهده و نهایی کردن سبد خرید',
    'cart.remove': 'حذف',
    'cart.qty': 'تعداد',
    'checkout.title': 'نهایی‌سازی سبد خرید',
    'checkout.cart': 'اقلام سبد خرید',
    'checkout.address': 'آدرس ارسال',
    'checkout.manageAddresses': 'مدیریت آدرس‌ها',
    'checkout.noAddress': 'آدرسی ثبت نشده. از پروفایل آدرس اضافه کنید.',
    'checkout.summary': 'خلاصه سفارش',
    'checkout.subtotal': 'جمع اقلام',
    'checkout.shipping': 'هزینه ارسال',
    'checkout.discount': 'تخفیف',
    'checkout.payable': 'مبلغ قابل پرداخت',
    'checkout.discountCode': 'کد تخفیف',
    'checkout.apply': 'اعمال',
    'checkout.pay': 'پرداخت',
    'payment.success.title': 'پرداخت موفق',
    'payment.success.subtitle': 'سفارش شما با موفقیت ثبت شد.',
    'payment.failed.title': 'پرداخت ناموفق',
    'payment.failed.subtitle': 'پرداخت تکمیل نشد. می‌توانید دوباره تلاش کنید.',
    'payment.orderCode': 'کد سفارش',
    'payment.goToOrders': 'مشاهده سفارشات',
    'payment.goHome': 'بازگشت به صفحه اصلی',
    'payment.tryAgain': 'تلاش مجدد',
    'payment.pending.title': 'در حال بررسی وضعیت پرداخت…',
    'payment.pending.subtitle': 'این کار چند ثانیه طول می‌کشد.',
    'payment.pending.timeout.title': 'هنوز در حال تایید پرداخت شما',
    'payment.pending.timeout.subtitle': 'این کار از حد معمول بیشتر طول کشیده. می‌تونید دوباره بررسی کنید یا بعداً از سفارش‌هاتون پیگیری کنید.',
    'payment.checkAgain': 'بررسی مجدد',
    'payment.checkFailed': 'دریافت وضعیت سفارش ممکن نشد.',
    'order.orderStatus.PENDING_PAYMENT': 'در انتظار پرداخت',
    'order.orderStatus.PAID': 'پرداخت شده',
    'order.orderStatus.CONFIRMED': 'تایید شده',
    'order.orderStatus.SHIPPED': 'ارسال شده',
    'order.orderStatus.DELIVERED': 'دریافت شده',
    'order.orderStatus.CANCELED': 'لغو شده',
    'product.category.Dresses': 'پیراهن‌ها',
    'product.category.Gowns': 'لباس شب',
    'product.category.Tops': 'بلوز و تاپ',
    // Shop Page
    'shop.hero.tag': '#ویژه',
    'shop.hero.title': 'معرفی جدیدترین مجموعه لباس‌های تابستانی',
    'shop.hero.subtitle': 'با اعتماد به نفس بپوشید، با سلیقه بپوشید، با ما بپوشید...',
    'shop.mid.tag': '#محصولات جدید',
    'shop.mid.title': 'از کلاسیک تا ترندهای مدرن،',
    'shop.mid.desc': 'ما هر آنچه برای ابراز فردیت خود نیاز دارید را داریم.',
    'shop.mid.card.title': 'پارچه‌های لطیف و سیلوئت‌های پیچیده',
    'shop.bottom.title': 'تجسم سبک مدرن،',
    'shop.bottom.subtitle': 'ترکیبی از راحتی و ظرافت.',
    'shop.btn.buy': 'خرید کنید',
    'product.out_of_stock': 'ناموجود',
    // Collection Stack
    'collection.light.tag': '#پیراهن‌های نخی و سبک',
    'collection.light.desc': 'پارچه‌های ظریف و سیلوئت‌های پیچیده، طراحی شده برای کسانی که به سبک و راحتی اهمیت می‌دهند.',
    'collection.evening.tag': '#شیک‌پوشی شبانه',
    'collection.evening.desc': 'مخمل لوکس و تورهای جاودانه، طراحی شده برای شب‌های فراموش‌نشدنی.',
    'collection.casual.tag': '#وینتیج روزمره',
    'collection.casual.desc': 'برش‌های کلاسیک بازطراحی شده برای کمد لباس مدرن، ایده‌آل برای استفاده روزانه.',
    // Categories
    'shop.cat.title': 'دسته‌بندی‌ها',
    'shop.cat.pants': 'شلوار و دامن',
    'shop.cat.lingerie': 'لباس زیر',
    'shop.cat.sleepwear': 'لباس خواب',
    'shop.cat.tops': 'بالاتنه',
    'shop.cat.shoes': 'کفش',
    'shop.cat.accessories': 'اکسسوری',
    // Category Page (Rack)
    'cat.filter': 'فیلتر',
    'cat.sort': 'مرتب‌سازی',
    'cat.aisle': 'راهرو',
    'cat.sale': 'حراجی',
    'cat.spotlight': 'ویترین',
    'cat.rack': 'رگال',
    'cat.filter.price': 'قیمت',
    'cat.sort.new': 'جدیدترین',
    'cat.sort.price_asc': 'قیمت: کم به زیاد',
    'cat.sort.price_desc': 'قیمت: زیاد به کم',
    // Product Details
    'product.fabric': 'جنس و پارچه',
    'product.composition': 'ترکیبات',
    'product.select_size': 'انتخاب سایز',
    'product.size_guide': 'جدول اندازه‌ها (سانتی‌متر)',
    'product.view_gallery': 'گالری سه‌بعدی',
    'product.watch_video': 'مشاهده فیلم',
    'product.close_view': 'بستن',
    'measure.bust': 'دور سینه',
    'measure.waist': 'دور کمر',
    'measure.hips': 'دور باسن',
    'measure.length': 'قد لباس',
    'measure.sleeve': 'قد آستین',
    // Styling Page
    'style.cta': 'چطور ست کنیم؟',
    'style.title': 'الهام‌بخش استایل',
    'style.looks': 'ست‌های پیشنهادی',
    'style.video': 'در حرکت',
    'style.back': 'بازگشت به محصول',
    'style.related': 'شاید بپسندید',
    'style.related_sub': 'مجموعه پیشنهادی',
    // Reviews
    'reviews.title': 'نظرات مشتریان',
    'reviews.write': 'نوشتن نظر',
    'reviews.placeholder': 'نظر خود را درباره این محصول بنویسید...',
    'reviews.submit': 'ثبت نظر',
    'reviews.role.verified': 'خریدار واقعی',
    'reviews.stars': 'امتیاز',
    'reviews.cancel': 'انصراف',
    // Auth
    'auth.login.title': 'ورود به حساب کاربری',
    'auth.login.phone': 'شماره موبایل',
    'auth.login.placeholder': '۰۹۱۲۰۰۰۰۰۰۰',
    'auth.login.btn': 'ارسال کد',
    'auth.login.footer': 'حساب کاربری ندارید؟',
    'auth.login.signup': 'ثبت نام کنید',
    'auth.otp.title': 'تایید شماره',
    'auth.otp.desc': 'لطفا کد ۵ رقمی ارسال شده به شماره زیر را وارد کنید',
    'auth.otp.btn': 'تایید و ورود',
    'auth.otp.resend': 'ارسال مجدد کد',
    'auth.otp.back': 'تغییر شماره',
    'auth.otp.digit': 'رقم',
    'profile.title': 'پروفایل من',
    'profile.logout': 'خروج',
    'profile.edit': 'ویرایش پروفایل',
    'profile.save': 'ذخیره',
    'profile.cancel': 'انصراف',
    'profile.name': 'نام',
    'profile.lastName': 'نام خانوادگی',
    'profile.mobile': 'شماره موبایل',
    'profile.job': 'شغل',
    'profile.nationalCode': 'کد ملی',
    'profile.address.title': 'آدرس‌ها',
    'profile.address.province': 'استان',
    'profile.address.city': 'شهر',
    'profile.address.line': 'آدرس',
    'profile.address.plaque': 'پلاک',
    'profile.address.unit': 'واحد',
    'profile.address.postalCode': 'کد پستی',
    'profile.address.add': 'افزودن آدرس',
    'profile.address.save': 'ذخیره آدرس',
    'profile.address.cancel': 'لغو',
    'profile.address.remove': 'حذف',
    'profile.address.default': 'پیش‌فرض',
    'profile.address.addNew': 'افزودن آدرس جدید',
    'profile.address.edit': 'ویرایش آدرس',
    'profile.address.confirmDelete': 'این آدرس حذف بشه؟ این کار قابل بازگشت نیست.',
    'profile.saved': 'پروفایل با موفقیت به‌روز شد.',
    'dashboard.menu.profile': 'پروفایل',
    'dashboard.menu.addresses': 'مدیریت آدرس‌ها',
    'dashboard.menu.orders': 'سفارشات',
    'dashboard.menu.adminOrders': 'سفارشات (ادمین)',
    'dashboard.menu.favorites': 'علاقمندی‌ها',
    'dashboard.menu.cart': 'لیست خرید',
    'dashboard.orders.title': 'سفارشات من',
    'dashboard.orders.empty': 'هنوز سفارشی ثبت نشده است.',
    'dashboard.admin.exit': 'خروج از پنل ادمین',
    'dashboard.orders.orderCode': 'کد سفارش',
    'dashboard.orders.date': 'تاریخ',
    'dashboard.orders.status': 'وضعیت',
    'dashboard.orders.total': 'جمع کل',
    'dashboard.orders.payable': 'مبلغ قابل پرداخت',
    'dashboard.orders.items': 'اقلام',
    'order.status.PAID': 'پرداخت‌شده',
    'order.status.PENDING': 'در انتظار پرداخت',
    'order.status.FAILED': 'ناموفق',
    'dashboard.favorites.title': 'علاقمندی‌ها',
    'dashboard.favorites.empty': 'لیست علاقمندی‌های شما خالی است.',
    'dashboard.cart.title': 'لیست خرید',
    'dashboard.cart.empty': 'سبد خرید شما خالی است.',
    'dashboard.shopping_list.empty': 'لیست خرید شما خالی است.',
    'product.shopping_list.add': 'افزودن به لیست خرید',
    'product.shopping_list.remove': 'حذف از لیست',
    'product.shopping_list.login_to_add': 'ورود برای ذخیره در لیست خرید'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fa');
  const [direction, setDirection] = useState<Direction>('rtl');
  
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Sync state with URL parameter
  useEffect(() => {
    // Check if the path starts with /en or /fa
    const pathSegments = location.pathname.split('/');
    const langSegment = pathSegments[1] as Language;

    if (langSegment === 'en' || langSegment === 'fa') {
      if (langSegment !== language) {
        setLanguage(langSegment);
      }
    }
  }, [location.pathname]);

  // Update direction and HTML attributes when language changes
  useEffect(() => {
    setDirection(language === 'fa' ? 'rtl' : 'ltr');
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    if (lang === language) return;
    
    // Replace current language in URL with new language
    const pathSegments = location.pathname.split('/');
    // If the URL already has a language prefix (it should based on our routing)
    if (pathSegments[1] === 'en' || pathSegments[1] === 'fa') {
        pathSegments[1] = lang;
        const newPath = pathSegments.join('/');
        navigate(newPath);
    } else {
        // Fallback or root case
        navigate(`/${lang}${location.pathname}`);
    }
    setLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
