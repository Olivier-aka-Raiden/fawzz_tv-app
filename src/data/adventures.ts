import type { Project } from '../types/project';

export const PROJECTS: Project[] = [
  {
    id: 'sochaux-nice-2022',
    title: 'Sochaux → Nice',
    subtitle: 'La première traversée de la France à vélo',
    description: "Première grande aventure cycliste en direct sur Twitch. 10 jours pour relier Sochaux à la Méditerranée, posant les bases de ce qui allait devenir une série de voyages communautaires.",
    badge: '2022',
    dates: { start: '2022-07-15', end: '2022-07-25' },
    routeId: 'sochaux-nice-2022',
    highlights: [
      "Première traversée complète de la France à vélo en live",
      "Arrivée sur la Méditerranée après 620 km",
      "Naissance du format d'aventure communautaire sur la chaîne",
    ],
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
    description: "Une expédition de 13 jours jusqu'au Danemark qui a confirmé la capacité à réaliser des aventures longue distance en totale autonomie, streamées en direct.",
    badge: '2023',
    dates: { start: '2023-06-02', end: '2023-06-15' },
    routeId: 'sochaux-denmark-2023',
    highlights: [
      "Passage de 4 pays : France, Allemagne, Danemark",
      "1 000 km en autonomie complète",
      "Confirmation du format : la chaîne peut produire du contenu longue distance fiable",
    ],
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
    description: "Le format SubaBike est né : chaque abonnement ajoute des kilomètres au lieu de temps. 34 jours d'aventure internationale où la communauté décide de la route en temps réel.",
    badge: '2024 • SubaBike',
    dates: { start: '2024-09-06', end: '2024-10-10' },
    routeId: 'sochaux-malta-2024',
    highlights: [
      "Format SubaBike inédit : les subs allongent le parcours",
      "Un donateur ajoute 1 700 km d'un coup, record absolu",
      "34 jours de stream — la plus longue aventure de la chaîne",
      "Traversée de 5 pays jusqu'à Malte",
    ],
    stats: [
      { label: 'Distance', value: '1 800 km' },
      { label: 'Durée', value: '34 jours' },
      { label: 'Stream', value: '286 h' },
      { label: 'Watch', value: '64K' },
    ],
  },
];
