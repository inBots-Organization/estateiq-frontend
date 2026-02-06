'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Language System for the Platform
 *
 * Provides:
 * - Global language state (Arabic/English)
 * - Complete translations for all UI text
 * - Language-specific configurations for STT, TTS, LLM
 * - RTL/LTR direction management
 */

export type Language = 'ar' | 'en';

interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  dir: 'rtl' | 'ltr';
  sttLocale: string;
  ttsVoice: string;
  ttsModel: string;
}

export const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  ar: {
    code: 'ar',
    name: 'Arabic (Saudi)',
    nativeName: 'العربية',
    dir: 'rtl',
    sttLocale: 'ar-SA',
    ttsVoice: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_AR || 'yXEnnEln9armDCyhkXcA',
    ttsModel: 'eleven_multilingual_v2',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    sttLocale: 'en-US',
    ttsVoice: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_EN || 'EXAVITQu4vr4xnSDxMaL',
    ttsModel: 'eleven_turbo_v2_5',
  },
};

// Complete Translations Interface
interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    back: string;
    next: string;
    save: string;
    close: string;
    search: string;
    filter: string;
    all: string;
    none: string;
    view: string;
    edit: string;
    delete: string;
    create: string;
    submit: string;
    reset: string;
    continue: string;
    start: string;
    stop: string;
    pause: string;
    resume: string;
    retry: string;
    skip: string;
    finish: string;
    complete: string;
    incomplete: string;
    active: string;
    inactive: string;
    enabled: string;
    disabled: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    today: string;
    yesterday: string;
    noResults: string;
    showMore: string;
    showLess: string;
  };

  // Auth
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    signingIn: string;
    login: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    email: string;
    emailAddress: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    fullName: string;
    rememberMe: string;
    welcomeBack: string;
    continueJourney: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    newToPlatform: string;
    termsAgree: string;
    termsOfService: string;
    privacyPolicy: string;
    loginSuccess: string;
    loginFailed: string;
    registerSuccess: string;
    invalidCredentials: string;
    passwordMismatch: string;
    passwordRequirements: string;
    emailRequired: string;
    passwordRequired: string;
    heroTitle: string;
    heroDescription: string;
    traineesCount: string;
    successRate: string;
    poweredBy: string;
    // Register page
    startJourney: string;
    joinThousands: string;
    createYourAccount: string;
    startTrainingJourney: string;
    creatingAccount: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    passwordStrong: string;
    confirmPasswordPlaceholder: string;
    freeTrialNoCreditCard: string;
    byCreatingAccount: string;
    // Benefits
    benefitAIPractice: string;
    benefitFeedback: string;
    benefitAnalytics: string;
    benefitOwnPace: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    dashboardDesc: string;
    courses: string;
    coursesDesc: string;
    simulations: string;
    simulationsDesc: string;
    voicePractice: string;
    voicePracticeDesc: string;
    realtimeCall: string;
    realtimeCallDesc: string;
    aiTeacher: string;
    aiTeacherDesc: string;
    reports: string;
    reportsDesc: string;
    admin: string;
    settings: string;
    profile: string;
    help: string;
    home: string;
  };

  // Landing Page
  landing: {
    brandName: string;

    // Navigation
    nav: {
      features: string;
      howItWorks: string;
      testimonials: string;
      pricing: string;
      signIn: string;
      getStarted: string;
    };

    // Hero
    hero: {
      badge: string;
      titlePart1: string;
      titleHighlight: string;
      description: string;
      startFreeTrial: string;
      watchDemo: string;
      noCreditCard: string;
      freeTrial: string;
      cancelAnytime: string;
    };

    // Stats
    stats: {
      activeTrainees: string;
      successRate: string;
      sessionsCompleted: string;
      userRating: string;
    };

    // Features
    features: {
      title: string;
      subtitle: string;
      aiSimulations: { title: string; description: string };
      voiceCalls: { title: string; description: string };
      analytics: { title: string; description: string };
      courses: { title: string; description: string };
      certifications: { title: string; description: string };
      bilingual: { title: string; description: string };
    };

    // How It Works
    howItWorks: {
      title: string;
      subtitle: string;
      step1: { title: string; description: string };
      step2: { title: string; description: string };
      step3: { title: string; description: string };
    };

    // Testimonials
    testimonials: {
      title: string;
      subtitle: string;
      items: Array<{
        quote: string;
        name: string;
        role: string;
        initials: string;
      }>;
    };

    // Pricing
    pricing: {
      title: string;
      subtitle: string;
      perMonth: string;
      mostPopular: string;
      getStarted: string;
      startTrial: string;
      contactSales: string;
      free: {
        name: string;
        description: string;
        price: string;
        features: string[];
      };
      pro: {
        name: string;
        description: string;
        price: string;
        features: string[];
      };
      enterprise: {
        name: string;
        description: string;
        price: string;
        features: string[];
      };
    };

    // CTA
    cta: {
      title: string;
      description: string;
      button: string;
    };

    // Footer
    footer: {
      description: string;
      product: string;
      company: string;
      legal: string;
      courses: string;
      simulations: string;
      about: string;
      blog: string;
      careers: string;
      contact: string;
      privacy: string;
      terms: string;
      cookies: string;
      allRightsReserved: string;
    };
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    welcome: string;
    continueJourney: string;
    overallProgress: string;
    averageScore: string;
    currentStreak: string;
    timeInvested: string;
    thisWeek: string;
    acrossAssessments: string;
    keepItGoing: string;
    minutesTotal: string;
    days: string;
    continueLearning: string;
    pickUpWhereYouLeft: string;
    negotiationFundamentals: string;
    module3: string;
    complete: string;
    continueCourse: string;
    practiceSimulations: string;
    sharpenSkills: string;
    recommendedScenario: string;
    priceNegotiation: string;
    basedOnPerformance: string;
    startSimulation: string;
    voicePractice: string;
    practiceWithAI: string;
    realtimeConversation: string;
    voiceCallDescription: string;
    newFeature: string;
    startVoiceCall: string;
    yourProgress: string;
    viewDetailedAnalytics: string;
    simulations: string;
    courses: string;
    voiceCalls: string;
    avgScore: string;
    viewReports: string;
  };

  // Courses
  courses: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    allLevels: string;
    coursesAvailable: string;
    hours: string;
    minutes: string;
    categories: {
      fundamentals: string;
      salesSkills: string;
      clientRelations: string;
      specialization: string;
      marketing: string;
    };
    difficulty: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
    noCourses: string;
    adjustFilters: string;
    startLearning: string;
    continueLearning: string;
    completed: string;
    inProgress: string;
    notStarted: string;
    lessons: string;
    duration: string;
    enrolled: string;
    progress: string;
    certificate: string;
    courseDetails: string;
    whatYouLearn: string;
    requirements: string;
    description: string;
    instructor: string;
    reviews: string;
    relatedCourses: string;
  };

  // Simulations
  simulations: {
    title: string;
    subtitle: string;
    chooseScenario: string;
    chooseMode: string;
    selectModeDescription: string;
    chatMode: string;
    voiceMode: string;
    chatModeDescription: string;
    voiceModeDescription: string;
    voiceCallInArabic: string;
    backToScenarios: string;
    scenarios: {
      propertyShowing: string;
      priceNegotiation: string;
      objectionHandling: string;
      firstContact: string;
      closingDeal: string;
      difficultClient: string;
    };
    scenarioDescriptions: {
      propertyShowing: string;
      priceNegotiation: string;
      objectionHandling: string;
      firstContact: string;
      closingDeal: string;
      difficultClient: string;
    };
    difficulty: {
      easy: string;
      medium: string;
      hard: string;
    };
    difficultyLevel: string;
    startSimulation: string;
    configureSession: string;
    selected: string;
    starting: string;
    endSimulation: string;
    simulationComplete: string;
    yourScore: string;
    feedback: string;
    strengths: string;
    improvements: string;
    tryAgain: string;
    nextScenario: string;
    viewDetailedReport: string;
    timeElapsed: string;
    messagesExchanged: string;
    clientSentiment: string;
    positive: string;
    neutral: string;
    negative: string;
  };

  // Voice Call
  voiceCall: {
    title: string;
    subtitle: string;
    startCall: string;
    endCall: string;
    connecting: string;
    listening: string;
    speaking: string;
    thinking: string;
    tapToSpeak: string;
    tapToInterrupt: string;
    callEnded: string;
    duration: string;
    messages: string;
    summary: string;
    performance: string;
    tryAgain: string;
    micPermissionError: string;
    didntHear: string;
    pleaseRepeat: string;
    stillThere: string;
    callInProgress: string;
    preparing: string;
    ready: string;
    // New fields for realtime-call
    evaluation: string;
    overallScore: string;
    communication: string;
    knowledge: string;
    professionalism: string;
    engagement: string;
    strengths: string;
    areasToImprove: string;
    userSpeaking: string;
  };

  // Scenarios
  scenarios: {
    selectScenario: string;
    selectDescription: string;
    propertyShowing: string;
    propertyShowingDesc: string;
    priceNegotiation: string;
    priceNegotiationDesc: string;
    firstContact: string;
    firstContactDesc: string;
    objectionHandling: string;
    objectionHandlingDesc: string;
    closingDeal: string;
    closingDealDesc: string;
  };

  // Reports
  reports: {
    title: string;
    subtitle: string;
    totalSessions: string;
    averageScore: string;
    improvement: string;
    topSkill: string;
    skillPerformance: string;
    scoreProgression: string;
    sessionHistory: string;
    allSessions: string;
    recommendations: string;
    focusAreas: string;
    suggestedCourses: string;
    exportReport: string;
    dateRange: string;
    lastWeek: string;
    lastMonth: string;
    last3Months: string;
    allTime: string;
    noData: string;
    excellentProgress: string;
    goodProgress: string;
    needsImprovement: string;
    performanceOverview: string;
    skillBreakdown: string;
    trendAnalysis: string;
    // Additional reports translations
    failedToLoad: string;
    exportFailed: string;
    noDataToExport: string;
    minutes: string;
    priority: {
      high: string;
      medium: string;
      low: string;
    };
    refresh: string;
    exportCSV: string;
    exportPDF: string;
    completedSimulations: string;
    acrossAllScenarios: string;
    pointsSinceStart: string;
    keepPracticing: string;
    yourStrongestArea: string;
    performanceAcrossAreas: string;
    benchmark: string;
    completeSimulations: string;
    performanceOverTime: string;
    monthsTracked: string;
    totalSessionsLabel: string;
    completeMoreSimulations: string;
    skillRadar: string;
    visualComparison: string;
    allCompletedSessions: string;
    filterByScenario: string;
    allScenarios: string;
    previous: string;
    page: string;
    of: string;
    next: string;
    noSessions: string;
    personalizedRecommendations: string;
    aiSuggestions: string;
    completeMoreForRecommendations: string;
    viewCourse: string;
    greatJob: string;
    keepPracticingMessage: string;
  };

  // Admin
  admin: {
    title: string;
    subtitle: string;
    totalUsers: string;
    teamAverage: string;
    totalSessionsAdmin: string;
    avgSessionsPerUser: string;
    performanceLeaders: string;
    topPerformers: string;
    needsAttention: string;
    recentActivity: string;
    userManagement: string;
    addUser: string;
    editUser: string;
    deleteUser: string;
    viewDetails: string;
    employeeList: string;
    searchEmployees: string;
    activeUsers: string;
    inactiveUsers: string;
    lastActive: string;
    sessionsCount: string;
    averageScoreAdmin: string;
    monthlyTrends: string;
    teamPerformance: string;
  };

  // Client Personas
  personas: {
    saudiClient: string;
    skepticalBuyer: string;
    firstTimeBuyer: string;
    investor: string;
    familyBuyer: string;
  };

  // Notifications
  notifications: {
    title: string;
    markAllRead: string;
    noNotifications: string;
    newCourseAvailable: string;
    achievementUnlocked: string;
    weeklyReport: string;
    reminderToPractice: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    systemMode: string;
    systemDefault: string;
    notifications: string;
    emailNotifications: string;
    pushNotifications: string;
    soundEffects: string;
    autoPlayAudio: string;
    account: string;
    changePassword: string;
    deleteAccount: string;
    privacy: string;
    dataExport: string;
  };

  // Errors
  errors: {
    somethingWentWrong: string;
    pageNotFound: string;
    unauthorized: string;
    forbidden: string;
    serverError: string;
    networkError: string;
    tryAgainLater: string;
    contactSupport: string;
    sessionExpired: string;
    invalidInput: string;
  };

  // Success Messages
  success: {
    saved: string;
    updated: string;
    deleted: string;
    created: string;
    sent: string;
    copied: string;
    downloaded: string;
    uploaded: string;
  };
}

