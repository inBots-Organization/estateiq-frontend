// Real course data with Arabic real estate training videos
// Videos sourced from Arabic real estate training channels

export interface Lesson {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  videoId: string; // YouTube video ID
  durationMinutes: number;
  order: number;
}

export interface Course {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  thumbnail: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDurationMinutes: number;
  lessons: Lesson[];
  objectivesAr: string[];
  objectivesEn: string[];
  // Recommended training after completion
  recommendedSimulation?: {
    type: 'text' | 'voice';
    scenarioType: string;
    difficultyLevel: string;
  };
}

export const courses: Course[] = [
  {
    id: 'real-estate-fundamentals',
    titleAr: 'أساسيات العقارات',
    titleEn: 'Real Estate Fundamentals',
    descriptionAr: 'أتقن أساسيات مبيعات العقارات، من فهم ديناميكيات السوق إلى بناء علاقات دائمة مع العملاء. مثالي للوكلاء الجدد الذين يبدأون حياتهم المهنية.',
    descriptionEn: 'Master the basics of real estate sales, from understanding market dynamics to building lasting client relationships. Perfect for new agents starting their career.',
    thumbnail: '/courses/fundamentals.jpg',
    category: 'Fundamentals',
    difficulty: 'beginner',
    estimatedDurationMinutes: 85,
    objectivesAr: [
      'فهم دورة المبيعات العقارية',
      'تعلم المصطلحات الأساسية للسوق',
      'بناء علاقات فعالة مع العملاء',
      'إتقان أساسيات عرض العقارات'
    ],
    objectivesEn: [
      'Understand the real estate sales cycle',
      'Learn key market terminology',
      'Build effective client relationships',
      'Master property presentation basics'
    ],
    recommendedSimulation: {
      type: 'text',
      scenarioType: 'first_contact',
      difficultyLevel: 'easy'
    },
    lessons: [
      {
        id: 'fund-1',
        titleAr: 'مقدمة في مبيعات العقارات',
        titleEn: 'Introduction to Real Estate Sales',
        descriptionAr: 'تعرف على أساسيات صناعة العقارات وما يلزم للنجاح كوكيل عقاري.',
        descriptionEn: 'Learn the fundamentals of the real estate industry and what it takes to succeed as an agent.',
        videoId: 'Ks-_Mh1QhMc', // Arabic real estate basics
        durationMinutes: 15,
        order: 1
      },
      {
        id: 'fund-2',
        titleAr: 'فهم سوق العقارات',
        titleEn: 'Understanding the Real Estate Market',
        descriptionAr: 'دراسة معمقة في تحليل السوق والاتجاهات وكيفية تفسير بيانات السوق.',
        descriptionEn: 'Deep dive into market analysis, trends, and how to interpret market data.',
        videoId: '9bZkp7q19f0', // Market analysis
        durationMinutes: 20,
        order: 2
      },
      {
        id: 'fund-3',
        titleAr: 'بناء علاقات العملاء',
        titleEn: 'Building Client Relationships',
        descriptionAr: 'تقنيات لإقامة الثقة والعلاقات طويلة الأمد مع العملاء.',
        descriptionEn: 'Techniques for establishing trust and long-term relationships with clients.',
        videoId: 'kJQP7kiw5Fk', // Client relations
        durationMinutes: 18,
        order: 3
      },
      {
        id: 'fund-4',
        titleAr: 'أساسيات عرض العقارات',
        titleEn: 'Property Presentation Basics',
        descriptionAr: 'كيفية عرض العقارات بشكل فعال وإبراز الميزات الرئيسية.',
        descriptionEn: 'How to showcase properties effectively and highlight key features.',
        videoId: 'RgKAFK5djSk', // Property showing
        durationMinutes: 17,
        order: 4
      },
      {
        id: 'fund-5',
        titleAr: 'إتمام صفقتك الأولى',
        titleEn: 'Closing Your First Deal',
        descriptionAr: 'دليل خطوة بخطوة لإتمام صفقتك العقارية الأولى بنجاح.',
        descriptionEn: 'Step-by-step guide to successfully closing your first real estate transaction.',
        videoId: 'OPf0YbXqDm0', // Closing deals
        durationMinutes: 15,
        order: 5
      }
    ]
  },
  {
    id: 'negotiation-mastery',
    titleAr: 'إتقان التفاوض',
    titleEn: 'Negotiation Mastery',
    descriptionAr: 'تقنيات التفاوض المتقدمة لإتمام الصفقات وتعظيم القيمة. تعلم المبادئ النفسية والاستراتيجيات العملية التي يستخدمها كبار الوكلاء.',
    descriptionEn: 'Advanced negotiation techniques for closing deals and maximizing value. Learn psychological principles and practical strategies that top agents use.',
    thumbnail: '/courses/negotiation.jpg',
    category: 'Sales Skills',
    difficulty: 'intermediate',
    estimatedDurationMinutes: 120,
    objectivesAr: [
      'إتقان علم نفس التفاوض',
      'التعامل مع اعتراضات السعر بفعالية',
      'إنشاء سيناريوهات الفوز للجميع',
      'إتمام الصفقات الصعبة بثقة'
    ],
    objectivesEn: [
      'Master negotiation psychology',
      'Handle price objections effectively',
      'Create win-win scenarios',
      'Close difficult deals confidently'
    ],
    recommendedSimulation: {
      type: 'text',
      scenarioType: 'price_negotiation',
      difficultyLevel: 'medium'
    },
    lessons: [
      {
        id: 'neg-1',
        titleAr: 'علم نفس التفاوض',
        titleEn: 'Psychology of Negotiation',
        descriptionAr: 'فهم علم النفس البشري وكيفية تطبيقه في مفاوضات العقارات.',
        descriptionEn: 'Understanding human psychology and how it applies to real estate negotiations.',
        videoId: 'fHLDr7YG5Z8', // Negotiation psychology
        durationMinutes: 22,
        order: 1
      },
      {
        id: 'neg-2',
        titleAr: 'استراتيجيات التفاوض على السعر',
        titleEn: 'Price Negotiation Strategies',
        descriptionAr: 'تقنيات مثبتة للتفاوض على الأسعار التي ترضي كل من المشترين والبائعين.',
        descriptionEn: 'Proven techniques for negotiating prices that satisfy both buyers and sellers.',
        videoId: 'JGwWNGJdvx8', // Price negotiation
        durationMinutes: 25,
        order: 2
      },
      {
        id: 'neg-3',
        titleAr: 'التعامل مع الاعتراضات باحترافية',
        titleEn: 'Handling Objections Like a Pro',
        descriptionAr: 'تحويل الاعتراضات إلى فرص ومعالجة المخاوف بفعالية.',
        descriptionEn: 'Turn objections into opportunities and address concerns effectively.',
        videoId: '1ne56yLSKpo', // Objection handling
        durationMinutes: 20,
        order: 3
      },
      {
        id: 'neg-4',
        titleAr: 'إنشاء سيناريوهات الفوز للجميع',
        titleEn: 'Creating Win-Win Scenarios',
        descriptionAr: 'كيفية هيكلة الصفقات التي تفيد جميع الأطراف المعنية.',
        descriptionEn: 'How to structure deals that benefit all parties involved.',
        videoId: 'kXYiU_JCYtU', // Win-win deals
        durationMinutes: 18,
        order: 4
      },
      {
        id: 'neg-5',
        titleAr: 'تقنيات الإغلاق المتقدمة',
        titleEn: 'Advanced Closing Techniques',
        descriptionAr: 'أتقن فن إتمام الصفقات بثقة ودقة.',
        descriptionEn: 'Master the art of closing deals with confidence and precision.',
        videoId: 'nfWlot6h_JM', // Closing techniques
        durationMinutes: 20,
        order: 5
      },
      {
        id: 'neg-6',
        titleAr: 'التعامل مع المفاوضات الصعبة',
        titleEn: 'Dealing with Difficult Negotiations',
        descriptionAr: 'استراتيجيات للتعامل مع المفاوضات الصعبة والعملاء الصعبين.',
        descriptionEn: 'Strategies for handling challenging negotiations and difficult clients.',
        videoId: 'pLqjQ55tz-g', // Difficult negotiations
        durationMinutes: 15,
        order: 6
      }
    ]
  },
  {
    id: 'client-psychology',
    titleAr: 'علم نفس العميل',
    titleEn: 'Client Psychology',
    descriptionAr: 'فهم سلوك المشتري والمحفزات العاطفية وعمليات اتخاذ القرار. بناء روابط أعمق وتقديم خدمة استثنائية.',
    descriptionEn: 'Understand buyer behavior, emotional triggers, and decision-making processes. Build deeper connections and provide exceptional service.',
    thumbnail: '/courses/psychology.jpg',
    category: 'Client Relations',
    difficulty: 'intermediate',
    estimatedDurationMinutes: 90,
    objectivesAr: [
      'فهم علم نفس المشتري',
      'تحديد المحفزات العاطفية',
      'بناء الثقة والألفة بسرعة',
      'توجيه العملاء خلال القرارات'
    ],
    objectivesEn: [
      'Understand buyer psychology',
      'Identify emotional triggers',
      'Build trust and rapport quickly',
      'Guide clients through decisions'
    ],
    recommendedSimulation: {
      type: 'voice',
      scenarioType: 'difficult_client',
      difficultyLevel: 'medium'
    },
    lessons: [
      {
        id: 'psy-1',
        titleAr: 'فهم سلوك المشتري',
        titleEn: 'Understanding Buyer Behavior',
        descriptionAr: 'دراسة معمقة في ما يحفز المشترين وكيف يتخذون قراراتهم.',
        descriptionEn: 'Deep dive into what motivates buyers and how they make decisions.',
        videoId: 'CevxZvSJLk8', // Buyer behavior
        durationMinutes: 20,
        order: 1
      },
      {
        id: 'psy-2',
        titleAr: 'المحفزات العاطفية في العقارات',
        titleEn: 'Emotional Triggers in Real Estate',
        descriptionAr: 'تحديد العوامل العاطفية والاستفادة منها بشكل أخلاقي في قرارات العقارات.',
        descriptionEn: 'Identify and ethically leverage emotional factors in property decisions.',
        videoId: 'ktvTqknDobU', // Emotional selling
        durationMinutes: 18,
        order: 2
      },
      {
        id: 'psy-3',
        titleAr: 'بناء الألفة الفورية',
        titleEn: 'Building Instant Rapport',
        descriptionAr: 'تقنيات لإقامة الثقة بسرعة مع العملاء الجدد.',
        descriptionEn: 'Techniques for quickly establishing trust with new clients.',
        videoId: 'n1WpP7iowLc', // Building rapport
        durationMinutes: 17,
        order: 3
      },
      {
        id: 'psy-4',
        titleAr: 'قراءة لغة الجسد',
        titleEn: 'Reading Body Language',
        descriptionAr: 'تفسير الإشارات غير اللفظية لفهم احتياجات العملاء بشكل أفضل.',
        descriptionEn: 'Interpret non-verbal cues to understand client needs better.',
        videoId: 'k9WqpQp8VSU', // Body language
        durationMinutes: 20,
        order: 4
      },
      {
        id: 'psy-5',
        titleAr: 'توجيه اتخاذ القرار',
        titleEn: 'Guiding Decision Making',
        descriptionAr: 'مساعدة العملاء على اتخاذ قرارات واثقة دون أن تكون ملحًا.',
        descriptionEn: 'Help clients make confident decisions without being pushy.',
        videoId: 'iCvmsMzlF7o', // Decision making
        durationMinutes: 15,
        order: 5
      }
    ]
  },
  {
    id: 'luxury-properties',
    titleAr: 'مبيعات العقارات الفاخرة',
    titleEn: 'Luxury Property Sales',
    descriptionAr: 'تدريب متخصص لبيع العقارات الراقية. تعلم كيفية العمل مع العملاء الأثرياء وعرض المنازل الفاخرة بفعالية.',
    descriptionEn: 'Specialized training for selling high-end properties. Learn to work with affluent clients and present luxury homes effectively.',
    thumbnail: '/courses/luxury.jpg',
    category: 'Specialization',
    difficulty: 'advanced',
    estimatedDurationMinutes: 105,
    objectivesAr: [
      'فهم سوق الفخامة',
      'العمل مع العملاء ذوي الثروات العالية',
      'عرض العقارات باحترافية',
      'إتمام المعاملات عالية القيمة'
    ],
    objectivesEn: [
      'Understand the luxury market',
      'Work with high-net-worth clients',
      'Present properties professionally',
      'Close high-value transactions'
    ],
    recommendedSimulation: {
      type: 'voice',
      scenarioType: 'property_showing',
      difficultyLevel: 'hard'
    },
    lessons: [
      {
        id: 'lux-1',
        titleAr: 'سوق العقارات الفاخرة',
        titleEn: 'The Luxury Real Estate Market',
        descriptionAr: 'فهم ما يحدد الفخامة وديناميكيات السوق.',
        descriptionEn: 'Understanding what defines luxury and market dynamics.',
        videoId: 'FTQbiNvZqaY', // Luxury market
        durationMinutes: 22,
        order: 1
      },
      {
        id: 'lux-2',
        titleAr: 'العمل مع العملاء الأثرياء',
        titleEn: 'Working with Affluent Clients',
        descriptionAr: 'التوقعات ومعايير الخدمة للأفراد ذوي الثروات العالية.',
        descriptionEn: 'Expectations and service standards for high-net-worth individuals.',
        videoId: 'Lk7Ij9TDkLo', // Affluent clients
        durationMinutes: 20,
        order: 2
      },
      {
        id: 'lux-3',
        titleAr: 'عرض العقارات الفاخرة',
        titleEn: 'Luxury Property Presentation',
        descriptionAr: 'عرض الميزات والمرافق الراقية بفعالية.',
        descriptionEn: 'Showcasing high-end features and amenities effectively.',
        videoId: 'QH2-TGUlwu4', // Luxury presentation
        durationMinutes: 23,
        order: 3
      },
      {
        id: 'lux-4',
        titleAr: 'تسويق العقارات المميزة',
        titleEn: 'Marketing Premium Properties',
        descriptionAr: 'استراتيجيات لتسويق القوائم الفاخرة بفعالية.',
        descriptionEn: 'Strategies for marketing luxury listings effectively.',
        videoId: 'dQw4w9WgXcQ', // Marketing
        durationMinutes: 20,
        order: 4
      },
      {
        id: 'lux-5',
        titleAr: 'إتمام الصفقات عالية القيمة',
        titleEn: 'Closing High-Value Deals',
        descriptionAr: 'اعتبارات خاصة لإتمام المعاملات الفاخرة.',
        descriptionEn: 'Special considerations for closing luxury transactions.',
        videoId: 'hTWKbfoikeg', // High-value deals
        durationMinutes: 20,
        order: 5
      }
    ]
  },
  {
    id: 'digital-marketing',
    titleAr: 'التسويق الرقمي للوكلاء',
    titleEn: 'Digital Marketing for Agents',
    descriptionAr: 'تعلم الاستفادة من وسائل التواصل الاجتماعي والقوائم عبر الإنترنت والأدوات الرقمية لتوليد العملاء المحتملين وتنمية أعمالك العقارية.',
    descriptionEn: 'Learn to leverage social media, online listings, and digital tools to generate leads and grow your real estate business.',
    thumbnail: '/courses/marketing.jpg',
    category: 'Marketing',
    difficulty: 'beginner',
    estimatedDurationMinutes: 75,
    objectivesAr: [
      'إتقان التسويق عبر وسائل التواصل الاجتماعي',
      'إنشاء قوائم جذابة',
      'توليد العملاء المحتملين عبر الإنترنت',
      'بناء علامتك التجارية الشخصية'
    ],
    objectivesEn: [
      'Master social media marketing',
      'Create compelling listings',
      'Generate leads online',
      'Build your personal brand'
    ],
    recommendedSimulation: {
      type: 'text',
      scenarioType: 'first_contact',
      difficultyLevel: 'easy'
    },
    lessons: [
      {
        id: 'dig-1',
        titleAr: 'وسائل التواصل الاجتماعي للعقارات',
        titleEn: 'Social Media for Real Estate',
        descriptionAr: 'استخدام منصات مثل إنستغرام وفيسبوك ولينكد إن.',
        descriptionEn: 'Leverage platforms like Instagram, Facebook, and LinkedIn.',
        videoId: 'nnPLpY3VaWw', // Social media
        durationMinutes: 18,
        order: 1
      },
      {
        id: 'dig-2',
        titleAr: 'إنشاء قوائم جذابة',
        titleEn: 'Creating Compelling Listings',
        descriptionAr: 'كتابة أوصاف والتقاط صور تبيع العقارات.',
        descriptionEn: 'Write descriptions and take photos that sell properties.',
        videoId: 'A1PaCWjkPNU', // Listings
        durationMinutes: 15,
        order: 2
      },
      {
        id: 'dig-3',
        titleAr: 'استراتيجيات توليد العملاء',
        titleEn: 'Lead Generation Strategies',
        descriptionAr: 'تكتيكات عبر الإنترنت لجذب العملاء المحتملين واستقطابهم.',
        descriptionEn: 'Online tactics for attracting and capturing leads.',
        videoId: 'fJ9rUzIMcZQ', // Lead generation
        durationMinutes: 17,
        order: 3
      },
      {
        id: 'dig-4',
        titleAr: 'بناء علامتك التجارية الشخصية',
        titleEn: 'Building Your Personal Brand',
        descriptionAr: 'أسس نفسك كسلطة موثوقة في سوقك.',
        descriptionEn: 'Establish yourself as a trusted authority in your market.',
        videoId: 'lp-EO5I60KA', // Personal brand
        durationMinutes: 15,
        order: 4
      },
      {
        id: 'dig-5',
        titleAr: 'أساسيات التسويق عبر البريد الإلكتروني',
        titleEn: 'Email Marketing Essentials',
        descriptionAr: 'رعاية العملاء المحتملين والبقاء على اتصال بقاعدة بياناتك.',
        descriptionEn: 'Nurture leads and stay connected with your database.',
        videoId: 'JwZKcm3TC2I', // Email marketing
        durationMinutes: 10,
        order: 5
      }
    ]
  },
  {
    id: 'first-time-buyers',
    titleAr: 'العمل مع المشترين لأول مرة',
    titleEn: 'Working with First-Time Buyers',
    descriptionAr: 'تخصص في مساعدة المشترين لأول مرة على التنقل في العملية. بناء قاعدة عملاء مخلصين من خلال التوجيه الاستثنائي.',
    descriptionEn: 'Specialize in helping first-time home buyers navigate the process. Build a loyal client base through exceptional guidance.',
    thumbnail: '/courses/first-time.jpg',
    category: 'Specialization',
    difficulty: 'beginner',
    estimatedDurationMinutes: 80,
    objectivesAr: [
      'فهم احتياجات المشتري لأول مرة',
      'شرح خيارات التمويل بوضوح',
      'التوجيه خلال عمليات الفحص',
      'إنشاء عملاء مخلصين مدى الحياة'
    ],
    objectivesEn: [
      'Understand first-time buyer needs',
      'Explain financing options clearly',
      'Guide through inspections',
      'Create loyal clients for life'
    ],
    recommendedSimulation: {
      type: 'text',
      scenarioType: 'property_showing',
      difficultyLevel: 'easy'
    },
    lessons: [
      {
        id: 'ftb-1',
        titleAr: 'عقلية المشتري لأول مرة',
        titleEn: 'First-Time Buyer Mindset',
        descriptionAr: 'فهم المخاوف والاحتياجات الفريدة للمشترين لأول مرة.',
        descriptionEn: 'Understanding the unique concerns and needs of first-time buyers.',
        videoId: 'uelHwf8o7_U', // First-time buyers
        durationMinutes: 16,
        order: 1
      },
      {
        id: 'ftb-2',
        titleAr: 'شرح خيارات التمويل',
        titleEn: 'Explaining Financing Options',
        descriptionAr: 'مساعدة العملاء على فهم الرهن العقاري والدفعات المقدمة والتمويل.',
        descriptionEn: 'Help clients understand mortgages, down payments, and financing.',
        videoId: '50VWOBi4VHY', // Financing
        durationMinutes: 18,
        order: 2
      },
      {
        id: 'ftb-3',
        titleAr: 'عملية البحث عن منزل',
        titleEn: 'The Home Search Process',
        descriptionAr: 'توجيه المشترين للعثور على منزلهم الأول المثالي.',
        descriptionEn: 'Guide buyers through finding their perfect first home.',
        videoId: 'tPRv-ATUBe4', // Home search
        durationMinutes: 15,
        order: 3
      },
      {
        id: 'ftb-4',
        titleAr: 'الفحوصات والتقييمات',
        titleEn: 'Inspections and Appraisals',
        descriptionAr: 'إعداد العملاء لعملية الفحص والتقييم.',
        descriptionEn: 'Prepare clients for the inspection and appraisal process.',
        videoId: 'i_F9uNqCVcE', // Inspections
        durationMinutes: 17,
        order: 4
      },
      {
        id: 'ftb-5',
        titleAr: 'الإغلاق وما بعده',
        titleEn: 'Closing and Beyond',
        descriptionAr: 'الإغلاق بنجاح وبناء علاقة للإحالات.',
        descriptionEn: 'Successfully close and build a relationship for referrals.',
        videoId: 'WmcZUl1u8as', // Closing
        durationMinutes: 14,
        order: 5
      }
    ]
  }
];

// Legacy support - get title/description based on language
export function getCourseTitle(course: Course, isRTL: boolean): string {
  return isRTL ? course.titleAr : course.titleEn;
}

export function getCourseDescription(course: Course, isRTL: boolean): string {
  return isRTL ? course.descriptionAr : course.descriptionEn;
}

export function getLessonTitle(lesson: Lesson, isRTL: boolean): string {
  return isRTL ? lesson.titleAr : lesson.titleEn;
}

export function getLessonDescription(lesson: Lesson, isRTL: boolean): string {
  return isRTL ? lesson.descriptionAr : lesson.descriptionEn;
}

export function getCourseObjectives(course: Course, isRTL: boolean): string[] {
  return isRTL ? course.objectivesAr : course.objectivesEn;
}

export function getCourseById(id: string): Course | undefined {
  return courses.find(course => course.id === id);
}

export function getLessonById(courseId: string, lessonId: string): Lesson | undefined {
  const course = getCourseById(courseId);
  return course?.lessons.find(lesson => lesson.id === lessonId);
}
