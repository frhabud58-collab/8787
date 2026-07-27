import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3002;

// Setup body parsers with UTF-8 encoding
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure UTF-8 encoding for responses based on content type
app.use((req, res, next) => {
  const contentType = res.getHeader('Content-Type');
  if (!contentType || contentType === 'application/octet-stream') {
    // Default to JSON for API routes
    if (req.path.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
  }
  next();
});

// Helper function to fix corrupted Arabic text (UTF-8 bytes misinterpreted as Latin-1)
function fixArabicText(text: any): any {
  if (typeof text !== 'string') return text;
  
  // Check if text contains corrupted Arabic (high bytes indicate Latin-1 misinterpretation)
  // Corrupted Arabic typically has bytes > 127 when it should be valid UTF-8
  try {
    // Try to detect and fix corrupted Arabic text
    const fixed = Buffer.from(text, 'latin1').toString('utf-8');
    // Only use fixed version if it contains valid Arabic Unicode ranges
    if (/[\u0600-\u06FF]/.test(fixed)) {
      return fixed;
    }
  } catch (e) {
    // If conversion fails, return original
  }
  return text;
}

// Middleware to fix Arabic encoding in request bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Intercept JSON responses to fix any corrupted Arabic text
const originalJson = res.json.bind(res);
res.json = function(data: any) {
  // Recursively fix Arabic text in the response data
  const fixData = (obj: any): any => {
    if (typeof obj === 'string') {
      return fixArabicText(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(fixData);
    } else if (obj && typeof obj === 'object') {
      const fixed: any = {};
      for (const key in obj) {
        fixed[key] = fixData(obj[key]);
      }
      return fixed;
    }
    return obj;
  };
  
  return originalJson(fixData(data));
};

// Initialize Gemini client safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// AI Store Design Generator API Endpoint
app.post('/api/gemini/generate-store', async (req, res) => {
  try {
    const { name, category, idea, logo } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'اسم المتجر وتصنيفه مطلوبان' });
    }

    if (!ai) {
      // Fallback with highly customized mock generation if Gemini API key is not active
      console.warn('Gemini API key is missing. Using custom deterministic generator.');
      const fallbackStore = generateDeterministicStore(name, category, idea, logo);
      return res.json(fallbackStore);
    }

    const prompt = `
      المطلوب: تصميم متجر إلكتروني احترافي مخصص بالكامل ومبتكر لمحل باسم "${name}" ينتمي لتصنيف "${category}".
      فكرة المحل وميزاته الإضافية: "${idea || 'متجر راقي يلبي كافة احتياجات الزبائن بأسلوب عصري وضمان عالي'}".
      
      قم بإنشاء هوية بصرية كاملة وتصميم مخصص يشمل:
      1. نظام ألوان متناسق واحترافي (themeColor) يتكون من: اللون الأساسي (primary)، اللون الثانوي (secondary)، ولون الخلفية (background). اختر ألوانًا تلائم الهوية بذكاء.
      2. اختيار التصميم الأنسب (layoutType) من بين: "grid" (للمتاجر العامة والتقنية)، "list" (للخدمات أو المطاعم)، أو "luxury" (للمجوهرات والعطور والأزياء الراقية).
      3. صياغة وصف تسويقي آسر ومبهر للمحل.
      4. قائمة من 3 إلى 4 أقسام داخلية مخصصة (categories) تناسب مجال المحل بدقة.
      5. قائمة من 2 بنر إعلاني تسويقي مذهل (banners)، تحتوي على عناوين وعناوين فرعية مشوقة، وروابط لصور Unsplash فائقة الجودة تطابق التصميم بدقة.
      6. قائمة من 5 إلى 6 منتجات بداية (products) مذهلة متطابقة مع الأقسام والأسعار المنطقية بالريال السعودي (ر.س)، مع أوصاف تسويقية دقيقة وروابط لصور Unsplash حقيقية وفائقة الجمال تعبر عن المنتجات.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `
          أنت مصمم واجهات متاجر ومستشار أعمال ذكي وخبير في تجربة المستخدم والتسويق الرقمي.
          مهمتك هي إنشاء متجر إلكتروني متكامل وجذاب ومصمم خصيصاً ليناسب نمط المتجر المدخل.
          تأكد دائماً من استخدام روابط صور حقيقية ومبهرة من موقع Unsplash (مثل صور هواتف ذكية حقيقية، ملابس عصرية، حلويات شهية، عطور راقية، إلخ) تتوافق تماماً مع السياق.
          يجب أن ترد دائماً باللغة العربية الفصحى الجذابة وبصيغة JSON صالحة تماماً ومطابقة للمخطط المطلوبة.
        `,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['themeColor', 'layoutType', 'description', 'categories', 'banners', 'products'],
          properties: {
            themeColor: {
              type: Type.OBJECT,
              required: ['primary', 'secondary', 'background'],
              properties: {
                primary: { type: Type.STRING, description: 'اللون الأساسي للمتجر بصيغة Hex، مثل #FF5733' },
                secondary: { type: Type.STRING, description: 'اللون الثانوي للمتجر بصيغة Hex' },
                background: { type: Type.STRING, description: 'لون خلفية المتجر بصيغة Hex، يفضل ألوان داكنة مريحة للعين أو بيضاء ناعمة' }
              }
            },
            layoutType: {
              type: Type.STRING,
              enum: ['grid', 'list', 'luxury'],
              description: 'طريقة عرض العناصر المفضلة'
            },
            description: { type: Type.STRING, description: 'وصف تسويقي احترافي مبهر ومتناسق مع المحل' },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'أسماء 3 إلى 4 أقسام مخصصة لمتجر التاجر'
            },
            banners: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['title', 'image'],
                properties: {
                  title: { type: Type.STRING, description: 'العنوان الرئيسي للبナー التسويقي' },
                  subtitle: { type: Type.STRING, description: 'العنوان الفرعي للبينر الإعلاني' },
                  image: { type: Type.STRING, description: 'رابط صورة Unsplash عالية الجودة ومطابقة لموضوع البينر' }
                }
              }
            },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['name', 'price', 'category', 'description', 'image'],
                properties: {
                  name: { type: Type.STRING, description: 'اسم المنتج الاحترافي' },
                  price: { type: Type.NUMBER, description: 'سعر المنتج بالريال السعودي، قيمة رقمية منطقية' },
                  category: { type: Type.STRING, description: 'القسم الذي ينتمي إليه المنتج (يجب أن يكون أحد الأقسام المصممة للمتجر أعلاه)' },
                  description: { type: Type.STRING, description: 'وصف تسويقي دقيق ومفصل للمنتج' },
                  image: { type: Type.STRING, description: 'رابط صورة Unsplash عالية الجودة لتمثيل المنتج الواقعي بدقة' }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || '{}';
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);

  } catch (error: any) {
    console.error('Error generating AI store:', error);
    res.status(500).json({ error: error.message || 'فشل توليد المتجر عبر الذكاء الاصطناعي' });
  }
});

// Helper function to generate high-quality deterministic design if API key is not set
function generateDeterministicStore(name: string, category: string, idea: string, logo: string) {
  let primary = '#D4AF37';
  let secondary = '#1a1a1a';
  let background = '#09090b';
  let layoutType: 'grid' | 'list' | 'luxury' = 'grid';
  let categories: string[] = [];
  let banners: any[] = [];
  let products: any[] = [];
  let description = `${name} - ${idea || 'أفضل المنتجات وأرقى الخدمات بتصميم مميز وخدمة توصيل فورية.'}`;

  if (category.includes('صيانة') || category.includes('هواتف') || category.includes('موبايل')) {
    primary = '#3b82f6'; // Neon Blue
    layoutType = 'grid';
    categories = ['جوالات جديدة', 'صيانة فورية شاشات', 'إكسسوارات وشواحن أصلية'];
    banners = [
      { title: 'أسرع خدمة صيانة فورية وشاشات بديلة', subtitle: 'قطع غيار أصلية وضمان معتمد يصل لـ 6 أشهر', image: 'https://images.unsplash.com/photo-1601524909162-be87252be298?q=80&w=1200&h=400&fit=crop' },
      { title: 'جديد جوالات هذا الموسم والتقنيات الذكية', subtitle: 'توصيل فوري ودفع آمن ومحفظة فودافون متوفرة', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&h=400&fit=crop' }
    ];
    products = [
      { name: 'آيفون 15 برو ماكس 256 جيجا تيتانيوم', price: 4899, category: 'جوالات جديدة', description: 'أقوى أداء وأحدث كاميرا مع شريحة A17 Pro الجبارة للسرعة والألعاب.', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&h=600&fit=crop' },
      { name: 'شاحن أنكر نانو ذكي بقوة 65 واط شحن فوري', price: 149, category: 'إكسسوارات وشواحن أصلية', description: 'شاحن صغير للغاية يدعم التقنية الذكية لحماية البطارية وشحن أسرع بـ 3 مرات.', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&h=600&fit=crop' },
      { name: 'خدمة تبديل شاشة آيفون أصلية سوبر أموليد', price: 799, category: 'صيانة فورية شاشات', description: 'صيانة فورية على أيدي أمهر المهندسين في أقل من 30 دقيقة مع ضمان معتمد.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&h=600&fit=crop' }
    ];
  } else if (category.includes('ملابس') || category.includes('أزياء') || category.includes('موضة')) {
    primary = '#c084fc'; // Elegant Purple
    layoutType = 'luxury';
    categories = ['رجالي شتوي كلاسيكي', 'عبايات وأزياء نسائية فاخرة', 'أحذية ومكملات جلديّة'];
    banners = [
      { title: 'تألق بأرقى تشكيلات الموضة الكلاسيكية العصرية', subtitle: 'خامات إيطالية فاخرة تناسب تطلعاتك', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&h=400&fit=crop' },
      { title: 'العباية الملكية والزخارف الراقية للجمال', subtitle: 'خصومات تصل لـ 30% بمناسبة الافتتاح', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&h=400&fit=crop' }
    ];
    products = [
      { name: 'ثوب سعودي مطرز شتوي فاخر جداً', price: 350, category: 'رجالي شتوي كلاسيكي', description: 'ثوب كلاسيكي دافئ منسوج من الصوف الفاخر والخيوط الألمانية المقاومة للتجعد.', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=600&h=600&fit=crop' },
      { name: 'بشت ملكي أسود زري ذهبي فاخر صناعة سورية', price: 950, category: 'رجالي شتوي كلاسيكي', description: 'بشت فاخر مطرز يدوياً بأرقى خيوط الذهب الفرنسي لإطلالة ملكية في كافة المناسبات.', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&h=600&fit=crop' },
      { name: 'حذاء جلدي كلاسيكي إيطالي صناعة يدوية', price: 299, category: 'أحذية ومكملات جلديّة', description: 'مصنوع بالكامل من جلد الطبيعي المعالج والمريح للقدمين مع نعل طبي مانع للانزلاق.', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&h=600&fit=crop' }
    ];
  } else if (category.includes('مطاعم') || category.includes('حلويات') || category.includes('كيك')) {
    primary = '#fbbf24'; // Amber Sweet
    layoutType = 'grid';
    categories = ['قوالب كيك أعياد ميلاد', 'حلويات شرقية مشكلة', 'برجر مشوي على الفحم'];
    banners = [
      { title: 'قوالب كيك مخصصة ومطرزة بالحب لمناسباتكم السعيدة', subtitle: 'طعم لا يقاوم ومكونات طازجة 100%', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&h=400&fit=crop' },
      { title: 'البرجر الملكي المشوي بالفحم والصلصات الخاصة بـ MIX', subtitle: 'اطلب الآن عبر الفون لتصلك ساخنة وفريش', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&h=400&fit=crop' }
    ];
    products = [
      { name: 'قالب كيك الشوكولاتة والكراميل الملكي العملاق', price: 180, category: 'قوالب كيك أعياد ميلاد', description: 'كيك الشوكولاتة البلجيكية الغنية مع طبقات الكراميل والمكسرات الفاخرة المحمصة.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&h=600&fit=crop' },
      { name: 'علبة حلويات شرقية مشكلة بالفستق واللوز', price: 95, category: 'حلويات شرقية مشكلة', description: 'تشكيلة رائعة من البقلاوة والبورمة والغرّيبة الغنية بالسمن البلدي والمكسرات الطازجة.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&h=600&fit=crop' },
      { name: 'وجبة همبرغر لحم بقري دبل مشوي بالفحم مع الجبنة', price: 45, category: 'برجر مشوي على الفحم', description: 'قطعتين من اللحم البلدي المشوي، جبن شيدر ذائب، خس طازج، وصلصة سرية مذهلة.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&h=600&fit=crop' }
    ];
  } else {
    // Default luxury/general mix
    primary = '#D4AF37'; // Gold
    layoutType = 'luxury';
    categories = ['الدهن العود والمسك', 'ساعات يد كلاسيكية', 'باقات ورود طبيعية جوري'];
    banners = [
      { title: 'أرقى دهن عود وبخور ملكي في العالم العربي', subtitle: 'نقاء الطبيعة والتقاليد العريقة تحت سقف واحد', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&h=400&fit=crop' },
      { title: 'باقات جوري مبهجة مخصصة للإهداء وتزيين منزلك', subtitle: 'أزهار طازجة نقطفها بحب وننسقها باحترافية', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=1200&h=400&fit=crop' }
    ];
    products = [
      { name: 'دهن العود الكمبودي المعتق الملكي الفاخر', price: 450, category: 'الدهن العود والمسك', description: 'رائحة بخورية عميقة تدوم لأيام، معبأ في تولة كريستالية فاخرة للإهداء الراقي.', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&h=600&fit=crop' },
      { name: 'ساعة رولكس كلاسيك الفاخرة بحزام ذهبي مقاوم للصدأ', price: 12500, category: 'ساعات يد كلاسيكية', description: 'ساعة يد سويسرية الصنع، حركة أوتوماتيكية دقيقة، زجاج ياقوتي مقاوم للخدوش والتآكل.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&h=600&fit=crop' },
      { name: 'باقة ورود جوري حمراء مغلفة كلاسيكياً', price: 120, category: 'باقات ورود طبيعية جوري', description: 'باقة من 20 وردة جوري حمراء نضرة، منسقة ومغلفة بأناقة لتسعد قلب من تحب.', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=600&h=600&fit=crop' }
    ];
  }

  return {
    themeColor: { primary, secondary, background },
    layoutType,
    description,
    categories,
    banners,
    products
  };
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        // Ensure proper charset for HTML files
        if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