const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'تم بنجاح',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      save: 'حفظ',
      close: 'إغلاق',
      search: 'بحث',
      filter: 'تصفية',
      all: 'الكل',
      none: 'لا شيء',
      view: 'عرض',
      edit: 'تعديل',
      delete: 'حذف',
      create: 'إنشاء',
      submit: 'إرسال',
      reset: 'إعادة تعيين',
      continue: 'متابعة',
      start: 'بدء',
      stop: 'إيقاف',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      retry: 'إعادة المحاولة',
      skip: 'تخطي',
      finish: 'إنهاء',
      complete: 'مكتمل',
      incomplete: 'غير مكتمل',
      active: 'نشط',
      inactive: 'غير نشط',
      enabled: 'مفعّل',
      disabled: 'معطّل',
      yes: 'نعم',
      no: 'لا',
      or: 'أو',
      and: 'و',
      minutes: 'دقائق',
      hours: 'ساعات',
      days: 'أيام',
      weeks: 'أسابيع',
      today: 'اليوم',
      yesterday: 'أمس',
      noResults: 'لا توجد نتائج',
      showMore: 'عرض المزيد',
      showLess: 'عرض أقل',
    },

    auth: {
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      signOut: 'تسجيل الخروج',
      signingIn: 'جاري تسجيل الدخول...',
      login: 'دخول',
      register: 'تسجيل',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPassword: 'إعادة تعيين كلمة المرور',
      email: 'البريد الإلكتروني',
      emailAddress: 'عنوان البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      fullName: 'الاسم الكامل',
      rememberMe: 'تذكرني',
      welcomeBack: 'مرحباً بعودتك',
      continueJourney: 'سجّل دخولك لمواصلة رحلتك التدريبية',
      createAccount: 'إنشاء حساب جديد',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      newToPlatform: 'جديد في EstateIQ؟',
      termsAgree: 'بتسجيل الدخول، أنت توافق على',
      termsOfService: 'شروط الخدمة',
      privacyPolicy: 'سياسة الخصوصية',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      loginFailed: 'فشل تسجيل الدخول',
      registerSuccess: 'تم إنشاء الحساب بنجاح',
      invalidCredentials: 'بيانات الدخول غير صحيحة',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordRequirements: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
      emailRequired: 'البريد الإلكتروني مطلوب',
      passwordRequired: 'كلمة المرور مطلوبة',
      heroTitle: 'أتقن مبيعات العقارات مع التدريب المدعوم بالذكاء الاصطناعي',
      heroDescription: 'تدرب على المفاوضات، تعامل مع الاعتراضات، وأتقن عرضك من خلال منصة المحاكاة الذكية.',
      traineesCount: '+10,000 متدرب',
      successRate: 'نسبة نجاح 95%',
      poweredBy: 'مدعوم بتقنية الذكاء الاصطناعي المتقدمة',
      // Register page
      startJourney: 'ابدأ رحلتك نحو التميز في المبيعات',
      joinThousands: 'انضم لآلاف المحترفين العقاريين الذين حولوا مسيرتهم المهنية.',
      createYourAccount: 'أنشئ حسابك',
      startTrainingJourney: 'ابدأ رحلتك التدريبية في العقارات اليوم',
      creatingAccount: 'جاري إنشاء الحساب...',
      firstNamePlaceholder: 'أحمد',
      lastNamePlaceholder: 'محمد',
      passwordStrong: 'أنشئ كلمة مرور قوية',
      confirmPasswordPlaceholder: 'أكد كلمة المرور',
      freeTrialNoCreditCard: 'تجربة مجانية لمدة 14 يومًا - لا تحتاج لبطاقة ائتمان',
      byCreatingAccount: 'بإنشاء حساب، أنت توافق على',
      // Benefits
      benefitAIPractice: 'محاكاة تدريبية مدعومة بالذكاء الاصطناعي',
      benefitFeedback: 'ملاحظات شخصية وتدريب مخصص',
      benefitAnalytics: 'تتبع تقدمك بتحليلات مفصلة',
      benefitOwnPace: 'تعلم بسرعتك الخاصة',
    },

    nav: {
      dashboard: 'لوحة التحكم',
      dashboardDesc: 'نظرة عامة على تقدمك',
      courses: 'الدورات التدريبية',
      coursesDesc: 'تعلم من خبراء الصناعة',
      simulations: 'المحاكاة',
      simulationsDesc: 'تدرب على سيناريوهات واقعية',
      voicePractice: 'التدريب الصوتي',
      voicePracticeDesc: 'تحدث مع عملاء افتراضيين',
      realtimeCall: 'مكالمة فورية',
      realtimeCallDesc: 'محادثة صوتية متقدمة',
      aiTeacher: 'المعلم الذكي',
      aiTeacherDesc: 'مرشدك الشخصي للتعلم',
      reports: 'التقارير',
      reportsDesc: 'تتبع أداءك وتقدمك',
      admin: 'الإدارة',
      settings: 'الإعدادات',
      profile: 'الملف الشخصي',
      help: 'المساعدة',
      home: 'الرئيسية',
    },

    landing: {
      brandName: 'EstateIQ',

      nav: {
        features: 'المميزات',
        howItWorks: 'كيف يعمل',
        testimonials: 'آراء العملاء',
        pricing: 'الأسعار',
        signIn: 'تسجيل الدخول',
        getStarted: 'ابدأ الآن',
      },

      hero: {
        badge: 'مدعوم بالذكاء الاصطناعي',
        titlePart1: 'أتقن مبيعات العقارات مع',
        titleHighlight: 'تدريب الذكاء الاصطناعي',
        description: 'تدرّب على سيناريوهات واقعية مع عملاء افتراضيين واحصل على تحليلات فورية لتحسين أدائك وإغلاق المزيد من الصفقات',
        startFreeTrial: 'ابدأ التجربة المجانية',
        watchDemo: 'شاهد العرض',
        noCreditCard: 'بدون بطاقة ائتمان',
        freeTrial: 'تجربة مجانية 14 يوم',
        cancelAnytime: 'إلغاء في أي وقت',
      },

      stats: {
        activeTrainees: 'متدرب نشط',
        successRate: 'نسبة النجاح',
        sessionsCompleted: 'جلسة مكتملة',
        userRating: 'تقييم المستخدمين',
      },

      features: {
        title: 'كل ما تحتاجه للتميز في العقارات',
        subtitle: 'منصة متكاملة للتدريب والتطوير المهني بأحدث تقنيات الذكاء الاصطناعي',
        aiSimulations: {
          title: 'محاكاة عملاء ذكية',
          description: 'تدرّب مع عملاء افتراضيين واقعيين يتحدثون بلهجات سعودية متنوعة ويستجيبون بذكاء',
        },
        voiceCalls: {
          title: 'مكالمات صوتية حقيقية',
          description: 'تدرّب على المكالمات الصوتية مع عملاء يتحدثون العربية بطلاقة وبشكل طبيعي',
        },
        analytics: {
          title: 'تحليلات أداء متقدمة',
          description: 'تتبع تقدمك بتقارير مفصلة وتوصيات مخصصة لتحسين نقاط الضعف',
        },
        courses: {
          title: 'دورات احترافية',
          description: 'تعلّم من خبراء الصناعة بمحتوى حصري ومحدّث باستمرار',
        },
        certifications: {
          title: 'شهادات معتمدة',
          description: 'احصل على شهادات معترف بها في السوق العقاري السعودي',
        },
        bilingual: {
          title: 'دعم ثنائي اللغة',
          description: 'منصة كاملة بالعربية والإنجليزية مع دعم RTL متكامل',
        },
      },

      howItWorks: {
        title: 'كيف تعمل المنصة',
        subtitle: 'ثلاث خطوات بسيطة لبدء رحلة التدريب والتطوير المهني',
        step1: {
          title: 'أنشئ حسابك',
          description: 'سجّل مجاناً في دقائق وحدد أهدافك التدريبية ومستواك الحالي',
        },
        step2: {
          title: 'تعلّم وتدرّب',
          description: 'شاهد الدورات التدريبية وتدرّب مع المحاكاة الذكية للعملاء',
        },
        step3: {
          title: 'تابع وتطور',
          description: 'راقب تقدمك من خلال التقارير واحصل على توصيات للتحسين المستمر',
        },
      },

      testimonials: {
        title: 'ماذا يقول عملاؤنا',
        subtitle: 'آلاف المحترفين يثقون بمنصتنا لتطوير مهاراتهم في المبيعات العقارية',
        items: [
          {
            quote: 'المنصة غيّرت طريقة تدريب فريقي تماماً. المحاكاة واقعية جداً والتحليلات تساعدنا على التحسن المستمر.',
            name: 'أحمد الراشد',
            role: 'مدير مبيعات - شركة دار العقار',
            initials: 'أر',
          },
          {
            quote: 'أفضل استثمار لتطوير مهاراتي. التدريب الصوتي بالعربية ممتاز وساعدني في إغلاق صفقات أكثر.',
            name: 'سارة المنصور',
            role: 'وكيلة عقارية - الرياض',
            initials: 'سم',
          },
          {
            quote: 'سهولة الاستخدام والمحتوى المحلي يجعل المنصة مثالية للسوق السعودي. أنصح بها بشدة.',
            name: 'خالد العتيبي',
            role: 'مستشار عقاري',
            initials: 'خع',
          },
        ],
      },

      pricing: {
        title: 'خطط أسعار مرنة',
        subtitle: 'اختر الخطة المناسبة لاحتياجاتك وابدأ رحلة التطوير المهني',
        perMonth: 'شهرياً',
        mostPopular: 'الأكثر شعبية',
        getStarted: 'ابدأ مجاناً',
        startTrial: 'ابدأ التجربة',
        contactSales: 'تواصل معنا',
        free: {
          name: 'مجاني',
          description: 'مثالي للتجربة والبدء',
          price: '0 ر.س',
          features: [
            '3 جلسات محاكاة شهرياً',
            'دورتان تدريبيتان',
            'تقارير أساسية',
            'دعم عبر البريد',
          ],
        },
        pro: {
          name: 'احترافي',
          description: 'للمحترفين الجادين',
          price: '199 ر.س',
          features: [
            'جلسات محاكاة غير محدودة',
            'جميع الدورات التدريبية',
            'مكالمات صوتية غير محدودة',
            'تحليلات متقدمة',
            'شهادات معتمدة',
            'دعم أولوية',
          ],
        },
        enterprise: {
          name: 'الشركات',
          description: 'للفرق والمؤسسات',
          price: 'تواصل معنا',
          features: [
            'كل مميزات الخطة الاحترافية',
            'لوحة تحكم إدارية',
            'تقارير أداء الفريق',
            'تخصيص السيناريوهات',
            'مدير حساب مخصص',
            'تدريب مخصص للفريق',
          ],
        },
      },

      cta: {
        title: 'جاهز لتطوير مهاراتك؟',
        description: 'انضم لآلاف المحترفين الذين يستخدمون منصتنا لتحقيق نتائج أفضل في المبيعات العقارية',
        button: 'ابدأ التجربة المجانية الآن',
      },

      footer: {
        description: 'منصة تدريب متكاملة للمحترفين في القطاع العقاري السعودي باستخدام أحدث تقنيات الذكاء الاصطناعي',
        product: 'المنتج',
        company: 'الشركة',
        legal: 'القانونية',
        courses: 'الدورات',
        simulations: 'المحاكاة',
        about: 'من نحن',
        blog: 'المدونة',
        careers: 'الوظائف',
        contact: 'تواصل معنا',
        privacy: 'سياسة الخصوصية',
        terms: 'شروط الاستخدام',
        cookies: 'سياسة ملفات تعريف الارتباط',
        allRightsReserved: 'جميع الحقوق محفوظة',
      },
    },

    dashboard: {
      title: 'لوحة التحكم',
      subtitle: 'نظرة عامة على تقدمك التدريبي',
      welcome: 'مرحباً بعودتك!',
      continueJourney: 'واصل رحلتك التدريبية اليوم',
      overallProgress: 'التقدم الإجمالي',
      averageScore: 'متوسط الدرجات',
      currentStreak: 'سلسلة الأيام',
      timeInvested: 'الوقت المستثمر',
      thisWeek: 'هذا الأسبوع',
      acrossAssessments: 'في جميع التقييمات',
      keepItGoing: 'استمر بالعمل الرائع!',
      minutesTotal: 'دقيقة إجمالاً',
      days: 'يوم',
      continueLearning: 'أكمل التعلم',
      pickUpWhereYouLeft: 'تابع من حيث توقفت في آخر دورة',
      negotiationFundamentals: 'أساسيات التفاوض',
      module3: 'الوحدة 3 - تقنيات الإقناع',
      complete: 'مكتمل',
      continueCourse: 'متابعة الدورة',
      practiceSimulations: 'تدريب المحاكاة',
      sharpenSkills: 'صقل مهاراتك مع سيناريوهات واقعية',
      recommendedScenario: 'السيناريو الموصى به',
      priceNegotiation: 'التفاوض على السعر - مستوى متوسط',
      basedOnPerformance: 'بناءً على أدائك الأخير',
      startSimulation: 'ابدأ المحاكاة',
      voicePractice: 'التدريب الصوتي',
      practiceWithAI: 'تدرّب على المحادثات مع عملاء افتراضيين',
      realtimeConversation: 'محادثة صوتية فورية',
      voiceCallDescription: 'تحدث مع عميل افتراضي باللهجة السعودية',
      newFeature: 'ميزة جديدة',
      startVoiceCall: 'ابدأ المكالمة',
      yourProgress: 'تقدمك',
      viewDetailedAnalytics: 'راقب إحصائياتك ونتائجك التفصيلية',
      simulations: 'محاكاة',
      courses: 'دورة',
      voiceCalls: 'مكالمة',
      avgScore: 'متوسط النتيجة',
      viewReports: 'عرض التقارير',
    },

    courses: {
      title: 'الدورات التدريبية',
      subtitle: 'طوّر مهاراتك مع دورات متخصصة من الخبراء',
      searchPlaceholder: 'ابحث عن دورة...',
      allCategories: 'جميع التصنيفات',
      allLevels: 'جميع المستويات',
      coursesAvailable: 'دورة متاحة',
      hours: 'ساعة',
      minutes: 'دقيقة',
      categories: {
        fundamentals: 'الأساسيات',
        salesSkills: 'مهارات البيع',
        clientRelations: 'علاقات العملاء',
        specialization: 'التخصص',
        marketing: 'التسويق',
      },
      difficulty: {
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم',
      },
      noCourses: 'لا توجد دورات',
      adjustFilters: 'جرّب تعديل معايير البحث',
      startLearning: 'ابدأ التعلم',
      continueLearning: 'أكمل التعلم',
      completed: 'مكتمل',
      inProgress: 'قيد التقدم',
      notStarted: 'لم يبدأ',
      lessons: 'درس',
      duration: 'المدة',
      enrolled: 'مسجل',
      progress: 'التقدم',
      certificate: 'شهادة',
      courseDetails: 'تفاصيل الدورة',
      whatYouLearn: 'ماذا ستتعلم',
      requirements: 'المتطلبات',
      description: 'الوصف',
      instructor: 'المدرب',
      reviews: 'التقييمات',
      relatedCourses: 'دورات ذات صلة',
    },

    simulations: {
      title: 'المحاكاة',
      subtitle: 'تدرّب على سيناريوهات واقعية مع عملاء افتراضيين',
      chooseScenario: 'اختر السيناريو',
      chooseMode: 'اختر نوع المحاكاة',
      selectModeDescription: 'اختر طريقة التواصل مع العميل الافتراضي',
      chatMode: 'محادثة كتابية',
      voiceMode: 'مكالمة صوتية',
      chatModeDescription: 'تواصل مع العميل عبر الرسائل النصية',
      voiceModeDescription: 'محادثة صوتية حقيقية باللهجة السعودية',
      voiceCallInArabic: 'باللغة العربية',
      backToScenarios: 'العودة للسيناريوهات',
      scenarios: {
        propertyShowing: 'عرض العقار',
        priceNegotiation: 'التفاوض على السعر',
        objectionHandling: 'معالجة الاعتراضات',
        firstContact: 'أول تواصل',
        closingDeal: 'إتمام الصفقة',
        difficultClient: 'عميل صعب',
      },
      scenarioDescriptions: {
        propertyShowing: 'تدرّب على عرض عقار للعميل والإجابة على استفساراته',
        priceNegotiation: 'تفاوض على السعر مع مشترٍ محتمل',
        objectionHandling: 'رد على مخاوف واعتراضات العميل باحترافية',
        firstContact: 'تعامل مع استفسار عميل جديد يبحث عن عقار',
        closingDeal: 'أغلق صفقة مع مشترٍ مهتم وجاهز للقرار',
        difficultClient: 'تعامل مع عميل متطلب أو صعب الإرضاء',
      },
      difficulty: {
        easy: 'سهل',
        medium: 'متوسط',
        hard: 'صعب',
      },
      difficultyLevel: 'مستوى الصعوبة',
      startSimulation: 'ابدأ المحاكاة',
      configureSession: 'اضبط إعدادات جلسة التدريب',
      selected: 'تم الاختيار',
      starting: 'جاري البدء...',
      endSimulation: 'إنهاء المحاكاة',
      simulationComplete: 'انتهت المحاكاة!',
      yourScore: 'نتيجتك',
      feedback: 'التغذية الراجعة',
      strengths: 'نقاط القوة',
      improvements: 'نقاط للتحسين',
      tryAgain: 'حاول مرة أخرى',
      nextScenario: 'السيناريو التالي',
      viewDetailedReport: 'عرض التقرير المفصل',
      timeElapsed: 'الوقت المنقضي',
      messagesExchanged: 'الرسائل المتبادلة',
      clientSentiment: 'انطباع العميل',
      positive: 'إيجابي',
      neutral: 'محايد',
      negative: 'سلبي',
    },

    voiceCall: {
      title: 'التدريب الصوتي',
      subtitle: 'تدرّب على المحادثات الصوتية مع عملاء افتراضيين',
      startCall: 'ابدأ المكالمة',
      endCall: 'إنهاء المكالمة',
      connecting: 'جاري الاتصال...',
      listening: 'يستمع...',
      speaking: 'يتكلم',
      thinking: 'يفكر...',
      tapToSpeak: 'اضغط للتحدث',
      tapToInterrupt: 'اضغط للمقاطعة',
      callEnded: 'انتهت المكالمة!',
      duration: 'المدة',
      messages: 'رسالة',
      summary: 'ملخص المحادثة',
      performance: 'قياسات الأداء',
      tryAgain: 'تدرّب مرة أخرى',
      micPermissionError: 'يرجى السماح بالوصول للميكروفون',
      didntHear: 'لم أسمعك',
      pleaseRepeat: 'ممكن تعيد؟',
      stillThere: 'هل أنت معي؟',
      callInProgress: 'المكالمة جارية',
      preparing: 'جاري التجهيز...',
      ready: 'جاهز',
      // New fields for realtime-call
      evaluation: 'التقييم',
      overallScore: 'الدرجة الإجمالية',
      communication: 'التواصل',
      knowledge: 'المعرفة',
      professionalism: 'الاحترافية',
      engagement: 'التفاعل',
      strengths: 'نقاط القوة',
      areasToImprove: 'نقاط التحسين',
      userSpeaking: 'يتحدث...',
    },

    scenarios: {
      selectScenario: 'اختر السيناريو',
      selectDescription: 'اختر نوع المحادثة التي تريد التدرب عليها',
      propertyShowing: 'عرض العقار',
      propertyShowingDesc: 'تدرّب على عرض عقار للعميل والإجابة على استفساراته',
      priceNegotiation: 'التفاوض على السعر',
      priceNegotiationDesc: 'تفاوض على السعر مع مشترٍ محتمل',
      firstContact: 'أول تواصل',
      firstContactDesc: 'تعامل مع استفسار عميل جديد يبحث عن عقار',
      objectionHandling: 'معالجة الاعتراضات',
      objectionHandlingDesc: 'رد على مخاوف واعتراضات العميل باحترافية',
      closingDeal: 'إتمام الصفقة',
      closingDealDesc: 'أغلق صفقة مع مشترٍ مهتم وجاهز للقرار',
    },

    reports: {
      title: 'تقارير الأداء',
      subtitle: 'تتبع تقدمك وحدد مجالات التحسين',
      totalSessions: 'إجمالي الجلسات',
      averageScore: 'متوسط الدرجات',
      improvement: 'نسبة التحسن',
      topSkill: 'أقوى مهارة',
      skillPerformance: 'أداء المهارات',
      scoreProgression: 'تطور الدرجات',
      sessionHistory: 'سجل الجلسات',
      allSessions: 'جميع الجلسات المكتملة',
      recommendations: 'توصيات مخصصة',
      focusAreas: 'مجالات التركيز',
      suggestedCourses: 'دورات مقترحة',
      exportReport: 'تصدير التقرير',
      dateRange: 'الفترة الزمنية',
      lastWeek: 'الأسبوع الماضي',
      lastMonth: 'الشهر الماضي',
      last3Months: 'آخر 3 أشهر',
      allTime: 'كل الوقت',
      noData: 'لا توجد بيانات كافية',
      excellentProgress: 'تقدم ممتاز!',
      goodProgress: 'تقدم جيد',
      needsImprovement: 'يحتاج تحسين',
      performanceOverview: 'نظرة عامة على الأداء',
      skillBreakdown: 'تفصيل المهارات',
      trendAnalysis: 'تحليل الاتجاهات',
      failedToLoad: 'فشل تحميل التقارير',
      exportFailed: 'فشل التصدير',
      noDataToExport: 'لا توجد بيانات للتصدير',
      minutes: 'دقيقة',
      priority: {
        high: 'عالية',
        medium: 'متوسطة',
        low: 'منخفضة',
      },
      refresh: 'تحديث',
      exportCSV: 'تصدير CSV',
      exportPDF: 'تصدير PDF',
      completedSimulations: 'محاكاة مكتملة',
      acrossAllScenarios: 'عبر جميع السيناريوهات',
      pointsSinceStart: 'نقطة منذ البداية',
      keepPracticing: 'استمر بالتدرب!',
      yourStrongestArea: 'أقوى مجالاتك',
      performanceAcrossAreas: 'أداؤك عبر مختلف المجالات',
      benchmark: 'المعيار',
      completeSimulations: 'أكمل بعض المحاكاة لرؤية بياناتك',
      performanceOverTime: 'الأداء مع مرور الوقت',
      monthsTracked: 'شهر متتبع',
      totalSessionsLabel: 'جلسة',
      completeMoreSimulations: 'أكمل المزيد من المحاكاة لرؤية اتجاهاتك',
      skillRadar: 'رادار المهارات',
      visualComparison: 'مقارنة بصرية لمهاراتك',
      allCompletedSessions: 'جميع الجلسات المكتملة',
      filterByScenario: 'تصفية حسب السيناريو',
      allScenarios: 'جميع السيناريوهات',
      previous: 'السابق',
      page: 'صفحة',
      of: 'من',
      next: 'التالي',
      noSessions: 'لا توجد جلسات بعد',
      personalizedRecommendations: 'توصيات مخصصة لك',
      aiSuggestions: 'اقتراحات الذكاء الاصطناعي بناءً على أدائك',
      completeMoreForRecommendations: 'أكمل المزيد من المحاكاة للحصول على توصيات',
      viewCourse: 'عرض الدورة',
      greatJob: 'أداء رائع!',
      keepPracticingMessage: 'استمر بالتدريب للحفاظ على مستواك العالي',
    },

    admin: {
      title: 'لوحة الإدارة',
      subtitle: 'نظرة عامة على أداء الفريق والنشاط',
      totalUsers: 'إجمالي المستخدمين',
      teamAverage: 'متوسط الفريق',
      totalSessionsAdmin: 'إجمالي الجلسات',
      avgSessionsPerUser: 'الجلسات لكل مستخدم',
      performanceLeaders: 'قادة الأداء',
      topPerformers: 'الأفضل أداءً',
      needsAttention: 'يحتاج متابعة',
      recentActivity: 'النشاط الأخير',
      userManagement: 'إدارة المستخدمين',
      addUser: 'إضافة مستخدم',
      editUser: 'تعديل مستخدم',
      deleteUser: 'حذف مستخدم',
      viewDetails: 'عرض التفاصيل',
      employeeList: 'قائمة الموظفين',
      searchEmployees: 'بحث عن موظف...',
      activeUsers: 'المستخدمون النشطون',
      inactiveUsers: 'غير نشط',
      lastActive: 'آخر نشاط',
      sessionsCount: 'عدد الجلسات',
      averageScoreAdmin: 'متوسط الدرجات',
      monthlyTrends: 'الاتجاهات الشهرية',
      teamPerformance: 'أداء الفريق',
    },

    personas: {
      saudiClient: 'عميل سعودي',
      skepticalBuyer: 'مشترٍ متشكك',
      firstTimeBuyer: 'مشترٍ لأول مرة',
      investor: 'مستثمر',
      familyBuyer: 'مشترٍ عائلي',
    },

    notifications: {
      title: 'الإشعارات',
      markAllRead: 'تحديد الكل كمقروء',
      noNotifications: 'لا توجد إشعارات',
      newCourseAvailable: 'دورة جديدة متاحة',
      achievementUnlocked: 'تم فتح إنجاز جديد',
      weeklyReport: 'تقريرك الأسبوعي جاهز',
      reminderToPractice: 'حان وقت التدريب!',
    },

    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      theme: 'المظهر',
      lightMode: 'فاتح',
      darkMode: 'داكن',
      systemMode: 'تلقائي',
      systemDefault: 'تلقائي',
      notifications: 'الإشعارات',
      emailNotifications: 'إشعارات البريد',
      pushNotifications: 'الإشعارات الفورية',
      soundEffects: 'المؤثرات الصوتية',
      autoPlayAudio: 'تشغيل الصوت تلقائياً',
      account: 'الحساب',
      changePassword: 'تغيير كلمة المرور',
      deleteAccount: 'حذف الحساب',
      privacy: 'الخصوصية',
      dataExport: 'تصدير البيانات',
    },

    errors: {
      somethingWentWrong: 'حدث خطأ ما',
      pageNotFound: 'الصفحة غير موجودة',
      unauthorized: 'غير مصرح',
      forbidden: 'الوصول مرفوض',
      serverError: 'خطأ في الخادم',
      networkError: 'خطأ في الاتصال',
      tryAgainLater: 'حاول مرة أخرى لاحقاً',
      contactSupport: 'تواصل مع الدعم الفني',
      sessionExpired: 'انتهت الجلسة، سجّل الدخول مرة أخرى',
      invalidInput: 'إدخال غير صحيح',
    },

    success: {
      saved: 'تم الحفظ',
      updated: 'تم التحديث',
      deleted: 'تم الحذف',
      created: 'تم الإنشاء',
      sent: 'تم الإرسال',
      copied: 'تم النسخ',
      downloaded: 'تم التحميل',
      uploaded: 'تم الرفع',
    },
  },

  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      save: 'Save',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      none: 'None',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      create: 'Create',
      submit: 'Submit',
      reset: 'Reset',
      continue: 'Continue',
      start: 'Start',
      stop: 'Stop',
      pause: 'Pause',
      resume: 'Resume',
      retry: 'Retry',
      skip: 'Skip',
      finish: 'Finish',
      complete: 'Complete',
      incomplete: 'Incomplete',
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      weeks: 'weeks',
      today: 'Today',
      yesterday: 'Yesterday',
      noResults: 'No results found',
      showMore: 'Show more',
      showLess: 'Show less',
    },

    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      signingIn: 'Signing in...',
      login: 'Login',
      register: 'Register',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      email: 'Email',
      emailAddress: 'Email address',
      emailPlaceholder: 'you@example.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      fullName: 'Full Name',
      rememberMe: 'Remember me',
      welcomeBack: 'Welcome back',
      continueJourney: 'Sign in to continue your training journey',
      createAccount: 'Create an account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      newToPlatform: 'New to EstateIQ?',
      termsAgree: 'By signing in, you agree to our',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      loginSuccess: 'Successfully signed in',
      loginFailed: 'Login failed',
      registerSuccess: 'Account created successfully',
      invalidCredentials: 'Invalid credentials',
      passwordMismatch: 'Passwords do not match',
      passwordRequirements: 'Password must be at least 8 characters',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      heroTitle: 'Master Real Estate Sales with AI-Powered Training',
      heroDescription: 'Practice negotiations, handle objections, and perfect your pitch with our intelligent simulation platform.',
      traineesCount: '10,000+ Trainees',
      successRate: '95% Success Rate',
      poweredBy: 'Powered by advanced AI technology',
      // Register page
      startJourney: 'Start Your Journey to Sales Excellence',
      joinThousands: 'Join thousands of real estate professionals who have transformed their careers.',
      createYourAccount: 'Create your account',
      startTrainingJourney: 'Start your real estate training journey today',
      creatingAccount: 'Creating account...',
      firstNamePlaceholder: 'John',
      lastNamePlaceholder: 'Doe',
      passwordStrong: 'Create a strong password',
      confirmPasswordPlaceholder: 'Confirm your password',
      freeTrialNoCreditCard: '14-day free trial - No credit card required',
      byCreatingAccount: 'By creating an account, you agree to our',
      // Benefits
      benefitAIPractice: 'AI-powered practice simulations',
      benefitFeedback: 'Personalized feedback and coaching',
      benefitAnalytics: 'Track progress with detailed analytics',
      benefitOwnPace: 'Learn at your own pace',
    },

    nav: {
      dashboard: 'Dashboard',
      dashboardDesc: 'Overview of your progress',
      courses: 'Training Courses',
      coursesDesc: 'Learn from industry experts',
      simulations: 'Simulations',
      simulationsDesc: 'Practice realistic scenarios',
      voicePractice: 'Voice Practice',
      voicePracticeDesc: 'Talk with virtual clients',
      realtimeCall: 'Real-Time Call',
      realtimeCallDesc: 'Advanced voice conversation',
      aiTeacher: 'AI Teacher',
      aiTeacherDesc: 'Your personal learning mentor',
      reports: 'Reports',
      reportsDesc: 'Track your performance',
      admin: 'Admin',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      home: 'Home',
    },

    landing: {
      brandName: 'EstateIQ',

      nav: {
        features: 'Features',
        howItWorks: 'How It Works',
        testimonials: 'Testimonials',
        pricing: 'Pricing',
        signIn: 'Sign In',
        getStarted: 'Get Started',
      },

      hero: {
        badge: 'AI-Powered',
        titlePart1: 'Master Real Estate Sales with',
        titleHighlight: 'AI-Powered Training',
        description: 'Practice realistic scenarios with virtual clients and get instant analytics to improve your performance and close more deals',
        startFreeTrial: 'Start Free Trial',
        watchDemo: 'Watch Demo',
        noCreditCard: 'No credit card required',
        freeTrial: '14-day free trial',
        cancelAnytime: 'Cancel anytime',
      },

      stats: {
        activeTrainees: 'Active Trainees',
        successRate: 'Success Rate',
        sessionsCompleted: 'Sessions Completed',
        userRating: 'User Rating',
      },

      features: {
        title: 'Everything You Need to Excel in Real Estate',
        subtitle: 'A complete platform for training and professional development with cutting-edge AI technology',
        aiSimulations: {
          title: 'Smart Client Simulations',
          description: 'Practice with realistic AI-powered client personas that respond intelligently and naturally',
        },
        voiceCalls: {
          title: 'Real Voice Calls',
          description: 'Practice voice conversations with AI clients that speak Arabic fluently and naturally',
        },
        analytics: {
          title: 'Advanced Analytics',
          description: 'Track your progress with detailed reports and personalized recommendations',
        },
        courses: {
          title: 'Professional Courses',
          description: 'Learn from industry experts with exclusive, continuously updated content',
        },
        certifications: {
          title: 'Certified Credentials',
          description: 'Earn industry-recognized certifications in the Saudi real estate market',
        },
        bilingual: {
          title: 'Bilingual Support',
          description: 'Full platform in Arabic and English with complete RTL support',
        },
      },

      howItWorks: {
        title: 'How It Works',
        subtitle: 'Three simple steps to start your training and professional development journey',
        step1: {
          title: 'Create Your Account',
          description: 'Sign up for free in minutes and set your training goals and current level',
        },
        step2: {
          title: 'Learn & Practice',
          description: 'Watch training courses and practice with intelligent client simulations',
        },
        step3: {
          title: 'Track & Improve',
          description: 'Monitor your progress through reports and get recommendations for continuous improvement',
        },
      },

      testimonials: {
        title: 'What Our Clients Say',
        subtitle: 'Thousands of professionals trust our platform to develop their real estate sales skills',
        items: [
          {
            quote: 'The platform completely transformed how I train my team. The simulations are very realistic and the analytics help us improve continuously.',
            name: 'Ahmed Al-Rashid',
            role: 'Sales Manager - Dar Al-Aqar',
            initials: 'AR',
          },
          {
            quote: 'Best investment in skill development. The voice training in Arabic is excellent and helped me close more deals.',
            name: 'Sara Al-Mansour',
            role: 'Real Estate Agent - Riyadh',
            initials: 'SA',
          },
          {
            quote: 'Ease of use and local content makes the platform ideal for the Saudi market. Highly recommended.',
            name: 'Khalid Al-Otaibi',
            role: 'Real Estate Consultant',
            initials: 'KA',
          },
        ],
      },

      pricing: {
        title: 'Flexible Pricing Plans',
        subtitle: 'Choose the plan that fits your needs and start your professional development journey',
        perMonth: 'month',
        mostPopular: 'Most Popular',
        getStarted: 'Get Started Free',
        startTrial: 'Start Trial',
        contactSales: 'Contact Sales',
        free: {
          name: 'Free',
          description: 'Perfect for getting started',
          price: '$0',
          features: [
            '3 simulation sessions/month',
            '2 training courses',
            'Basic reports',
            'Email support',
          ],
        },
        pro: {
          name: 'Professional',
          description: 'For serious professionals',
          price: '$49',
          features: [
            'Unlimited simulations',
            'All training courses',
            'Unlimited voice calls',
            'Advanced analytics',
            'Certified credentials',
            'Priority support',
          ],
        },
        enterprise: {
          name: 'Enterprise',
          description: 'For teams and organizations',
          price: 'Contact Us',
          features: [
            'All Pro features',
            'Admin dashboard',
            'Team performance reports',
            'Custom scenarios',
            'Dedicated account manager',
            'Custom team training',
          ],
        },
      },

      cta: {
        title: 'Ready to Develop Your Skills?',
        description: 'Join thousands of professionals using our platform to achieve better results in real estate sales',
        button: 'Start Your Free Trial Now',
      },

      footer: {
        description: 'A complete training platform for professionals in the Saudi real estate sector using the latest AI technology',
        product: 'Product',
        company: 'Company',
        legal: 'Legal',
        courses: 'Courses',
        simulations: 'Simulations',
        about: 'About Us',
        blog: 'Blog',
        careers: 'Careers',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        cookies: 'Cookie Policy',
        allRightsReserved: 'All rights reserved',
      },
    },

    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your training progress',
      welcome: 'Welcome Back!',
      continueJourney: 'Continue your training journey today',
      overallProgress: 'Overall Progress',
      averageScore: 'Average Score',
      currentStreak: 'Current Streak',
      timeInvested: 'Time Invested',
      thisWeek: 'this week',
      acrossAssessments: 'across all assessments',
      keepItGoing: 'Keep up the great work!',
      minutesTotal: 'minutes total',
      days: 'days',
      continueLearning: 'Continue Learning',
      pickUpWhereYouLeft: 'Pick up where you left off in your last course',
      negotiationFundamentals: 'Negotiation Fundamentals',
      module3: 'Module 3 - Persuasion Techniques',
      complete: 'complete',
      continueCourse: 'Continue Course',
      practiceSimulations: 'Practice Simulations',
      sharpenSkills: 'Sharpen your skills with realistic scenarios',
      recommendedScenario: 'Recommended Scenario',
      priceNegotiation: 'Price Negotiation - Medium Level',
      basedOnPerformance: 'Based on your recent performance',
      startSimulation: 'Start Simulation',
      voicePractice: 'Voice Practice',
      practiceWithAI: 'Practice conversations with AI-powered clients',
      realtimeConversation: 'Real-time Conversation',
      voiceCallDescription: 'Talk with a virtual client in natural Arabic',
      newFeature: 'New Feature',
      startVoiceCall: 'Start Call',
      yourProgress: 'Your Progress',
      viewDetailedAnalytics: 'Track your stats and detailed results',
      simulations: 'Simulations',
      courses: 'Courses',
      voiceCalls: 'Voice Calls',
      avgScore: 'Avg Score',
      viewReports: 'View Reports',
    },

    courses: {
      title: 'Training Courses',
      subtitle: 'Build your skills with expert-led courses',
      searchPlaceholder: 'Search courses...',
      allCategories: 'All Categories',
      allLevels: 'All Levels',
      coursesAvailable: 'courses available',
      hours: 'h',
      minutes: 'm',
      categories: {
        fundamentals: 'Fundamentals',
        salesSkills: 'Sales Skills',
        clientRelations: 'Client Relations',
        specialization: 'Specialization',
        marketing: 'Marketing',
      },
      difficulty: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
      },
      noCourses: 'No courses found',
      adjustFilters: 'Try adjusting your search or filters',
      startLearning: 'Start Learning',
      continueLearning: 'Continue Learning',
      completed: 'Completed',
      inProgress: 'In Progress',
      notStarted: 'Not Started',
      lessons: 'lessons',
      duration: 'Duration',
      enrolled: 'Enrolled',
      progress: 'Progress',
      certificate: 'Certificate',
      courseDetails: 'Course Details',
      whatYouLearn: 'What You\'ll Learn',
      requirements: 'Requirements',
      description: 'Description',
      instructor: 'Instructor',
      reviews: 'Reviews',
      relatedCourses: 'Related Courses',
    },

    simulations: {
      title: 'Simulations',
      subtitle: 'Practice realistic scenarios with virtual clients',
      chooseScenario: 'Choose Scenario',
      chooseMode: 'Choose Simulation Mode',
      selectModeDescription: 'Select how you want to communicate with the virtual client',
      chatMode: 'Chat Simulation',
      voiceMode: 'Voice Call Simulation',
      chatModeDescription: 'Communicate with the client via text messages',
      voiceModeDescription: 'Real voice conversation with natural speech',
      voiceCallInArabic: 'In Arabic',
      backToScenarios: 'Back to Scenarios',
      scenarios: {
        propertyShowing: 'Property Showing',
        priceNegotiation: 'Price Negotiation',
        objectionHandling: 'Objection Handling',
        firstContact: 'First Contact',
        closingDeal: 'Closing Deal',
        difficultClient: 'Difficult Client',
      },
      scenarioDescriptions: {
        propertyShowing: 'Practice showing a property to a client and answering their questions',
        priceNegotiation: 'Negotiate the price with a potential buyer',
        objectionHandling: 'Address client concerns and objections professionally',
        firstContact: 'Handle a new client inquiry looking for a property',
        closingDeal: 'Close a deal with an interested buyer ready to decide',
        difficultClient: 'Handle a demanding or hard-to-please client',
      },
      difficulty: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
      },
      difficultyLevel: 'Difficulty Level',
      startSimulation: 'Start Simulation',
      configureSession: 'Configure your training session settings',
      selected: 'Selected',
      starting: 'Starting...',
      endSimulation: 'End Simulation',
      simulationComplete: 'Simulation Complete!',
      yourScore: 'Your Score',
      feedback: 'Feedback',
      strengths: 'Strengths',
      improvements: 'Areas for Improvement',
      tryAgain: 'Try Again',
      nextScenario: 'Next Scenario',
      viewDetailedReport: 'View Detailed Report',
      timeElapsed: 'Time Elapsed',
      messagesExchanged: 'Messages Exchanged',
      clientSentiment: 'Client Sentiment',
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative',
    },

    voiceCall: {
      title: 'Voice Training',
      subtitle: 'Practice voice conversations with virtual clients',
      startCall: 'Start Call',
      endCall: 'End Call',
      connecting: 'Connecting...',
      listening: 'Listening...',
      speaking: 'Speaking',
      thinking: 'Thinking...',
      tapToSpeak: 'Tap to speak',
      tapToInterrupt: 'Tap to interrupt',
      callEnded: 'Call Ended!',
      duration: 'Duration',
      messages: 'messages',
      summary: 'Conversation Summary',
      performance: 'Performance Metrics',
      tryAgain: 'Practice Again',
      micPermissionError: 'Please allow microphone access',
      didntHear: "Didn't hear you",
      pleaseRepeat: 'Could you repeat that?',
      stillThere: 'Are you still there?',
      callInProgress: 'Call in progress',
      preparing: 'Preparing...',
      ready: 'Ready',
      // New fields for realtime-call
      evaluation: 'Evaluation',
      overallScore: 'Overall Score',
      communication: 'Communication',
      knowledge: 'Knowledge',
      professionalism: 'Professionalism',
      engagement: 'Engagement',
      strengths: 'Strengths',
      areasToImprove: 'Areas to Improve',
      userSpeaking: 'Speaking...',
    },

    scenarios: {
      selectScenario: 'Select Scenario',
      selectDescription: 'Choose the type of conversation you want to practice',
      propertyShowing: 'Property Showing',
      propertyShowingDesc: 'Practice showing a property to a client and answering questions',
      priceNegotiation: 'Price Negotiation',
      priceNegotiationDesc: 'Negotiate the price with a potential buyer',
      firstContact: 'First Contact',
      firstContactDesc: 'Handle a new client inquiry looking for a property',
      objectionHandling: 'Objection Handling',
      objectionHandlingDesc: 'Address client concerns and objections professionally',
      closingDeal: 'Closing Deal',
      closingDealDesc: 'Close a deal with an interested buyer ready to decide',
    },

    reports: {
      title: 'Performance Reports',
      subtitle: 'Track your progress and identify areas for improvement',
      totalSessions: 'Total Sessions',
      averageScore: 'Average Score',
      improvement: 'Improvement',
      topSkill: 'Top Skill',
      skillPerformance: 'Skill Performance',
      scoreProgression: 'Score Progression',
      sessionHistory: 'Session History',
      allSessions: 'All completed sessions',
      recommendations: 'Personalized Recommendations',
      focusAreas: 'Focus Areas',
      suggestedCourses: 'Suggested Courses',
      exportReport: 'Export Report',
      dateRange: 'Date Range',
      lastWeek: 'Last Week',
      lastMonth: 'Last Month',
      last3Months: 'Last 3 Months',
      allTime: 'All Time',
      noData: 'Not enough data',
      excellentProgress: 'Excellent progress!',
      goodProgress: 'Good progress',
      needsImprovement: 'Needs improvement',
      performanceOverview: 'Performance Overview',
      skillBreakdown: 'Skill Breakdown',
      trendAnalysis: 'Trend Analysis',
      failedToLoad: 'Failed to load reports',
      exportFailed: 'Export failed',
      noDataToExport: 'No data to export',
      minutes: 'minutes',
      priority: {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
      refresh: 'Refresh',
      exportCSV: 'Export CSV',
      exportPDF: 'Export PDF',
      completedSimulations: 'completed simulations',
      acrossAllScenarios: 'across all scenarios',
      pointsSinceStart: 'points since start',
      keepPracticing: 'Keep practicing!',
      yourStrongestArea: 'Your strongest area',
      performanceAcrossAreas: 'Your performance across different areas',
      benchmark: 'Benchmark',
      completeSimulations: 'Complete some simulations to see your data',
      performanceOverTime: 'Performance Over Time',
      monthsTracked: 'months tracked',
      totalSessionsLabel: 'sessions',
      completeMoreSimulations: 'Complete more simulations to see your trends',
      skillRadar: 'Skill Radar',
      visualComparison: 'Visual comparison of your skills',
      allCompletedSessions: 'All completed sessions',
      filterByScenario: 'Filter by scenario',
      allScenarios: 'All scenarios',
      previous: 'Previous',
      page: 'Page',
      of: 'of',
      next: 'Next',
      noSessions: 'No sessions yet',
      personalizedRecommendations: 'Personalized Recommendations',
      aiSuggestions: 'AI suggestions based on your performance',
      completeMoreForRecommendations: 'Complete more simulations to get recommendations',
      viewCourse: 'View Course',
      greatJob: 'Great job!',
      keepPracticingMessage: 'Keep practicing to maintain your high level',
    },

    admin: {
      title: 'Admin Dashboard',
      subtitle: 'Overview of team performance and activity',
      totalUsers: 'Total Users',
      teamAverage: 'Team Average',
      totalSessionsAdmin: 'Total Sessions',
      avgSessionsPerUser: 'Avg Sessions/User',
      performanceLeaders: 'Performance Leaders',
      topPerformers: 'Top Performers',
      needsAttention: 'Needs Attention',
      recentActivity: 'Recent Activity',
      userManagement: 'User Management',
      addUser: 'Add User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      viewDetails: 'View Details',
      employeeList: 'Employee List',
      searchEmployees: 'Search employees...',
      activeUsers: 'Active Users',
      inactiveUsers: 'Inactive',
      lastActive: 'Last Active',
      sessionsCount: 'Sessions',
      averageScoreAdmin: 'Avg Score',
      monthlyTrends: 'Monthly Trends',
      teamPerformance: 'Team Performance',
    },

    personas: {
      saudiClient: 'Saudi Client',
      skepticalBuyer: 'Skeptical Buyer',
      firstTimeBuyer: 'First-Time Buyer',
      investor: 'Investor',
      familyBuyer: 'Family Buyer',
    },

    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No notifications',
      newCourseAvailable: 'New course available',
      achievementUnlocked: 'Achievement unlocked',
      weeklyReport: 'Your weekly report is ready',
      reminderToPractice: 'Time to practice!',
    },

    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light',
      darkMode: 'Dark',
      systemMode: 'System',
      systemDefault: 'System',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      soundEffects: 'Sound Effects',
      autoPlayAudio: 'Auto-play Audio',
      account: 'Account',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
      privacy: 'Privacy',
      dataExport: 'Export Data',
    },

    errors: {
      somethingWentWrong: 'Something went wrong',
      pageNotFound: 'Page not found',
      unauthorized: 'Unauthorized',
      forbidden: 'Access denied',
      serverError: 'Server error',
      networkError: 'Network error',
      tryAgainLater: 'Please try again later',
      contactSupport: 'Contact support',
      sessionExpired: 'Session expired, please sign in again',
      invalidInput: 'Invalid input',
    },

    success: {
      saved: 'Saved successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
      created: 'Created successfully',
      sent: 'Sent successfully',
      copied: 'Copied to clipboard',
      downloaded: 'Downloaded successfully',
      uploaded: 'Uploaded successfully',
    },
  },
};

interface LanguageContextType {
  language: Language;
  config: LanguageConfig;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  // Load saved language preference
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLanguageState(saved);
      document.documentElement.dir = LANGUAGE_CONFIGS[saved].dir;
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    // Update document direction and language
    document.documentElement.dir = LANGUAGE_CONFIGS[lang].dir;
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, setLanguage]);

  const value: LanguageContextType = {
    language,
    config: LANGUAGE_CONFIGS[language],
    t: TRANSLATIONS[language],
    setLanguage,
    toggleLanguage,
    isRTL: LANGUAGE_CONFIGS[language].dir === 'rtl',
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for direction-aware styling
export function useDir(): 'rtl' | 'ltr' {
  const { config } = useLanguage();
  return config.dir;
}

// Helper hook to check if RTL
export function useIsRTL(): boolean {
  const { isRTL } = useLanguage();
  return isRTL;
}
