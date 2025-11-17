import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'ما هي تكلفة استخدام ميدفلو؟',
      answer: 'تختلف الأسعار حسب حجم العيادة وعدد الأطباء واحتياجاتك الخاصة. نقدم باقات مرنة تبدأ من أسعار تنافسية مع فترة تجريبية مجانية. تواصل معنا للحصول على عرض مخصص لعيادتك.',
    },
    {
      question: 'هل البيانات آمنة ومحمية؟',
      answer: 'نعم، أمان البيانات أولويتنا القصوى. نستخدم أحدث معايير التشفير والأمان، ونلتزم بمعايير حماية البيانات الطبية. جميع البيانات مشفرة ومحمية بنسخ احتياطية دورية.',
    },
    {
      question: 'كم يستغرق إعداد النظام؟',
      answer: 'عملية الإعداد سريعة وسهلة. يمكن إعداد حسابك وبدء العمل خلال 24-48 ساعة فقط. نوفر أيضاً دعماً كاملاً لاستيراد بياناتك الحالية وتدريب فريقك.',
    },
    {
      question: 'هل يدعم النظام العيادات متعددة الفروع؟',
      answer: 'نعم، ميدفلو مصمم لدعم العيادات والمجمعات الطبية متعددة الفروع. يمكنك إدارة عدة فروع من لوحة تحكم واحدة مع صلاحيات منفصلة لكل فرع.',
    },
    {
      question: 'هل يتكامل النظام مع بوابات الدفع؟',
      answer: 'نعم، نتكامل مع جميع بوابات الدفع الرئيسية في السعودية مثل مدى، Visa، Mastercard، STC Pay وغيرها. يمكن للمرضى الدفع بسهولة عبر الإنترنت.',
    },
    {
      question: 'هل يمكن استخدام النظام على الجوال؟',
      answer: 'نعم، ميدفلو متاح عبر تطبيقات الجوال لنظامي iOS وAndroid، بالإضافة إلى واجهة ويب متجاوبة تعمل على جميع الأجهزة بسلاسة.',
    },
    {
      question: 'ما نوع الدعم الفني المتوفر؟',
      answer: 'نقدم دعماً فنياً متواصلاً على مدار الساعة عبر الهاتف، واتساب، والبريد الإلكتروني. فريقنا المتخصص جاهز دائماً لمساعدتك في حل أي مشكلة أو استفسار.',
    },
    {
      question: 'هل يمكن تخصيص النظام حسب احتياجاتنا؟',
      answer: 'نعم، نوفر خيارات تخصيص واسعة لتناسب احتياجات عيادتك الخاصة. يمكن تخصيص الحقول، التقارير، والعمليات حسب سير عملك.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-4xl font-bold mb-4">
            الأسئلة{' '}
            <span className="section-highlight">
              الشائعة
            </span>
          </h2>
          <p className="section-description text-xl">
            إجابات على أهم الأسئلة التي قد تخطر ببالك
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="faq-item overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="faq-toggle"
              >
                <span className="faq-question text-lg pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <svg
                    className="w-6 h-6 faq-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 faq-answer">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="surface-blur text-center mt-12 p-8"
        >
          <h3 className="text-2xl font-bold theme-heading mb-3">
            لديك سؤال آخر؟
          </h3>
          <p className="theme-text mb-6">
            فريقنا جاهز للإجابة على جميع استفساراتك
          </p>
          <a
            href="https://wa.me/966599773417"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            تواصل معنا على واتساب
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;

