import { redirect } from 'next/navigation';

/**
 * /roadmap est remplacé par /parcours
 * Redirection permanente pour garder les anciens liens fonctionnels
 */
export default function RoadmapRedirect() {
  redirect('/parcours');
}