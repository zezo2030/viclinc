import { motion } from 'framer-motion';

const benefits = [
  {
    benefit: 'هوية رقمية مستقلة',
    impact: 'تعزيز ثقة المريض وولائه لعيادتك',
  },
  {
    benefit: 'زيادة الحجوزات',
    impact: 'تجربة سهلة تقلل الانتظار وتزيد الإقبال',
  },
  {
    benefit: 'تحسين الإيرادات',
    impact: 'لا عمولات — كل الأرباح تعود لك',
  },
  {
    benefit: 'إدارة أسهل',
    impact: 'كل شيء في لوحة واحدة (المواعيد، الفواتير، المرضى)',
  },
  {
    benefit: 'تكامل سلس',
    impact: 'يعمل بجانب نظامك الداخلي الحالي',
  },
  {
    benefit: 'رؤية فورية',
    impact: 'تقارير وأرقام مباشرة لدعم القرار',
  },
  {
    benefit: 'دعم محلي',
    impact: 'فريق سعودي يفهم السوق الصحي',
  },
];

const Benefits = () => {
  return (
    <section id="benefits" className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag-pill">قيمة فورية</span>
          <h2 className="section-title text-4xl md:text-5xl font-black mb-4">
            فوائد{' '}
            <span className="section-highlight">
              MedFlw
            </span>{' '}
            للعيادة
          </h2>
          <p className="section-description text-xl max-w-3xl mx-auto">
            أثر ملموس في كل جانب من جوانب عملك — من الهوية إلى الإيرادات.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden border border-blue-100 shadow-2xl bg-white/90 backdrop-blur-md"
        >
          <table className="min-w-full divide-y divide-blue-100 text-right">
            <thead className="bg-gradient-to-l from-blue-100/80 to-green-100/70">
              <tr className="text-neutral-700">
                <th scope="col" className="px-6 py-4 text-lg font-bold">
                  الفائدة
                </th>
                <th scope="col" className="px-6 py-4 text-lg font-bold">
                  الأثر
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {benefits.map((row, index) => (
                <tr
                  key={row.benefit}
                  className={index % 2 === 0 ? 'bg-white/80' : 'bg-blue-50/60'}
                >
                  <td className="px-6 py-4 text-lg font-semibold text-neutral-800">
                    {row.benefit}
                  </td>
                  <td className="px-6 py-4 text-lg text-neutral-600">
                    {row.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;


