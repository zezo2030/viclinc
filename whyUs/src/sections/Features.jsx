import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'تطبيق خاص باسم عيادتك',
      points: [
        'هوية رقمية مستقلة تحمل اسمك وشعارك.',
        'تصميم عصري يتناسب مع تخصصك الطبي.',
        'لا حاجة لأي معرفة تقنية — فقط أرسل شعارك وابدأ.',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'حجز المواعيد صار أسهل',
      points: [
        'واجهة حجز ذكية للمواعيد الحضورية أو الافتراضية.',
        'تنبيهات تلقائية للمريض والطبيب لتقليل الغياب.',
        'إدارة جدول الأطباء بسهولة من لوحة التحكم.',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'العيادة الافتراضية (Virtual Clinic)',
      points: [
        'مكالمات فيديو آمنة ومشفرة.',
        'وصفات طبية إلكترونية.',
        'أرشفة تلقائية لكل الاستشارات في ملف المريض.',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm6 0v-4a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2zM3 5a2 2 0 012-2h3.28a1 1 0 01.948.684L10.726 8.5" />
        </svg>
      ),
      title: 'الرعاية المنزلية (HomeCare)',
      points: [
        'طلبات زيارة منزلية بواجهة سهلة.',
        'تتبع مباشر للممارسين عبر GPS.',
        'تقارير فورية وتوقيع إلكتروني بعد الخدمة.',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16M4 9h16M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9m-9 0v12" />
        </svg>
      ),
      title: 'التكامل مع الأنظمة الداخلية',
      points: [
        'يعمل جنبًا إلى جنب مع نظامك الحالي (ديسكتوب أو سحابي).',
        'استيراد بيانات المرضى والفواتير بسلاسة.',
        'لا يتعارض مع أي برنامج إداري موجود مسبقًا.',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'مدفوعات إلكترونية آمنة',
      points: [
        'ربط مباشر مع بوابات الدفع السعودية (مدى، STC Pay، Apple Pay).',
        'تسوية مالية تلقائية بين الفروع أو الأطباء.',
        'لا عمولات على الحجز — فقط اشتراك ثابت.',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17a4 4 0 010-8h1a4 4 0 010 8h-1zm0-8V5m0 12v2m5-8h2m-14 0h2" />
        </svg>
      ),
      title: 'لوحة تحكم وتقارير ذكية',
      points: [
        'رؤية شاملة للأداء: عدد الحجوزات، الإيرادات، نسبة الغياب.',
        'تقارير مالية وتشغيلية قابلة للتصدير.',
        'أدوات تحليل تساعدك في اتخاذ قرارات النمو.',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'أمان وخصوصية عالية',
      points: [
        'استضافة سعودية متوافقة مع لوائح وزارة الصحة.',
        'تشفير كامل للبيانات الطبية.',
        'صلاحيات مرنة للمستخدمين وسجلات تدقيق تفصيلية.',
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="features" className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-4xl md:text-5xl mb-4">
            مميزات{' '}
            <span className="section-highlight">
              MedFlw
            </span>
          </h2>
          <p className="section-description text-xl max-w-4xl mx-auto">
            كل ميزة مصممة لتمنح عيادتك تجربة رقمية مكتملة من أول تواصل مع المريض وحتى التقارير الذكية.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="feature-card group"
            >
              <motion.div 
                className="feature-icon"
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
              </motion.div>
              
              <h3 className="feature-card-title">
                {feature.title}
              </h3>
              <ul className="feature-card-text space-y-2">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;

