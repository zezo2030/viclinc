import { motion } from 'framer-motion';
import calendarImage from '../assets/calendar.jpg';
import analizImage from '../assets/analiz.jpg';

const dashboards = [
  {
    title: 'لوحة المواعيد الفورية',
    description: 'متابعة الحجوزات اليومية مع حالة التأكيد والتنبيهات الذكية.',
    stats: '32 زيارة مؤكدة اليوم',
    image: calendarImage,
  },
  {
    title: 'تحليلات الأداء',
    description: 'رؤية شاملة لنسب الحضور، مصادر المرضى، ومتوسط زمن الانتظار.',
    stats: '+18% نمو شهري',
    image: analizImage,
  },
  {
    title: 'إدارة الملفات الطبية',
    description: 'وصول سريع لملفات المرضى مع ملاحظات الطبيب وخطط العلاج.',
    stats: '240 ملف محدث هذا الأسبوع',
    image: 'https://m-quality.net/wp-content/uploads/2018/10/mediacal-records.jpg',
  },
];

const DashboardGallery = () => {
  return (
    <section className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag-pill">لوحات تحكم مبتكرة</span>
          <h2 className="section-title text-4xl md:text-5xl mb-4">كل ما تحتاجه في نظرة واحدة</h2>
          <p className="section-description text-xl max-w-3xl mx-auto">
            واجهات عصرية تمنح فريقك بيانات دقيقة في الوقت الفعلي لاتخاذ قرارات أسرع وأكثر ذكاءً.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {dashboards.map((dashboard, index) => (
            <motion.article
              key={dashboard.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="feature-card overflow-hidden p-0"
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={dashboard.image}
                  alt={dashboard.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 showcase-overlay opacity-70" />
                <div className="absolute bottom-4 right-4 left-4 surface-blur p-4 text-sm theme-heading">
                  {dashboard.stats}
                </div>
              </div>
              <div className="p-6">
                <h3 className="feature-card-title mb-2">{dashboard.title}</h3>
                <p className="feature-card-text mb-4">{dashboard.description}</p>
                <a
                  href="https://wa.me/966599773417"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-inline font-semibold"
                >
                  اطلب عرضاً توضيحياً
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardGallery;
