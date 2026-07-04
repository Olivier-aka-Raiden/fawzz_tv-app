import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';
import type { Sponsor } from '../../types/sponsor';

export default function SponsorCard({ sponsor, index }: { sponsor: Sponsor; index: number }) {
  return (
    <motion.a
      href={sponsor.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all hover:bg-gray-900/80 group flex flex-col items-center text-center gap-4"
    >
      <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
        {sponsor.logoSrc ? (
          <img src={sponsor.logoSrc} alt={sponsor.name} className="w-full h-full object-contain p-2" />
        ) : (
          <span className="text-2xl font-bold text-gray-600">{sponsor.name.charAt(0)}</span>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white group-hover:text-twitch-glow transition-colors">
          {sponsor.name}
        </h3>
        <p className="text-gray-400 text-sm mt-1 leading-relaxed">{sponsor.description}</p>
      </div>

      {sponsor.promoCode && (
        <div className="flex items-center gap-2 px-4 py-2 bg-twitch/10 border border-twitch/20 rounded-lg">
          <Tag size={14} className="text-twitch" />
          <code className="text-twitch font-mono font-semibold text-sm">{sponsor.promoCode}</code>
        </div>
      )}

      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 group-hover:text-gray-300 transition-colors mt-auto">
        <ExternalLink size={14} />
        {new URL(sponsor.websiteUrl).hostname}
      </span>
    </motion.a>
  );
}
