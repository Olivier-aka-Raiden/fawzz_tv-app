import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AdventureDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <Link to="/aventures" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
        <ArrowLeft size={18} />
        Retour
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Aventure: {id}</h1>
      <p className="text-gray-400">Détail de l'aventure — en construction</p>
    </section>
  );
}
