import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, LogIn, Store, Shield, User, Sparkles, Mail, Lock, Phone, 
  ArrowLeft, ArrowRight, CheckCircle, CheckCircle2, ShieldCheck, MapPin, 
  CreditCard, Layers, ShoppingBag, Eye, Heart, HelpCircle, Zap
} from 'lucide-react';
import { User as UserType } from '../types';
import { logSystemActivity, isFirebaseSimulated, auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from '../lib/firebase';
import { fbSync, saveLocal } from '../lib/firebaseSync';
import PhoneCasesHeart from './PhoneCasesHeart';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  onOpenHeartDashboard?: () => void;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Firebase operation timed out (iframe security restrictions or disabled provider)'));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export default function AuthModal({ isOpen, onClose, onSuccess, onOpenHeartDashboard }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration Wizard Step
  // 'select_type' -> 'client_form' | 'step1' | 'step2' | 'step_template' | 'step3' | 'step4'
  const [registerStep, setRegisterStep] = useState<'select_type' | 'client_form' | 'step1' | 'step2' | 'step_template' | 'step3' | 'step4' | 'step5' | 'step6'>('select_type');
  const [storeVisualTemplate, setStoreVisualTemplate] = useState<'mobile' | 'clothing' | 'perfume' | 'shoes' | 'multicategory' | 'electronics' | 'phonecases' | 'supermarket' | 'hometools' | 'computers'>('multicategory');

  // Common Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Merchant-specific fields (Human / إنسان)
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('بيع هواتف وإكسسوارات');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [foodType, setFoodType] = useState('');
  const [storeCity, setStoreCity] = useState('القاهرة');
  const [storeDistrict, setStoreDistrict] = useState('');
  const [storeNeighborhood, setStoreNeighborhood] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [mapLocation, setMapLocation] = useState('');
  
  // Logo & Cover selection (Presets or manual link)
  const [storeLogo, setStoreLogo] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop');
  const [storeCover, setStoreCover] = useState('https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&h=400&fit=crop');
  
  // Subscription package choice
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'premium'>('basic');
  const [receiptImage, setReceiptImage] = useState('');

  // Auto-login merchant when admin approves (poll mix_users while on step6)
  useEffect(() => {
    if (registerStep !== 'step6' || !email) return;

    const checkApproval = () => {
      try {
        const users = JSON.parse(localStorage.getItem('mix_users') || '[]');
        const approvedUser = users.find((u: any) =>
          u.email && u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.status === 'approved' && u.storeId
        );
        if (approvedUser) {
          const userType = {
            id: approvedUser.id,
            name: approvedUser.name || name,
            email: approvedUser.email,
            password: 'default123',
            role: 'merchant' as const,
            storeId: approvedUser.storeId
          };
          localStorage.setItem('mix_user', JSON.stringify(userType));
          onSuccess(userType);
          onClose();
          setRegisterStep('select_type');
          setReceiptImage('');
        }
      } catch {}
    };

    checkApproval();
    const interval = setInterval(checkApproval, 2000);

    const handler = (e: any) => {
      if (e.detail?.key === 'mix_users') checkApproval();
    };
    window.addEventListener('local-storage-change', handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('local-storage-change', handler);
    };
  }, [registerStep, email, name, onSuccess, onClose]);

  // Authorization check
  const [isAuthorized, setIsAuthorized] = useState(false);

  // AI Store Builder States
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiIdeaPrompt, setAiIdeaPrompt] = useState('');
  const [generatedAIStoreData, setGeneratedAIStoreData] = useState<any | null>(null);

  // Submission Loader State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset designs for easy setup
  const PRESET_LOGOS = [
    { name: 'حديث وذهبي', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop' },
    { name: 'أزياء راقية', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=200&h=200&fit=crop' },
    { name: 'عطور شرقية', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=200&h=200&fit=crop' },
    { name: 'فن الذهب والفضة', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&h=200&fit=crop' }
  ];

  const PRESET_COVERS = [
    { name: 'أناقة داكنة ورخام', url: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&h=400&fit=crop' },
    { name: 'بوتيك أزياء فرنسي', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&h=400&fit=crop' },
    { name: 'بخور وعود عربي', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&h=400&fit=crop' },
    { name: 'معرض مجوهرات ملكي', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&h=400&fit=crop' }
  ];

  const handleQuickLogin = (type: 'merchant-tech' | 'merchant-otaibi' | 'user' | 'admin') => {
    let mockUser: UserType;
    if (type === 'admin') {
      mockUser = {
        id: 'admin-super',
        name: 'مدير المنصة العام (أبو فرج)',
        email: 'frhabud58@gmail.com',
        password: 'admin123',
        role: 'admin'
      };
      localStorage.setItem('mix_user', JSON.stringify(mockUser));
    } else if (type === 'merchant-tech') {
      mockUser = {
        id: 'merchant-tech-id',
        name: 'أحمد التميمي (تيك ستور)',
        email: 'tech@mix.com',
        password: 'merchant123',
        role: 'merchant',
        storeId: 'store-1'
      };
    } else if (type === 'merchant-otaibi') {
      mockUser = {
        id: 'merchant-otaibi-id',
        name: 'سليمان العتيبي',
        email: 'otaibi@mix.com',
        password: 'merchant123',
        role: 'merchant',
        storeId: 'store-5'
      };
    } else {
      mockUser = {
        id: 'user-101',
        name: 'عميل تجريبي',
        email: 'client@mix.com',
        password: 'user123',
        role: 'user'
      };
    }
    onSuccess(mockUser);
    onClose();
  };

  const handleQuickAdminLogin = async () => {
    setIsSubmitting(true);
    try {
      const adminUser: UserType = {
        id: 'admin-super',
        name: 'مدير المنصة العام (أبو فرج)',
        email: 'frhabud58@gmail.com',
        password: 'ABUDfrh123',
        role: 'admin'
      };

      // Sync user
      try {
        let storedUsers = JSON.parse(localStorage.getItem('mix_users') || '[]');
        if (!Array.isArray(storedUsers)) storedUsers = [];
        if (!storedUsers.some((u: any) => u.email === 'frhabud58@gmail.com')) {
          storedUsers.push({
            id: 'admin-super',
            name: 'مدير المنصة العام (أبو فرج)',
            email: 'frhabud58@gmail.com',
            role: 'admin',
            password: 'ABUDfrh123'
          });
          localStorage.setItem('mix_users', JSON.stringify(storedUsers));
        }
      } catch (e) {
        console.error(e);
      }

      await logSystemActivity('تسجيل دخول مدير النظام', 'دخول فوري بلمسة واحدة لمدير النظام (أبو فرج)');
      localStorage.setItem('mix_user', JSON.stringify(adminUser));
      onSuccess(adminUser);
      onClose();
    } catch (err: any) {
      alert('خطأ في تسجيل الدخول السريع: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOneClickInstantStore = async () => {
    setIsSubmitting(true);
    try {
      const storeNames = [
        'بوتيك العطور الملكي 🪵',
        'جوهرة الرياض للساعات 💎',
        'مكس تيك للأجهزة الذكية 📱',
        'قصر الفخامة للجلود 👞',
        'ركن النخبة للبخور والعود ✨'
      ];
      const categories = [
        'عطور وبخور فاخر',
        'ساعات ومجوهرات',
        'إلكترونيات وهواتف',
        'أحذية وجلود',
        'عطور وبخور فاخر'
      ];
      const randomIdx = Math.floor(Math.random() * storeNames.length);
      const chosenStoreName = storeNames[randomIdx];
      const chosenCategory = categories[randomIdx];

      const randomNum = Math.floor(100 + Math.random() * 900);
      const merchantEmail = `fast-merchant-${randomNum}@mix.com`;
      const merchantPassword = `123456`;
      const merchantName = `التاجر السريع ${randomNum}`;
      const newStoreId = `store-${Date.now()}`;
      const merchantUserId = `user-${Date.now()}`;

      const newMerchantUser: UserType = {
        id: merchantUserId,
        name: merchantName,
        email: merchantEmail,
        password: merchantPassword,
        role: 'merchant',
        storeId: newStoreId
      };

      // Add to simulated users list
      try {
        let users = JSON.parse(localStorage.getItem('mix_users') || '[]');
        if (!Array.isArray(users)) users = [];
        users.push({ ...newMerchantUser, password: merchantPassword });
        localStorage.setItem('mix_users', JSON.stringify(users));
      } catch (err) {
        console.error(err);
      }

      // Create Store
      const newStore = {
        id: newStoreId,
        name: chosenStoreName,
        logo: PRESET_LOGOS[randomIdx % PRESET_LOGOS.length].url,
        cover: PRESET_COVERS[randomIdx % PRESET_COVERS.length].url,
        category: chosenCategory,
        description: `أهلاً بكم في ${chosenStoreName}. متجرنا تم إنشاؤه فورياً بنظام المسار الفائق السرعة لتقديم أرقى المنتجات بأعلى معايير الجودة والضمان في المملكة العربية السعودية.`,
        city: 'الرياض',
        country: 'السعودية',
        rating: 5.0,
        reviewsCount: 0,
        productsCount: 3,
        themeColor: {
          primary: '#D4AF37',
          secondary: '#111111',
          background: '#050505'
        },
        layoutType: 'luxury' as const,
        banners: [
          {
            id: `b-1-${Date.now()}`,
            title: `عروض الافتتاح الكبرى في ${chosenStoreName}`,
            subtitle: 'خصومات حصرية تصل لغاية 30% مع شحن مجاني',
            image: PRESET_COVERS[randomIdx % PRESET_COVERS.length].url
          }
        ],
        categories: [chosenCategory, 'وصل حديثاً'],
        featured: true,
        status: 'active',
        ownerId: merchantUserId,
        commissionRate: 5,
        salesCount: 0
      };

      // Save Store
      try {
        const currentStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
        currentStores.push(newStore);
        localStorage.setItem('mix_stores', JSON.stringify(currentStores));

        // Create 3 premium products
        const sampleProducts = [
          { name: `عطر مسك مكس الملكي 🧪`, price: 299, image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&h=600&fit=crop', desc: 'عطر فاخر يمزج بين نفحات العود والمسك الأبيض والزهور الشرقية النادرة.' },
          { name: `ساعة الكلاسيك الذهبية ⏱️`, price: 1499, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&h=600&fit=crop', desc: 'ساعة يد فاخرة مطلية بالذهب عيار 21 مع حزام جلدي طبيعي متين.' },
          { name: `شاحن MIX اللاسلكي الفائق بقوة 100 واط ⚡`, price: 199, image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&h=600&fit=crop', desc: 'شاحن لاسلكي ذكي فائق السرعة يدعم الشحن الآمن لجميع الأجهزة الذكية.' }
        ];

        const currentProducts = JSON.parse(localStorage.getItem('mix_products') || '[]');
        const newProducts = sampleProducts.map((p, idx) => ({
          id: `prod-${Date.now()}-${idx}`,
          storeId: newStoreId,
          name: p.name,
          price: p.price,
          image: p.image,
          category: chosenCategory,
          description: p.desc,
          rating: 5,
          stock: 99,
          salesCount: 0,
          isOffer: false
        }));

        const updatedProducts = [...newProducts, ...currentProducts];
        localStorage.setItem('mix_products', JSON.stringify(updatedProducts));

        // Dispatch events so App state gets refreshed
        window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_stores', value: JSON.stringify(currentStores) } }));
        window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_products', value: JSON.stringify(updatedProducts) } }));
      } catch (err) {
        console.error(err);
      }

      await logSystemActivity('تأسيس متجر سريع', `تم تأسيس متجر جديد فوري باسم ${chosenStoreName} للتاجر ${merchantName}`);
      localStorage.setItem('mix_user', JSON.stringify(newMerchantUser));
      fbSync.saveUser(newMerchantUser).catch(() => {});
      
      alert(`🎉 تم إنشاء وتأسيس متجرك الفاخر "${chosenStoreName}" بنجاح فائق! بريدك للتحكم هو: ${merchantEmail} وكلمة المرور: ${merchantPassword}`);
      onSuccess(newMerchantUser);
      onClose();
    } catch (error: any) {
      alert(`فشل تدشين المتجر السريع: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOneClickInstantShopper = async () => {
    setIsSubmitting(true);
    try {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const emailVal = `fast-shopper-${randomNum}@mix.com`;
      const nameVal = `المتسوق السريع ${randomNum}`;
      
      const newUser: UserType = {
        id: `user-${Date.now()}`,
        name: nameVal,
        email: emailVal,
        password: '123456',
        role: 'user'
      };

      // Add to simulated users list
      try {
        let users = JSON.parse(localStorage.getItem('mix_users') || '[]');
        if (!Array.isArray(users)) users = [];
        users.push({ ...newUser, password: '123456' });
        localStorage.setItem('mix_users', JSON.stringify(users));
      } catch (err) {
        console.error(err);
      }

      await logSystemActivity('تسجيل عميل سريع', `تم تسجيل المتسوق ${nameVal} بنجاح عبر المسار السريع`);
      localStorage.setItem('mix_user', JSON.stringify(newUser));
      
      alert(`🛍️ تم إنشاء حساب المتسوق السريع بنجاح! الاسم: ${nameVal}`);
      onSuccess(newUser);
      onClose();
    } catch (error: any) {
      alert(`فشل إنشاء الحساب السريع: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      
      // Real Google OAuth popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const googleEmail = firebaseUser.email || '';
      const displayName = firebaseUser.displayName || googleEmail.split('@')[0];

      let roleType: 'user' | 'merchant' | 'admin' = 'user';
      let storeId: string | undefined = undefined;

      if (googleEmail.toLowerCase() === 'frhabud58@gmail.com') {
        roleType = 'admin';
      } else {
        try {
          const storedStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
          const matchingStore = storedStores.find((s: any) => s.ownerId === googleEmail || s.ownerId === `user-${googleEmail}`);
          if (matchingStore) {
            roleType = 'merchant';
            storeId = matchingStore.id;
          }
        } catch (err) {
          console.error(err);
        }
      }

      const loggedUser: UserType = {
        id: firebaseUser.uid || 'google-' + Date.now(),
        name: displayName,
        email: googleEmail,
        password: 'google-auth-' + Date.now(),
        role: roleType,
        storeId
      };

      try {
        const users = JSON.parse(localStorage.getItem('mix_users') || '[]');
        if (!users.some((u: any) => u.email && u.email.toLowerCase() === googleEmail.toLowerCase())) {
          users.push({ ...loggedUser, password: 'google-auth-' + Date.now() });
          localStorage.setItem('mix_users', JSON.stringify(users));
        }
      } catch (err) {
        console.error(err);
      }

      fbSync.saveUser(loggedUser).catch(() => {});
      await logSystemActivity('تسجيل دخول جوجل', `تم تسجيل دخول ${displayName} عبر Google OAuth`);
      localStorage.setItem('mix_user', JSON.stringify(loggedUser));
      onSuccess(loggedUser);
      onClose();
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      // Fallback: prompt-based login if Firebase auth fails
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/network-request-failed' || error.message?.includes('auth')) {
        const googleEmail = prompt('فشل OAuth — أدخل بريدك الإلكتروني يدوياً:\n(Gmail المرتبط بحسابك)');
        if (!googleEmail || !googleEmail.includes('@')) {
          alert('يرجى إدخال بريد إلكتروني صحيح.');
          return;
        }
        const displayName = googleEmail.split('@')[0];
        let roleType: 'user' | 'merchant' | 'admin' = 'user';
        let storeId: string | undefined = undefined;
        if (googleEmail.toLowerCase() === 'frhabud58@gmail.com') { roleType = 'admin'; }
        else {
          try {
            const storedStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
            const matchingStore = storedStores.find((s: any) => s.ownerId === googleEmail);
            if (matchingStore) { roleType = 'merchant'; storeId = matchingStore.id; }
          } catch {}
        }
        const loggedUser: UserType = { id: 'google-' + Date.now(), name: displayName, email: googleEmail, password: 'google-auth-' + Date.now(), role: roleType, storeId };
        try {
          const users = JSON.parse(localStorage.getItem('mix_users') || '[]');
          if (!users.some((u: any) => u.email?.toLowerCase() === googleEmail.toLowerCase())) {
            users.push({ ...loggedUser, password: 'google-auth-' + Date.now() });
            localStorage.setItem('mix_users', JSON.stringify(users));
          }
        } catch {}
        fbSync.saveUser(loggedUser).catch(() => {});
        await logSystemActivity('تسجيل دخول جوجل (يدوي)', `تم تسجيل دخول ${displayName} عبر Google يدوياً`);
        localStorage.setItem('mix_user', JSON.stringify(loggedUser));
        onSuccess(loggedUser);
        onClose();
      } else {
        alert(`فشل تسجيل الدخول باستخدام Google: ${error.message || 'خطأ غير معروف'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const attemptLocalLogin = (emailVal: string, passwordVal: string): UserType | null => {
    const trimmedEmail = emailVal.trim().toLowerCase();
    
    let storedUsers: any[] = [];
    try {
      storedUsers = JSON.parse(localStorage.getItem('mix_users') || '[]');
      if (!Array.isArray(storedUsers)) storedUsers = [];
    } catch (e) {
      storedUsers = [];
    }
    const matchedLocal = storedUsers.find((u: any) => u.email && u.email.toLowerCase() === trimmedEmail);
    
    if (matchedLocal && matchedLocal.status === 'pending') {
      alert('طلب إنشاء المتجر لا يزال قيد المراجعة. سيتم إعلامك عند الموافقة.');
      return null;
    }

    if (matchedLocal && matchedLocal.password === passwordVal) {
      let roleType = matchedLocal.role || 'user';
      let storeId = matchedLocal.storeId;
      let displayName = matchedLocal.name;

      try {
        const storedStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
        const matchingStore = storedStores.find((s: any) => 
          s.id === storeId ||
          s.ownerId === matchedLocal.id || 
          s.ownerId === trimmedEmail || 
          s.ownerId === `user-${trimmedEmail}`
        );
        if (matchingStore) {
          roleType = 'merchant';
          storeId = matchingStore.id;
          displayName = `شريك منصة MIX | ${matchingStore.name}`;
        }
      } catch (err) {
        console.error(err);
      }

      return {
        id: matchedLocal.id,
        name: displayName,
        email: matchedLocal.email,
        password: matchedLocal.password || 'default123',
        role: roleType,
        storeId: storeId
      };
    }
    return null;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    // Hidden Admin credential check with dynamic Firebase Auth registration & Firestore sync
    if (email.trim() === 'frhabud58@gmail.com' && password === 'ABUDfrh123') {
      const adminUser: UserType = {
        id: 'admin-super',
        name: 'مدير المنصة العام (أبو فرج)',
        email: 'frhabud58@gmail.com',
        password: 'ABUDfrh123',
        role: 'admin'
      };

      // Try to register/login securely in Firebase Auth if not simulated
      if (!isFirebaseSimulated) {
        try {
          await withTimeout(signInWithEmailAndPassword(auth, email.trim(), password), 1500);
        } catch (fbError: any) {
          if (fbError.code === 'auth/user-not-found' || fbError.code === 'auth/invalid-credential' || fbError.message.includes('timed out')) {
            try {
              // Auto register the admin account in Firebase Auth to guarantee it exists
              const credential = await withTimeout(createUserWithEmailAndPassword(auth, email.trim(), password), 1500);
              adminUser.id = credential.user.uid;
            } catch (createError) {
              console.warn('Could not auto-create admin in Firebase Auth, proceeding locally:', createError);
            }
          } else {
            console.warn('Firebase Auth admin sign-in warning:', fbError);
          }
        }
      }

      // Add admin user to mix_users list so it is saved to Firestore
      try {
        let storedUsers: any[] = [];
        try {
          storedUsers = JSON.parse(localStorage.getItem('mix_users') || '[]');
          if (!Array.isArray(storedUsers)) storedUsers = [];
        } catch (e) {
          storedUsers = [];
        }
        if (!storedUsers.some((u: any) => u.email && u.email.toLowerCase() === 'frhabud58@gmail.com')) {
          storedUsers.push({
            id: adminUser.id,
            name: 'مدير المنصة العام (أبو فرج)',
            email: 'frhabud58@gmail.com',
            role: 'admin',
            password: 'ABUDfrh123'
          });
          localStorage.setItem('mix_users', JSON.stringify(storedUsers));
        }
      } catch (err) {
        console.error('Failed to sync admin user to local storage list:', err);
      }

      await logSystemActivity('تسجيل دخول مدير النظام', `تم دخول المدير العام للمنصة`);
      
      // Store in localStorage for persistence
      localStorage.setItem('mix_user', JSON.stringify(adminUser));
      
      setIsSubmitting(false);
      onSuccess(adminUser);
      onClose();
      return;
    }

    try {
      let loggedUser: UserType | null = null;
      
      if (!isFirebaseSimulated) {
        try {
          // Firebase Sign In
          const userCredential = await withTimeout(signInWithEmailAndPassword(auth, email.trim(), password), 1500);
          const user = userCredential.user;

          // Regular client / merchant login fallback
          let roleType: 'user' | 'merchant' | 'admin' = 'user';
          let storeId: string | undefined = undefined;
          let displayName = user.displayName || email.split('@')[0];

          // Check if there is an existing store that matches this email as ownerId/email
          try {
            // First check if user exists in mix_users list
            let storedUsers: any[] = [];
            try {
              storedUsers = JSON.parse(localStorage.getItem('mix_users') || '[]');
              if (!Array.isArray(storedUsers)) storedUsers = [];
            } catch (e) {
              storedUsers = [];
            }
            const matchedUser = storedUsers.find((u: any) => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
            
            if (matchedUser) {
              roleType = matchedUser.role || 'user';
              storeId = matchedUser.storeId;
              displayName = matchedUser.name || displayName;
            }

            const storedStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
            // Match store by ownerId = user.uid or email or storeId
            const matchingStore = storedStores.find((s: any) => 
              s.id === storeId ||
              s.ownerId === user.uid || 
              s.ownerId === email.trim() || 
              s.ownerId === `user-${email.trim()}` ||
              s.ownerId === `user-${user.uid}`
            );

            if (matchingStore) {
              roleType = 'merchant';
              storeId = matchingStore.id;
              displayName = `شريك منصة MIX | ${matchingStore.name}`;
            } else if (roleType === 'merchant' && !storeId) {
              // Create a default store ID if they should be a merchant but don't have one
              storeId = 'store-1';
            }
          } catch (err) {
            console.error(err);
          }

          loggedUser = {
            id: user.uid,
            name: displayName,
            email: email.trim(),
            password: password,
            role: roleType,
            storeId
          };
        } catch (fbError) {
          console.warn('Firebase Sign-In failed, trying local database fallback:', fbError);
          loggedUser = attemptLocalLogin(email, password);
          if (!loggedUser) {
            const allUsers = JSON.parse(localStorage.getItem('mix_users') || '[]');
            const pendingUser = allUsers.find((u: any) => u.email && u.email.toLowerCase() === email.trim().toLowerCase() && u.status === 'pending');
            if (pendingUser) {
              alert('طلب إنشاء المتجر لا يزال قيد المراجعة. سيتم إعلامك عند الموافقة.');
              setIsSubmitting(false);
              return;
            }
            alert('البريد الإلكتروني أو كلمة المرور غير صحيحة. إذا لم يكن لديك حساب، يرجى إنشاء حساب جديد أولاً.');
            setIsSubmitting(false);
            return;
          }
        }
      } else {
        loggedUser = attemptLocalLogin(email, password);
        if (!loggedUser) {
          const allUsers = JSON.parse(localStorage.getItem('mix_users') || '[]');
          const pendingUser = allUsers.find((u: any) => u.email && u.email.toLowerCase() === email.trim().toLowerCase() && u.status === 'pending');
          if (pendingUser) {
            alert('طلب إنشاء المتجر لا يزال قيد المراجعة. سيتم إعلامك عند الموافقة.');
            setIsSubmitting(false);
            return;
          }
          alert('البريد الإلكتروني أو كلمة المرور غير صحيحة. إذا لم يكن لديك حساب، يرجى إنشاء حساب جديد أولاً.');
          setIsSubmitting(false);
          return;
        }
      }

      if (loggedUser) {
        localStorage.setItem('mix_user', JSON.stringify(loggedUser));
        fbSync.saveUser(loggedUser).catch(() => {});
        await logSystemActivity('تسجيل دخول', `تم دخول المستخدم ${loggedUser.name}`);
        onSuccess(loggedUser);
        onClose();
      }
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      alert(`خطأ في البريد أو كلمة المرور: الرجاء التأكد من صحة البيانات والمحاولة مجدداً. لمدير النظام: البريد frhabud58@gmail.com وكلمة المرور ABUDfrh123`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      alert('يرجى ملء كافة الحقول الإجبارية');
      return;
    }

    setIsSubmitting(true);
    try {
      let newUser: UserType;
      
      if (!isFirebaseSimulated) {
        try {
          // Firebase registration
          const userCredential = await withTimeout(createUserWithEmailAndPassword(auth, email.trim(), password), 1500);
          const user = userCredential.user;

          newUser = {
            id: user.uid,
            name: name,
            email: email.trim(),
            password: password,
            role: 'user'
          };
        } catch (fbError) {
          console.warn('Firebase registration failed or skipped, creating local account:', fbError);
          newUser = {
            id: `local-user-${Date.now()}`,
            name: name,
            email: email.trim(),
            password: password,
            role: 'user'
          };
        }
      } else {
        newUser = {
          id: `local-user-${Date.now()}`,
          name: name,
          email: email.trim(),
          password: password,
          role: 'user'
        };
      }

      // Save user to simulated user list
      try {
        let users = JSON.parse(localStorage.getItem('mix_users') || '[]');
        if (!Array.isArray(users)) users = [];
        if (!users.some((u: any) => u.email && u.email.toLowerCase() === email.trim().toLowerCase())) {
          users.push({ ...newUser, password });
          localStorage.setItem('mix_users', JSON.stringify(users));
        }
      } catch (err) {
        console.error(err);
      }

      localStorage.setItem('mix_user', JSON.stringify(newUser));
      fbSync.saveUser(newUser).catch(() => {});
      await logSystemActivity('تسجيل مستخدم جديد', `تم تسجيل مستخدم جديد باسم ${name} بالبريد الإلكتروني ${email}`);
      onSuccess(newUser);
      onClose();
    } catch (error: any) {
      console.error('Email Registration Error:', error);
      alert(`فشل تسجيل حساب جديد: ${error.message || 'يرجى المحاولة لاحقاً'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerateStore = async () => {
    if (!storeName) {
      alert('يرجى كتابة اسم المتجر أولاً لتصميم هوية بصرية مخصصة له.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/gemini/generate-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName,
          category: storeCategory,
          idea: aiIdeaPrompt,
          logo: storeLogo
        })
      });
      if (!response.ok) {
        throw new Error('فشل استدعاء خادم التصميم الذكي');
      }
      const data = await response.json();
      setGeneratedAIStoreData(data);
      
      // Auto populate fields
      if (data.banners?.[0]?.image) {
        setStoreCover(data.banners[0].image);
      }
      
      alert('✨ تم توليد الهوية البصرية، الألوان، الأقسام، وبنرات الدعاية بنجاح! سيتم تلقائياً إنشاء منتجات بداية مخصصة تظهر مباشرة في لوحة التحكم والمتجر عند تأكيد التسجيل.');
    } catch (err: any) {
      console.error(err);
      alert('تم تشغيل المولد الافتراضي الفاخر لتصميم المتجر وتوليد الهوية والمنتجات بنجاح ✨');
      // deterministic fallback
      const fallback = {
        themeColor: { primary: '#3b82f6', secondary: '#111111', background: '#050505' },
        layoutType: 'grid',
        description: `متجر ${storeName} المتكامل لصيانة وبيع الإلكترونيات والهواتف الذكية بأعلى مواصفات وأفضل الأسعار لـ MIX.`,
        categories: ['جوالات جديدة', 'صيانة شاشات', 'شواحن وإكسسوارات'],
        banners: [
          { title: 'أفضل العروض وأسرع صيانة فورية', subtitle: 'قطع غيار أصلية وضمان معتمد يصل لـ 6 أشهر', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=1200&h=400&fit=crop' }
        ],
        products: [
          { name: 'آيفون 15 برو ماكس تيتانيوم ديب', price: 4799, category: 'جوالات جديدة', description: 'أقوى جوال ذكي للعام مع حماية تيتانيوم كاملة.', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&h=600&fit=crop' },
          { name: 'شاحن أنكر نانو ذكي بقوة 65 واط شحن فوري', price: 149, category: 'شواحن وإكسسوارات', description: 'شاحن صغير للغاية يدعم التقنية الذكية لحماية البطارية وشحن أسرع بـ 3 مرات.', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&h=600&fit=crop' }
        ]
      };
      setGeneratedAIStoreData(fallback);
      if (fallback.banners?.[0]?.image) {
        setStoreCover(fallback.banners[0].image);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleMerchantRegisterSubmit = async () => {
    if (!isAuthorized) {
      alert('يرجى تأكيد تفويض منصة MIX بإنشاء وتدشين المتجر قبل المتابعة.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create firebase auth credentials for the merchant as well for secure logging!
      let merchantUserId = `user-${email || Date.now()}`;
      if (!isFirebaseSimulated) {
        try {
          const userCredential = await withTimeout(createUserWithEmailAndPassword(auth, email.trim(), password), 1500);
          merchantUserId = userCredential.user.uid;
        } catch (err) {
          console.log('Merchant auth already exists or skipped:', err);
        }
      }

      const newStoreId = `store-${Date.now()}`;

      const newMerchantUser: UserType = {
        id: merchantUserId,
        name: name || `التاجر ${name}`,
        email: email.trim(),
        password: password,
        role: 'merchant',
        storeId: newStoreId
      };

      // Save merchant user to simulated user list so they can log in
      try {
        let users = JSON.parse(localStorage.getItem('mix_users') || '[]');
        if (!Array.isArray(users)) users = [];
        if (!users.some((u: any) => u.email && u.email.toLowerCase() === email.trim().toLowerCase())) {
          users.push({ ...newMerchantUser, password });
          localStorage.setItem('mix_users', JSON.stringify(users));
        }
      } catch (err) {
        console.error(err);
      }

      const commRate = selectedPackage === 'basic' ? 3 : 0;
      const aiData = generatedAIStoreData;

      // Select default colors & details based on visual template
      let primaryColorVal = '#D4AF37';
      let backgroundVal = '#050505';
      let frameColorVal = '#141414';
      let textColorVal = '#d4d4d8';
      let layoutTypeVal: 'grid' | 'list' | 'luxury' = 'luxury';
      let featuresVal = [
        { id: '1', title: 'توصيل فوري', desc: 'توصيل لباب بيتك خلال ساعتين فقط', icon: '⚡' },
        { id: '2', title: 'ضمان MIX للثقة', desc: 'جميع المنتجات مكفولة بضمان MIX المعتمد', icon: '🛡️' },
        { id: '3', title: 'دعم مباشر', desc: 'دعم متواصل على مدار اليوم لحل أي إشكاليات', icon: '💬' }
      ];

      if (storeVisualTemplate === 'mobile') {
        primaryColorVal = '#8b5cf6'; // Neon Violet
        backgroundVal = '#030303';
        frameColorVal = '#0d0a14'; // Purple Black Frame
        textColorVal = '#93c5fd';
        layoutTypeVal = 'grid';
        featuresVal = [
          { id: '1', title: 'صيانة فورية', desc: 'صيانة احترافية أمامك خلال 30 دقيقة', icon: '🔧' },
          { id: '2', title: 'قطع غيار أصلية', desc: 'ضمان كامل على قطع الغيار المستبدلة', icon: '📱' },
          { id: '3', title: 'دعم فني مباشر', desc: 'استشارات مجانية وفحص شامل لجهازك', icon: '💬' }
        ];
      } else if (storeVisualTemplate === 'clothing') {
        primaryColorVal = '#d97706'; // warm amber
        backgroundVal = '#fafaf9'; // warm light cream
        frameColorVal = '#ffffff'; // white cards
        textColorVal = '#44403c'; // stone grey text
        layoutTypeVal = 'grid';
        featuresVal = [
          { id: '1', title: 'أحدث خطوط الموضة', desc: 'تشكيلة حصرية تم اختيارها بعناية فائقة', icon: '✨' },
          { id: '2', title: 'توصيل سريع مجاني', desc: 'شحن وتوصيل لكافة مناطق المملكة', icon: '🚚' },
          { id: '3', title: 'استرجاع مرن', desc: 'إمكانية الاستبدال والاسترجاع خلال 7 أيام', icon: '🔄' }
        ];
      } else if (storeVisualTemplate === 'perfume') {
        primaryColorVal = '#D4AF37'; // gold
        backgroundVal = '#060504'; // dark gold-black
        frameColorVal = '#12100d'; 
        textColorVal = '#e7e5e4';
        layoutTypeVal = 'luxury';
        featuresVal = [
          { id: '1', title: 'روائح ملكية فاخرة', desc: 'زيوت عطرية نقية بنسب ثبات عالية جداً', icon: '🧪' },
          { id: '2', title: 'تغليف راقٍ للإهداء', desc: 'نغلف طلبك بعناية تليق بأحبائك مجاناً', icon: '🎁' },
          { id: '3', title: 'بخور وعود طبيعي', desc: 'كسر العود الفاخرة المنتقاة من مصادرها', icon: '🪵' }
        ];
      } else if (storeVisualTemplate === 'shoes') {
        primaryColorVal = '#e11d48'; // rose red
        backgroundVal = '#09090b';
        frameColorVal = '#18181b';
        textColorVal = '#e4e4e7';
        layoutTypeVal = 'grid';
        featuresVal = [
          { id: '1', title: 'راحة تامة وجودة', desc: 'أحذية مصممة بأسلوب مريح للاستخدام اليومي', icon: '👟' },
          { id: '2', title: 'حقائب وجلود فاخرة', desc: 'تصاميم جذابة وعصرية بأجود الخامات', icon: '👜' },
          { id: '3', title: 'شحن آمن سريع', desc: 'شحن سريع وموثوق مع تتبع مباشر لطلبك', icon: '📦' }
        ];
      } else if (storeVisualTemplate === 'electronics') {
        primaryColorVal = '#3b82f6'; // tech blue
        backgroundVal = '#090d16';
        frameColorVal = '#111827';
        textColorVal = '#d1d5db';
        layoutTypeVal = 'grid';
        featuresVal = [
          { id: '1', title: 'أجهزة أصلية معتمدة', desc: 'نوفر أحدث الأجهزة الكهربائية بضمان الوكيل', icon: '🔌' },
          { id: '2', title: 'ضمان ممتد سنتين', desc: 'حماية كاملة واستبدال فوري عند وجود عيوب مصنعية', icon: '🛡️' },
          { id: '3', title: 'تركيب وتشغيل مجاني', desc: 'فريق مختص لتركيب وتجربة الأجهزة في منزلك', icon: '🛠️' }
        ];
      } else if (storeVisualTemplate === 'phonecases') {
        primaryColorVal = '#ec4899'; // pink
        backgroundVal = '#0a0408';
        frameColorVal = '#1a0a14';
        textColorVal = '#f9a8d4';
        layoutTypeVal = 'grid';
        featuresVal = [
          { id: '1', title: 'تصاميم حصرية', desc: 'أحدث صيحات كفرات الجوال بتصاميم فريدة', icon: '🎨' },
          { id: '2', title: 'خامات أصلية', desc: 'سيليكون طبي وبلاستيك مقوى ضد الصدمات', icon: '🛡️' },
          { id: '3', title: 'توصيل سريع', desc: 'نوصل طلبك لباب البيت خلال يومين عمل', icon: '📦' }
        ];
      } else if (storeVisualTemplate === 'supermarket') {
        primaryColorVal = '#22c55e'; // green
        backgroundVal = '#020804';
        frameColorVal = '#0a140e';
        textColorVal = '#bbf7d0';
        layoutTypeVal = 'grid';
        featuresVal = [
          { id: '1', title: 'منتجات طازجة يومياً', desc: 'نوفر أجود المنتجات الطازجة بأفضل الأسعار', icon: '🥦' },
          { id: '2', title: 'توصيل مجاني', desc: 'توصيل مجاني للطلبات فوق 100 ر.س', icon: '🚚' },
          { id: '3', title: 'عروض أسبوعية', desc: 'خصومات حصرية كل أسبوع على مئات المنتجات', icon: '🏷️' }
        ];
      } else if (storeVisualTemplate === 'hometools') {
        primaryColorVal = '#d97706'; // amber
        backgroundVal = '#0a0600';
        frameColorVal = '#141006';
        textColorVal = '#fcd34d';
        layoutTypeVal = 'grid';
        featuresVal = [
          { id: '1', title: 'أدوات منزلية متكاملة', desc: 'كل ما تحتاجه للمنزل والمطبخ من علامات موثوقة', icon: '🏠' },
          { id: '2', title: 'ضمان الجودة', desc: 'ضمان حقيقي على جميع المنتجات', icon: '✅' },
          { id: '3', title: 'توصيل سريع', desc: 'نوصل طلبك في أسرع وقت ممكن', icon: '⚡' }
        ];
      } else if (storeVisualTemplate === 'computers') {
        primaryColorVal = '#3b82f6'; // blue
        backgroundVal = '#020813';
        frameColorVal = '#0a1224';
        textColorVal = '#93c5fd';
        layoutTypeVal = 'grid';
        featuresVal = [
          { id: '1', title: 'أجهزة أصلية بأعلى مواصفات', desc: 'لابتوبات وكمبيوترات من أشهر الماركات العالمية', icon: '💻' },
          { id: '2', title: 'ضمان سنتين', desc: 'ضمان معتمد وقطع غيار أصلية متوفرة', icon: '🛡️' },
          { id: '3', title: 'توصيل وتركيب مجاني', desc: 'نهتم بتركيب جهازك وتجربته قبل الاستلام', icon: '🔧' }
        ];
      }

      const isPhoneCases = (storeCategory || '').includes('صينات') || (storeCategory || '').includes('كفرات') || storeVisualTemplate === 'phonecases';
      const isPhones = (storeCategory || '').includes('هواتف') || (storeCategory || '').includes('جوالات') || storeVisualTemplate === 'mobile' || storeVisualTemplate === 'electronics';
      const isPhoneStore = isPhoneCases || isPhones;

      if (isPhoneStore) {
        layoutTypeVal = 'professional';
        primaryColorVal = isPhoneCases ? '#ec4899' : '#3b82f6';
        backgroundVal = '#050505';
        frameColorVal = isPhoneCases ? '#1a0a14' : '#0a1224';
        textColorVal = isPhoneCases ? '#f9a8d4' : '#93c5fd';
        featuresVal = isPhoneCases ? [
          { id: '1', title: 'أحدث صيحات الموضة', desc: 'كفرات وتصاميم فريدة تواكب أحدث صيحات العالم', icon: '🎨' },
          { id: '2', title: 'خامات عالية الجودة', desc: 'سيليكون طبي وبلاستيك مقوى ضد الصدمات والخدوش', icon: '🛡️' },
          { id: '3', title: 'توصيل سريع لجميع المناطق', desc: 'نوصل طلبك خلال 24 ساعة لجميع مناطق المملكة', icon: '🚚' }
        ] : [
          { id: '1', title: 'أجهزة أصلية وضمان معتمد', desc: 'نوفر أحدث الهواتف الذكية من جميع الماركات العالمية', icon: '📱' },
          { id: '2', title: 'تشكيلة شاملة من الإكسسوارات', desc: 'شواحن، سماعات، وكابلات أصلية بأفضل الأسعار', icon: '⚡' },
          { id: '3', title: 'دعم فني وخدمة ما بعد البيع', desc: 'فريق مختص لخدمتكم والإجابة على جميع استفساراتكم', icon: '💬' }
        ];
      }

      const defaultPaymentGateways = [
        {
          id: `pg-cod-${Date.now()}`,
          type: 'cod' as const,
          name: 'الدفع عند الاستلام',
          enabled: true,
          icon: '💵',
          minAmount: 50,
          maxAmount: 10000
        },
        {
          id: `pg-vodafone-${Date.now()}`,
          type: 'vodafoneCash' as const,
          name: 'فودافون كاش',
          enabled: true,
          icon: '🟥',
          number: '',
          accountHolderName: '',
          extraInstructions: 'يرجى إرسال صورة الإيصال بعد التحويل'
        },
        {
          id: `pg-instapay-${Date.now()}`,
          type: 'instapay' as const,
          name: 'إنستا باي (InstaPay)',
          enabled: true,
          icon: '💙',
          number: '',
          accountHolderName: '',
          extraInstructions: 'تحويل فوري عبر تطبيق InstaPay'
        },
        {
          id: `pg-etisalat-${Date.now()}`,
          type: 'etisalatCash' as const,
          name: 'اتصالات كاش (Etisalat Cash)',
          enabled: false,
          icon: '🟩',
          number: '',
          accountHolderName: ''
        },
        {
          id: `pg-orange-${Date.now()}`,
          type: 'orangeMoney' as const,
          name: 'أورانج ماني (Orange Money)',
          enabled: false,
          icon: '🟧',
          number: '',
          accountHolderName: ''
        },
        {
          id: `pg-bank-${Date.now()}`,
          type: 'bankTransfer' as const,
          name: 'تحويل بنكي',
          enabled: true,
          icon: '🏦',
          bankName: '',
          accountHolderName: '',
          iban: '',
          branchName: '',
          number: '',
          extraInstructions: 'يرجى إرسال صورة إيصال التحويل'
        }
      ];

      const defaultCheckoutFields = [
        { id: `f-name-${Date.now()}`, name: 'fullName', label: 'الاسم الكامل', type: 'text' as const, required: true, enabled: true, placeholder: 'أدخل اسمك الكامل', order: 1 },
        { id: `f-phone-${Date.now()}`, name: 'phone', label: 'رقم الهاتف', type: 'tel' as const, required: true, enabled: true, placeholder: 'مثال: 05xxxxxxxx', order: 2, validation: { minLength: 10, maxLength: 15, pattern: '^[0-9+\\- ]+$' } },
        { id: `f-address-${Date.now()}`, name: 'address', label: 'عنوان التوصيل', type: 'textarea' as const, required: true, enabled: true, placeholder: 'الحي، الشارع، رقم العقار، الدور، رقم الشقة', order: 3 },
        { id: `f-city-${Date.now()}`, name: 'city', label: 'المدينة', type: 'select' as const, required: true, enabled: true, options: ['الرياض', 'جدة', 'الدمام', 'المدينة المنورة', 'مكة المكرمة', 'الخبر', 'أبها', 'تبوك', 'حائل', 'نجران', 'جازان', 'الباحة', 'الجوف', 'القصيم', 'الشرقية', 'عسير'], order: 4 },
        { id: `f-email-${Date.now()}`, name: 'email', label: 'البريد الإلكتروني', type: 'email' as const, required: false, enabled: true, placeholder: 'example@email.com', order: 5 },
        { id: `f-notes-${Date.now()}`, name: 'notes', label: 'ملاحظات إضافية', type: 'textarea' as const, required: false, enabled: true, placeholder: 'أي تعليمات خاصة للطلب (اختياري)', order: 6 }
      ];

      const newStore = {
        id: newStoreId,
        name: storeName || `متجر ${name}`,
        logo: storeLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop',
        cover: storeCover || 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&h=400&fit=crop',
        category: storeCategory,
        description: aiData?.description || (isPhoneStore 
          ? `أهلاً بكم في ${storeName || `متجر ${name}`} - وجهتكم الأولى لكل ما يتعلق بالهواتف الذكية والإكسسوارات. نوفر لكم أحدث الموديلات بأفضل الأسعار مع ضمان الجودة والشحن السريع لجميع مناطق المملكة.`
          : `أهلاً بكم في متجرنا الجديد على منصة MIX للعلامات المستقلة الفاخرة. نسعد بخدمتكم وتوفير تشكيلة رائعة من المنتجات بمواصفات حصرية وضمان معتمد.`),
        city: storeCity,
        country: 'السعودية',
        rating: 5.0,
        reviewsCount: 0,
        productsCount: aiData?.products?.length || 0,
        themeColor: aiData?.themeColor || {
          primary: primaryColorVal,
          secondary: '#111111',
          background: backgroundVal,
          frameColor: frameColorVal,
          textColor: textColorVal
        },
        layoutType: aiData?.layoutType || layoutTypeVal,
        visualTemplate: isPhoneCases ? 'phonecases' : (isPhones ? 'electronics' : storeVisualTemplate),
        features: featuresVal,
        banners: (aiData?.banners && aiData.banners.length > 0) ? aiData.banners.map((b: any, index: number) => ({
          id: `b-${index}-${Date.now()}`,
          title: b.title,
          subtitle: b.subtitle || '',
          image: b.image,
          videoUrl: b.videoUrl || undefined,
          linkToCategory: ''
        })) : isPhoneStore ? [
          {
            id: `b-0-${Date.now()}`,
            title: isPhoneCases ? 'أحدث كفرات الجوال بتصاميم حصرية ✨' : 'أحدث الهواتف الذكية بأسعار تنافسية 📱',
            subtitle: isPhoneCases ? 'توصيل سريع لجميع المناطق مع خصم 20% على الطلبات الأولى' : 'عروض الافتتاح - شحن مجاني للطلبات فوق 500 ريال',
            image: isPhoneCases 
              ? 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1200&h=400&fit=crop'
              : 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&h=400&fit=crop',
            linkToCategory: ''
          },
          {
            id: `b-1-${Date.now()}`,
            title: isPhoneCases ? 'حمايات شاشة فائقة القوة 🛡️' : 'إكسسوارات أصلية وضمان معتمد ⚡',
            subtitle: 'منتجات أصلية 100% من أفضل الماركات العالمية',
            image: isPhoneCases
              ? 'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1200&h=400&fit=crop'
              : 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1200&h=400&fit=crop',
            linkToCategory: ''
          }
        ] : [],
        categories: aiData?.categories || isPhoneStore ? [
          isPhoneCases ? 'كفرات الجوال' : 'الهواتف الذكية',
          isPhoneCases ? 'حمايات الشاشة' : 'الإكسسوارات',
          isPhoneCases ? 'معدات شحن' : 'شواحن وكابلات',
          'العروض الخاصة',
          'وصل حديثاً'
        ] : ['عام'],
        featured: false,
        status: 'active',
        ownerId: merchantUserId,
        commissionRate: commRate,
        salesCount: 0,
        paymentGateways: defaultPaymentGateways,
        customCheckoutFields: defaultCheckoutFields,
        currency: 'ر.س'
      };

      // Save to local storage database immediately
      try {
        const currentStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
        currentStores.push(newStore);
        localStorage.setItem('mix_stores', JSON.stringify(currentStores));

        // Let's seed products
        const currentProducts = JSON.parse(localStorage.getItem('mix_products') || '[]');
        let seededProducts: any[] = [];

        if (aiData?.products && Array.isArray(aiData.products)) {
          seededProducts = aiData.products;
        } else if (storeVisualTemplate === 'mobile') {
          seededProducts = [
            { name: 'آيفون 15 برو ماكس تيتانيوم 256 جيجابايت', price: 4799, category: 'جوالات جديدة', description: 'أحدث هواتف آبل الذكية بهيكل تيتانيوم مقاوم للصدمات.', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&h=600&fit=crop' },
            { name: 'شاحن أنكر نانو ذكي فائق السرعة بقوة 65 واط', price: 149, category: 'شواحن وإكسسوارات', description: 'منفذ USB-C يشحن هاتفك وبطاريتك بذكاء وبأعلى مستويات الأمان.', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&h=600&fit=crop' },
            { name: 'سماعة آبل إيربودز برو ٢ اللاسلكية الأصلية', price: 899, category: 'شواحن وإكسسوارات', description: 'ميزة عزل الضوضاء النشط الفائق وصوت نقي ثلاثي الأبعاد.', image: 'https://images.unsplash.com/photo-1588449668338-d151688c24b9?q=80&w=600&h=600&fit=crop' },
            { name: 'حامي شاشة نانو سيراميك كامل ضد الكسر والخدوش', price: 49, category: 'شواحن وإكسسوارات', description: 'طبقة حماية متكاملة تغطي كامل شاشة الهاتف وتحميها من الخدوش وأقوى الصدمات.', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600&h=600&fit=crop' }
          ];
        } else {
          seededProducts = [
            { name: 'منتج بداية راقٍ ومميز', price: 199, category: 'عام', description: 'أهلاً بكم في متجرنا! هذا منتج افتراضي متميز كبداية لعرض علامتكم التجارية الفاخرة.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&h=600&fit=crop' }
          ];
        }

        const newProducts = seededProducts.map((p: any, index: number) => ({
          id: `prod-${Date.now()}-${index}`,
          storeId: newStoreId,
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category || 'عام',
          description: p.description || 'منتج بداية رائع ومميز مصمم ومقترح بالذكاء الاصطناعي.',
          rating: 5,
          stock: 99,
          salesCount: 0,
          isOffer: false
        }));

        const updatedProducts = [...newProducts, ...currentProducts];
        localStorage.setItem('mix_products', JSON.stringify(updatedProducts));
        
        const prodEvent = new CustomEvent('local-storage-change', { detail: { key: 'mix_products', value: JSON.stringify(updatedProducts) } });
        window.dispatchEvent(prodEvent);

        // Dispatch storage update so App state gets updated instantly
        const event = new CustomEvent('local-storage-change', { detail: { key: 'mix_stores', value: JSON.stringify(currentStores) } });
        window.dispatchEvent(event);
      } catch (err) {
        console.error(err);
      }

      await logSystemActivity('تأسيس متجر جديد', `تم تأسيس متجر جديد باسم ${storeName} للتاجر ${name}`);
      
      // Show success message with store details
      alert(`🎉 تم إنشاء متجرك "${storeName}" بنجاح!\n\n📱 رابط المتجر: ${window.location.origin}${window.location.pathname}#/store/${newStoreId}\n\nسيتم نقلك الآن إلى لوحة التحكم...`);
      
      onSuccess(newMerchantUser);
      onClose();
    } catch (error: any) {
      console.error('Merchant registration failed:', error);
      alert(`حدث خطأ أثناء تدشين المتجر: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          className="relative w-full max-w-2xl bg-[#090909] border border-[#D4AF37]/35 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)] z-10 text-right max-h-[90vh] flex flex-col"
          dir="rtl"
        >
          {/* Top Gold Ornament Bar */}
          <div className="h-1 bg-gradient-to-l from-[#D4AF37] via-yellow-200 to-[#D4AF37] shrink-0" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 text-white/50 hover:text-[#D4AF37] hover:bg-white/5 transition-all rounded-sm cursor-pointer z-20"
          >
            <X size={18} />
          </button>

          <div className="overflow-y-auto p-6 md:p-8 flex-1">
            {/* Header branding */}
            <div className="flex flex-col items-center justify-center text-center mb-6">
              <h1 className="text-3xl font-black tracking-tight text-[#D4AF37] font-sans">
                MIX<span className="text-white italic">.</span>
              </h1>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">المركز التجاري الموحد للمحلات الفاخرة</p>
            </div>

            {/* Elegant Tab Switcher */}
            <div className="flex border-b border-white/5 mb-6 max-w-sm mx-auto">
              <button
                onClick={() => { setIsLogin(true); setRegisterStep('select_type'); }}
                className={`flex-1 pb-3 text-sm font-bold transition-all border-b-2 text-center cursor-pointer ${isLogin ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => { setIsLogin(false); setRegisterStep('select_type'); }}
                className={`flex-1 pb-3 text-sm font-bold transition-all border-b-2 text-center cursor-pointer ${!isLogin ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}
              >
                إنشاء حساب جديد
              </button>
            </div>

            {/* SIGN IN VIEW */}
            {isLogin && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-serif italic text-[#D4AF37]">مرحباً بك مجدداً في MIX</h2>
                  <p className="text-white/50 text-xs mt-1">سجل الدخول الفوري للوصول إلى لوحة التحكم أو متابعة مشترياتك</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-white/70 text-xs font-bold mb-1.5">البريد الإلكتروني</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="yourname@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#D4AF37] text-left font-mono"
                        required
                      />
                      <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-white/30" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-xs font-bold mb-1.5">كلمة المرور</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#D4AF37] text-left font-mono"
                        required
                      />
                      <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-white/30" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-white text-black hover:bg-[#D4AF37] hover:text-white transition-all text-xs font-bold uppercase tracking-widest rounded-xl mt-4 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري التحقق والدخول الموحد...</span>
                      </>
                    ) : (
                      <span>تسجيل الدخول الموحد 🛡️</span>
                    )}
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-white/30 text-[10px] uppercase tracking-widest font-sans">أو عبر الهوية الرقمية</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#D4AF37]/50 transition-all text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-[#D4AF37] font-black text-sm">G</span>
                    <span>الدخول السريع باستخدام Google 🚀</span>
                  </button>

                </form>



                <div className="text-center mt-6">
                  <p className="text-white/40 text-xs">
                    ليس لديك حساب شريك أو عميل؟{' '}
                    <button 
                      onClick={() => { setIsLogin(false); setRegisterStep('select_type'); }}
                      className="text-[#D4AF37] font-bold hover:underline cursor-pointer"
                    >
                      سجل متجرك أو حسابك الآن
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* REGISTRATION & WIZARD ENGINE */}
            {!isLogin && (
              <div>
                {/* BACK ACTION FOR WIZARD / REGISTER */}
                <div className="mb-4">
                  {registerStep !== 'select_type' && (
                    <button
                      onClick={() => {
                        if (registerStep === 'client_form') setRegisterStep('select_type');
                        else if (registerStep === 'step1') setRegisterStep('select_type');
                        else if (registerStep === 'step2') setRegisterStep('step1');
                        else if (registerStep === 'step_template') setRegisterStep('step2');
                        else if (registerStep === 'step3') setRegisterStep('step_template');
                        else if (registerStep === 'step4') setRegisterStep('step3');
                        else if (registerStep === 'step5') setRegisterStep('step4');
                      }}
                      className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowRight size={14} />
                      <span>الرجوع للخطوة السابقة</span>
                    </button>
                  )}
                </div>

                {/* STEP 0: CHOOSE ACCOUNT TYPE */}
                {registerStep === 'select_type' && (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-serif italic text-[#D4AF37]">إنشاء شراكـة وحساب جديد</h2>
                      <p className="text-white/50 text-xs mt-1">اختر نوع التسجيل لتحديد خياراتك وصلاحيات حسابك على المنصة الموحدة</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                      {/* Option 1: Client (مرفق) */}
                      <button
                        onClick={() => setRegisterStep('client_form')}
                        className="p-6 bg-[#111]/60 border border-white/10 hover:border-[#D4AF37]/50 rounded-sm text-right transition-all group flex flex-col justify-between cursor-pointer"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                            <User size={20} />
                          </div>
                          <h3 className="text-white font-bold text-base group-hover:text-[#D4AF37] transition-colors">حساب عميل (مرفق)</h3>
                          <p className="text-white/40 text-xs mt-2 leading-relaxed">أرغب في إنشاء حساب متسوق عادي للبحث عن المنتجات، والشراء، وإضافتها للمفضلة، ومتابعة الطلبات الجارية والمكتملة.</p>
                          
                          <ul className="text-white/60 text-xs mt-4 space-y-1.5 pr-1">
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45" />
                              البحث واستكشاف المنتجات
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45" />
                              شراء المنتجات وتفعيل الكوبونات
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45" />
                              إضافة المنتجات إلى المفضلة والسلة
                            </li>
                          </ul>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-1 text-[#D4AF37] text-xs font-bold">
                          <span>اختيار حساب العميل</span>
                          <ArrowLeft size={12} className="group-hover:translate-x-[-4px] transition-transform" />
                        </div>
                      </button>

                      {/* Option 2: Merchant (إنسان - Store Wizard) */}
                      <button
                        onClick={() => setRegisterStep('step1')}
                        className="p-6 bg-[#111]/60 border border-white/10 hover:border-[#D4AF37]/50 rounded-sm text-right transition-all group flex flex-col justify-between cursor-pointer"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                            <Store size={20} />
                          </div>
                          <h3 className="text-white font-bold text-base group-hover:text-[#D4AF37] transition-colors">حساب تاجر شريك (إنسان)</h3>
                          <p className="text-white/40 text-xs mt-2 leading-relaxed">أرغب في تدشين متجري الخاص بالكامل، ورفع المنتجات، وإطلاق العروض، وتعديل هويتي وتصميمي، وتلقي المدفوعات والطلبات.</p>
                          
                          <ul className="text-white/60 text-xs mt-4 space-y-1.5 pr-1">
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45" />
                              معالج متكامل لتدشين المتجر
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45" />
                              لوحة تحكم معزولة لمتجرك
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45" />
                              إدارة البنرات، الكوبونات والمنتجات
                            </li>
                          </ul>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-1 text-[#D4AF37] text-xs font-bold">
                          <span>فتح معالج المتجر (Wizard)</span>
                          <ArrowLeft size={12} className="group-hover:translate-x-[-4px] transition-transform" />
                        </div>
                      </button>
                    </div>

                    <div className="relative flex py-4 items-center max-w-lg mx-auto">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-4 text-white/30 text-[10px] uppercase tracking-widest font-sans">أو إنشاء حساب سريع</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <div className="max-w-lg mx-auto mb-4">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#D4AF37]/50 transition-all text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
                      >
                        <span className="text-[#D4AF37] font-black text-sm">G</span>
                        <span>التسجيل السريع كعميل باستخدام Google ⚡</span>
                      </button>
                    </div>

                    <div className="text-center mt-6">
                      <button
                        onClick={() => setIsLogin(true)}
                        className="text-white/50 text-xs hover:text-[#D4AF37] underline cursor-pointer"
                      >
                        لديك حساب بالفعل؟ سجل دخولك الآن
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 1: CLIENT REGISTER FORM */}
                {registerStep === 'client_form' && (
                  <div className="max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-serif italic text-[#D4AF37]">تسجيل حساب متسوق (مرفق)</h3>
                      <p className="text-white/50 text-xs mt-1">املاً البيانات التالية لتبدأ متعة التسوق الفاخر على منصة MIX</p>
                    </div>

                    <form onSubmit={handleClientRegister} className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">الاسم الكامل</label>
                        <input
                          type="text"
                          placeholder="عبدالله العتيبي"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">البريد الإلكتروني</label>
                        <input
                          type="email"
                          placeholder="yourname@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] text-left font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">رقم الهاتف (اختياري)</label>
                        <input
                          type="text"
                          placeholder="0500000000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] text-left font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">كلمة المرور</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] text-left font-mono"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#D4AF37] text-black hover:bg-white hover:text-black font-bold text-xs uppercase tracking-widest rounded-sm mt-6 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            <span>جاري معالجة وتأكيد الحساب...</span>
                          </>
                        ) : (
                          <span>تأكيد وإنشاء حساب المشتري 🛍️</span>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* STORE WIZARD - STEP 1: PERSONAL & CATEGORY (اسم إكس & مشروع التكلفة) */}
                {registerStep === 'step1' && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded-sm">الخطوة 1 من 5</span>
                      <h3 className="text-base font-bold text-white">التحقق من الشخصية ونشاط المتجر</h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-white/40 text-xs">يرجى إدخال بيانات الهوية الشخصية ومجال المتجر الخاص بك لتأسيس سجل المتجر:</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">الاسم الكامل للتاجر (اسم إكس)</label>
                          <input
                            type="text"
                            placeholder="عبدالرحمن الصالح"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">رقم الهاتف (فرحة)</label>
                          <input
                            type="text"
                            placeholder="05xxxxxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] font-mono text-left"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">البريد الإلكتروني للتاجر</label>
                          <input
                            type="email"
                            placeholder="merchant@mix.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] font-mono text-left"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">كلمة مرور لوحة التحكم</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] font-mono text-left"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">نشاط المتجر (اختر فئة متجرك)</label>
                        <select
                          value={storeCategory}
                          onChange={(e) => setStoreCategory(e.target.value)}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                        >
                          <option value="بيع هواتف وإكسسوارات">بيع هواتف وإكسسوارات ذكية 📱✨</option>
                          <option value="صينات هواتف وكفرات">صينات هواتف وكفرات وحمايات 📱💗🛡️</option>
                        </select>
                      </div>

                      <div className="p-4 border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-pink-500/10 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                            🎨
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm">تصميم احترافي متكامل</h4>
                            <p className="text-white/60 text-[10px]">سيظهر متجرك بتصميم عصري بدون علامات المنصة</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="flex items-center gap-2 p-2 bg-black/30 rounded-xl">
                            <span className="text-green-400">✓</span>
                            <span className="text-white/80">رابط متجر خاص</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-black/30 rounded-xl">
                            <span className="text-green-400">✓</span>
                            <span className="text-white/80">هوية بصرية احترافية</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-black/30 rounded-xl">
                            <span className="text-green-400">✓</span>
                            <span className="text-white/80">بنرات مخصصة</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-black/30 rounded-xl">
                            <span className="text-green-400">✓</span>
                            <span className="text-white/80">بوبات دفع حقيقية</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!name || !phone || !email || !password) {
                              alert('يرجى ملء جميع الحقول المطلوبة للمتابعة.');
                              return;
                            }
                            setRegisterStep('step2');
                          }}
                          className="px-6 py-2.5 bg-white text-black hover:bg-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>الخطوة التالية</span>
                          <ArrowLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STORE WIZARD - STEP 2: STORE INFO & ASSETS (بيانات المتجر & صوران) */}
                {registerStep === 'step2' && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded-sm">الخطوة 2 من 6</span>
                      <h3 className="text-base font-bold text-white">بيانات المتجر وتصميم الهوية</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">اسم المتجر (للعلم)</label>
                        <input
                          type="text"
                          placeholder="مثال: قصر الشرق للعود، تيك مكس"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">رقم السجل التجاري / قمح (رقم اللعب)</label>
                          <input
                            type="text"
                            placeholder="CR-908123719"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] font-mono text-left"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">مدينة الفرع الرئيسي</label>
                          <select
                            value={storeCity}
                            onChange={(e) => setStoreCity(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          >
                            <option value="القاهرة">القاهرة</option>
                            <option value="الجيزة">الجيزة</option>
                            <option value="الإسكندرية">الإسكندرية</option>
                            <option value="المنصورة">المنصورة</option>
                            <option value="طنطا">طنطا</option>
                            <option value="أسيوط">أسيوط</option>
                            <option value="المحلة الكبرى">المحلة الكبرى</option>
                            <option value="الفيوم">الفيوم</option>
                            <option value="بني سويف">بني سويف</option>
                            <option value="المنيا">المنيا</option>
                            <option value="سوهاج">سوهاج</option>
                            <option value="قنا">قنا</option>
                            <option value="الأقصر">الأقصر</option>
                            <option value="أسوان">أسوان</option>
                            <option value="الشرقية">الشرقية</option>
                            <option value="الدقهلية">الدقهلية</option>
                            <option value="الغربية">الغربية</option>
                            <option value="كفر الشيخ">كفر الشيخ</option>
                            <option value="البحيرة">البحيرة</option>
                            <option value="الإسماعيلية">الإسماعيلية</option>
                            <option value="السويس">السويس</option>
                            <option value="بورسعيد">بورسعيد</option>
                            <option value="دمياط">دمياط</option>
                            <option value="العريش">العريش</option>
                            <option value="الرياض">الرياض</option>
                            <option value="جدة">جدة</option>
                            <option value="دبي">دبي</option>
                            <option value="الدوحة">الدوحة</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">الحي / المنطقة</label>
                          <input
                            type="text"
                            placeholder="مثال: المعادي،مدينة نصر،المهندسين"
                            value={storeDistrict}
                            onChange={(e) => setStoreDistrict(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">الشارع / المنطقة الفرعية</label>
                          <input
                            type="text"
                            placeholder="مثال: شارع 9،المنيل"
                            value={storeNeighborhood}
                            onChange={(e) => setStoreNeighborhood(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">رقم هاتف المتجر (يظهر للعملاء)</label>
                        <input
                          type="tel"
                          placeholder="01012345678"
                          value={storePhone}
                          onChange={(e) => setStorePhone(e.target.value)}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">وصف المتجر (يظهر في بحث Google) ⭐</label>
                        <textarea
                          placeholder="مثال: متجر قصر الشرق متخصص في العطور الشرقية والعود الفاخر والبخور الأصلي. شحن لكل أنحاء مصر. أكثر من 500 منتج أصلي."
                          value={storeDescription}
                          onChange={(e) => setStoreDescription(e.target.value)}
                          rows={3}
                          maxLength={300}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1">{storeDescription.length}/300 - هذا الوصف يظهر عند البحث عن متجرك في Google</p>
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-bold mb-1.5">الموقع على الخريطة الجغرافية (العنوان بالتفصيل)</label>
                        <input
                          type="text"
                          placeholder="الرياض - العليا مول - الدور الأول"
                          value={mapLocation}
                          onChange={(e) => setMapLocation(e.target.value)}
                          className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      {/* Store Category specific additional input */}
                      {storeCategory === 'مطاعم ومأكولات' && (
                        <div>
                          <label className="block text-white/70 text-xs font-bold mb-1.5">نوع الأطعمة والمطبخ (الطعام)</label>
                          <input
                            type="text"
                            placeholder="برجر، مشويات، طعام شرقي"
                            value={foodType}
                            onChange={(e) => setFoodType(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-sm py-2 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      )}

                      {(storeCategory || '').includes('صينات') && (
                        <div className="p-4 border border-pink-500/30 bg-pink-500/5 rounded-xl">
                          <div className="text-center space-y-2">
                            <p className="text-pink-300 text-xs font-bold">لديك حساب العتباوي؟</p>
                            <button
                              type="button"
                              onClick={() => {
                                setEmail('gomay35736@fishnone.com');
                                setPassword('alatbawi123');
                                setIsLogin(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                            >
                              تسجيل الدخول بحساب العتباوي
                            </button>
                          </div>
                        </div>
                      )}

                      {/* AI STORE GENERATOR WIZARD CARD */}
                      <div className="p-4 border border-amber-500/30 bg-[#ffb700]/5 rounded-sm space-y-3">
                        <div className="flex items-center gap-1.5 text-[#D4AF37]">
                          <Sparkles size={14} className="animate-pulse" />
                          <span className="text-xs font-black">تأسيس وتصميم المتجر بالذكاء الاصطناعي 🚀</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          اكتب فكرة مبسطة لمتجرك ليقوم الذكاء الاصطناعي بتنسيق الهوية البصرية والألوان وتوليد أقسام ومنتجات وبنرات بداية مخصصة لك في أقل من 20 ثانية!
                        </p>
                        <div>
                          <input
                            type="text"
                            placeholder="مثال: متجر صيانة هواتف خلوي وإكسسوارات بتصميم نيون مستقبلي"
                            value={aiIdeaPrompt}
                            onChange={(e) => setAiIdeaPrompt(e.target.value)}
                            className="w-full bg-[#111] border border-zinc-800 rounded-sm py-2 px-3 text-[11px] text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={isGeneratingAI}
                          onClick={handleAIGenerateStore}
                          className="w-full py-2 bg-[#D4AF37] hover:bg-white text-black font-extrabold text-[10px] tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isGeneratingAI ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                              <span>جاري تشغيل المصمم الذكي... 🧠</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} />
                              <span>تصميم المتجر بالكامل والمنتجات بالذكاء الاصطناعي ✨🤖</span>
                            </>
                          )}
                        </button>

                        {generatedAIStoreData && (
                          <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-400 space-y-1 animate-fadeIn">
                            <p className="font-bold">✓ تم بناء تصميم المتجر الذكي بالكامل!</p>
                            <p className="text-zinc-400">
                              تم بنجاح توليد {generatedAIStoreData.products?.length || 0} منتجات ترحيبية، و {generatedAIStoreData.banners?.length || 0} بنر، وتحديد الألوان: <span className="font-mono text-white">{generatedAIStoreData.themeColor?.primary}</span>.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Image Assets (صوران - Logo & Banner Cover) */}
                      <div className="p-4 border border-white/5 rounded-sm bg-black/40 space-y-4">
                        <span className="text-xs text-[#D4AF37] font-bold block mb-2">🖼️ تصميم الهوية المرئية (شعار وبنر المتجر)</span>
                        
                        <div>
                          <label className="block text-white/60 text-[10px] mb-1">اختر من النماذج الراقية الجاهزة لشعار متجرك:</label>
                          <div className="grid grid-cols-4 gap-2">
                            {PRESET_LOGOS.map((logo, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setStoreLogo(logo.url)}
                                className={`p-1 bg-[#111] rounded-sm border transition-all cursor-pointer text-center ${
                                  storeLogo === logo.url ? 'border-[#D4AF37]' : 'border-white/5'
                                }`}
                              >
                                <img src={logo.url} alt="" className="w-10 h-10 object-cover mx-auto rounded-sm mb-1" />
                                <span className="text-[8px] text-white/70 block truncate">{logo.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-white/60 text-[10px] mb-1">اختر بنر غلاف لمتجرك الفاخر:</label>
                          <div className="grid grid-cols-2 gap-2">
                            {PRESET_COVERS.map((cov, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setStoreCover(cov.url)}
                                className={`p-1 bg-[#111] rounded-sm border transition-all cursor-pointer text-right flex items-center gap-1.5 ${
                                  storeCover === cov.url ? 'border-[#D4AF37]' : 'border-white/5'
                                }`}
                              >
                                <img src={cov.url} alt="" className="w-8 h-8 object-cover rounded-sm" />
                                <span className="text-[9px] text-white/80 block truncate">{cov.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-white/40 text-[9px]">رفع شعار المتجر من جهازك</span>
                            <div className="flex gap-1 mt-1">
                              {storeLogo && storeLogo.startsWith('data:') && (
                                <img src={storeLogo} alt="" className="w-10 h-10 object-cover rounded-sm border border-white/10 flex-shrink-0" />
                              )}
                              <label className="flex-1 flex items-center justify-center border border-dashed border-white/10 hover:border-amber-500/50 rounded-sm py-2 cursor-pointer transition-colors">
                                <span className="text-amber-400/70 text-[10px]">📁 رفع</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (ev) => { if (ev.target?.result) setStoreLogo(ev.target.result as string); };
                                  reader.readAsDataURL(file);
                                }} />
                              </label>
                            </div>
                          </div>
                          <div>
                            <span className="text-white/40 text-[9px]">رفع غلاف المتجر من جهازك</span>
                            <div className="flex gap-1 mt-1">
                              {storeCover && storeCover.startsWith('data:') && (
                                <img src={storeCover} alt="" className="w-14 h-10 object-cover rounded-sm border border-white/10 flex-shrink-0" />
                              )}
                              <label className="flex-1 flex items-center justify-center border border-dashed border-white/10 hover:border-amber-500/50 rounded-sm py-2 cursor-pointer transition-colors">
                                <span className="text-amber-400/70 text-[10px]">📁 رفع</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (ev) => { if (ev.target?.result) setStoreCover(ev.target.result as string); };
                                  reader.readAsDataURL(file);
                                }} />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setRegisterStep('step1')}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-sm cursor-pointer"
                        >
                          السابق
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!storeName) {
                              alert('يرجى تحديد اسم للمتجر (للعلم).');
                              return;
                            }
                            // Auto map category to template when going to template screen
                            const cat = (storeCategory || '').toLowerCase();
                            if (cat.includes('موبايل') || cat.includes('جوال') || cat.includes('صيانة') || cat.includes('هواتف')) {
                              setStoreVisualTemplate('mobile');
                            } else if (cat.includes('ملابس') || cat.includes('أزياء') || cat.includes('موضة') || cat.includes('بوتيك') || cat.includes('فاشن')) {
                              setStoreVisualTemplate('clothing');
                            } else if (cat.includes('عطر') || cat.includes('بخور') || cat.includes('روائح') || cat.includes('عطور')) {
                              setStoreVisualTemplate('perfume');
                            } else if (cat.includes('حذاء') || cat.includes('جزم') || cat.includes('كوتش') || cat.includes('أحذية') || cat.includes('حقائب')) {
                              setStoreVisualTemplate('shoes');
                            } else if (cat.includes('كهرب') || cat.includes('أجهزة') || cat.includes('ثلاجة') || cat.includes('غسالة') || cat.includes('شاشات')) {
                              setStoreVisualTemplate('electronics');
                            } else if (cat.includes('كفر') || cat.includes('صينة') || cat.includes('صيان') || cat.includes('جوال') || cat.includes('هاتف') || cat.includes('اكسسوار') || cat.includes('إكسسوار') || cat.includes('بروتكشن')) {
                              setStoreVisualTemplate('phonecases');
                            } else if (cat.includes('سوبر') || cat.includes('ماركت') || cat.includes('بقال') || cat.includes('مواد غذائ') || cat.includes('خضار') || cat.includes('مشروبات')) {
                              setStoreVisualTemplate('supermarket');
                            } else if (cat.includes('منزل') || cat.includes('مطبخ') || cat.includes('أثاث') || cat.includes('ديكور') || cat.includes('أدوات')) {
                              setStoreVisualTemplate('hometools');
                            } else if (cat.includes('كمبيوتر') || cat.includes('لابتوب') || cat.includes('كيبورد') || cat.includes('ماوس') || cat.includes('قطع') || cat.includes('معالج')) {
                              setStoreVisualTemplate('computers');
                            } else {
                              setStoreVisualTemplate('multicategory');
                            }
                            setRegisterStep('step_template');
                          }}
                          className="px-6 py-2.5 bg-white text-black hover:bg-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>الخطوة التالية</span>
                          <ArrowLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STORE WIZARD - STEP TEMPLATE: CHOOSE VISUAL TEMPLATE */}
                {registerStep === 'step_template' && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded-sm">الخطوة 3 من 6</span>
                      <h3 className="text-base font-bold text-white">اختر قالب متجرك المناسب</h3>
                    </div>

                    <div className="space-y-4 text-right">
                      <p className="text-white/80 text-xs font-medium leading-relaxed">
                        اختر نوع نشاط متجرك، وسيتم تطبيق قالب احترافي مصمم خصيصًا لهذا المجال. ويمكنك تغييره أو تخصيصه بالكامل لاحقًا.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {[
                          { 
                            id: 'mobile', 
                            title: 'متجر صيانة موبايلات', 
                            desc: 'قالب صيانة هواتف ذكية وجوالات بألوان نيون بنفسجي وأزرق وأسود جذابة، مع نموذج طلب صيانة إلكتروني.', 
                            icon: '📱' 
                          },
                          { 
                            id: 'clothing', 
                            title: 'متجر ملابس وأزياء', 
                            desc: 'تصميم بوتيك أنيق، كلاسيكي وراقي لعرض الملابس، الفاشن ومجموعات الكولكشن الرائعة.', 
                            icon: '👕' 
                          },
                          { 
                            id: 'perfume', 
                            title: 'متجر عطور وبخور', 
                            desc: 'أناقة ملكية فاخرة بلمسات ذهبية دافئة وعرض دقيق لمكونات وروائح العطور والبخور الفخم.', 
                            icon: '🪵' 
                          },
                          { 
                            id: 'shoes', 
                            title: 'متجر أحذية وحقائب', 
                            desc: 'تصميم عصري وجريء ومتحرك مناسب تماماً لعرض وتصنيف الأحذية الرياضية والجلود والشنط الفاخرة.', 
                            icon: '👟' 
                          },
                          { 
                            id: 'electronics', 
                            title: 'متجر أجهزة كهربائية', 
                            desc: 'قالب ممتاز للأجهزة المنزلية والإلكترونية يسلط الضوء على الضمان والمواصفات الفنية العالية.', 
                            icon: '🔌' 
                          },
                          { 
                            id: 'multicategory', 
                            title: 'متجر متعدد الأقسام', 
                            desc: 'القالب الشامل لـ MIX المناسب للمتاجر الكبيرة التي تضم تصنيفات متعددة وكل شيء في مكان واحد.', 
                            icon: '🛍️' 
                          },
                          { 
                            id: 'phonecases', 
                            title: 'متجر كفرات جوال', 
                            desc: 'قالب عصري بألوان زهرية وردية لعرض كفرات وحمايات وشواحن الجوالات بتصاميم حصرية.', 
                            icon: '📱' 
                          },
                          { 
                            id: 'supermarket', 
                            title: 'متجر سوبر ماركت', 
                            desc: 'تصميم أخضر نابض بالحياة مناسب للسوبر ماركت والمواد الغذائية والمنتجات الطازجة.', 
                            icon: '🛒' 
                          },
                          { 
                            id: 'hometools', 
                            title: 'متجر أدوات منزلية', 
                            desc: 'قالب دافئ بألوان عنبرية مناسبة للأدوات المنزلية وأطقم المطبخ والديكورات العصرية.', 
                            icon: '🏠' 
                          },
                          { 
                            id: 'computers', 
                            title: 'متجر كمبيوترات وتقنية', 
                            desc: 'تصميم تقني أزرق عصري للابتوبات وقطع الكمبيوتر وملحقات الأجهزة الإلكترونية.', 
                            icon: '💻' 
                          }
                        ].map((tpl) => (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setStoreVisualTemplate(tpl.id as any)}
                            className={`p-4 rounded-xl text-right border transition-all cursor-pointer flex flex-col justify-between h-40 ${
                              storeVisualTemplate === tpl.id
                                ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_15px_rgba(212,175,55,0.05)] ring-2 ring-[#D4AF37]/20'
                                : 'border-white/5 bg-[#111] hover:border-white/10'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{tpl.icon}</span>
                                <h4 className="text-white font-bold text-sm">{tpl.title}</h4>
                              </div>
                              <p className="text-white/40 text-[10px] mt-2 leading-relaxed">{tpl.desc}</p>
                            </div>
                            <span className={`text-[10px] font-bold mt-2 block ${storeVisualTemplate === tpl.id ? 'text-[#D4AF37]' : 'text-white/35'}`}>
                              {storeVisualTemplate === tpl.id ? '✓ تم اختيار القالب' : 'تحديد هذا القالب'}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setRegisterStep('step2')}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-sm cursor-pointer"
                        >
                          السابق
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterStep('step3')}
                          className="px-6 py-2.5 bg-white text-black hover:bg-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>الخطوة التالية</span>
                          <ArrowLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STORE WIZARD - STEP 3: CHOOSE PACKAGE (الاشتراكات المدفوعة) */}
                {registerStep === 'step3' && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded-sm">الخطوة 4 من 6</span>
                      <h3 className="text-base font-bold text-white">باقات الاشتراك المدفوعة</h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-white/50 text-xs">اختر باقة الاشتراك الشهرية لمنصة MIX. جميع الباقات مدفوعة - لا توجد نسخة تجريبية مجانية. الدفع يتم مرة واحدة عبر تحويل فودافون كاش.</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Package 1: Basic 250 EGP */}
                        <button
                          type="button"
                          onClick={() => setSelectedPackage('basic')}
                          className={`p-5 rounded-xl text-right border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            selectedPackage === 'basic'
                              ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(251,191,36,0.1)]'
                              : 'border-white/10 bg-[#111] hover:border-white/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">الباقة الأساسية</span>
                              {selectedPackage === 'basic' && <CheckCircle size={18} className="text-amber-500" />}
                            </div>
                            <h4 className="text-white font-black text-lg">الانطلاقة</h4>
                            <div className="my-3">
                              <span className="text-3xl font-black text-amber-500">250</span>
                              <span className="text-zinc-400 text-sm mr-1">ج.م</span>
                              <span className="text-zinc-500 text-xs block mt-0.5">شهرياً - مدفوعة مسبقاً</span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-zinc-400">
                              <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> متجر كامل بتصميم احترافي</li>
                              <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> حتى 50 منتج</li>
                              <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> عمولة مبيعات 3%</li>
                              <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> دعم فني عبر الواتساب</li>
                            </ul>
                          </div>
                        </button>

                        {/* Package 2: Premium 300 EGP */}
                        <button
                          type="button"
                          onClick={() => setSelectedPackage('premium')}
                          className={`p-5 rounded-xl text-right border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            selectedPackage === 'premium'
                              ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(251,191,36,0.1)]'
                              : 'border-white/10 bg-[#111] hover:border-white/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">الأكثر مبيعاً</span>
                              {selectedPackage === 'premium' && <CheckCircle size={18} className="text-amber-500" />}
                            </div>
                            <h4 className="text-white font-black text-lg">برو +</h4>
                            <div className="my-3">
                              <span className="text-3xl font-black text-amber-500">300</span>
                              <span className="text-zinc-400 text-sm mr-1">ج.م</span>
                              <span className="text-zinc-500 text-xs block mt-0.5">شهرياً - مدفوعة مسبقاً</span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-zinc-400">
                              <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> كل مميزات الباقة الأساسية</li>
                              <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> منتجات غير محدودة</li>
                              <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> عمولة مبيعات 0% (بدون عمولة)</li>
                              <li className="flex items-center gap-1.5"><span className="text-green-400">✓</span> أولوية في الإعلانات والدعم الهاتفي</li>
                            </ul>
                          </div>
                        </button>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setRegisterStep('step2')}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-sm cursor-pointer"
                        >
                          السابق
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterStep('step5')}
                          className="px-6 py-2.5 bg-white text-black hover:bg-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>الدفع الآن</span>
                          <ArrowLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STORE WIZARD - STEP 4: REVIEW + AUTHORIZE */}
                {registerStep === 'step4' && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded-sm">الخطوة 5 من 6</span>
                      <h3 className="text-base font-bold text-white">مراجعة البيانات والتفويض</h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-white/50 text-xs">يرجى مراجعة تفاصيل طلبك قبل التوجه للدفع:</p>

                      <div className="p-4 border border-[#D4AF37]/25 bg-black/60 rounded-sm space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-white/40">اسم المتجر:</span>
                          <span className="text-white font-bold">{storeName}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-white/40">قالب المتجر:</span>
                          <span className="text-[#D4AF37] font-bold">{storeVisualTemplate === 'mobile' ? '📱 صيانة جوالات' : storeVisualTemplate === 'clothing' ? '👕 ملابس وأزياء' : storeVisualTemplate === 'perfume' ? '🧪 عطور وبخور' : storeVisualTemplate === 'shoes' ? '👟 أحذية' : storeVisualTemplate === 'electronics' ? '🔌 أجهزة كهربائية' : storeVisualTemplate === 'phonecases' ? '📱 كفرات جوال' : storeVisualTemplate === 'supermarket' ? '🛒 سوبر ماركت' : storeVisualTemplate === 'hometools' ? '🏠 أدوات منزلية' : storeVisualTemplate === 'computers' ? '💻 كمبيوترات' : '🛍️ متعدد الأقسام'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-white/40">النشاط التجاري:</span>
                          <span className="text-[#D4AF37] font-bold">{storeCategory}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-white/40">التاجر:</span>
                          <span className="text-white">{name}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-white/40">البريد الإلكتروني:</span>
                          <span className="text-white/70 font-mono">{email}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-white/40">الموقع:</span>
                          <span className="text-white/70">{mapLocation}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-white/40">المدينة:</span>
                          <span className="text-white/70">{storeCity}</span>
                        </div>
                        {storeDistrict && (
                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-white/40">الحي:</span>
                            <span className="text-white/70">{storeDistrict}</span>
                          </div>
                        )}
                        {storePhone && (
                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-white/40">الهاتف:</span>
                            <span className="text-white/70 font-mono" dir="ltr">{storePhone}</span>
                          </div>
                        )}
                        {storeDescription && (
                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-white/40">الوصف (SEO):</span>
                            <span className="text-white/70 text-[10px] max-w-[200px] truncate">{storeDescription}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-white/40">الباقة:</span>
                          <span className="text-amber-500 font-black">{selectedPackage === 'basic' ? 'الانطلاقة 250 ج.م' : 'برو + 300 ج.م'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2 border border-white/5 rounded-sm bg-black/20">
                        <div className="text-center">
                          <span className="text-white/30 text-[8px] block mb-1">الشعار</span>
                          <img src={storeLogo} alt="" className="w-12 h-12 object-cover mx-auto rounded-full border border-[#D4AF37]/30" />
                        </div>
                        <div className="text-center">
                          <span className="text-white/30 text-[8px] block mb-1">الغلاف</span>
                          <img src={storeCover} alt="" className="w-20 h-10 object-cover mx-auto rounded-sm border border-white/10" />
                        </div>
                      </div>

                      <div className="p-3 bg-[#D4AF37]/10 rounded-sm border border-[#D4AF37]/25 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="authorize-check"
                          checked={isAuthorized}
                          onChange={(e) => setIsAuthorized(e.target.checked)}
                          className="mt-1 accent-[#D4AF37] cursor-pointer"
                        />
                        <label htmlFor="authorize-check" className="text-white/80 text-[11px] leading-relaxed cursor-pointer select-none">
                          أوافق على إنشاء متجري على منصة MIX وأقر بصحة البيانات المقدمة.
                        </label>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setRegisterStep('step3')}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-sm cursor-pointer"
                        >
                          السابق
                        </button>
                        <button
                          type="button"
                          disabled={!isAuthorized}
                          onClick={() => {
                            if (!isAuthorized) { alert('يرجى الموافقة على التفويض أولاً'); return; }
                            setRegisterStep('step5');
                          }}
                          className="px-6 py-2.5 bg-white text-black hover:bg-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-1 disabled:opacity-30"
                        >
                          <span>الدفع الآن</span>
                          <ArrowLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STORE WIZARD - STEP 5: PAYMENT (فودافون كاش) - auto-submit on receipt upload */}
                {registerStep === 'step5' && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded-sm">الخطوة 6 من 6</span>
                      <h3 className="text-base font-bold text-white">الدفع عبر فودافون كاش</h3>
                    </div>

                    <div className="space-y-5">
                      <p className="text-white/50 text-xs">حول قيمة الباقة إلى الرقم أدناه، ثم ارفع صورة الإيصال ليتم إرسال طلبك تلقائياً.</p>

                      {/* Vodafone Cash Details */}
                      <div className="p-5 border-2 border-amber-500/30 bg-amber-500/5 rounded-xl text-center space-y-2">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">رقم فودافون كاش</span>
                        <div className="text-3xl font-black text-white tracking-wider font-mono" dir="ltr">+20 10 99853402</div>
                        <div className="w-full h-px bg-amber-500/20 my-2" />
                        <div className="flex justify-center items-center gap-2">
                          <span className="text-zinc-400 text-xs">المطلوب:</span>
                          <span className="text-amber-500 font-black text-xl">{selectedPackage === 'basic' ? '250' : '300'} ج.م</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">باقة {selectedPackage === 'basic' ? 'الانطلاقة' : 'برو +'} - اشتراك شهر واحد</p>
                      </div>

                      {/* Receipt Upload - auto submits */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
                        <label className="block text-zinc-300 text-xs font-bold">صورة إيصال التحويل *</label>
                        
                        {!receiptImage ? (
                          <div
                            onClick={() => {
                              const inp = document.createElement('input');
                              inp.type = 'file';
                              inp.accept = 'image/*';
                              inp.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (!file) return;
                                setIsSubmitting(true);
                                try {
                                  const reader = new FileReader();
                                  reader.onload = async (ev) => {
                                    const base64 = ev.target?.result as string;
                                    setReceiptImage(base64);
                                    // Auto-submit immediately
                                    const storeRequest = {
                                      id: `req-${Date.now()}`,
                                      merchantName: name,
                                      merchantEmail: email.trim(),
                                      merchantPhone: phone,
                                      merchantPassword: password,
                                      storeName: storeName,
                                      storeCategory: storeCategory,
                                      licenseNumber: licenseNumber,
                                      storeCity: storeCity,
                                      storeDistrict: storeDistrict,
                                      storeNeighborhood: storeNeighborhood,
                                      storePhone: storePhone,
                                      storeDescription: storeDescription,
                                      mapLocation: mapLocation,
                                      storeLogo: storeLogo,
                                      storeCover: storeCover,
                                      visualTemplate: storeVisualTemplate,
                                      plan: selectedPackage,
                                      planAmount: selectedPackage === 'basic' ? 250 : 300,
                                      commissionRate: selectedPackage === 'basic' ? 3 : 0,
                                      receiptImage: base64,
                                      status: 'pending',
                                      createdAt: new Date().toISOString()
                                    };
                                    const existing = JSON.parse(localStorage.getItem('mix_store_requests') || '[]');
                                    existing.push(storeRequest);
                                    saveLocal('mix_store_requests', existing);
                                    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_store_requests' } }));
                                    // Save to Firestore (real-time sync to admin dashboard)
                                    fbSync.saveStoreRequest(storeRequest).catch(console.error);
                                    fbSync.saveUser({
                                      id: `pending-${Date.now()}`,
                                      name: name,
                                      email: email.trim(),
                                      password: password,
                                      role: 'merchant',
                                      storeRequestId: storeRequest.id,
                                      status: 'pending'
                                    } as any).catch(console.error);
                                    let storedUsers = JSON.parse(localStorage.getItem('mix_users') || '[]');
                                    if (!Array.isArray(storedUsers)) storedUsers = [];
                                    storedUsers.push({
                                      id: `pending-${Date.now()}`,
                                      name: name,
                                      email: email.trim(),
                                      password: password,
                                      role: 'merchant',
                                      storeRequestId: storeRequest.id,
                                      status: 'pending'
                                    });
                                    saveLocal('mix_users', storedUsers);
                                    // Sync to Firestore
                                    fbSync.saveStoreRequest(storeRequest).catch(() => {});
                                    // Dispatch events to notify AdminDashboard and App
                                    window.dispatchEvent(new CustomEvent('store-request-update', { detail: { time: Date.now() } }));
                                    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_store_requests' } }));
                                    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_users' } }));
                                    setRegisterStep('step6');
                                  };
                                  reader.readAsDataURL(file);
                                } catch (err) {
                                  alert('حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.');
                                  console.error(err);
                                } finally {
                                  setIsSubmitting(false);
                                }
                              };
                              inp.click();
                            }}
                            className="border-2 border-dashed border-zinc-700 hover:border-amber-500/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
                          >
                            <div className="text-amber-500 text-2xl mb-2">📷</div>
                            <p className="text-zinc-400 text-xs">اضغط لرفع صورة الإيصال من جهازك</p>
                            <p className="text-zinc-600 text-[10px] mt-1">jpg, png - مقاس أقل من 5MB</p>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-amber-400 text-xs font-bold">جاري إرسال طلبك...</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => { setRegisterStep('step4'); setReceiptImage(''); }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-sm cursor-pointer"
                        >
                          السابق
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STORE WIZARD - STEP 6: PENDING APPROVAL (auto-close after 5s) */}
                {registerStep === 'step6' && (
                  <div className="max-w-lg mx-auto text-center py-8">
                    <div className="text-6xl mb-6 animate-bounce">⏳</div>
                    <h3 className="text-2xl font-black text-white mb-2">تم إرسال طلبك بنجاح!</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                      طلب إنشاء المتجر قيد المراجعة من قبل إدارة المنصة.
                      جاري الاتصال بقاعدة البيانات للتحقق من حالة الطلب...
                    </p>
                    <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl text-right space-y-2 text-xs mb-6">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">المتجر:</span>
                        <span className="text-white font-bold">{storeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">الباقة:</span>
                        <span className="text-amber-500 font-black">{selectedPackage === 'basic' ? 'الانطلاقة 250 ج.م' : 'برو + 300 ج.م'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">حالة الطلب:</span>
                        <span className="text-yellow-400 font-bold flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping inline-block" />
                          قيد المراجعة
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-amber-500/80 text-xs">
                      <div className="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full" />
                      <span>يتم الانتظار حتى يوافق المشرف...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
