import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const STAT_VALUES = [
  { key: 'adventures', value: '3' },
  { key: 'km', value: '3 420' },
  { key: 'hours', value: '552 h' },
  { key: 'watch', value: '93.1K' },
];

export default function Stats() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4 bg-gray-900/50 border-y border-gray-800">
      <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {STAT_VALUES.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-gray-500 text-sm uppercase tracking-wider">{t(`home.stats.${stat.key}`)}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
