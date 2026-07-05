export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stats: { label: string; value: string }[];
  badge?: string;
  dates?: { start: string; end: string };
  routeId?: string;
  highlights?: string[];
  comingSoon?: boolean;
  /** i18n key prefix for translatable fields (title, subtitle, description, badge, stats labels) */
  tKey?: string;
}
