'use client';
/**
 * LanguageContext — Internationalisation complète FR / EN
 * Détection navigateur → persistance localStorage → hook useLanguage() + composant LanguageSwitcher
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'fr' | 'en';

export const SUPPORTED_LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
];

/* ═══════════════════════════════════════════════════════════════
   TRANSLATIONS — COMPLET
═══════════════════════════════════════════════════════════════ */
export const TRANSLATIONS = {
  fr: {
    /* ── Navigation Sidebar ── */
    nav_dashboard:        'Tableau de bord',
    nav_mes_formations:   'Mes formations',
    nav_parcours:         'Mon Parcours IA',
    nav_certificats:      'Mes Certificats',
    nav_catalogue:        'Catalogue',
    nav_session_expert:   'Session Expert',
    nav_abonnements:      'Abonnements',
    nav_integration:      'Intégration IA',
    nav_mon_espace:       'Mon Espace',
    nav_creer_formation:  'Créer une formation',
    nav_mes_sessions:     'Mes Sessions',

    /* ── Commun ── */
    logout:               'Déconnexion',
    mon_profil:           'Mon profil',
    theme_dark:           'Mode sombre',
    theme_light:          'Mode clair',
    langue:               'Langue :',
    loading:              'Chargement…',
    back:                 'Retour',
    see_more:             'Voir plus',
    see_all:              'Voir tout',
    close:                'Fermer',
    save:                 'Enregistrer',
    cancel:               'Annuler',
    send:                 'Envoyer',
    continue:             'Continuer',
    next:                 'Suivant',
    previous:             'Précédent',
    step:                 'Étape',
    week:                 'semaine',
    weeks:                'semaines',
    hours:                'heures',
    minutes:              'minutes',
    free:                 'Gratuit',
    pro_badge:            'PRO',
    popular:              '⭐ Le plus populaire',
    recommended:          'Recommandé',

    /* ── Dashboard ── */
    dash_welcome:         'Bon retour',
    dash_welcome_new:     'Bienvenue sur StratIA',
    dash_subtitle:        'Votre assistant IA est prêt à travailler.',
    dash_diagnostic:      'Mon diagnostic IA',
    dash_score:           'Score IA',
    dash_level:           'Niveau',
    dash_roadmap_prog:    'Progression du plan',
    dash_tasks_done:      'tâches terminées',
    dash_roi_title:       'ROI estimé',
    dash_roi_weekly:      'h/sem économisées',
    dash_roi_monthly:     '$/mois économisés',
    dash_actions_title:   'Actions rapides',
    dash_action_diag:     'Voir mon diagnostic',
    dash_action_roadmap:  'Ma feuille de route',
    dash_action_sessions: 'Prendre un rendez-vous',
    dash_action_chatbot:  'Poser une question à l\'IA',
    dash_nudge_title:     'Vous n\'avez pas avancé depuis un moment',
    dash_nudge_body:      'Reprenez là où vous en étiez — 15 min suffisent pour terminer votre prochaine étape.',
    dash_nudge_cta:       'Reprendre ma roadmap',
    dash_shortcuts:       'Raccourcis',
    dash_upgrade_title:   'Passez au Pro',
    dash_upgrade_body:    '-40% sur toutes les formations et 1 formation offerte chaque mois.',
    dash_upgrade_cta:     'Voir les plans',

    /* ── Catalogue Formations ── */
    cat_title:            'Formations StratIA',
    cat_subtitle_fn:      (n: number) => `${n} formation${n > 1 ? 's' : ''} pour maîtriser l'intelligence artificielle`,
    cat_search:           'Rechercher une formation…',
    cat_all:              'Toutes',
    cat_all_levels:       'Tous niveaux',
    cat_all_types:        'Tout',
    cat_video:            'Vidéo',
    cat_live:             'Live',
    cat_no_results:       'Aucune formation trouvée',
    cat_no_results_sub:   'Essayez d\'autres filtres ou mots-clés.',
    cat_views:            'vues',
    cat_enrolled:         'inscrits',
    cat_see_details:      'Voir les détails',
    cat_pro_upsell:       'Abonnez-vous Pro',
    cat_pro_desc:         '-40% sur toutes les formations et 1 formation offerte chaque mois.',
    cat_pro_cta:          'Voir les plans Pro',
    cat_level_beg:        'Débutant',
    cat_level_int:        'Intermédiaire',
    cat_level_adv:        'Avancé',

    /* ── Modal Formation ── */
    modal_price:          'Prix de la formation',
    modal_unlimited:      'Accès illimité · Certificat inclus',
    modal_or_with:        'ou avec',
    modal_pro_plan:       'Abonnement Pro',
    modal_buy_btn:        'Acheter et regarder',
    modal_pro_upsell_h:   'Mieux avec l\'Abonnement Pro',
    modal_pro_upsell_p:   '-40% sur toutes les formations, 1 formation offerte/mois et chat direct avec vos formateurs.',
    modal_see_plans:      'Voir les plans Pro',
    modal_already_owned:  'Vous avez déjà cette formation !',
    modal_goto_mine:      'Retrouvez-la dans Mes formations pour la regarder.',
    modal_watch:          'Regarder',
    modal_pro_included:   'Regarder (inclus dans votre Pro)',
    modal_unlocked:       'Formation débloquée !',
    modal_unlocked_sub:   'Retrouvez-la dans Mes formations pour la regarder à tout moment.',
    modal_chat_pro:       'Chat avec le formateur — réservé Pro',
    modal_chat_pro_sub:   'Achetez cette formation ou abonnez-vous Pro pour accéder au chat.',
    modal_chat_pro_badge: 'Chat Pro inclus',
    modal_trainer:        'Formateur',
    modal_processing:     'Traitement…',
    modal_live_session:   'Session Live',
    modal_live_email:     'Le lien vous sera envoyé par email 1h avant',

    /* ── Mes Formations ── */
    myf_title:            'Mes formations',
    myf_subtitle_fn:      (n: number) => `${n} formation${n > 1 ? 's' : ''} achetée${n > 1 ? 's' : ''}`,
    myf_buy_btn:          'Acheter une formation',
    myf_upgrade_title:    'Débloquez le chat avec vos formateurs',
    myf_upgrade_body:     'Le chat en direct avec les formateurs est réservé aux membres Pro.',
    myf_upgrade_cta:      'Voir les plans',
    myf_empty_title:      'Aucune formation achetée',
    myf_empty_body:       'Explorez le catalogue pour trouver votre première formation et commencer à vous former.',
    myf_empty_cta:        'Voir le catalogue',
    myf_in_progress:      'En cours',
    myf_unlimited:        'Accès illimité',
    myf_watch:            'Regarder',
    myf_pause:            'Pause',
    myf_chat:             'Chat formateur',
    myf_chat_pro:         'Chat (Pro)',
    myf_formateur_rep:    'Formateur · répond sous 24h',
    myf_chat_placeholder: 'Posez votre question…',
    myf_fullscreen:       'Plein écran',
    myf_exit_fullscreen:  'Quitter le plein écran',

    /* ── Mon Parcours ── */
    parcours_title:       'Votre parcours IA sur mesure',
    parcours_subtitle:    'Répondez à 4 questions rapides et notre IA vous génère un parcours de formations personnalisé.',
    parcours_start:       'Trouver mes formations',
    parcours_q4:          '4 questions',
    parcours_q4_sub:      'Moins de 2 min',
    parcours_ai_pers:     'IA personnalisée',
    parcours_ai_pers_sub: 'Adapté à vous',
    parcours_concrete:    'Formations concrètes',
    parcours_concrete_sub:'Chaque étape = 1 cours',
    parcours_loading:     'Notre IA analyse votre profil…',
    parcours_loading_sub: 'Nous sélectionnons les formations les plus adaptées à vos réponses.',
    parcours_result_title:'Votre parcours IA',
    parcours_custom:      'Parcours personnalisé',
    parcours_steps:       'Étapes',
    parcours_weeks_est:   'Semaines estimées',
    parcours_completed:   'Complétées',
    parcours_progress:    'Progression',
    parcours_step_by_step:'Votre parcours étape par étape',
    parcours_mark:        'Marquer',
    parcours_done:        'Fait',
    parcours_objective:   'Objectif',
    parcours_why:         'Pourquoi cette formation',
    parcours_see:         'Voir',
    parcours_browse:      'Parcourir',
    parcours_redo:        'Refaire',
    parcours_start_step1: 'Prêt à démarrer l\'étape 1 ?',
    parcours_see_all:     'Voir toutes les formations',
    parcours_error:       'Une erreur est survenue. Veuillez réessayer.',
    parcours_generate:    'Générer mon parcours',
    parcours_next:        'Suivant',

    /* ── Abonnement ── */
    sub_title:            'Choisissez votre plan',
    sub_subtitle:         'L\'IA évolue chaque semaine. Restez toujours compétitif avec l\'abonnement Pro.',
    sub_cancel:           'Annulez à tout moment · Pas d\'engagement annuel · Paiement sécurisé',
    sub_calc_title:       'Combien économisez-vous avec Pro ?',
    sub_calc_sub:         'Ajustez selon votre utilisation mensuelle',
    sub_calc_without:     'Sans abonnement',
    sub_calc_with:        'Avec Pro',
    sub_calc_save:        'Vous économisez',
    sub_formations_month: 'Formations / mois',
    sub_sessions_month:   'Sessions expert / mois',
    sub_compare_title:    'Comparatif détaillé',
    sub_why_title:        'Pourquoi s\'abonner ?',
    sub_why_body:         'L\'IA évolue chaque semaine. L\'abonnement Pro vous garde toujours à la pointe sans effort.',
    sub_feature:          'Fonctionnalité',
    sub_integration_title:'Intégration IA sur mesure pour votre équipe',
    sub_integration_body: 'Notre équipe analyse vos processus, crée un plan d\'intégration IA et forme vos équipes.',
    sub_integration_cta:  'Demander un devis',
    sub_questions:        'Des questions ?',
    sub_talk_consultant:  'Parlez à un consultant →',
    sub_per_month:        '/ mois',
    sub_per_formation:    '/ formation',
    plan_unit:            "\u00c0 l'unit\u00e9",
    plan_pro:             'Pro',
    plan_team:            '\u00c9quipe',
    subscribe:            'Passer Pro maintenant',


    /* ── Landing Page ── */
    land_badge:           'Propuls\u00e9 par l\'intelligence artificielle',
    land_h1_part1:        'Rendez vos \u00e9quipes',
    land_h1_part2:        'gr\u00e2ce \u00e0 l\'intelligence artificielle.',
    land_h1_sub:          'Formations vid\u00e9o \u00b7 Sessions live \u00b7 Int\u00e9gration en entreprise.\nR\u00e9sultats concrets d\u00e8s la premi\u00e8re semaine.',
    land_cta_primary:     'Commencer gratuitement',
    land_cta_secondary:   'Voir les formations',
    land_stat1:           'Professionnels form\u00e9s',
    land_stat2:           'Formations disponibles',
    land_stat3:           'Satisfaction client',
    land_scroll:          'D\u00e9filer',
    /* Topnav */
    nav_formations_link:  'Formations',
    nav_integration_link: 'Int\u00e9gration IA',
    nav_temoignages:      'T\u00e9moignages',
    nav_how_it_works:     'Comment \u00e7a marche',
    nav_pricing:          'Tarifs',
    nav_login:            'Connexion',
    nav_start:            'Commencer',
    /* ProofBar */
    proof_trust:          'Ils nous font confiance',
    /* Problem */
    prob_badge:           'Le probl\u00e8me',
    prob_h2:              'Combien d\'heures perdez-vous chaque semaine\u00a0?',
    prob_sub:             'Quelle que soit votre industrie, les m\u00eames inefficacit\u00e9s se r\u00e9p\u00e8tent.',
    /* Solution */
    sol_badge:            'Notre solution',
    sol_h2a:              'Deux piliers.',
    sol_h2b:              'Un seul objectif.',
    sol_sub:              'Monter en comp\u00e9tences ET int\u00e9grer l\'intelligence artificielle en production \u2014 pas seulement en th\u00e9orie.',
    sol_p1_badge:         'Pilier 1',
    sol_p1_title:         'Formations Vid\u00e9o Intelligence Artificielle',
    sol_p1_body:          'Des cours vid\u00e9o produits par des experts, organis\u00e9s en parcours progressifs. Notre IA analyse votre profil et vous recommande exactement ce dont vous avez besoin.',
    sol_p1_cta:           'Explorer les formations',
    sol_p2_badge:         'Pilier 2',
    sol_p2_title:         'Int\u00e9gration Intelligence Artificielle en Entreprise',
    sol_p2_body:          'Notre \u00e9quipe se d\u00e9place chez vous, analyse vos processus m\u00e9tier et livre un plan d\'int\u00e9gration IA cl\u00e9 en main. Du conseil \u00e0 l\'impl\u00e9mentation.',
    sol_p2_cta:           'Demander une int\u00e9gration',
    /* How it works */
    how_badge:            'Simple & structur\u00e9',
    how_h2:               'Comment \u00e7a marche',
    how_sub:              'De z\u00e9ro \u00e0 comp\u00e9tent en intelligence artificielle \u2014 que vous soyez seul ou en \u00e9quipe.',
    /* Integration */
    integ_badge:          'Int\u00e9gration intelligence artificielle',
    integ_h2a:            'On vient chez vous.',
    integ_h2b:            'On livre les r\u00e9sultats.',
    integ_body:           'Notre \u00e9quipe de consultants analyse vos processus m\u00e9tier, identifie les gains potentiels et livre un plan cl\u00e9 en main.',
    integ_cta:            'Demander une consultation',
    integ_productivity:   'Productivit\u00e9 moyenne gagn\u00e9e',
    /* Testimonials */
    test_badge:           'T\u00e9moignages',
    test_h2:              'Ce que disent nos clients',
    test_sub:             'Des r\u00e9sultats r\u00e9els, mesurables, v\u00e9rifiables.',
    /* CTA Final */
    cta_badge:            'Commencez aujourd\'hui gratuitement',
    cta_h2a:              'Pr\u00eat \u00e0 transformer votre entreprise',
    cta_h2b:              'avec l\'intelligence artificielle\u00a0?',
    cta_body:             'Rejoignez 200+ entreprises qui se forment et int\u00e8grent l\'IA avec StratIA. Premiers r\u00e9sultats d\u00e8s la premi\u00e8re semaine.',
    cta_btn1:             'Cr\u00e9er mon compte gratuit',
    cta_btn2:             'Parler \u00e0 un consultant',
    cta_note:             'Aucune carte de cr\u00e9dit requise \u00b7 Acc\u00e8s imm\u00e9diat \u00b7 Support francophone',
    cta_demo:             'Essayer la d\u00e9mo',
    /* Footer */
    foot_tagline:         'Formations IA & int\u00e9gration en entreprise pour rester comp\u00e9titif.',
    foot_platform:        'Plateforme',
    foot_services:        'Services',
    foot_account:         'Compte',
    foot_copyright:       '\u00a9 2026 StratIA. Tous droits r\u00e9serv\u00e9s.',
    foot_made:            'Propuls\u00e9 par IA \u00b7 Fait au Qu\u00e9bec \uD83C\uDF41',
    land_stat4:           'Formations IA',
    land_h1_cycling:      ['imbattables', 'comp\u00e9titives', 'autonomes', 'productives', 'innovantes'],
  },

  en: {
    /* ── Navigation Sidebar ── */
    nav_dashboard:        'Dashboard',
    nav_mes_formations:   'My Courses',
    nav_parcours:         'My AI Path',
    nav_certificats:      'My Certificates',
    nav_catalogue:        'Catalogue',
    nav_session_expert:   'Expert Session',
    nav_abonnements:      'Subscriptions',
    nav_integration:      'AI Integration',
    nav_mon_espace:       'My Space',
    nav_creer_formation:  'Create a Course',
    nav_mes_sessions:     'My Sessions',

    /* ── Common ── */
    logout:               'Log out',
    mon_profil:           'My profile',
    theme_dark:           'Dark mode',
    theme_light:          'Light mode',
    langue:               'Language:',
    loading:              'Loading…',
    back:                 'Back',
    see_more:             'See more',
    see_all:              'See all',
    close:                'Close',
    save:                 'Save',
    cancel:               'Cancel',
    send:                 'Send',
    continue:             'Continue',
    next:                 'Next',
    previous:             'Previous',
    step:                 'Step',
    week:                 'week',
    weeks:                'weeks',
    hours:                'hours',
    minutes:              'minutes',
    free:                 'Free',
    pro_badge:            'PRO',
    popular:              '⭐ Most popular',
    recommended:          'Recommended',

    /* ── Dashboard ── */
    dash_welcome:         'Welcome back',
    dash_welcome_new:     'Welcome to StratIA',
    dash_subtitle:        'Your AI assistant is ready to work.',
    dash_diagnostic:      'My AI diagnostic',
    dash_score:           'AI Score',
    dash_level:           'Level',
    dash_roadmap_prog:    'Plan progress',
    dash_tasks_done:      'tasks done',
    dash_roi_title:       'Estimated ROI',
    dash_roi_weekly:      'h/week saved',
    dash_roi_monthly:     '$/month saved',
    dash_actions_title:   'Quick actions',
    dash_action_diag:     'View my diagnostic',
    dash_action_roadmap:  'My roadmap',
    dash_action_sessions: 'Book an appointment',
    dash_action_chatbot:  'Ask the AI a question',
    dash_nudge_title:     'You haven\'t made progress in a while',
    dash_nudge_body:      'Pick up where you left off — 15 min is enough to complete your next step.',
    dash_nudge_cta:       'Resume my roadmap',
    dash_shortcuts:       'Shortcuts',
    dash_upgrade_title:   'Upgrade to Pro',
    dash_upgrade_body:    '-40% on all courses and 1 free course every month.',
    dash_upgrade_cta:     'View plans',

    /* ── Catalogue Formations ── */
    cat_title:            'StratIA Courses',
    cat_subtitle_fn:      (n: number) => `${n} course${n > 1 ? 's' : ''} to master artificial intelligence`,
    cat_search:           'Search a course…',
    cat_all:              'All',
    cat_all_levels:       'All levels',
    cat_all_types:        'All',
    cat_video:            'Video',
    cat_live:             'Live',
    cat_no_results:       'No course found',
    cat_no_results_sub:   'Try different filters or keywords.',
    cat_views:            'views',
    cat_enrolled:         'enrolled',
    cat_see_details:      'See details',
    cat_pro_upsell:       'Go Pro',
    cat_pro_desc:         '-40% on all courses and 1 free course every month.',
    cat_pro_cta:          'View Pro plans',
    cat_level_beg:        'Beginner',
    cat_level_int:        'Intermediate',
    cat_level_adv:        'Advanced',

    /* ── Modal Formation ── */
    modal_price:          'Course price',
    modal_unlimited:      'Unlimited access · Certificate included',
    modal_or_with:        'or with',
    modal_pro_plan:       'Pro subscription',
    modal_buy_btn:        'Buy and watch',
    modal_pro_upsell_h:   'Better with Pro subscription',
    modal_pro_upsell_p:   '-40% on all courses, 1 free course/month and direct chat with your instructors.',
    modal_see_plans:      'View Pro plans',
    modal_already_owned:  'You already have this course!',
    modal_goto_mine:      'Find it in My Courses to watch it.',
    modal_watch:          'Watch',
    modal_pro_included:   'Watch (included in your Pro)',
    modal_unlocked:       'Course unlocked!',
    modal_unlocked_sub:   'Find it in My Courses to watch at any time.',
    modal_chat_pro:       'Chat with instructor — Pro only',
    modal_chat_pro_sub:   'Buy this course or subscribe to Pro to access the chat.',
    modal_chat_pro_badge: 'Pro Chat included',
    modal_trainer:        'Instructor',
    modal_processing:     'Processing…',
    modal_live_session:   'Live Session',
    modal_live_email:     'The link will be sent to you by email 1h before',

    /* ── Mes Formations ── */
    myf_title:            'My Courses',
    myf_subtitle_fn:      (n: number) => `${n} course${n > 1 ? 's' : ''} purchased`,
    myf_buy_btn:          'Buy a course',
    myf_upgrade_title:    'Unlock chat with your instructors',
    myf_upgrade_body:     'Live chat with instructors is reserved for Pro members.',
    myf_upgrade_cta:      'View plans',
    myf_empty_title:      'No course purchased',
    myf_empty_body:       'Explore the catalogue to find your first AI course and start learning.',
    myf_empty_cta:        'View catalogue',
    myf_in_progress:      'In progress',
    myf_unlimited:        'Unlimited access',
    myf_watch:            'Watch',
    myf_pause:            'Pause',
    myf_chat:             'Instructor chat',
    myf_chat_pro:         'Chat (Pro)',
    myf_formateur_rep:    'Instructor · replies within 24h',
    myf_chat_placeholder: 'Ask your question…',
    myf_fullscreen:       'Fullscreen',
    myf_exit_fullscreen:  'Exit fullscreen',

    /* ── Mon Parcours ── */
    parcours_title:       'Your personalised AI path',
    parcours_subtitle:    'Answer 4 quick questions and our AI generates a personalised learning path.',
    parcours_start:       'Find my courses',
    parcours_q4:          '4 questions',
    parcours_q4_sub:      'Less than 2 min',
    parcours_ai_pers:     'Personalised AI',
    parcours_ai_pers_sub: 'Tailored to you',
    parcours_concrete:    'Concrete courses',
    parcours_concrete_sub:'Each step = 1 course',
    parcours_loading:     'Our AI is analysing your profile…',
    parcours_loading_sub: 'We are selecting the most suitable courses for your answers.',
    parcours_result_title:'Your AI path',
    parcours_custom:      'Personalised path',
    parcours_steps:       'Steps',
    parcours_weeks_est:   'Estimated weeks',
    parcours_completed:   'Completed',
    parcours_progress:    'Progress',
    parcours_step_by_step:'Your path step by step',
    parcours_mark:        'Mark',
    parcours_done:        'Done',
    parcours_objective:   'Objective',
    parcours_why:         'Why this course',
    parcours_see:         'View',
    parcours_browse:      'Browse',
    parcours_redo:        'Redo',
    parcours_start_step1: 'Ready to start step 1?',
    parcours_see_all:     'View all courses',
    parcours_error:       'An error occurred. Please try again.',
    parcours_generate:    'Generate my path',
    parcours_next:        'Next',

    /* ── Abonnement ── */
    sub_title:            'Choose your plan',
    sub_subtitle:         'AI evolves every week. Stay competitive with the Pro subscription.',
    sub_cancel:           'Cancel anytime · No annual commitment · Secure payment',
    sub_calc_title:       'How much do you save with Pro?',
    sub_calc_sub:         'Adjust based on your monthly usage',
    sub_calc_without:     'Without subscription',
    sub_calc_with:        'With Pro',
    sub_calc_save:        'You save',
    sub_formations_month: 'Courses / month',
    sub_sessions_month:   'Expert sessions / month',
    sub_compare_title:    'Detailed comparison',
    sub_why_title:        'Why subscribe?',
    sub_why_body:         'AI evolves every week. The Pro subscription keeps you always ahead effortlessly.',
    sub_feature:          'Feature',
    sub_integration_title:'Custom AI integration for your team',
    sub_integration_body: 'Our team analyses your processes, creates an AI integration plan and trains your teams.',
    sub_integration_cta:  'Request a quote',
    sub_questions:        'Questions?',
    sub_talk_consultant:  'Talk to a consultant →',
    sub_per_month:        '/ month',
    sub_per_formation:    '/ course',
    plan_unit:            'One-time',
    plan_pro:             'Pro',
    plan_team:            'Team',
    subscribe:            'Start Pro now',


    /* ── Landing Page ── */
    land_badge:           'Powered by artificial intelligence',
    land_h1_part1:        'Make your teams',
    land_h1_part2:        'with artificial intelligence.',
    land_h1_sub:          'Video courses \u00b7 Live sessions \u00b7 Enterprise AI integration.\nConcrete results from the first week.',
    land_cta_primary:     'Start for free',
    land_cta_secondary:   'View courses',
    land_stat1:           'Professionals trained',
    land_stat2:           'Courses available',
    land_stat3:           'Client satisfaction',
    land_scroll:          'Scroll',
    /* Topnav */
    nav_formations_link:  'Courses',
    nav_integration_link: 'AI Integration',
    nav_temoignages:      'Testimonials',
    nav_how_it_works:     'How it works',
    nav_pricing:          'Pricing',
    nav_login:            'Log in',
    nav_start:            'Get started',
    /* ProofBar */
    proof_trust:          'Trusted by',
    /* Problem */
    prob_badge:           'The problem',
    prob_h2:              'How many hours do you lose every week?',
    prob_sub:             'Whatever your industry, the same inefficiencies repeat themselves.',
    /* Solution */
    sol_badge:            'Our solution',
    sol_h2a:              'Two pillars.',
    sol_h2b:              'One goal.',
    sol_sub:              'Level up AND deploy artificial intelligence in production \u2014 not just in theory.',
    sol_p1_badge:         'Pillar 1',
    sol_p1_title:         'AI Video Courses',
    sol_p1_body:          'Expert-produced video courses organised in progressive paths. Our AI analyses your profile and recommends exactly what you need.',
    sol_p1_cta:           'Explore courses',
    sol_p2_badge:         'Pillar 2',
    sol_p2_title:         'AI Enterprise Integration',
    sol_p2_body:          'Our team visits your premises, analyses your business processes and delivers a turnkey AI integration plan. From consulting to implementation.',
    sol_p2_cta:           'Request integration',
    /* How it works */
    how_badge:            'Simple & structured',
    how_h2:               'How it works',
    how_sub:              'From zero to AI-competent \u2014 whether you are solo or in a team.',
    /* Integration */
    integ_badge:          'AI integration',
    integ_h2a:            'We come to you.',
    integ_h2b:            'We deliver results.',
    integ_body:           'Our consultants analyse your business processes, identify potential gains and deliver a turnkey plan.',
    integ_cta:            'Request a consultation',
    integ_productivity:   'Average productivity gained',
    /* Testimonials */
    test_badge:           'Testimonials',
    test_h2:              'What our clients say',
    test_sub:             'Real, measurable, verifiable results.',
    /* CTA Final */
    cta_badge:            'Start today for free',
    cta_h2a:              'Ready to transform your business',
    cta_h2b:              'with artificial intelligence?',
    cta_body:             'Join 200+ companies training and integrating AI with StratIA. First results from the first week.',
    cta_btn1:             'Create my free account',
    cta_btn2:             'Talk to a consultant',
    cta_note:             'No credit card required \u00b7 Instant access \u00b7 English support',
    cta_demo:             'Try the demo',
    /* Footer */
    foot_tagline:         'AI courses & enterprise integration to stay competitive.',
    foot_platform:        'Platform',
    foot_services:        'Services',
    foot_account:         'Account',
    foot_copyright:       '\u00a9 2026 StratIA. All rights reserved.',
    foot_made:            'Powered by AI \u00b7 Made in Qu\u00e9bec \uD83C\uDF41',
    land_stat4:           'AI courses',
    land_h1_cycling:      ['unbeatable', 'competitive', 'autonomous', 'productive', 'innovative'],
  },
} satisfies Record<Lang, Record<string, unknown>>;

