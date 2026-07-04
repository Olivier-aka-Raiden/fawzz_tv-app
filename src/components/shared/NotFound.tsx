import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-bold text-gray-700 mb-4">404</h1>
      <p className="text-gray-400 mb-8">Page introuvable</p>
      <Link to="/" className="text-twitch hover:text-twitch-glow transition-colors">
        ← Retour à l'accueil
      </Link>
    </div>
  );
}
