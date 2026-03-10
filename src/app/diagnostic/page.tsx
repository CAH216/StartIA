import { redirect } from 'next/navigation';

/**
 * /diagnostic est remplacé par /parcours
 * Redirection permanente pour garder les anciens liens fonctionnels
 */
export default function DiagnosticRedirect() {
  redirect('/parcours');
}
