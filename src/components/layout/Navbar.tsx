import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useTwitchLive } from '../../hooks/useTwitchLive';

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLive = useTwitchLive();

  const NAV_LINKS = [
    { to: '/aventures', label: t('nav.adventures') },
    { to: '/clips', label: t('nav.clips') },
    { to: '/live', label: t('nav.live'), liveIndicator: true },
    { to: '/sponsors', label: t('nav.sponsors') },
    { to: '/a-propos', label: t('nav.about') },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand — logo + FAWZZ_TV */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
          onClick={() => setOpen(false)}
        >
          <img
            src="/assets/brand/logo.png"
            alt="FAWZZ_TV"
            className="h-8 w-auto"
          />
          <span className="brand-text text-sm sm:text-base whitespace-nowrap">
            FAWZZ_TV
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm transition-colors flex items-center gap-1.5 ${
                location.pathname === link.to
                  ? 'text-twitch font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
              {link.liveIndicator && (
                <span
                  className={`
                    inline-block w-2 h-2 rounded-full transition-all duration-500
                    ${isLive
                      ? 'bg-red-500 neon-live-dot'
                      : 'bg-gray-700'
                    }
                  `}
                  title={isLive ? 'En direct' : 'Hors ligne'}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 space-y-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block text-sm py-3 px-2 rounded-lg transition-colors flex items-center gap-2 ${
                location.pathname === link.to
                  ? 'text-twitch bg-twitch/10 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
              {link.liveIndicator && (
                <span
                  className={`
                    inline-block w-2 h-2 rounded-full transition-all duration-500
                    ${isLive
                      ? 'bg-red-500 neon-live-dot'
                      : 'bg-gray-700'
                    }
                  `}
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
