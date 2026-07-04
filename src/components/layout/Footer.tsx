import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tv, MessageCircle, Video, Ghost, Music2 } from 'lucide-react';

const SOCIALS = [
  { href: 'https://www.twitch.tv/fawzz_tv', label: 'Twitch', icon: Tv, hoverClass: 'hover:text-twitch' },
  { href: 'https://x.com/Fawzz_tv', label: 'X (Twitter)', icon: MessageCircle, hoverClass: 'hover:text-gray-200' },
  { href: 'https://www.tiktok.com/@fawzztv', label: 'TikTok', icon: Music2, hoverClass: 'hover:text-pink-400' },
  { href: 'https://snapchat.com/add/fawzz_tv', label: 'Snapchat', icon: Ghost, hoverClass: 'hover:text-yellow-400' },
  { href: 'https://www.youtube.com/@Fawzztv', label: 'YouTube', icon: Video, hoverClass: 'hover:text-red-400' },
];

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-10">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm space-y-5">
        {/* Brand */}
        <Link to="/" className="inline-block">
          <span className="brand-text text-lg">
            FAWZZ_TV
          </span>
        </Link>

        {/* Socials */}
        <div className="flex justify-center gap-6">
          {SOCIALS.map(social => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors p-1 ${social.hoverClass}`}
              aria-label={social.label}
            >
              <social.icon size={20} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p>© {year} FAWZZ_TV. {t('footer.rights')}</p>
      </div>
    </footer>
  );
}
