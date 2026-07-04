import type { Project } from '../types/project';

export const PROJECTS: Project[] = [
  {
    id: 'sochaux-nice-2022',
    title: 'Sochaux → Nice',
    subtitle: 'La première traversée de la France à vélo',
    description: "Première grande aventure cycliste en direct sur Twitch. 10 jours pour relier Sochaux à la Méditerranée.",
    badge: '2022',
    stats: [
      { label: 'Distance', value: '620 km' },
      { label: 'Durée', value: '10 jours' },
      { label: 'Stream', value: '110 h' },
      { label: 'Watch', value: '21.2K' },
    ],
  },
  {
    id: 'sochaux-denmark-2023',
    title: 'Sochaux → Danemark',
    subtitle: "Première traversée européenne en autonomie",
    description: "Une expédition de 13 jours jusqu'au Danemark qui a confirmé la viabilité du format longue distance.",
    badge: '2023',
    stats: [
      { label: 'Distance', value: '1 000 km' },
      { label: 'Durée', value: '13 jours' },
      { label: 'Stream', value: '156 h' },
      { label: 'Watch', value: '7.9K' },
    ],
  },
  {
    id: 'sochaux-malta-2024',
    title: 'Sochaux → Malte',
    subtitle: 'Le premier SubaBike — les subs ajoutent des kilomètres',
    description: "34 jours d'aventure internationale. Un donateur a ajouté 1 700 km d'un coup. La communauté décide de la route.",
    badge: '2024 • SubaBike',
    stats: [
      { label: 'Distance', value: '1 800 km' },
      { label: 'Durée', value: '34 jours' },
      { label: 'Stream', value: '286 h' },
      { label: 'Watch', value: '64K' },
    ],
  },
];
