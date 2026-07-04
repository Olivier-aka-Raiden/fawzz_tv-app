import { useTranslation } from 'react-i18next';
import { Tv, MessageCircle, Video } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm space-y-4">
        <div className="flex justify-center gap-6">
          <a href="https://twitch.tv/fawzz_tv" target="_blank" rel="noopener noreferrer"
             className="hover:text-twitch transition-colors p-1" aria-label="Twitch">
            <Tv size={20} />
          </a>
          <a href="https://twitter.com/fawzz_tv" target="_blank" rel="noopener noreferrer"
             className="hover:text-blue-400 transition-colors p-1" aria-label="Twitter">
            <MessageCircle size={20} />
          </a>
          <a href="https://youtube.com/@fawzz_tv" target="_blank" rel="noopener noreferrer"
             className="hover:text-red-400 transition-colors p-1" aria-label="YouTube">
            <Video size={20} />
          </a>
        </div>
        <p>© {year} Fawzz_tv. {t('footer.rights')}</p>
      </div>
    </footer>
  );
}
