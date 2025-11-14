import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag-pill">من نحن</span>
          <h2 className="section-title text-4xl md:text-5xl font-black mb-6">
            MedFlw أكثر من منصة لإدارة العيادات
          </h2>
          <p className="section-description text-xl max-w-3xl mx-auto leading-relaxed">
            نبني حلولاً ذكية تمنح عيادتك هويتها الرقمية الكاملة، وتقرّب فريقك من مرضاك دون وسيط.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="feature-card text-lg leading-relaxed space-y-6"
          >
            <p>
              MedFlw منصة سعودية ذكية تمكّن العيادات والمراكز الطبية من امتلاك تطبيقها الخاص باسمها وشعارها،
              لإدارة المواعيد، الاستشارات، الرعاية المنزلية، والمدفوعات بكل سهولة.
            </p>
            <p>
              نحن لا نقدم نظامًا مشتركًا… بل هوية رقمية مستقلة لكل عيادة تعكس شخصيتها وتقرّبها من مرضاها،
              دون الاعتماد على تطبيقات وسيطة أو عمولات.
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="feature-card space-y-4"
          >
            <h3 className="text-2xl font-bold theme-heading">
              هدفنا
            </h3>
            <p className="text-lg leading-relaxed theme-text">
              هدفنا هو تحويل العيادات إلى منظومات رقمية متكاملة تربط المريض، والطبيب، والإدارة في تجربة
              واحدة سلسة واحترافية.
            </p>
            <div className="divider" />
            <p className="theme-text">
              كل ما نقدمه مصمم ليُسهّل التحول الرقمي، ويضمن تجربة مميزة لكل الأطراف، مع دعم محلي يفهم احتياجات
              القطاع الصحي السعودي.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
};

export default About;