export type TranslationKey = keyof typeof TRANSLATIONS['fr'];

/* ══════════════════════════════════════════════════════════════
   CONTEXT
══════════════════════════════════════════════════════════════ */
interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  tf: <T>(key: TranslationKey) => T;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => String(k),
  tf: <T,>(k: TranslationKey) => k as unknown as T,
});

function detectBrowserLang(): Lang {
  if (typeof window === 'undefined') return 'fr';
  const nav = navigator.language || navigator.languages?.[0] || 'fr';
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

const LS_KEY = 'stratia_lang';

/* ══════════════════════════════════════════════════════════════
   PROVIDER
══════════════════════════════════════════════════════════════ */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as Lang | null;
    setLangState(stored && SUPPORTED_LANGS.some(l => l.code === stored) ? stored : detectBrowserLang());
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem(LS_KEY, l);
  }

  /** t() → toujours une string */
  function t(key: TranslationKey): string {
    const val = TRANSLATIONS[lang][key] ?? TRANSLATIONS['fr'][key] ?? key;
    return typeof val === 'string' ? val : String(key);
  }

  /** tf<T>() → retourne la valeur typée (pour fonctions, tableaux…) */
  function tf<T>(key: TranslationKey): T {
    const val = TRANSLATIONS[lang][key] ?? TRANSLATIONS['fr'][key];
    return val as T;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tf }}>
      {children}
    </LanguageContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOOKS & COMPOSANTS
══════════════════════════════════════════════════════════════ */
export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`}>
      {SUPPORTED_LANGS.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)} title={l.label}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
          style={lang === l.code
            ? { background: 'var(--primary)', color: 'white', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }
            : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <span>{l.flag}</span>
          <span>{l.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
