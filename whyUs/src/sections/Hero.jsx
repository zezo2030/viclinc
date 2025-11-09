import { motion } from 'framer-motion';

const Hero = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="theme-section relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 hero-backdrop">
        {/* Grid Pattern */}
        <div className="absolute inset-0 hero-grid" />
      </div>
      
      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="hero-blob hero-blob--blue absolute -top-40 -right-40 w-96 h-96"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="hero-blob hero-blob--green absolute -bottom-40 -left-40 w-96 h-96"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="hero-blob hero-blob--mint absolute top-1/2 left-1/2 w-72 h-72 opacity-40"
          animate={{
            scale: [1, 1.1, 1],
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-right"
          >
            <motion.div className="mb-4">
              <motion.span 
                className="pill-badge text-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                🚀 نظام إدارة عيادات متكامل
              </motion.span>
            </motion.div>

            <motion.h1
              className="section-title text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              حوّل عيادتك إلى{' '}
              <span className="relative inline-block">
                <span className="section-highlight">
                  نظام ذكي
                </span>
                <motion.div
                  className="absolute -bottom-2 right-0 left-0 h-3 hero-highlight-ring opacity-60"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </span>
            </motion.h1>
            
            <motion.p
              className="section-description text-xl mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              منصّة متكاملة لإدارة العيادات من الحجز أونلاين إلى السجل الطبي ولوحة تحكم غنية بالتحليلات. 
              <strong className="theme-accent"> حجز، ملفات، فواتير واستشارة فيديو</strong> — في مكانٍ واحد
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group"
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(24, 144, 255, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  احجز ديمو الآن
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </span>
              </motion.a>
              
              <motion.button
                onClick={() => scrollToSection('features')}
                className="btn-ghost group text-lg font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  تعرّف على الميزات
                  <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-12 grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.div 
                className="relative group"
                whileHover={{ y: -5 }}
              >
                <div className="metric-card text-center">
                  <div className="metric-value">+500</div>
                  <div className="metric-label">عيادة تثق بنا</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative group"
                whileHover={{ y: -5 }}
              >
                <div className="metric-card text-center">
                  <div className="metric-value">+50K</div>
                  <div className="metric-label">موعد شهرياً</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative group"
                whileHover={{ y: -5 }}
              >
                <div className="metric-card text-center">
                  <div className="metric-value">24/7</div>
                  <div className="metric-label">دعم فني</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              className="relative z-10"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative mx-auto w-full max-w-lg flex items-center justify-center">
                <div className="hero-icon-wrapper">
                  <div className="hero-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="8" y="12" width="48" height="40" rx="6" ry="6" stroke="currentColor" strokeWidth="3" />
                      <rect x="16" y="20" width="22" height="6" rx="3" fill="currentColor" opacity="0.75" />
                      <rect x="16" y="30" width="32" height="4" rx="2" fill="currentColor" opacity="0.55" />
                      <rect x="16" y="38" width="26" height="4" rx="2" fill="currentColor" opacity="0.4" />
                      <circle cx="46" cy="24" r="5" stroke="currentColor" strokeWidth="3" />
                      <path d="M43 39l5 5 9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              className="absolute top-10 -left-10 hero-floating-card"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center gap-3">
                <div className="icon-circle icon-circle--success">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold theme-heading">حجز مؤكد</div>
                  <div className="text-xs theme-text">منذ دقيقتين</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-10 -right-10 hero-floating-card"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <div className="flex items-center gap-3">
                <div className="icon-circle icon-circle--info">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold theme-heading">تذكير</div>
                  <div className="text-xs theme-text">موعد بعد ساعة</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

