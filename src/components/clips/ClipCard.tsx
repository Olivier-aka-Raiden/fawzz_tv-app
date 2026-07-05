import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock } from 'lucide-react';
import type { ClipData } from '../../data/clips';

function formatViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ClipCard({ clip, index }: { clip: ClipData; index: number }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost&parent=${window.location.hostname}&autoplay=true`}
          title={clip.title}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors cursor-pointer group"
      onClick={() => setPlaying(true)}
    >
      <div className="aspect-video relative bg-gray-800">
        <img src={clip.thumbnailUrl} alt={clip.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-twitch/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {formatDuration(clip.duration)}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors">
          {clip.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Eye size={12} />{formatViews(clip.viewCount)}</span>
          <span className="flex items-center gap-1"><Clock size={12} />{formatDuration(clip.duration)}</span>
        </div>
      </div>
    </motion.div>
  );
}
