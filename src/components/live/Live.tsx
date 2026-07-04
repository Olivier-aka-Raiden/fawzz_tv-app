import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, Tv } from 'lucide-react';
import { updateTwitchLiveStatus, useTwitchLive } from '../../hooks/useTwitchLive';

const CHANNEL = 'fawzz_tv';

// Derive parent domain for Twitch embed's parent= parameter
const PARENT = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export default function Live() {
  const { t } = useTranslation();
  const isLive = useTwitchLive();
  const playerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  const initPlayer = useCallback(() => {
    if (!playerRef.current || scriptLoaded.current) return;
    scriptLoaded.current = true;

    // Twitch embed SDK fires ONLINE / OFFLINE events
    try {
      const player = new (window as any).Twitch.Player(playerRef.current, {
        channel: CHANNEL,
        width: '100%',
        height: '100%',
        parent: [PARENT],
        autoplay: true,
        muted: false,
      });

      player.addEventListener((window as any).Twitch.Player.ONLINE, () => {
        updateTwitchLiveStatus(true);
      });

      player.addEventListener((window as any).Twitch.Player.OFFLINE, () => {
        updateTwitchLiveStatus(false);
      });
    } catch {
      // Twitch SDK may not be available — degrade gracefully
      scriptLoaded.current = false;
    }
  }, []);

  useEffect(() => {
    // Load Twitch embed script once
    if (document.querySelector('script[src="https://embed.twitch.tv/embed/v1.js"]')) {
      initPlayer();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://embed.twitch.tv/embed/v1.js';
    script.async = true;
    script.onload = initPlayer;
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount — other components may use it
    };
  }, [initPlayer]);

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {t('live.title')}
          </h1>
          {/* Live status badge */}
          <span
            className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              transition-all duration-500
              ${isLive
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-gray-800 text-gray-500'
              }
            `}
          >
            <span
              className={`
                w-2 h-2 rounded-full
                ${isLive ? 'bg-white neon-live-dot' : 'bg-gray-600'}
              `}
            />
            {isLive ? t('live.liveNow') : t('live.offline')}
          </span>
        </div>
        <p className="text-gray-400 max-w-xl mx-auto">{t('live.subtitle')}</p>
      </motion.div>

      {/* Player + Chat grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4"
      >
        {/* Left: Twitch Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          {isLive ? (
            <div ref={playerRef} className="w-full h-full" />
          ) : (
            /* Offline placeholder with the embed */
            <div className="w-full h-full relative">
              <div ref={playerRef} className="w-full h-full" />
              {/* Fallback if JS embed fails */}
              <iframe
                src={`https://player.twitch.tv/?channel=${CHANNEL}&parent=${PARENT}`}
                className="w-full h-full absolute inset-0"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Right: Twitch Chat */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl flex flex-col min-h-[400px] lg:min-h-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800 bg-gray-900/80">
            <Tv size={14} className="text-twitch" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              {t('live.chat')}
            </span>
          </div>
          <iframe
            src={`https://www.twitch.tv/embed/${CHANNEL}/chat?parent=${PARENT}&darkpopout`}
            className="flex-1 w-full border-0"
            title="Twitch Chat"
          />
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <a
          href={`https://twitch.tv/${CHANNEL}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-twitch hover:bg-twitch-glow text-white font-semibold rounded-xl transition-all duration-300 hover:neon-glow"
        >
          <ExternalLink size={18} />
          {t('live.cta')}
        </a>
      </motion.div>
    </section>
  );
}
