import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import {
  Home, Zap, Scale, User, Bell, AlertTriangle, FileText, Calculator,
  Bot, Shield, ChevronRight, Send, Loader2, Printer,
  Briefcase, Heart, Clock, MapPin, Calendar, AlertCircle, Megaphone,
  Sun, Moon, ArrowLeft, Sparkles, BookOpen, Hash, Stethoscope, HandMetal,
  Ban, Eye, FileCheck, Users, ClipboardList, ShieldAlert, XOctagon,
  CalendarOff, Lightbulb, Phone, Mail, Plus, Pencil, Trash2, KeyRound,
  UserPlus, X, Save
} from 'lucide-react';

const APP_VERSION = '1.0.0';

// Le mot de passe administrateur. À CHANGER avant déploiement public.
// En production : utiliser une vraie auth backend, pas un mot de passe en clair.
const ADMIN_PASSWORD = 'unsa-sulo-2026';

// Élus par défaut — remplacés par les données stockées dans window.storage
// si l'admin a déjà saisi des élus. Sinon ces placeholders s'affichent.
const DEFAULT_ELUS = [
  {
    id: 'placeholder-1',
    name: 'À renseigner',
    role: 'Délégué·e syndical·e UNSA',
    phone: '',
    email: '',
    mandates: ['Délégué·e syndical·e'],
    bio: 'Activez le mode administrateur dans Profil pour ajouter ou modifier les élus.',
    photoUrl: null
  }
];
const LOGO_B64 = "data:image/jpeg;base64,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";

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Geist:wght@300..700&display=swap');
.font-display { font-family: 'Bricolage Grotesque', system-ui, sans-serif; letter-spacing: -0.02em; }
.font-body { font-family: 'Geist', system-ui, sans-serif; }
.tap-scale { transition: transform 120ms ease; }
.tap-scale:active { transform: scale(0.97); }
.fade-in { animation: fadeIn 240ms ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.stagger > * { animation: fadeIn 320ms ease both; }
.stagger > *:nth-child(1) { animation-delay: 20ms; }
.stagger > *:nth-child(2) { animation-delay: 60ms; }
.stagger > *:nth-child(3) { animation-delay: 100ms; }
.stagger > *:nth-child(4) { animation-delay: 140ms; }
.stagger > *:nth-child(5) { animation-delay: 180ms; }
.stagger > *:nth-child(6) { animation-delay: 220ms; }
.stagger > *:nth-child(7) { animation-delay: 260ms; }
.stagger > *:nth-child(8) { animation-delay: 300ms; }
.stagger > *:nth-child(9) { animation-delay: 340ms; }
.stagger > *:nth-child(10) { animation-delay: 380ms; }
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  body { background: white !important; color: black !important; }
}
.print-only { display: none; }

.splash-bg { background: radial-gradient(ellipse at top, #2E6BC4 0%, #1F5AA8 35%, #0F2D5C 70%, #082047 100%); }
.splash-logo { animation: splashLogo 900ms cubic-bezier(0.34, 1.4, 0.64, 1) both; }
.splash-halo { animation: splashHalo 2200ms ease-out infinite; }
.splash-text { animation: splashFade 700ms ease 350ms both; }
.splash-tagline { animation: splashFade 600ms ease 700ms both; }
.splash-dots span { animation: splashDot 1400ms ease infinite; }
.splash-dots span:nth-child(2) { animation-delay: 200ms; }
.splash-dots span:nth-child(3) { animation-delay: 400ms; }
.splash-out { animation: splashOut 380ms ease both; }
@keyframes splashLogo { 0% { opacity: 0; transform: scale(0.5) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes splashHalo { 0% { transform: scale(1); opacity: 0.55; } 70% { transform: scale(1.6); opacity: 0; } 100% { transform: scale(1.6); opacity: 0; } }
@keyframes splashFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes splashDot { 0%, 100% { opacity: 0.2; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
@keyframes splashOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.04); } }

:root { --unsa-blue: #1F5AA8; --unsa-blue-dark: #0F2D5C; --unsa-red: #B8332A; }
.theme-light {
  --bg: #F7F8FA; --surface: #FFFFFF; --surface-2: #F1F4F9;
  --border: #E5E9F0; --border-strong: #D6DCE6;
  --text: #0F172A; --text-2: #475569; --text-3: #94A3B8;
  --primary: #1F5AA8; --primary-hover: #194880; --primary-soft: #E8F1FB;
  --accent-red: #B8332A; --accent-red-soft: #FBEAE8;
}
.theme-dark {
  --bg: #050D1F; --surface: #0E1B36; --surface-2: #15264A;
  --border: #1E3258; --border-strong: #294070;
  --text: #F1F5FB; --text-2: #94A8C8; --text-3: #5B7099;
  --primary: #4A86D6; --primary-hover: #6FA0E0; --primary-soft: rgba(74,134,214,0.12);
  --accent-red: #E55B50; --accent-red-soft: rgba(229,91,80,0.12);
}
`;


/* ================== API CLIENT ================== */
async function apiGet(key) {
  try {
    const res = await fetch(`/api/data?key=${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.value;
  } catch (e) {
    // Fallback to localStorage when offline / API not deployed
    try {
      const raw = localStorage.getItem(`unsa_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

async function apiSet(key, value, adminToken) {
  // Mirror to localStorage immediately
  try { localStorage.setItem(`unsa_${key}`, JSON.stringify(value)); } catch {}
  if (!adminToken) return { ok: true, local: true };
  try {
    const res = await fetch(`/api/data?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ value })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function callAI({ system, messages, model }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, model: model || 'claude-sonnet-4-6' })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

/* ================== PHOTO UPLOAD ================== */
async function processPhotoFile(file, maxDim = 480) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Aucun fichier'));
    if (file.size > 10 * 1024 * 1024) return reject(new Error('Fichier trop volumineux (max 10 Mo)'));
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const w = Math.max(1, Math.floor(img.width * ratio));
        const h = Math.max(1, Math.floor(img.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error("Impossible de lire l'image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Échec de lecture du fichier"));
    reader.readAsDataURL(file);
  });
}

/* ================== FICHES ================== */
const FICHES = [
  {
    id: 'avertissement', icon: AlertCircle, title: 'Avertissement / Sanction', accent: 'amber',
    resume: "Sanction disciplinaire qui figure dans votre dossier. Même sans impact financier, elle peut justifier une sanction plus lourde plus tard. Délai de contestation : 2 mois.",
    infos: [
      { kind: 'critical', text: "Vous avez 2 mois à compter de la notification pour contester. Au-delà, c'est prescrit." }
    ],
    loi: "Code du travail, art. L1331-1 et suivants. Une sanction repose sur un fait réel, daté, proportionné. Pas de double sanction pour un même fait. Faits prescrits si plus de 2 mois entre leur connaissance par l'employeur et la sanction.",
    motifs: [
      "Faits inexacts ou inexistants",
      "Faits prescrits (plus de 2 mois)",
      "Avertissement non motivé ou motifs vagues",
      "Sanction disproportionnée",
      "Manquements de l'employeur (formation, matériel, consignes)",
      "Double sanction pour les mêmes faits",
      "Procédure non respectée"
    ],
    aFaire: [
      "Lire attentivement l'avertissement et noter la date",
      "Rassembler les preuves (emails, témoins, plannings, photos)",
      "Rédiger un courrier de contestation",
      "Envoyer en lettre recommandée avec AR",
      "Conserver copie + récépissé LRAR",
      "Contacter un délégué UNSA"
    ],
    aEviter: [
      "Signer sans réserves",
      "Répondre à chaud par mail",
      "Ignorer la sanction",
      "Laisser passer le délai de 2 mois"
    ],
    courriersIds: ['contestation-avertissement']
  },
  {
    id: 'convocation', icon: Megaphone, title: 'Convocation disciplinaire', accent: 'red',
    resume: "Entretien préalable obligatoire avant toute sanction (sauf simple avertissement). Procédure très encadrée : toute irrégularité peut faire annuler la sanction.",
    infos: [
      { kind: 'tip', text: "Près de 30 % des sanctions sont annulées aux Prud'hommes pour vice de procédure. La forme compte." },
      { kind: 'critical', text: "Délai minimum de 5 jours ouvrables entre la convocation et l'entretien." }
    ],
    loi: "Code du travail, art. L1232-2 et suivants. La convocation doit être écrite et motivée. Vous avez le droit d'être assisté(e) par une personne de l'entreprise (collègue, délégué). Notification de la sanction entre 2 jours ouvrables et 1 mois après l'entretien.",
    procedure: [
      "Réception de la convocation écrite et motivée",
      "Délai de 5 jours ouvrables minimum",
      "Entretien préalable (avec assistance)",
      "Délai de réflexion de l'employeur (2 jours min)",
      "Notification de la sanction (1 mois max)"
    ],
    aFaire: [
      "Lire attentivement : objet, date, lieu, sanction envisagée",
      "Préparer arguments et preuves",
      "Demander l'assistance d'un délégué UNSA",
      "Préparer vos réponses par écrit",
      "Demander un compte rendu d'entretien",
      "Envoyer vos observations écrites en LRAR sous 8 jours"
    ],
    aEviter: [
      "Aller seul(e) à l'entretien",
      "Avouer sous pression",
      "Signer un document sur place",
      "Répondre par l'émotion ou l'attaque"
    ],
    courriersIds: ['reponse-entretien-disciplinaire', 'entretien-prealable', 'compte-rendu-entretien']
  },
  {
    id: 'harcelement', icon: Shield, title: 'Harcèlement moral / sexuel', accent: 'red',
    resume: "Agissements répétés qui dégradent vos conditions de travail, votre santé ou votre dignité. Interdit par la loi. L'employeur a une obligation de prévention et de protection.",
    infos: [
      { kind: 'important', text: "Aucune sanction ne peut être prise contre vous pour avoir signalé de bonne foi des faits de harcèlement (art. L1152-2 et L1153-3)." }
    ],
    loi: "Code du travail, art. L1152-1 (moral) et L1153-1 (sexuel). C'est la répétition des agissements qui caractérise le harcèlement, sauf en cas de harcèlement sexuel d'environnement. L'employeur est tenu à une obligation de sécurité (art. L4121-1).",
    aFaire: [
      "Tenir un journal daté précis (dates, heures, lieux, propos exacts, témoins)",
      "Conserver les écrits : mails, SMS, messages, captures d'écran",
      "Identifier les témoins et leur demander des attestations",
      "Consulter le médecin du travail (secret médical)",
      "Signaler par écrit à l'employeur, au CSE, au référent harcèlement",
      "Saisir un délégué UNSA pour accompagnement",
      "Inspection du travail ou plainte pénale en cas de gravité"
    ],
    aEviter: [
      "Rester isolé(e)",
      "Démissionner — préférez la prise d'acte",
      "Effacer des preuves",
      "Accepter une mutation 'arrangeante' sans avis juridique"
    ],
    courriersIds: ['signalement-harcelement', 'attestation-temoin']
  },
  {
    id: 'heures-sup', icon: Clock, title: 'Heures supplémentaires & horaires', accent: 'blue',
    resume: "Au-delà de 35h/semaine, toute heure est supplémentaire et doit être majorée. Durée max : 48h/semaine. Repos quotidien : 11h consécutives.",
    infos: [
      { kind: 'tip', text: "Aux Prud'hommes, vous n'avez pas à prouver chaque heure : il suffit d'apporter des éléments précis. Si l'employeur ne tient pas de décompte, le doute vous profite." },
      { kind: 'critical', text: "3 ans pour réclamer des heures sup non payées (art. L3245-1). Au-delà, prescrit." }
    ],
    loi: "Code du travail, art. L3121-28. Majorations : +25 % de la 36e à la 43e heure, +50 % au-delà. Durée légale : 35h. Max quotidien : 10h. Max hebdo : 48h. Pause obligatoire : 20 min après 6h de travail. Modification d'horaires : préavis 7 jours minimum.",
    aFaire: [
      "Tenir un agenda précis quotidien (arrivée, départ, pauses)",
      "Conserver badges, mails, plannings, captures d'écran d'envois tardifs",
      "Récupérer toutes les versions des plannings",
      "Vérifier votre convention collective (peut être plus favorable)",
      "Réclamer par écrit en cas de non-paiement",
      "Saisir les Prud'hommes dans les 3 ans"
    ],
    aEviter: [
      "Faire des heures non déclarées sans trace",
      "Vous fier uniquement aux relevés de l'employeur",
      "Accepter un forfait sans vérifier qu'il est légalement valable",
      "Renoncer aux majorations 'pour la bonne ambiance'"
    ],
    courriersIds: ['reclamation-heures']
  },
  {
    id: 'accident', icon: Heart, title: 'Accident du travail', accent: 'red',
    resume: "Tout accident survenu au temps et lieu de travail (et accident de trajet) est présumé accident du travail. Déclaration obligatoire dans les 24h.",
    infos: [
      { kind: 'critical', text: "Même si l'accident vous semble bénin, déclarez-le. Une douleur qui apparaît plus tard ne sera pas reconnue si non déclarée." },
      { kind: 'tip', text: "Réflexe immédiat : photos des lieux, du matériel, de vos blessures. Notez les noms des témoins." }
    ],
    loi: "Code de la sécurité sociale, art. L411-1. Soins à 100 % (feuille d'accident). Indemnités journalières dès le 1er jour (60 % puis 80 %). Protection contre le licenciement pendant l'arrêt (sauf faute grave non liée).",
    procedure: [
      "Mise en sécurité + secours si besoin",
      "Prévenir l'employeur sous 24h (par écrit de préférence)",
      "Examen médical le jour même + certificat médical initial",
      "Déclaration employeur à la CPAM sous 48h",
      "Réception de la feuille d'accident (soins gratuits)",
      "Décision CPAM sous 30 jours (90 si enquête)"
    ],
    aFaire: [
      "Photographier les lieux, le matériel, les blessures",
      "Noter les témoins et leurs coordonnées",
      "Déclarer à l'employeur dans les 24h par écrit",
      "Demander un certificat médical initial",
      "Si l'employeur refuse de déclarer : déclaration directe à la CPAM",
      "Conserver tous les documents (certificats, arrêts, courriers)"
    ],
    aEviter: [
      "Minimiser ou ne pas déclarer",
      "Reprendre le travail sans visite de reprise après 60 jours",
      "Accepter un poste différent sans avis du médecin du travail",
      "Signer une reconnaissance de faute"
    ],
    asavoir: [
      "Faute inexcusable de l'employeur : si l'accident est dû à un manquement (matériel défectueux, formation absente, alerte ignorée), procédure spécifique pour indemnisation supplémentaire."
    ]
  },
  {
    id: 'arret-maladie', icon: Stethoscope, title: 'Arrêt maladie', accent: 'blue',
    resume: "Pendant l'arrêt, votre contrat est suspendu. L'employeur a des limites strictes sur ce qu'il peut vous demander.",
    infos: [
      { kind: 'critical', text: "L'employeur ne peut PAS vous demander de travailler pendant l'arrêt, même un email. C'est du travail dissimulé." },
      { kind: 'tip', text: "Vous pouvez demander une visite de pré-reprise avec le médecin du travail vous-même, sans passer par l'employeur. Gratuit et confidentiel." }
    ],
    loi: "Code du travail, art. L1226-1 et suivants. Indemnités CPAM dès le 4e jour (carence 3 jours, sauf AT/MP). Complément employeur selon convention collective. Visite de reprise obligatoire après 30 jours d'arrêt (60 pour AT/MP).",
    aFaire: [
      "Envoyer volets 1 et 2 à la CPAM sous 48h",
      "Envoyer volet 3 à l'employeur sous 48h",
      "Respecter les heures de sortie autorisées",
      "Prévenir de toute prolongation",
      "Demander la visite de reprise après 30 jours"
    ],
    aEviter: [
      "Travailler pendant l'arrêt (même un peu)",
      "Refuser un contrôle médical CPAM ou employeur",
      "Quitter le département sans accord CPAM",
      "Reprendre sans visite de reprise"
    ],
    asavoir: [
      "L'employeur ne peut PAS connaître votre diagnostic (secret médical), vous demander de venir au bureau, vous appeler en permanence, modifier votre contrat ni vous licencier en raison de l'arrêt.",
      "Subrogation : si activée, votre employeur vous verse l'intégralité du salaire et se fait rembourser par la CPAM. Vérifiez sur votre bulletin."
    ]
  },
  {
    id: 'inaptitude', icon: ShieldAlert, title: 'Inaptitude au travail', accent: 'amber',
    resume: "L'inaptitude est déclarée par le médecin du travail. Procédure encadrée pouvant mener au reclassement ou au licenciement. Origine professionnelle = indemnités doublées.",
    infos: [
      { kind: 'critical', text: "Ne signez JAMAIS une rupture conventionnelle pendant une procédure d'inaptitude. Vous perdriez tous les avantages liés (indemnités doublées, reclassement)." },
      { kind: 'important', text: "L'origine de l'inaptitude est cruciale. Professionnelle = protection renforcée + indemnités doublées." }
    ],
    loi: "Code du travail, art. L1226-2 et suivants. Si l'employeur n'a ni reclassé ni licencié au bout d'1 mois, le salaire reprend automatiquement. Contestation de l'avis : 15 jours devant le Conseil de Prud'hommes en référé.",
    procedure: [
      "Visite médicale (vous, employeur ou suite à arrêt)",
      "Étude du poste par le médecin du travail si nécessaire",
      "Échanges avec l'employeur",
      "Avis d'inaptitude remis ou envoyé",
      "Recherche de reclassement (1 mois)",
      "Reclassement ou licenciement"
    ],
    aFaire: [
      "Conserver l'avis d'inaptitude en main propre",
      "Examiner sérieusement les propositions de reclassement",
      "Solliciter le médecin du travail avant tout désaccord",
      "Contester sous 15 jours si motifs valables (poste non étudié, avis mal motivé)",
      "Faire valoir l'origine professionnelle si applicable",
      "Contacter un délégué UNSA"
    ],
    aEviter: [
      "Signer une rupture conventionnelle pendant la procédure",
      "Refuser systématiquement toute proposition de reclassement",
      "Refuser les visites médicales",
      "Contester sans avis préalable d'un délégué"
    ]
  },
  {
    id: 'droit-retrait', icon: HandMetal, title: 'Droit de retrait', accent: 'red',
    resume: "Vous pouvez quitter immédiatement votre poste face à un danger grave et imminent, sans perte de salaire ni sanction. Droit fondamental.",
    infos: [
      { kind: 'critical', text: "Ce n'est pas la réalité du danger qui compte, mais votre perception raisonnable au moment des faits." },
      { kind: 'important', text: "Tout licenciement lié à un retrait légitime est nul. Aucune retenue de salaire ne peut être appliquée." }
    ],
    loi: "Code du travail, art. L4131-1. Conditions : danger grave (lésions graves, voire mort), imminent (court terme), personnel (vous menace ou un collègue). Perception raisonnable suffit.",
    procedure: [
      "Quitter le poste — pas d'autorisation préalable nécessaire",
      "Alerter l'employeur immédiatement (oral puis écrit)",
      "Confirmer par écrit sous 24-48h (LRAR)",
      "Prévenir le CSE/CSSCT et un délégué UNSA"
    ],
    aFaire: [
      "Documenter précisément le danger (photos, témoins)",
      "Notifier oralement puis par écrit",
      "Envoyer LRAR avec description précise sous 48h",
      "Prévenir le CSE et un délégué UNSA",
      "Garder copie de tout"
    ],
    aEviter: [
      "Retrait sans motif sérieux (peut entraîner retenue + sanction)",
      "Retrait collectif sans coordination",
      "Reprise sans confirmation que le danger a cessé"
    ],
    asavoir: [
      "Exemples légitimes : matériel défaillant, absence d'EPI obligatoires, agression non maîtrisée, exposition à produits dangereux sans protection, surcharge entraînant un risque psycho-social grave."
    ],
    courriersIds: ['notification-retrait']
  },
  {
    id: 'amenagement', icon: FileCheck, title: 'Aménagement de poste', accent: 'emerald',
    resume: "Pour raisons de santé, familiales ou organisationnelles. Vous avez le droit de demander, l'employeur doit examiner sérieusement.",
    infos: [
      { kind: 'tip', text: "Si l'aménagement est lié à votre santé, passez par le médecin du travail. Ses préconisations s'imposent à l'employeur." }
    ],
    loi: "Le refus de l'employeur n'est valable que s'il prouve l'impossibilité technique ou des contraintes excessives. Refus écrit et motivé obligatoire. Refus plus difficile à justifier si demande du médecin du travail ou RQTH.",
    aFaire: [
      "Préparer arguments concrets (impact santé, organisation)",
      "Joindre justificatifs (certificat, attestation médecin du travail, RQTH)",
      "Proposer des solutions précises, pas seulement demander",
      "Demander un entretien en complément du courrier",
      "Conserver toutes les traces écrites"
    ],
    aEviter: [
      "Demander oralement uniquement",
      "Demander sans aucune piste de solution",
      "Accepter un refus sans motivation écrite"
    ],
    courriersIds: ['demande-amenagement']
  },
  {
    id: 'refus-signer', icon: Ban, title: 'Refuser de signer un document', accent: 'amber',
    resume: "Vous n'êtes JAMAIS obligé(e) de signer immédiatement. Vous avez toujours le droit de demander un délai de réflexion et de prendre conseil.",
    infos: [
      { kind: 'critical', text: "La signature précipitée est l'une des erreurs les plus fréquentes. Aucune obligation légale ne vous impose de signer sur-le-champ." }
    ],
    loi: "Pour certains documents (notification de sanction, courrier), vous pouvez accuser réception sans accepter le contenu. Mention à ajouter : « Reçu le [date] — sans valoir acceptation » ou « Reçu sous toutes réserves d'usage. Je conteste le contenu. »",
    aFaire: [
      "Demander une copie du document",
      "Demander un délai de réflexion (15 jours à 1 mois)",
      "Faire relire par un délégué UNSA ou un avocat",
      "Si signature 'reçu' obligatoire : ajouter mention de réserve",
      "Si refus : envoyer LRAR de contestation dans les jours qui suivent"
    ],
    aEviter: [
      "Signer sous pression ou en urgence",
      "Signer avant lecture complète",
      "Signer sans avoir consulté un conseil",
      "Refuser oralement sans confirmation écrite"
    ],
    asavoir: [
      "Documents pour lesquels la prudence s'impose : avenant au contrat, rupture conventionnelle, reçu pour solde de tout compte, lettre de démission, engagement de non-concurrence, compte rendu rédigé par l'employeur, reconnaissance de faute."
    ],
    courriersIds: ['refus-signer']
  },
  {
    id: 'conges-payes', icon: Calendar, title: 'Congés payés', accent: 'emerald',
    resume: "5 semaines (30 jours ouvrables) par an + jours d'ancienneté + fractionnement + RTT. L'employeur fixe les dates avec préavis strict.",
    infos: [
      { kind: 'critical', text: "Refus de l'employeur 15 jours avant le départ sans motif sérieux = refus abusif. Vous pouvez le contester et demander des dommages-intérêts." }
    ],
    loi: "Code du travail, art. L3141-3. Période d'acquisition : 1er juin au 31 mai. Période principale (4 semaines min) entre 1er mai et 31 octobre. Délai notification dates : 1 mois avant. Modification possible 1 mois avant max.",
    aFaire: [
      "Demander par écrit (email ou courrier)",
      "Conserver la validation écrite",
      "Vérifier le solde sur fiche de paie",
      "En cas de refus tardif : LRAR de contestation",
      "Joindre preuves d'engagement (réservations) en cas de préjudice"
    ],
    aEviter: [
      "Partir sans validation écrite",
      "Renoncer aux congés non pris sans alerte écrite",
      "Accepter un refus sans motivation"
    ],
    asavoir: [
      "Congés exceptionnels (droit absolu, pas refusables) : mariage 4 jours, mariage enfant 1 jour, naissance/adoption 3 jours, décès enfant 5-14 jours, décès conjoint/parent 3 jours, annonce handicap enfant 5 jours.",
      "Congés non pris au 31 mai en principe perdus, mais report obligatoire en cas de maladie, maternité, AT/MP, ou empêchement par l'employeur.",
      "Enfant malade : 3 jours/an non rémunérés (5 si enfant <1 an ou 3 enfants à charge)."
    ],
    courriersIds: ['demande-conges', 'contestation-refus']
  },
  {
    id: 'geolocalisation', icon: MapPin, title: 'Géolocalisation', accent: 'amber',
    resume: "L'employeur peut géolocaliser un véhicule pro pour un motif légitime, après information et conformité RGPD/CNIL. Interdite hors temps de travail.",
    loi: "RGPD + délibérations CNIL. Pas de surveillance permanente pendant les pauses. Information préalable du salarié obligatoire.",
    aFaire: [
      "Demander la note d'information écrite",
      "Vérifier la finalité déclarée",
      "Désactiver hors temps de travail si possible techniquement",
      "Saisir la CNIL en cas d'abus"
    ],
    aEviter: [
      "Manipuler ou désactiver le boîtier sans accord — c'est une faute",
      "Accepter un contrôle des temps de pause par géolocalisation"
    ]
  },
  {
    id: 'licenciement', icon: Briefcase, title: 'Licenciement', accent: 'red',
    resume: "Rupture du contrat à l'initiative de l'employeur. Procédure stricte (convocation, entretien, notification). Indemnités selon ancienneté.",
    infos: [
      { kind: 'critical', text: "12 mois pour saisir les Prud'hommes en cas de licenciement abusif. Au-delà, prescrit." }
    ],
    loi: "Code du travail, art. L1232-1 et suivants. Tout licenciement doit reposer sur une cause réelle et sérieuse. À défaut, abusif et ouvre droit à indemnisation.",
    aFaire: [
      "Demander la convocation par écrit (5 jours ouvrables minimum)",
      "Vous faire assister par un conseiller du salarié ou un délégué UNSA",
      "Conserver tous les écrits",
      "Saisir les Prud'hommes dans les 12 mois si abusif"
    ],
    aEviter: [
      "Signer des documents sans les avoir lus",
      "Accepter une rupture conventionnelle sans calcul préalable",
      "Démissionner sous pression",
      "Laisser passer le délai de contestation"
    ]
  },
  {
    id: 'preuves', icon: Eye, title: 'Comment prouver une situation', accent: 'blue',
    resume: "Au tribunal, ce qui n'est pas prouvé n'existe pas. Anticipez et documentez tout, en temps réel.",
    infos: [
      { kind: 'tip', text: "Astuce : envoyez-vous chaque soir un email récapitulatif de la journée. L'horodatage automatique constitue une preuve d'antériorité incontestable." }
    ],
    loi: "Les 4 catégories de preuves : écrits (emails, SMS, courriers, notes), témoignages (attestations art. 202 CPC), éléments matériels (photos, captures), documents officiels (certificats, fiches de paie, contrat).",
    aFaire: [
      "Tenir un journal quotidien daté précis",
      "Faire suivre vos emails pro vers boîte personnelle (les vôtres uniquement)",
      "Captures d'écran SMS/WhatsApp horodatées",
      "Conserver tous les courriers + enveloppes",
      "Photos de matériel, locaux, conditions (date/heure activées)",
      "Identifier les témoins TÔT et demander attestations",
      "Stocker en double : chez vous ET cloud personnel"
    ],
    aEviter: [
      "Diffuser des emails non adressés à vous",
      "Photographier des personnes sans accord (RGPD)",
      "Enregistrer une conversation sans y participer (illégal)",
      "Documenter après coup (perte de valeur probante)"
    ],
    asavoir: [
      "Enregistrement audio : en France, vous pouvez enregistrer une conversation à laquelle vous participez (jurisprudence Cass. 2023). Pas une conversation sans y être partie."
    ],
    courriersIds: ['attestation-temoin', 'compte-rendu-entretien']
  }
];

/* ================== COURRIERS ================== */
const COURRIERS = [
  {
    id: 'contestation-avertissement', title: "Contestation d'avertissement",
    desc: "Contester une sanction disciplinaire dans les 2 mois", icon: AlertCircle,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse complète', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'entreprise", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'dateAvert', label: "Date de l'avertissement", type: 'date' },
      { id: 'motif', label: "Motif invoqué (recopiez ses mots)", type: 'textarea' },
      { id: 'arguments', label: "Vos arguments / votre version", type: 'textarea' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\nLettre recommandée avec accusé de réception\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Contestation de l'avertissement notifié le ${d.dateAvert}\n\nMadame, Monsieur,\n\nPar courrier daté du ${d.dateAvert}, vous m'avez notifié un avertissement pour le motif suivant : « ${d.motif} ».\n\nJe conteste formellement cette sanction pour les motifs suivants :\n\n${d.arguments}\n\nJe vous demande en conséquence de bien vouloir retirer cet avertissement de mon dossier disciplinaire et de m'en confirmer le retrait par écrit.\n\nÀ défaut de réponse satisfaisante dans un délai de quinze jours, je me réserve le droit de saisir le conseil de prud'hommes territorialement compétent.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'reponse-entretien-disciplinaire', title: "Réponse écrite après entretien disciplinaire",
    desc: "À envoyer en LRAR sous 8 jours après l'entretien préalable", icon: ClipboardList,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'employeur", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'dateEntretien', label: "Date de l'entretien", type: 'date' },
      { id: 'assistant', label: "Personne qui vous a assisté(e)", type: 'text' },
      { id: 'faitsReproches', label: "Faits reprochés", type: 'textarea' },
      { id: 'votreVersion', label: "Votre version, faits par faits", type: 'textarea' },
      { id: 'contexte', label: "Contexte / circonstances atténuantes", type: 'textarea' },
      { id: 'situationPerso', label: "Votre situation (ancienneté, antécédents)", type: 'textarea' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\nLettre recommandée avec accusé de réception\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Suite à l'entretien préalable du ${d.dateEntretien} — observations écrites\n\nMadame, Monsieur,\n\nVous m'avez convoqué(e) à un entretien préalable à sanction qui s'est tenu le ${d.dateEntretien}. J'étais assisté(e) de ${d.assistant}.\n\nLes faits qui m'ont été reprochés lors de cet entretien sont les suivants : ${d.faitsReproches}\n\nSuite à cet entretien, je souhaite porter à votre connaissance par écrit les éléments suivants, qui complètent ou corrigent ce qui a été dit :\n\n1. Sur les faits :\n${d.votreVersion}\n\n2. Sur le contexte :\n${d.contexte}\n\n3. Sur ma situation personnelle :\n${d.situationPerso}\n\nAu regard de ces éléments, je vous demande de bien vouloir réexaminer la sanction envisagée, qui me paraît disproportionnée et/ou injustifiée.\n\nJe précise que je conteste par avance toute sanction qui serait notifiée sans tenir compte de mes observations, et que je me réserve le droit de saisir le conseil de prud'hommes.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'reclamation-heures', title: "Réclamation d'heures supplémentaires",
    desc: "Demander le paiement d'heures non rémunérées", icon: Clock,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'employeur", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'periode', label: "Période concernée", type: 'text' },
      { id: 'nbHeures', label: "Nombre d'heures non payées", type: 'text' },
      { id: 'preuves', label: "Preuves (badges, plannings, mails...)", type: 'textarea' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\nLettre recommandée avec accusé de réception\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Demande de paiement d'heures supplémentaires\n\nMadame, Monsieur,\n\nJe vous adresse une demande relative au paiement d'heures supplémentaires effectuées et non rémunérées sur la période ${d.periode}.\n\nJ'ai effectué ${d.nbHeures} heures supplémentaires au-delà de la durée légale du travail, qui n'ont fait l'objet ni d'un paiement majoré ni d'un repos compensateur équivalent.\n\nJe dispose des éléments suivants :\n${d.preuves}\n\nConformément à l'article L3121-28 du Code du travail, je vous demande la régularisation de mon salaire avec les majorations légales (25 % pour les huit premières heures supplémentaires hebdomadaires, 50 % au-delà), ou un accord d'entreprise plus favorable.\n\nÀ défaut de régularisation dans un délai de 30 jours, je me réserve le droit de saisir le conseil de prud'hommes.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'signalement-harcelement', title: "Signalement de harcèlement",
    desc: "Alerter formellement l'employeur — strictement confidentiel", icon: Shield,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'employeur", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'datePoste', label: "Date d'entrée dans l'entreprise", type: 'date' },
      { id: 'poste', label: "Votre poste", type: 'text' },
      { id: 'typeHarcelement', label: "Type (moral / sexuel / discriminatoire)", type: 'text' },
      { id: 'auteur', label: "Auteur(s) — nom, prénom, fonction", type: 'text' },
      { id: 'faits', label: "Description chronologique précise", type: 'textarea' },
      { id: 'consequences', label: "Conséquences sur santé / travail", type: 'textarea' },
      { id: 'pieces', label: "Pièces jointes", type: 'textarea' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\nLettre recommandée avec accusé de réception — STRICTEMENT CONFIDENTIEL\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Signalement de faits de harcèlement ${d.typeHarcelement} — demande de mesures urgentes\n\nMadame, Monsieur,\n\nSalarié(e) de l'entreprise depuis le ${d.datePoste} au poste de ${d.poste}, je vous saisis aujourd'hui pour vous signaler des faits que je qualifie de harcèlement ${d.typeHarcelement} dont je suis victime sur mon lieu de travail.\n\n1. Auteur(s) présumé(s) :\n${d.auteur}\n\n2. Description chronologique des faits :\n${d.faits}\n\n3. Conséquences sur ma santé et mon travail :\n${d.consequences}\n\n4. Pièces justificatives jointes :\n${d.pieces}\n\nAu regard de votre obligation légale de protection (art. L4121-1 et L1152-4 du Code du travail), je vous demande de prendre les mesures nécessaires et urgentes pour :\n• Faire cesser immédiatement les agissements signalés\n• Diligenter une enquête interne en toute confidentialité\n• Mettre en place les mesures de protection adaptées (éloignement de l'auteur)\n• Saisir si nécessaire le CSE et le médecin du travail\n\nJe vous demande de m'informer par écrit, dans un délai raisonnable, des suites données à ce signalement.\n\nJe précise que je transmets copie de ce courrier aux délégués UNSA et au médecin du travail.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'demande-conges', title: "Demande de congés payés",
    desc: "Formaliser une demande de congés par écrit", icon: Calendar,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'employeur', label: "Nom de l'employeur / responsable", type: 'text' },
      { id: 'dateDebut', label: "Date de début souhaitée", type: 'date' },
      { id: 'dateFin', label: "Date de fin souhaitée", type: 'date' },
      { id: 'motif', label: "Motif (optionnel)", type: 'text' }
    ],
    build: (d) => `${d.nom}\n\nÀ l'attention de ${d.employeur}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Demande de congés payés\n\nMadame, Monsieur,\n\nJe sollicite par la présente l'autorisation de prendre des congés payés du ${d.dateDebut} au ${d.dateFin} inclus.\n\n${d.motif ? `Motif : ${d.motif}\n\n` : ''}Je vous remercie de bien vouloir m'adresser une réponse écrite afin de pouvoir organiser cette période.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'contestation-refus', title: "Contestation d'un refus injustifié",
    desc: "Refus de congés, modification d'horaires, refus d'aménagement", icon: CalendarOff,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'employeur", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'dateDemande', label: "Date de votre demande initiale", type: 'date' },
      { id: 'demande', label: "Objet de votre demande", type: 'text' },
      { id: 'dateRefus', label: "Date du refus", type: 'date' },
      { id: 'motifsContestation', label: "Pourquoi le refus est injustifié", type: 'textarea' },
      { id: 'prejudice', label: "Préjudice subi", type: 'textarea' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\nLettre recommandée avec accusé de réception\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Contestation du refus opposé à ma demande du ${d.dateDemande}\n\nMadame, Monsieur,\n\nPar courrier/email du ${d.dateDemande}, j'ai sollicité ${d.demande}.\n\nPar retour du ${d.dateRefus}, vous m'avez opposé un refus que je conteste pour les raisons suivantes :\n\n1. Sur le respect des délais et de la motivation :\n${d.motifsContestation}\n\n2. Sur le préjudice causé :\n${d.prejudice}\n\nJe vous demande donc de bien vouloir reconsidérer votre décision et de me confirmer par écrit l'acceptation de ma demande initiale dans un délai de 8 jours.\n\nÀ défaut de réponse favorable, je me réserve le droit de saisir les instances représentatives du personnel et, le cas échéant, le conseil de prud'hommes.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'demande-amenagement', title: "Demande d'aménagement de poste",
    desc: "Pour raisons de santé, familiales ou organisationnelles", icon: FileCheck,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'employeur", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'dateEntree', label: "Date d'entrée", type: 'date' },
      { id: 'poste', label: "Votre poste", type: 'text' },
      { id: 'motif', label: "Motif de la demande", type: 'textarea' },
      { id: 'amenagements', label: "Aménagements souhaités (précis)", type: 'textarea' },
      { id: 'justificatifs', label: "Justificatifs joints", type: 'textarea' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\nLettre recommandée avec accusé de réception\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Demande d'aménagement de poste de travail\n\nMadame, Monsieur,\n\nSalarié(e) au sein de l'entreprise depuis le ${d.dateEntree} au poste de ${d.poste}, je sollicite par la présente un aménagement de mon poste de travail.\n\nMotif de ma demande :\n${d.motif}\n\nAménagements souhaités :\n${d.amenagements}\n\nJustificatifs joints :\n${d.justificatifs}\n\nJe reste à votre disposition pour échanger sur les modalités concrètes de cet aménagement, notamment dans le cadre d'un entretien que je sollicite à votre meilleure convenance.\n\nJe vous remercie de l'attention que vous voudrez bien porter à ma demande et vous prie d'agréer, Madame, Monsieur, mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'demande-entretien-rh', title: "Demande d'entretien avec les RH",
    desc: "Pour aborder un sujet professionnel ou personnel", icon: Users,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'destinataire', label: "Nom du contact RH", type: 'text' },
      { id: 'dateEntree', label: "Date d'entrée", type: 'date' },
      { id: 'poste', label: "Votre poste", type: 'text' },
      { id: 'objet', label: "Objet (sans entrer dans les détails)", type: 'text' },
      { id: 'duree', label: "Durée souhaitée (30, 45, 60 min)", type: 'text' },
      { id: 'dispos', label: "Vos disponibilités", type: 'textarea' },
      { id: 'accompagnant', label: "Accompagnant — optionnel", type: 'text' }
    ],
    build: (d) => `Objet : Demande d'entretien\n\nMadame / Monsieur ${d.destinataire},\n\nSalarié(e) au sein de l'entreprise depuis le ${d.dateEntree} au poste de ${d.poste}, je sollicite par la présente un entretien avec vous afin d'aborder un sujet professionnel important.\n\nObjet de ma demande :\n${d.objet}\n\nModalités souhaitées :\nJe suggère un entretien d'une durée d'environ ${d.duree} minutes, à votre meilleure convenance dans les 15 jours à venir.\n\nMes disponibilités : ${d.dispos}\n\n${d.accompagnant ? `Je souhaiterais être accompagné(e) lors de cet entretien par ${d.accompagnant}.\n\n` : ''}Je vous remercie de bien vouloir me confirmer la date et le lieu retenus.\n\nVous remerciant par avance, je vous prie d'agréer, Madame / Monsieur, mes salutations distinguées.\n\n${d.nom}\n${d.poste}`
  },
  {
    id: 'refus-signer', title: "Refus de signer / demande de délai",
    desc: "Confirmer par écrit votre refus ou demande de délai", icon: Ban,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'employeur", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'datePresentation', label: "Date de présentation", type: 'date' },
      { id: 'titreDoc', label: "Titre / nature du document", type: 'text' },
      { id: 'objetDoc', label: "Objet (modification, rupture, solde de tout compte...)", type: 'text' },
      { id: 'problemes', label: "Ce qui pose problème dans le contenu", type: 'textarea' },
      { id: 'conditions', label: "Conditions de présentation (pression, délai...)", type: 'textarea' },
      { id: 'delai', label: "Délai de réflexion demandé", type: 'text' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\nLettre recommandée avec accusé de réception\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Demande de délai / refus de signer le document du ${d.datePresentation}\n\nMadame, Monsieur,\n\nLe ${d.datePresentation}, vous m'avez présenté pour signature un document intitulé « ${d.titreDoc} » portant sur ${d.objetDoc}.\n\nConformément à mes droits et à la liberté contractuelle qui m'est garantie, je vous informe que je refuse de signer ce document en l'état, pour les raisons suivantes :\n\n1. Sur le contenu du document :\n${d.problemes}\n\n2. Sur les conditions de présentation :\n${d.conditions}\n\n3. Sur ma demande :\nJe vous demande de bien vouloir :\n• Me transmettre une copie complète du document\n• M'accorder un délai de réflexion de ${d.delai}\n• Me permettre de prendre conseil auprès des délégués UNSA et/ou d'un avocat\n\nJe précise que mon refus actuel ne saurait être interprété comme un refus définitif, mais comme une demande légitime d'examen approfondi avant tout engagement de ma part.\n\nJe précise également que toute pression ou sanction qui me serait infligée pour ce refus serait considérée comme abusive et donnerait lieu aux recours appropriés.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'notification-retrait', title: "Notification de droit de retrait",
    desc: "À envoyer en LRAR sous 24-48h après le retrait", icon: HandMetal,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'employeur", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'dateRetrait', label: "Date du retrait", type: 'date' },
      { id: 'heureRetrait', label: "Heure", type: 'text' },
      { id: 'lieu', label: "Lieu exact", type: 'text' },
      { id: 'danger', label: "Nature du danger", type: 'textarea' },
      { id: 'temoins', label: "Personnes présentes / témoins", type: 'textarea' },
      { id: 'raisons', label: "Pourquoi le danger était grave et imminent", type: 'textarea' },
      { id: 'mesures', label: "Mesures prises immédiatement", type: 'textarea' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\nLettre recommandée avec accusé de réception\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Exercice de mon droit de retrait — situation de danger grave et imminent\n\nMadame, Monsieur,\n\nLe ${d.dateRetrait} à ${d.heureRetrait}, conformément à l'article L4131-1 du Code du travail, j'ai exercé mon droit de retrait sur mon lieu de travail, en raison d'un danger grave et imminent pour ma santé et/ou ma vie.\n\nDescription précise de la situation :\nLieu : ${d.lieu}\nDate et heure : ${d.dateRetrait} à ${d.heureRetrait}\nNature du danger : ${d.danger}\nTémoins : ${d.temoins}\n\nPourquoi j'ai estimé le danger grave et imminent :\n${d.raisons}\n\nMesures prises immédiatement :\n${d.mesures}\n\nJe vous demande de prendre toutes les mesures nécessaires pour faire cesser ce danger et me permettre de reprendre mon poste dans des conditions de sécurité satisfaisantes. Je vous rappelle que vous êtes tenu(e) à une obligation de sécurité de résultat à mon égard.\n\nJe précise qu'aucune retenue de salaire ni sanction ne saurait m'être opposée pour l'exercice légitime de mon droit de retrait.\n\nJe transmets copie de cette lettre au CSE / CSSCT et aux délégués UNSA.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  },
  {
    id: 'compte-rendu-entretien', title: "Compte rendu d'entretien",
    desc: "Pour formaliser et garder une trace officielle", icon: ClipboardList,
    fields: [
      { id: 'date', label: "Date de l'entretien", type: 'date' },
      { id: 'heureDebut', label: "Heure de début", type: 'text' },
      { id: 'heureFin', label: "Heure de fin", type: 'text' },
      { id: 'lieu', label: "Lieu", type: 'text' },
      { id: 'employeurPresent', label: "Personnes présentes pour l'employeur", type: 'textarea' },
      { id: 'nom', label: "Votre nom et fonction", type: 'text' },
      { id: 'assistant', label: "Votre assistant(e)", type: 'text' },
      { id: 'objet', label: "Objet de l'entretien", type: 'text' },
      { id: 'sujetsEmployeur', label: "Sujets abordés par l'employeur", type: 'textarea' },
      { id: 'reponses', label: "Vos réponses et observations", type: 'textarea' },
      { id: 'decisions', label: "Décisions / engagements pris", type: 'textarea' },
      { id: 'desaccords', label: "Points en désaccord", type: 'textarea' },
      { id: 'suite', label: "Suite à donner", type: 'textarea' }
    ],
    build: (d) => `COMPTE RENDU D'ENTRETIEN\n\nDate de l'entretien : ${d.date}\nHeure de début : ${d.heureDebut}\nHeure de fin : ${d.heureFin}\nLieu : ${d.lieu}\n\nPersonnes présentes :\n${d.employeurPresent} (employeur)\n${d.nom} (salarié·e)\n${d.assistant ? `${d.assistant} (assistant·e)\n` : ''}\nObjet de l'entretien : ${d.objet}\n\n1. Sujets abordés par l'employeur :\n${d.sujetsEmployeur}\n\n2. Mes réponses et observations :\n${d.reponses}\n\n3. Décisions / engagements pris durant l'entretien :\n${d.decisions}\n\n4. Points en désaccord :\n${d.desaccords}\n\n5. Suite à donner :\n${d.suite}\n\nCe compte rendu reflète fidèlement les propos tenus lors de l'entretien. Je vous remercie de bien vouloir me confirmer son exactitude par retour ou de me transmettre vos éventuelles rectifications dans un délai de 8 jours. À défaut, je considérerai qu'il fait foi.\n\nDate : ${new Date().toLocaleDateString('fr-FR')}\n\n${d.nom}`
  },
  {
    id: 'attestation-temoin', title: "Attestation de témoin (art. 202 CPC)",
    desc: "Modèle conforme — joindre obligatoirement copie pièce d'identité", icon: Users,
    fields: [
      { id: 'nomComplet', label: "NOM USUEL et NOM DE NAISSANCE", type: 'text' },
      { id: 'prenom', label: "Prénom(s) complet(s)", type: 'text' },
      { id: 'dateNaiss', label: "Date de naissance", type: 'date' },
      { id: 'lieuNaiss', label: "Lieu de naissance", type: 'text' },
      { id: 'profession', label: "Profession actuelle", type: 'text' },
      { id: 'adresse', label: "Adresse complète", type: 'textarea' },
      { id: 'lien', label: "Lien avec les parties", type: 'text' },
      { id: 'faits', label: "Récit chronologique des faits constatés", type: 'textarea' },
      { id: 'ville', label: "Ville", type: 'text' }
    ],
    build: (d) => `ATTESTATION\n\nJe soussigné(e),\n\nNom et nom de jeune fille : ${d.nomComplet}\nPrénom(s) : ${d.prenom}\nDate de naissance : ${d.dateNaiss}\nLieu de naissance : ${d.lieuNaiss}\nProfession : ${d.profession}\nAdresse : ${d.adresse}\nLien avec les parties : ${d.lien}\n\nAtteste sur l'honneur que :\n\n${d.faits}\n\nLa présente attestation est établie en vue de sa production en justice et je sais qu'une fausse attestation de ma part m'exposerait aux sanctions pénales prévues par l'article 441-7 du Code pénal (3 ans d'emprisonnement et 45 000 € d'amende).\n\nPièce jointe : copie de ma carte nationale d'identité (ou passeport) recto-verso.\n\nFait à ${d.ville}, le ${new Date().toLocaleDateString('fr-FR')}\n\nSignature manuscrite (ne pas oublier de signer chaque page) :`
  },
  {
    id: 'entretien-prealable', title: "Assistance à entretien préalable",
    desc: "Informer l'employeur de votre assistance", icon: Megaphone,
    fields: [
      { id: 'nom', label: 'Vos nom et prénom', type: 'text' },
      { id: 'adresse', label: 'Votre adresse', type: 'textarea' },
      { id: 'employeur', label: "Nom de l'employeur", type: 'text' },
      { id: 'adresseEmp', label: "Adresse de l'employeur", type: 'textarea' },
      { id: 'dateEntretien', label: "Date de l'entretien", type: 'date' },
      { id: 'nomConseiller', label: "Nom de l'assistant·e", type: 'text' }
    ],
    build: (d) => `${d.nom}\n${d.adresse}\n\n${d.employeur}\n${d.adresseEmp}\n\nFait le ${new Date().toLocaleDateString('fr-FR')}\n\nObjet : Entretien préalable du ${d.dateEntretien} — assistance\n\nMadame, Monsieur,\n\nFaisant suite à votre convocation à un entretien préalable fixé au ${d.dateEntretien}, je vous informe que je serai assisté(e) lors de cet entretien par ${d.nomConseiller}, conformément aux dispositions de l'article L1232-4 du Code du travail.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${d.nom}`
  }
];

/* ================== ERREURS ================== */
const ERREURS = [
  { n: 1, title: "Signer un document sous pression", text: "Rupture conventionnelle, solde de tout compte, avenant, reconnaissance de faute… Ne signez jamais sur le champ. Demandez un délai et faites relire par un délégué UNSA." },
  { n: 2, title: "Démissionner sur un coup de tête", text: "Quasi-irréversible. Vous perdez vos droits au chômage. Préférez la rupture conventionnelle, ou la prise d'acte si harcèlement." },
  { n: 3, title: "Insulter ou menacer par écrit", text: "Un email injurieux peut justifier un licenciement pour faute grave. Restez professionnel(le) en toutes circonstances. Vos écrits restent." },
  { n: 4, title: "Faire justice soi-même", text: "Reprendre des heures non payées de son propre chef, modifier ses horaires sans accord… Cela peut justifier une sanction. Contestez officiellement." },
  { n: 5, title: "Parler ouvertement à ses collègues", text: "Vos confidences peuvent revenir à la direction. Privilégiez les délégués UNSA — tenus à la confidentialité." },
  { n: 6, title: "Diffuser sur les réseaux sociaux", text: "Critiquer publiquement votre entreprise (Facebook, X, LinkedIn, TikTok) : motif de licenciement quasi-systématique, même hors temps de travail." },
  { n: 7, title: "Laisser passer les délais", text: "2 mois pour contester un avertissement, 12 mois pour le licenciement, 3 ans pour les salaires. Une procédure prescrite est définitivement perdue." },
  { n: 8, title: "Ne pas garder de preuves", text: "Effacer ses emails, jeter les courriers, vider sa boîte pro avant de partir : suicidaire. Conservez tout, en double, sur cloud privé." },
  { n: 9, title: "Refuser le médecin du travail", text: "Si vous êtes en souffrance, ne refusez jamais une visite. Le médecin du travail peut être votre meilleur allié — pouvoir réel + secret médical." },
  { n: 10, title: "Rester isolé(e)", text: "L'erreur la plus fréquente. Ne restez jamais seul(e) face à un conflit. Délégués UNSA, CSE, médecin du travail. L'isolement est l'outil de l'employeur abusif." }
];

/* ================== CALCULATEURS ================== */
const CALCULATORS = [
  {
    id: 'heures-sup', title: "Heures supplémentaires", icon: Clock,
    desc: "Estimez la majoration due sur une semaine",
    inputs: [
      { id: 'heures', label: 'Heures travaillées cette semaine', type: 'number' },
      { id: 'taux', label: 'Salaire horaire brut (€)', type: 'number' }
    ],
    compute: ({ heures, taux }) => {
      const h = parseFloat(heures) || 0;
      const t = parseFloat(taux) || 0;
      if (h <= 35) return { result: '0 €', detail: "Pas d'heures supplémentaires sur cette semaine." };
      const h25 = Math.min(Math.max(h - 35, 0), 8);
      const h50 = Math.max(h - 43, 0);
      const m25 = h25 * t * 1.25;
      const m50 = h50 * t * 1.5;
      const total = m25 + m50;
      return {
        result: total.toFixed(2) + ' €',
        detail: `${h25}h à +25 % = ${m25.toFixed(2)} €\n${h50}h à +50 % = ${m50.toFixed(2)} €\nTotal majoré : ${total.toFixed(2)} €`
      };
    }
  },
  {
    id: 'indemnite', title: "Indemnité légale de licenciement", icon: Briefcase,
    desc: "Calcul de l'indemnité minimale légale",
    inputs: [
      { id: 'anciennete', label: "Ancienneté en années (ex: 7.5)", type: 'number' },
      { id: 'salaire', label: 'Salaire mensuel moyen brut (€)', type: 'number' }
    ],
    compute: ({ anciennete, salaire }) => {
      const a = parseFloat(anciennete) || 0;
      const s = parseFloat(salaire) || 0;
      if (a < 8/12) return { result: '0 €', detail: "Ancienneté inférieure à 8 mois — aucune indemnité légale due." };
      const part1 = Math.min(a, 10) * (s / 4);
      const part2 = Math.max(a - 10, 0) * (s / 3);
      const total = part1 + part2;
      return {
        result: total.toFixed(2) + ' €',
        detail: `Jusqu'à 10 ans : ${Math.min(a, 10)} × ${s/4} = ${part1.toFixed(2)} €\nAu-delà de 10 ans : ${Math.max(a-10, 0)} × ${(s/3).toFixed(2)} = ${part2.toFixed(2)} €\nTotal légal minimum : ${total.toFixed(2)} €\n\n⚠ Votre convention collective peut prévoir mieux.`
      };
    }
  },
  {
    id: 'anciennete', title: "Ancienneté", icon: Hash,
    desc: "Combien de temps êtes-vous dans l'entreprise ?",
    inputs: [{ id: 'dateEntree', label: "Date d'entrée dans l'entreprise", type: 'date' }],
    compute: ({ dateEntree }) => {
      if (!dateEntree) return { result: '—', detail: 'Renseignez la date.' };
      const start = new Date(dateEntree);
      const now = new Date();
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();
      if (days < 0) { months--; days += 30; }
      if (months < 0) { years--; months += 12; }
      const totalMonths = years * 12 + months;
      return {
        result: `${years} an(s), ${months} mois`,
        detail: `Soit environ ${totalMonths} mois ou ${Math.floor((now - start) / 86400000)} jours.`
      };
    }
  },
  {
    id: 'conges', title: "Congés payés acquis", icon: Calendar,
    desc: "Estimation sur la période de référence",
    inputs: [{ id: 'mois', label: 'Mois travaillés sur la période', type: 'number' }],
    compute: ({ mois }) => {
      const m = parseFloat(mois) || 0;
      const j = m * 2.5;
      return {
        result: `${j} jours ouvrables`,
        detail: `${m} × 2,5 = ${j} jours ouvrables (≈ ${(j * 6 / 7).toFixed(1)} jours ouvrés)\nMaximum légal : 30 jours / an.`
      };
    }
  }
];

/* ================== UI HELPERS ================== */
const accentClass = (theme, accent) => {
  const map = {
    red: { bg: 'var(--accent-red-soft)', fg: 'var(--accent-red)' },
    amber: { bg: theme === 'light' ? '#FEF6E4' : 'rgba(234,179,8,0.12)', fg: theme === 'light' ? '#A16207' : '#FBC02D' },
    blue: { bg: 'var(--primary-soft)', fg: 'var(--primary)' },
    emerald: { bg: theme === 'light' ? '#E6F4EC' : 'rgba(34,197,94,0.12)', fg: theme === 'light' ? '#15803D' : '#4ADE80' }
  };
  return map[accent] || map.blue;
};

const infoStyle = (kind, theme) => {
  const map = {
    critical: { bg: theme === 'light' ? '#FBEAE8' : 'rgba(229,91,80,0.12)', fg: theme === 'light' ? '#7F1D1D' : '#FCA5A5', border: theme === 'light' ? '#F5C2BC' : 'rgba(229,91,80,0.3)', icon: AlertTriangle },
    important: { bg: theme === 'light' ? '#FEF6E4' : 'rgba(234,179,8,0.12)', fg: theme === 'light' ? '#854D0E' : '#FCD34D', border: theme === 'light' ? '#FCE0A1' : 'rgba(234,179,8,0.3)', icon: AlertCircle },
    info: { bg: theme === 'light' ? '#E8F1FB' : 'rgba(74,134,214,0.12)', fg: theme === 'light' ? '#1E3A8A' : '#93C5FD', border: theme === 'light' ? '#BAD3F2' : 'rgba(74,134,214,0.3)', icon: BookOpen },
    tip: { bg: theme === 'light' ? '#E6F4EC' : 'rgba(34,197,94,0.12)', fg: theme === 'light' ? '#14532D' : '#86EFAC', border: theme === 'light' ? '#A7D8B7' : 'rgba(34,197,94,0.3)', icon: Lightbulb }
  };
  return map[kind] || map.info;
};

const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)' };
const inputStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' };

/* ================== HEADER & NAV ================== */
function Header({ onUrgence }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl no-print" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}>
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden ring-1 ring-white/30 shadow-md" style={{ background: '#fff' }}>
            <img src={LOGO_B64} alt="UNSA SULO" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-display font-bold text-base leading-tight" style={{ color: 'var(--text)' }}>UNSA SULO</div>
            <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--primary)' }}>Mon assistant</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center tap-scale" style={cardStyle}>
            <Bell size={18} style={{ color: 'var(--text-2)' }} />
          </button>
          <button onClick={onUrgence} className="h-10 px-3 rounded-xl flex items-center gap-1.5 tap-scale font-semibold text-sm" style={{ background: 'var(--accent-red-soft)', color: 'var(--accent-red)', border: '1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)' }}>
            <AlertTriangle size={16} />
            <span>Urgence</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'agir', label: 'Agir', icon: Zap },
    { id: 'defense', label: 'Défense', icon: Scale },
    { id: 'elus', label: 'Élus', icon: Users },
    { id: 'profil', label: 'Profil', icon: User }
  ];
  return (
    <nav className="no-print fixed bottom-0 inset-x-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', borderTop: '1px solid var(--border)' }}>
      <div className="flex items-stretch justify-around max-w-md mx-auto">
        {items.map(it => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} className="flex-1 py-3 flex flex-col items-center gap-1 tap-scale" style={{ color: active ? 'var(--primary)' : 'var(--text-3)' }}>
              <div className={`relative ${active ? 'scale-110' : ''} transition`}>
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {active && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'var(--primary)' }} />}
              </div>
              <span className={`text-[9px] uppercase tracking-wider ${active ? 'font-semibold' : 'font-medium'}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-2" />
    </nav>
  );
}

/* ================== ACCUEIL ================== */
function Accueil({ open, name, theme, news, isAdmin, onAddNews, onEditNews, onDeleteNews }) {
  const actions = [
    { id: 'defense', icon: Scale, title: 'Mes droits', desc: '14 fiches juridiques', accent: 'blue', onTap: () => open({ type: 'tab', id: 'defense' }) },
    { id: 'courrier', icon: FileText, title: 'Courriers', desc: '13 modèles PDF', accent: 'red', onTap: () => open({ type: 'tab', id: 'agir' }) },
    { id: 'calc', icon: Calculator, title: 'Calculer', desc: 'Heures sup, indemnités…', accent: 'emerald', onTap: () => open({ type: 'calc-list' }) },
    { id: 'ai', icon: Bot, title: 'Assistant IA', desc: 'Posez votre question', accent: 'amber', onTap: () => open({ type: 'ai' }) }
  ];

  return (
    <div className="px-5 pt-6 pb-8 fade-in">
      <div className="mb-6">
        <div className="text-sm mb-1 capitalize" style={{ color: 'var(--text-3)' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 className="font-display font-bold text-3xl leading-tight" style={{ color: 'var(--text)' }}>
          Bonjour{name ? `, ${name}` : ''}.<br />
          <span style={{ color: 'var(--text-3)' }}>Que voulez-vous faire ?</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 stagger mb-6">
        {actions.map(a => {
          const c = accentClass(theme, a.accent);
          return (
            <button key={a.id} onClick={a.onTap} className="text-left p-4 rounded-2xl tap-scale aspect-[1/1.05] flex flex-col justify-between" style={cardStyle}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: c.bg, color: c.fg, border: `1px solid ${c.fg}25` }}>
                <a.icon size={22} strokeWidth={2} />
              </div>
              <div>
                <div className="font-display font-semibold text-base leading-tight" style={{ color: 'var(--text)' }}>{a.title}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{a.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={() => open({ type: 'ai' })} className="w-full text-left rounded-2xl p-5 mb-6 tap-scale relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--unsa-blue) 0%, var(--unsa-blue-dark) 100%)' }}>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="flex items-start gap-3 relative">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <Sparkles size={22} className="text-white" />
          </div>
          <div className="text-white">
            <div className="font-display font-bold text-base mb-0.5">Demandez en langage libre</div>
            <div className="text-sm opacity-85 mb-2">"Mon chef veut me changer d'horaire demain, peut-il ?"</div>
            <div className="text-xs uppercase tracking-widest font-semibold opacity-90 flex items-center gap-1">
              Lancer l'assistant <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </button>

      <button onClick={() => open({ type: 'erreurs' })} className="w-full text-left rounded-2xl p-4 mb-3 tap-scale flex items-center gap-3" style={{ background: 'var(--accent-red-soft)', border: '1px solid color-mix(in srgb, var(--accent-red) 25%, transparent)' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-red)', color: 'white' }}>
          <XOctagon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm" style={{ color: 'var(--accent-red)' }}>10 erreurs à éviter absolument</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Quand la situation devient sérieuse au travail</div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--accent-red)' }} className="shrink-0" />
      </button>

      <button onClick={() => open({ type: 'fiche', id: 'preuves' })} className="w-full text-left rounded-2xl p-4 mb-6 tap-scale flex items-center gap-3" style={cardStyle}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <Eye size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>Comment prouver une situation</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Au tribunal, ce qui n'est pas prouvé n'existe pas</div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--text-3)' }} className="shrink-0" />
      </button>

      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-3)' }}>Actualités UNSA SULO</div>
        {isAdmin && (
          <button onClick={onAddNews} className="h-7 px-2.5 rounded-lg flex items-center gap-1 tap-scale font-semibold text-xs" style={{ background: 'var(--primary)', color: 'white' }}>
            <Plus size={12} /> Ajouter
          </button>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {news.length === 0 && !isAdmin && (
          <div className="rounded-xl p-4" style={cardStyle}>
            <div className="font-medium text-sm mb-1" style={{ color: 'var(--text)' }}>Délai de contestation d'une sanction : 2 mois</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>N'attendez pas — un avertissement non contesté peut servir plus tard.</div>
          </div>
        )}
        {news.length === 0 && isAdmin && (
          <button onClick={onAddNews} className="w-full text-center py-6 rounded-xl text-sm font-medium tap-scale" style={{ ...cardStyle, color: 'var(--primary)', borderStyle: 'dashed' }}>
            + Publier la première annonce
          </button>
        )}
        {news.map(n => {
          const c = accentClass(theme, n.accent);
          return (
            <div key={n.id} className="rounded-xl p-4 relative" style={{ ...cardStyle, borderLeft: `4px solid ${c.fg}` }}>
              <div className="font-display font-semibold text-sm mb-1.5 pr-12" style={{ color: 'var(--text)' }}>{n.title}</div>
              <div className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-2)' }}>{n.body}</div>
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1">
                  <button onClick={() => onEditNews(n.id)} className="w-7 h-7 rounded-lg flex items-center justify-center tap-scale" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => onDeleteNews(n.id)} className="w-7 h-7 rounded-lg flex items-center justify-center tap-scale" style={{ background: 'var(--accent-red-soft)', color: 'var(--accent-red)' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================== AGIR ================== */
function Agir({ open, theme }) {
  return (
    <div className="px-5 pt-6 pb-8 fade-in">
      <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>Agir</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>Outils concrets pour faire valoir vos droits.</p>

      <div className="text-xs uppercase tracking-widest mb-3 font-bold flex items-center gap-2" style={{ color: 'var(--text-3)' }}>
        <FileText size={12} /> Courriers ({COURRIERS.length})
      </div>
      <div className="space-y-2 stagger mb-7">
        {COURRIERS.map(c => (
          <button key={c.id} onClick={() => open({ type: 'courrier', id: c.id })} className="w-full text-left p-4 rounded-xl flex items-center gap-3 tap-scale" style={cardStyle}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <c.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{c.title}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{c.desc}</div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-3)' }} className="shrink-0" />
          </button>
        ))}
      </div>

      <div className="text-xs uppercase tracking-widest mb-3 font-bold flex items-center gap-2" style={{ color: 'var(--text-3)' }}>
        <Calculator size={12} /> Calculs
      </div>
      <div className="space-y-2 stagger">
        {CALCULATORS.map(c => {
          const cl = accentClass(theme, 'emerald');
          return (
            <button key={c.id} onClick={() => open({ type: 'calc', id: c.id })} className="w-full text-left p-4 rounded-xl flex items-center gap-3 tap-scale" style={cardStyle}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: cl.bg, color: cl.fg }}>
                <c.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{c.title}</div>
                <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{c.desc}</div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-3)' }} className="shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================== DÉFENSE ================== */
function Defense({ open, theme }) {
  return (
    <div className="px-5 pt-6 pb-8 fade-in">
      <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>Défense</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>Vos droits, en clair. Pas de jargon.</p>
      <div className="space-y-2 stagger">
        {FICHES.map(f => {
          const c = accentClass(theme, f.accent);
          return (
            <button key={f.id} onClick={() => open({ type: 'fiche', id: f.id })} className="w-full text-left p-4 rounded-xl flex items-center gap-3 tap-scale" style={cardStyle}>
              <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.bg, color: c.fg, border: `1px solid ${c.fg}25` }}>
                <f.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{f.title}</div>
                <div className="text-xs line-clamp-1" style={{ color: 'var(--text-3)' }}>{f.resume}</div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-3)' }} className="shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================== PROFIL ================== */
function Profil({ name, setName, theme, setTheme, isAdmin, onAdminToggle }) {
  return (
    <div className="px-5 pt-6 pb-8 fade-in">
      <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>Profil</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>Données stockées localement sur votre appareil.</p>

      <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--unsa-blue) 0%, var(--unsa-blue-dark) 100%)' }}>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15" style={{ background: 'white' }} />
        <div className="flex items-center gap-4 mb-4 relative">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
            <img src={LOGO_B64} alt="UNSA" className="w-full h-full object-contain" />
          </div>
          <div className="text-white">
            <div className="font-display font-bold text-lg leading-tight">{name || 'Anonyme'}</div>
            <div className="text-xs font-semibold uppercase tracking-wider mt-0.5 opacity-90">
              {isAdmin ? 'Administrateur UNSA SULO' : 'Adhérent UNSA SULO'}
            </div>
          </div>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre prénom" className="w-full bg-white/15 backdrop-blur placeholder-white/60 text-white rounded-xl px-4 py-3 text-sm outline-none border border-white/20 focus:border-white/40" />
      </div>

      {isAdmin && (
        <div className="rounded-xl p-4 mb-3 flex items-center gap-3" style={{ background: 'var(--primary-soft)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--primary)', color: 'white' }}>
            <KeyRound size={16} />
          </div>
          <div className="flex-1 text-xs" style={{ color: 'var(--primary)' }}>
            <strong className="font-semibold">Mode administrateur actif.</strong> Vous pouvez ajouter, modifier ou supprimer les élus.
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden mb-3" style={cardStyle}>
        <button onClick={onAdminToggle} className="w-full flex items-center justify-between px-4 py-4 tap-scale">
          <div className="flex items-center gap-3">
            <KeyRound size={18} style={{ color: isAdmin ? 'var(--primary)' : 'var(--text-2)' }} />
            <span className="text-sm" style={{ color: 'var(--text)' }}>Mode administrateur</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: isAdmin ? 'var(--primary)' : 'var(--text-3)' }}>
            {isAdmin ? 'Actif' : 'Activer'}
          </span>
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between px-4 py-4 tap-scale">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={18} style={{ color: 'var(--text-2)' }} /> : <Sun size={18} style={{ color: 'var(--text-2)' }} />}
            <span className="text-sm" style={{ color: 'var(--text)' }}>Thème</span>
          </div>
          <span className="text-sm" style={{ color: 'var(--text-3)' }}>{theme === 'dark' ? 'Sombre' : 'Clair'}</span>
        </button>
        <div className="px-4 py-4 flex items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <BookOpen size={18} style={{ color: 'var(--text-2)' }} />
          <div className="flex-1">
            <div className="text-sm" style={{ color: 'var(--text)' }}>Version</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>v{APP_VERSION} — prototype</div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[11px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
        Cette application est un prototype. Les contenus juridiques sont indicatifs et ne remplacent pas l'avis d'un avocat ou d'un délégué. À faire valider par un juriste avant diffusion publique.
      </div>
    </div>
  );
}

/* ================== SUB-HEADER ================== */
function SubHeader({ title, subtitle, onClose }) {
  return (
    <div className="sticky top-[64px] z-20 backdrop-blur-xl px-4 py-3 flex items-center gap-3 no-print" style={{ background: 'color-mix(in srgb, var(--bg) 90%, transparent)', borderBottom: '1px solid var(--border)' }}>
      <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center tap-scale" style={cardStyle}>
        <ArrowLeft size={18} style={{ color: 'var(--text)' }} />
      </button>
      <div className="min-w-0">
        <div className="font-display font-semibold text-base truncate" style={{ color: 'var(--text)' }}>{title}</div>
        {subtitle && <div className="text-[11px] truncate" style={{ color: 'var(--text-3)' }}>{subtitle}</div>}
      </div>
    </div>
  );
}

/* ================== INFO BOX ================== */
function InfoBox({ kind, text, theme }) {
  const s = infoStyle(kind, theme);
  const Icon = s.icon;
  return (
    <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <Icon size={16} className="shrink-0 mt-0.5" style={{ color: s.fg }} />
      <div className="text-xs leading-relaxed" style={{ color: s.fg }}>{text}</div>
    </div>
  );
}

/* ================== FICHE ================== */
function Section({ title, tone, theme, children }) {
  let dotColor = 'var(--text-3)';
  if (tone === 'emerald') dotColor = theme === 'light' ? '#15803D' : '#4ADE80';
  if (tone === 'red') dotColor = 'var(--accent-red)';
  if (tone === 'info') dotColor = 'var(--primary)';
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 rounded-full" style={{ background: dotColor }} />
        <div className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-3)' }}>{title}</div>
      </div>
      <div className="pl-3">{children}</div>
    </div>
  );
}

function FicheView({ fiche, onClose, theme, openCourrier }) {
  const c = accentClass(theme, fiche.accent);
  return (
    <div className="fade-in">
      <SubHeader title={fiche.title} onClose={onClose} />
      <div className="px-5 pb-32 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: c.bg, color: c.fg, border: `1px solid ${c.fg}30` }}>
          <fiche.icon size={14} /> Fiche juridique
        </div>
        <p className="leading-relaxed mb-5" style={{ color: 'var(--text)' }}>{fiche.resume}</p>

        {fiche.infos && fiche.infos.length > 0 && (
          <div className="space-y-2 mb-5">
            {fiche.infos.map((info, i) => <InfoBox key={i} kind={info.kind} text={info.text} theme={theme} />)}
          </div>
        )}

        <Section title="Ce que dit la loi">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{fiche.loi}</p>
        </Section>

        {fiche.procedure && (
          <Section title="La procédure">
            <ol className="space-y-2">
              {fiche.procedure.map((step, i) => (
                <li key={i} className="text-sm flex gap-2.5" style={{ color: 'var(--text)' }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {fiche.motifs && (
          <Section title="Motifs valables">
            <ul className="space-y-1.5">
              {fiche.motifs.map((m, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text)' }}>
                  <span className="shrink-0" style={{ color: 'var(--primary)' }}>•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Ce qu'il faut faire" tone="emerald" theme={theme}>
          <ul className="space-y-2">
            {fiche.aFaire.map((x, i) => (
              <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text)' }}>
                <span className="shrink-0 font-bold" style={{ color: theme === 'light' ? '#15803D' : '#4ADE80' }}>✓</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="À éviter" tone="red" theme={theme}>
          <ul className="space-y-2">
            {fiche.aEviter.map((x, i) => (
              <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text)' }}>
                <span className="shrink-0 font-bold" style={{ color: 'var(--accent-red)' }}>✗</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </Section>

        {fiche.asavoir && fiche.asavoir.length > 0 && (
          <Section title="Bon à savoir" tone="info" theme={theme}>
            <div className="space-y-2">
              {fiche.asavoir.map((s, i) => (
                <div key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{s}</div>
              ))}
            </div>
          </Section>
        )}

        {fiche.courriersIds && fiche.courriersIds.length > 0 && (
          <Section title="Courriers associés">
            <div className="space-y-2">
              {fiche.courriersIds.map(cid => {
                const courrier = COURRIERS.find(x => x.id === cid);
                if (!courrier) return null;
                return (
                  <button key={cid} onClick={() => openCourrier(cid)} className="w-full text-left p-3 rounded-xl flex items-center gap-3 tap-scale" style={cardStyle}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      <courrier.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{courrier.title}</div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        <div className="mt-6 text-[11px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
          Information indicative. Pour votre cas précis, consultez un délégué UNSA ou l'assistant IA.
        </div>
      </div>
    </div>
  );
}

/* ================== ERREURS ================== */
function ErreursView({ onClose, theme }) {
  return (
    <div className="fade-in">
      <SubHeader title="10 erreurs à éviter" subtitle="Quand la situation devient sérieuse" onClose={onClose} />
      <div className="px-5 pb-32 pt-2">
        <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--accent-red-soft)', border: '1px solid color-mix(in srgb, var(--accent-red) 25%, transparent)' }}>
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-red)' }} />
            <div className="text-sm leading-relaxed" style={{ color: 'var(--accent-red)' }}>
              Lorsqu'un conflit s'installe, certaines réactions instinctives peuvent ruiner votre dossier, même si vous avez raison sur le fond.
            </div>
          </div>
        </div>
        <div className="space-y-3 stagger">
          {ERREURS.map(e => (
            <div key={e.n} className="rounded-xl p-4 flex gap-3" style={cardStyle}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-display font-bold text-sm" style={{ background: 'var(--accent-red)', color: 'white' }}>
                {e.n}
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{e.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{e.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl p-4" style={{ background: 'var(--primary-soft)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}>
          <div className="flex items-start gap-2.5">
            <Lightbulb size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
            <div className="text-sm leading-relaxed" style={{ color: 'var(--primary)' }}>
              <strong className="font-semibold">Le vrai réflexe :</strong> dès qu'une situation devient tendue, contactez vos délégués UNSA. Plus vous agissez tôt, plus vos chances de bien gérer la situation sont grandes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== COURRIER ================== */
function CourrierGenerator({ courrier, onClose }) {
  const [data, setData] = useState({});
  const [step, setStep] = useState('form');
  const allFilled = courrier.fields.filter(f => f.id !== 'motif' && f.id !== 'accompagnant' && f.id !== 'assistant').every(f => data[f.id] && data[f.id].trim());
  const text = step === 'preview' ? courrier.build(data) : '';

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${courrier.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      <SubHeader title={courrier.title} onClose={onClose} />
      <div className="px-5 pb-32 pt-2">
        {step === 'form' && (
          <>
            <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>{courrier.desc}</p>
            <div className="space-y-4">
              {courrier.fields.map(f => (
                <div key={f.id}>
                  <label className="block text-xs uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>
                    {f.label}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea value={data[f.id] || ''} onChange={e => setData({ ...data, [f.id]: e.target.value })} rows={3} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={inputStyle} />
                  ) : (
                    <input type={f.type} value={data[f.id] || ''} onChange={e => setData({ ...data, [f.id]: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setStep('preview')} disabled={!allFilled} className="mt-6 w-full py-4 rounded-xl text-white font-semibold tap-scale disabled:opacity-40" style={{ background: allFilled ? 'var(--primary)' : 'var(--text-3)' }}>
              {allFilled ? 'Générer le courrier' : 'Remplissez tous les champs'}
            </button>
          </>
        )}
        {step === 'preview' && (
          <>
            <div className="rounded-2xl bg-white text-black p-6 mb-5 print-area" style={{ border: '1px solid #E5E9F0' }}>
              <pre className="whitespace-pre-wrap text-[13px] leading-relaxed font-body">{text}</pre>
            </div>
            <div className="flex gap-2 no-print">
              <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl font-medium tap-scale text-sm" style={cardStyle}>Modifier</button>
              <button onClick={handleDownload} className="flex-1 py-3 rounded-xl font-medium tap-scale text-sm flex items-center justify-center gap-1.5" style={cardStyle}>
                <FileText size={15} /> .txt
              </button>
              <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl text-white font-semibold tap-scale text-sm flex items-center justify-center gap-1.5" style={{ background: 'var(--primary)' }}>
                <Printer size={15} /> PDF
              </button>
            </div>
            <div className="mt-4 text-[11px] leading-relaxed no-print" style={{ color: 'var(--text-3)' }}>
              Le bouton PDF ouvre la boîte d'impression : choisissez "Enregistrer en PDF". Envoyez en lettre recommandée avec accusé de réception.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================== CALCULATEUR ================== */
function CalculatorView({ calc, onClose, theme }) {
  const [data, setData] = useState({});
  const allFilled = calc.inputs.every(i => data[i.id] !== undefined && data[i.id] !== '');
  const out = allFilled ? calc.compute(data) : null;
  const cl = accentClass(theme, 'emerald');

  return (
    <div className="fade-in">
      <SubHeader title={calc.title} onClose={onClose} />
      <div className="px-5 pb-32 pt-2">
        <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>{calc.desc}</p>
        <div className="space-y-4 mb-6">
          {calc.inputs.map(f => (
            <div key={f.id}>
              <label className="block text-xs uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>{f.label}</label>
              <input type={f.type} step="any" value={data[f.id] || ''} onChange={e => setData({ ...data, [f.id]: e.target.value })} className="w-full rounded-xl px-4 py-3 text-base outline-none" style={inputStyle} />
            </div>
          ))}
        </div>
        {out && (
          <div className="rounded-2xl p-5 fade-in" style={{ background: cl.bg, border: `1px solid ${cl.fg}30` }}>
            <div className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: cl.fg }}>Résultat</div>
            <div className="font-display font-bold text-3xl mb-3" style={{ color: 'var(--text)' }}>{out.result}</div>
            <pre className="text-xs whitespace-pre-wrap leading-relaxed font-body" style={{ color: 'var(--text-2)' }}>{out.detail}</pre>
          </div>
        )}
        <div className="mt-5 text-[11px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
          Estimation indicative selon le Code du travail. Votre convention collective peut prévoir mieux.
        </div>
      </div>
    </div>
  );
}

function CalcList({ open, theme }) {
  const cl = accentClass(theme, 'emerald');
  return (
    <div className="fade-in">
      <SubHeader title="Calculateurs" onClose={() => open(null)} />
      <div className="px-5 pb-32 pt-2 space-y-2 stagger">
        {CALCULATORS.map(c => (
          <button key={c.id} onClick={() => open({ type: 'calc', id: c.id })} className="w-full text-left p-4 rounded-xl flex items-center gap-3 tap-scale" style={cardStyle}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: cl.bg, color: cl.fg }}>
              <c.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{c.title}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{c.desc}</div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-3)' }} className="shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================== AI CHAT ================== */
const SYSTEM_PROMPT = `Tu es l'assistant syndical UNSA SULO pour les salariés français. Tu réponds en français, brièvement et clairement (max 150 mots).

Règles strictes :
- Tu connais le Code du travail français mais tu n'es pas avocat. Pour les cas graves, recommande un délégué UNSA SULO ou un avocat.
- Tu poses 1-2 questions de clarification si la situation est floue.
- Tu termines toujours par 1-2 actions concrètes : "Que faire maintenant".
- Si la situation est urgente (licenciement imminent, harcèlement, accident, droit de retrait), recommande l'assistance immédiate d'un délégué UNSA.
- Tu n'inventes JAMAIS d'articles de loi. Cite uniquement ceux que tu es sûr (L1232-1, L1152-1, L3121-28, L1331-1, L4121-1, L411-1, L4131-1, L1226-1).
- Ton style : direct, factuel, rassurant. Pas de jargon. Pas de longues phrases.`;

function AIChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Bonjour. Décrivez votre situation en quelques phrases — je vous oriente vers vos droits et vos prochaines actions." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(''); setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const data = await callAI({ system: SYSTEM_PROMPT, messages: apiMessages });
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      if (!text) {
        setMessages([...newMessages, { role: 'assistant', content: "Je n'ai pas pu formuler de réponse. Reformulez votre question ou contactez un délégué UNSA." }]);
        return;
      }
      setMessages([...newMessages, { role: 'assistant', content: text }]);
    } catch (e) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: `⚠ L'assistant n'est pas disponible.\n\n${e.message}\n\nVérifiez que la fonction Netlify est déployée et que la clé ANTHROPIC_API_KEY est configurée dans les variables d'environnement Netlify.`
      }]);
    } finally { setLoading(false); }
  };

  const suggestions = [
    "Mon chef veut me changer d'horaire demain",
    "J'ai reçu un avertissement injustifié",
    "Mes heures sup ne sont pas payées"
  ];

  return (
    <div className="fade-in flex flex-col h-[calc(100vh-64px)]">
      <SubHeader title="Assistant IA" subtitle="Confidentiel · pas un avocat" onClose={onClose} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap" style={m.role === 'user' ? { background: 'var(--primary)', color: 'white', borderBottomRightRadius: '8px' } : { ...cardStyle, color: 'var(--text)', borderBottomLeftRadius: '8px' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ ...cardStyle, borderBottomLeftRadius: '8px' }}>
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-3)' }} />
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>Réflexion…</span>
            </div>
          </div>
        )}
        {messages.length === 1 && !loading && (
          <div className="pt-2 space-y-2">
            <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--text-3)' }}>Exemples</div>
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)} className="block w-full text-left text-sm rounded-xl px-3 py-2 tap-scale" style={{ ...cardStyle, color: 'var(--text-2)' }}>"{s}"</button>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 py-3 sticky bottom-0" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-end gap-2">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder="Décrivez votre situation…" className="flex-1 rounded-2xl px-4 py-3 text-sm outline-none resize-none max-h-32" style={inputStyle} />
          <button onClick={send} disabled={!input.trim() || loading} className="w-11 h-11 rounded-2xl text-white flex items-center justify-center tap-scale shrink-0 disabled:opacity-40" style={{ background: 'var(--primary)' }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== URGENCE ================== */
function UrgenceModal({ onClose, openAI }) {
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-end justify-center fade-in" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="w-full max-w-md rounded-t-3xl p-6 pb-10" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border-strong)' }} />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-red-soft)', color: 'var(--accent-red)', border: '1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Que se passe-t-il ?</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>Pas à pas, ne signez rien.</div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {[
            { t: "Je suis convoqué maintenant", d: "Demandez 5 jours pour préparer votre défense." },
            { t: "On me demande de signer", d: "Ne signez RIEN avant relecture par un délégué." },
            { t: "Je suis en accident", d: "Médecin le jour même, déclaration sous 24h." },
            { t: "Je subis un harcèlement", d: "Notez tout. Témoins. Médecin. Délégué." },
            { t: "Je suis en danger immédiat", d: "Droit de retrait : quittez le poste, alertez par écrit." }
          ].map(c => (
            <button key={c.t} onClick={() => { onClose(); openAI(); }} className="w-full text-left p-3 rounded-xl tap-scale" style={cardStyle}>
              <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{c.t}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{c.d}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 rounded-xl font-medium tap-scale text-sm" style={cardStyle}>Fermer</button>
      </div>
    </div>
  );
}

/* ================== SPLASH ================== */
function Splash({ onDone }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const created = [];
    const playSignature = async () => {
      try {
        await Tone.start();
        if (cancelled) return;
        const reverb = new Tone.Freeverb({ roomSize: 0.92, dampening: 2400 }).toDestination();
        reverb.wet.value = 0.55;
        const comp = new Tone.Compressor(-18, 3).connect(reverb);
        const sub = new Tone.MembraneSynth({ pitchDecay: 0.06, octaves: 7, envelope: { attack: 0.001, decay: 0.55, sustain: 0, release: 1.2 } }).toDestination();
        sub.volume.value = -2;
        const pad = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.45, decay: 1.2, sustain: 0.4, release: 2.4 } }).connect(comp);
        pad.volume.value = -10;
        const bell = new Tone.PolySynth(Tone.FMSynth, { modulationIndex: 8, harmonicity: 3.1, envelope: { attack: 0.005, decay: 0.6, sustain: 0.1, release: 2 }, modulationEnvelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 1 } }).connect(comp);
        bell.volume.value = -16;
        created.push(sub, pad, bell, comp, reverb);
        const t = Tone.now();
        sub.triggerAttackRelease('D1', '8n', t);
        pad.triggerAttackRelease('D3', '2n', t + 0.25);
        pad.triggerAttackRelease('A3', '2n', t + 0.85);
        pad.triggerAttackRelease(['D4', 'F#4', 'A4'], '1n', t + 1.4);
        bell.triggerAttackRelease('D5', '4n', t + 1.6);
        bell.triggerAttackRelease('A4', '8n', t + 2.4);
      } catch (e) {}
    };
    playSignature();
    const showT = setTimeout(() => { if (!cancelled) setExiting(true); }, 3500);
    const doneT = setTimeout(() => { if (!cancelled) onDone(); }, 3900);
    return () => {
      cancelled = true;
      clearTimeout(showT); clearTimeout(doneT);
      created.forEach(node => { try { node.dispose(); } catch {} });
    };
  }, [onDone]);
  const skip = () => { setExiting(true); setTimeout(onDone, 380); };
  return (
    <div onClick={skip} className={`fixed inset-0 z-[100] flex flex-col items-center justify-center splash-bg ${exiting ? 'splash-out' : ''}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-48 -left-32 w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)' }} />
        <div className="absolute top-1/4 left-8 w-2 h-2 rounded-full bg-white/40" />
        <div className="absolute top-1/3 right-12 w-1.5 h-1.5 rounded-full bg-white/25" />
        <div className="absolute bottom-1/3 right-8 w-1 h-1 rounded-full bg-white/30" />
      </div>
      <div className="splash-logo relative mb-8">
        <div className="absolute inset-0 rounded-[2rem] splash-halo" style={{ background: 'rgba(255,255,255,0.4)' }} />
        <div className="absolute inset-0 rounded-[2rem] splash-halo" style={{ background: 'rgba(255,255,255,0.3)', animationDelay: '700ms' }} />
        <div className="relative w-32 h-32 rounded-[2rem] bg-white shadow-2xl overflow-hidden ring-1 ring-white/40">
          <img src={LOGO_B64} alt="UNSA SULO" className="w-full h-full object-contain" />
        </div>
      </div>
      <div className="splash-text relative text-center px-8">
        <h1 className="font-display font-bold text-white text-[2.6rem] tracking-tight leading-none">UNSA SULO</h1>
        <p className="text-white/70 text-[11px] mt-3 uppercase tracking-[0.35em] font-semibold">Mon assistant</p>
      </div>
      <div className="splash-tagline absolute bottom-20 inset-x-0 text-center">
        <p className="text-white/60 text-sm font-medium px-8">Vos droits, à portée de main</p>
        <div className="splash-dots flex justify-center gap-2 mt-5">
          <span className="block w-1.5 h-1.5 rounded-full bg-white" />
          <span className="block w-1.5 h-1.5 rounded-full bg-white" />
          <span className="block w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>
      <div className="absolute bottom-5 inset-x-0 text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-[0.25em] font-semibold">Solidarité · Service · Action</p>
        <p className="text-white/25 text-[9px] mt-1.5 font-medium">Version {APP_VERSION}</p>
      </div>
    </div>
  );
}

/* ================== ÉLUS ================== */
function avatarColors(seed) {
  const colors = [
    'linear-gradient(135deg, #1F5AA8 0%, #0F2D5C 100%)',
    'linear-gradient(135deg, #B8332A 0%, #7F1D1D 100%)',
    'linear-gradient(135deg, #15803D 0%, #064E3B 100%)',
    'linear-gradient(135deg, #A16207 0%, #78350F 100%)',
    'linear-gradient(135deg, #6D28D9 0%, #3730A3 100%)'
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || '?';
}

function ElusTab({ elus, isAdmin, onOpen, onEdit, onAdd, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = elus.filter(e => {
    const q = search.toLowerCase();
    if (!q) return true;
    return e.name.toLowerCase().includes(q)
      || e.role.toLowerCase().includes(q)
      || (e.mandates || []).some(m => m.toLowerCase().includes(q));
  });

  return (
    <div className="px-5 pt-6 pb-8 fade-in">
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>Élus UNSA</h1>
        {isAdmin && (
          <button onClick={onAdd} className="h-9 px-3 rounded-xl flex items-center gap-1.5 tap-scale font-semibold text-xs" style={{ background: 'var(--primary)', color: 'white' }}>
            <Plus size={14} /> Ajouter
          </button>
        )}
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--text-3)' }}>Vos représentants — appel ou email en 1 clic.</p>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher (nom, mandat...)"
        className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4"
        style={inputStyle}
      />

      {filtered.length === 0 && (
        <div className="text-center py-10" style={{ color: 'var(--text-3)' }}>
          <Users size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucun élu trouvé.</p>
          {isAdmin && <p className="text-xs mt-1">Tapez "Ajouter" pour saisir le premier.</p>}
        </div>
      )}

      <div className="space-y-2 stagger">
        {filtered.map(e => (
          <button key={e.id} onClick={() => onOpen(e.id)} className="w-full text-left p-4 rounded-xl flex items-center gap-3 tap-scale" style={cardStyle}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden font-display font-bold text-white text-sm" style={{ background: e.photoUrl ? '#fff' : avatarColors(e.id) }}>
              {e.photoUrl ? <img src={e.photoUrl} alt="" className="w-full h-full object-cover" /> : getInitials(e.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{e.name}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{e.role}</div>
              {e.mandates && e.mandates.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {e.mandates.slice(0, 3).map((m, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{m}</span>
                  ))}
                </div>
              )}
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-3)' }} className="shrink-0" />
          </button>
        ))}
      </div>

      {!isAdmin && (
        <div className="mt-6 text-[11px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
          Pour ajouter ou modifier les élus, activez le mode administrateur dans le profil.
        </div>
      )}
    </div>
  );
}

function ElusDetail({ elu, isAdmin, onClose, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div className="fade-in">
      <SubHeader title={elu.name} onClose={onClose} />
      <div className="px-5 pb-32 pt-4">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-lg font-display font-bold text-white text-2xl mb-3" style={{ background: elu.photoUrl ? '#fff' : avatarColors(elu.id) }}>
            {elu.photoUrl ? <img src={elu.photoUrl} alt="" className="w-full h-full object-cover" /> : getInitials(elu.name)}
          </div>
          <div className="font-display font-bold text-xl text-center" style={{ color: 'var(--text)' }}>{elu.name}</div>
          <div className="text-sm text-center mt-0.5" style={{ color: 'var(--text-3)' }}>{elu.role}</div>
          {elu.mandates && elu.mandates.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {elu.mandates.map((m, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{m}</span>
              ))}
            </div>
          )}
        </div>

        {(elu.phone || elu.email) && (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {elu.phone && (
              <a href={`tel:${elu.phone.replace(/\s/g, '')}`} className="rounded-xl p-3 flex flex-col items-center gap-1 tap-scale text-white font-semibold" style={{ background: 'var(--primary)' }}>
                <Phone size={20} />
                <span className="text-xs">Appeler</span>
              </a>
            )}
            {elu.email && (
              <a href={`mailto:${elu.email}`} className="rounded-xl p-3 flex flex-col items-center gap-1 tap-scale font-semibold" style={{ ...cardStyle, color: 'var(--text)' }}>
                <Mail size={20} />
                <span className="text-xs">Email</span>
              </a>
            )}
          </div>
        )}

        <div className="space-y-2 mb-5">
          {elu.phone && (
            <div className="rounded-xl p-3 flex items-center gap-3" style={cardStyle}>
              <Phone size={16} style={{ color: 'var(--primary)' }} />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-3)' }}>Téléphone</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{elu.phone}</div>
              </div>
            </div>
          )}
          {elu.email && (
            <div className="rounded-xl p-3 flex items-center gap-3" style={cardStyle}>
              <Mail size={16} style={{ color: 'var(--primary)' }} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-3)' }}>Email</div>
                <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{elu.email}</div>
              </div>
            </div>
          )}
        </div>

        {elu.bio && (
          <div className="rounded-xl p-4 mb-5" style={cardStyle}>
            <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-3)' }}>À propos</div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-2)' }}>{elu.bio}</p>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--text-3)' }}>Mode administrateur</div>
            <div className="flex gap-2">
              <button onClick={onEdit} className="flex-1 py-3 rounded-xl font-medium tap-scale text-sm flex items-center justify-center gap-1.5" style={cardStyle}>
                <Pencil size={14} /> Modifier
              </button>
              <button onClick={() => setConfirmDel(true)} className="flex-1 py-3 rounded-xl font-medium tap-scale text-sm flex items-center justify-center gap-1.5" style={{ background: 'var(--accent-red-soft)', color: 'var(--accent-red)', border: '1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)' }}>
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
            {confirmDel && (
              <div className="mt-3 rounded-xl p-3" style={{ background: 'var(--accent-red-soft)', border: '1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)' }}>
                <p className="text-sm mb-2" style={{ color: 'var(--accent-red)' }}>Confirmer la suppression de {elu.name} ?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDel(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={cardStyle}>Annuler</button>
                  <button onClick={onDelete} className="flex-1 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--accent-red)' }}>Supprimer</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function PhotoUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const dataUrl = await processPhotoFile(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message || 'Erreur lors du traitement de la photo');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-xs uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>Photo (optionnel)</label>
      {value && (
        <div className="mb-2 flex items-center gap-3">
          <img src={value} alt="" className="w-16 h-16 rounded-xl object-cover" style={{ border: '1px solid var(--border)' }} />
          <button type="button" onClick={() => onChange('')} className="text-xs font-medium px-3 py-1.5 rounded-lg tap-scale" style={{ background: 'var(--accent-red-soft)', color: 'var(--accent-red)' }}>
            Retirer
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
        id="photo-upload-input"
      />
      <label htmlFor="photo-upload-input" className="block w-full rounded-xl px-4 py-3 text-sm text-center font-medium tap-scale cursor-pointer" style={{ ...cardStyle, color: 'var(--primary)', borderStyle: 'dashed', borderColor: 'var(--primary)' }}>
        {uploading ? 'Traitement...' : value ? 'Changer de photo' : '📷 Choisir / Prendre une photo'}
      </label>
      {error && <div className="text-xs mt-1.5" style={{ color: 'var(--accent-red)' }}>{error}</div>}
      <div className="text-[10px] mt-1.5" style={{ color: 'var(--text-3)' }}>
        L'image est redimensionnée (max 480px) et compressée automatiquement.
      </div>
    </div>
  );
}

function ElusEditor({ initial, onSave, onClose }) {
  const [data, setData] = useState(initial || { name: '', role: '', phone: '', email: '', mandatesText: '', bio: '', photoUrl: '' });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const valid = data.name && data.name.trim();

  const save = () => {
    if (!valid) return;
    const mandates = (data.mandatesText || '').split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    onSave({
      id: initial?.id || `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name.trim(),
      role: data.role.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      mandates,
      bio: data.bio.trim(),
      photoUrl: data.photoUrl.trim() || null
    });
  };

  return (
    <div className="fade-in">
      <SubHeader title={initial ? 'Modifier un élu' : 'Ajouter un élu'} onClose={onClose} />
      <div className="px-5 pb-32 pt-2">
        <div className="space-y-4">
          {[
            { id: 'name', label: 'Nom complet *', type: 'text' },
            { id: 'role', label: 'Fonction (ex: Délégué CSE)', type: 'text' },
            { id: 'phone', label: 'Téléphone', type: 'tel' },
            { id: 'email', label: 'Email', type: 'email' },
            { id: 'mandatesText', label: 'Mandats (séparés par virgules)', type: 'textarea', placeholder: 'CSE, CSSCT, Délégué syndical...' },
            { id: 'bio', label: 'Bio / Présentation (optionnel)', type: 'textarea' }
          ].map(f => (
            <div key={f.id}>
              <label className="block text-xs uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={data[f.id] || ''} onChange={e => set(f.id, e.target.value)} rows={3} placeholder={f.placeholder || ''} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={inputStyle} />
              ) : (
                <input type={f.type} value={data[f.id] || ''} onChange={e => set(f.id, e.target.value)} placeholder={f.placeholder || ''} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              )}
            </div>
          ))}
          <PhotoUploader value={data.photoUrl} onChange={v => set('photoUrl', v)} />
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-medium tap-scale text-sm" style={cardStyle}>
            Annuler
          </button>
          <button onClick={save} disabled={!valid} className="flex-1 py-3 rounded-xl text-white font-semibold tap-scale text-sm flex items-center justify-center gap-1.5 disabled:opacity-40" style={{ background: valid ? 'var(--primary)' : 'var(--text-3)' }}>
            <Save size={15} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== ADMIN LOGIN ================== */
function AdminLogin({ onSuccess, onClose }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    if (pw === ADMIN_PASSWORD) {
      onSuccess(pw); // pass token to parent
    } else {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center fade-in p-5" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <KeyRound size={22} />
          </div>
          <div>
            <div className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Mode administrateur</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>Réservé aux délégués UNSA</div>
          </div>
        </div>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="Mot de passe"
          autoFocus
          className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-2"
          style={{ ...inputStyle, borderColor: error ? 'var(--accent-red)' : 'var(--border)' }}
        />
        {error && <div className="text-xs mb-2" style={{ color: 'var(--accent-red)' }}>Mot de passe incorrect.</div>}
        <div className="flex gap-2 mt-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-medium tap-scale text-sm" style={cardStyle}>Annuler</button>
          <button onClick={submit} disabled={!pw} className="flex-1 py-3 rounded-xl text-white font-semibold tap-scale text-sm disabled:opacity-40" style={{ background: 'var(--primary)' }}>
            Activer
          </button>
        </div>
      </div>
    </div>
  );
}


/* ================== NEWS / ANNONCES ================== */
function NewsEditor({ initial, onSave, onClose, theme }) {
  const [data, setData] = useState(initial || { title: '', body: '', accent: 'blue' });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const valid = data.title && data.body && data.title.trim() && data.body.trim();
  const save = () => {
    if (!valid) return;
    onSave({
      id: initial?.id || `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: data.title.trim(),
      body: data.body.trim(),
      accent: data.accent,
      createdAt: initial?.createdAt || new Date().toISOString()
    });
  };
  return (
    <div className="fade-in">
      <SubHeader title={initial ? "Modifier l'annonce" : "Nouvelle annonce"} onClose={onClose} />
      <div className="px-5 pb-32 pt-2 space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>Titre *</label>
          <input value={data.title} onChange={e => set('title', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>Contenu *</label>
          <textarea value={data.body} onChange={e => set('body', e.target.value)} rows={6} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>Couleur</label>
          <div className="grid grid-cols-4 gap-2">
            {['blue', 'red', 'emerald', 'amber'].map(a => {
              const c = accentClass(theme, a);
              return (
                <button key={a} type="button" onClick={() => set('accent', a)} className="py-3 rounded-xl text-xs font-semibold tap-scale" style={{ background: c.bg, color: c.fg, border: data.accent === a ? `2px solid ${c.fg}` : `1px solid ${c.fg}30` }}>
                  {a}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-medium tap-scale text-sm" style={cardStyle}>Annuler</button>
          <button onClick={save} disabled={!valid} className="flex-1 py-3 rounded-xl text-white font-semibold tap-scale text-sm disabled:opacity-40" style={{ background: valid ? 'var(--primary)' : 'var(--text-3)' }}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== APP ================== */
export default function App() {
  const [tab, setTab] = useState('accueil');
  const [screen, setScreen] = useState(null);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('light');
  const [urgence, setUrgence] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [elus, setElus] = useState(DEFAULT_ELUS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  const [adminToken, setAdminToken] = useState('');
  const [news, setNews] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const n = localStorage.getItem('unsa_user_name');
        const t = localStorage.getItem('unsa_user_theme');
        if (n) setName(JSON.parse(n));
        if (t) setTheme(JSON.parse(t));
      } catch {}
      try {
        const [eRemote, newsRemote] = await Promise.all([
          apiGet('elus'),
          apiGet('news')
        ]);
        if (Array.isArray(eRemote) && eRemote.length > 0) setElus(eRemote);
        if (Array.isArray(newsRemote)) setNews(newsRemote);
      } catch {}
      setStorageReady(true);
    })();
  }, []);

  // Persist name (local only)
  const updateName = (v) => {
    setName(v);
    try { localStorage.setItem('unsa_user_name', JSON.stringify(v)); } catch {}
  };
  // Persist theme (local only)
  const updateTheme = (v) => {
    setTheme(v);
    try { localStorage.setItem('unsa_user_theme', JSON.stringify(v)); } catch {}
  };
  // Persist elus (shared via Netlify Blobs, requires admin token)
  const saveElus = async (list) => {
    setElus(list);
    const r = await apiSet('elus', list, adminToken);
    setSaveStatus(r.ok ? { ok: true, msg: r.local ? 'Sauvegardé localement' : 'Sauvegardé en ligne' } : { ok: false, msg: r.error || 'Erreur de sauvegarde' });
    setTimeout(() => setSaveStatus(null), 3000);
  };
  // Persist news
  const saveNews = async (list) => {
    setNews(list);
    const r = await apiSet('news', list, adminToken);
    setSaveStatus(r.ok ? { ok: true, msg: r.local ? 'Sauvegardé localement' : 'Sauvegardé en ligne' } : { ok: false, msg: r.error || 'Erreur de sauvegarde' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const addOrUpdateElu = (e) => {
    const exists = elus.find(x => x.id === e.id);
    const next = exists ? elus.map(x => x.id === e.id ? e : x) : [...elus.filter(x => x.id !== 'placeholder-1'), e];
    saveElus(next);
    setScreen({ type: 'elu', id: e.id });
  };

  const deleteElu = (id) => {
    const next = elus.filter(x => x.id !== id);
    saveElus(next.length > 0 ? next : DEFAULT_ELUS);
    setScreen(null);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setAdminToken('');
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleOpen = (s) => {
    if (s && s.type === 'tab') { setTab(s.id); setScreen(null); }
    else setScreen(s);
  };

  const renderScreen = () => {
    if (!screen) return null;
    if (screen.type === 'fiche') {
      const f = FICHES.find(x => x.id === screen.id);
      return <FicheView fiche={f} onClose={() => setScreen(null)} theme={theme} openCourrier={(cid) => setScreen({ type: 'courrier', id: cid })} />;
    }
    if (screen.type === 'courrier') {
      const c = COURRIERS.find(x => x.id === screen.id);
      return <CourrierGenerator courrier={c} onClose={() => setScreen(null)} />;
    }
    if (screen.type === 'calc') {
      const c = CALCULATORS.find(x => x.id === screen.id);
      return <CalculatorView calc={c} onClose={() => setScreen(null)} theme={theme} />;
    }
    if (screen.type === 'calc-list') return <CalcList open={handleOpen} theme={theme} />;
    if (screen.type === 'ai') return <AIChat onClose={() => setScreen(null)} />;
    if (screen.type === 'erreurs') return <ErreursView onClose={() => setScreen(null)} theme={theme} />;
    if (screen.type === 'elu') {
      const e = elus.find(x => x.id === screen.id);
      if (!e) { setScreen(null); return null; }
      return <ElusDetail elu={e} isAdmin={isAdmin} onClose={() => setScreen(null)} onEdit={() => setScreen({ type: 'elu-edit', id: e.id })} onDelete={() => deleteElu(e.id)} />;
    }
    if (screen.type === 'elu-edit') {
      const e = elus.find(x => x.id === screen.id);
      const initial = e ? { ...e, mandatesText: (e.mandates || []).join(', ') } : null;
      return <ElusEditor initial={initial} onSave={addOrUpdateElu} onClose={() => setScreen({ type: 'elu', id: screen.id })} />;
    }
    if (screen.type === 'elu-add') {
      return <ElusEditor initial={null} onSave={addOrUpdateElu} onClose={() => setScreen(null)} />;
    }
    if (screen.type === 'news-add') {
      return <NewsEditor initial={null} onSave={(n) => { saveNews([n, ...news]); setScreen(null); }} onClose={() => setScreen(null)} theme={theme} />;
    }
    if (screen.type === 'news-edit') {
      const n = news.find(x => x.id === screen.id);
      if (!n) { setScreen(null); return null; }
      return <NewsEditor initial={n} onSave={(updated) => { saveNews(news.map(x => x.id === n.id ? updated : x)); setScreen(null); }} onClose={() => setScreen(null)} theme={theme} />;
    }
    return null;
  };

  return (
    <div className={`font-body theme-${theme} min-h-screen`} style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <style>{FONT_CSS}</style>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <div className="max-w-md mx-auto relative">
        <Header onUrgence={() => setUrgence(true)} />
        <main className="pb-24">
          {screen ? renderScreen() : (
            <>
              {tab === 'accueil' && <Accueil open={handleOpen} name={name} theme={theme} news={news} isAdmin={isAdmin} onAddNews={() => setScreen({ type: 'news-add' })} onEditNews={(id) => setScreen({ type: 'news-edit', id })} onDeleteNews={(id) => saveNews(news.filter(n => n.id !== id))} />}
              {tab === 'agir' && <Agir open={handleOpen} theme={theme} />}
              {tab === 'defense' && <Defense open={handleOpen} theme={theme} />}
              {tab === 'elus' && (
                <ElusTab
                  elus={elus}
                  isAdmin={isAdmin}
                  onOpen={(id) => setScreen({ type: 'elu', id })}
                  onEdit={(id) => setScreen({ type: 'elu-edit', id })}
                  onAdd={() => setScreen({ type: 'elu-add' })}
                  onDelete={deleteElu}
                />
              )}
              {tab === 'profil' && <Profil name={name} setName={updateName} theme={theme} setTheme={updateTheme} isAdmin={isAdmin} onAdminToggle={handleAdminToggle} />}
            </>
          )}
        </main>
        <BottomNav tab={tab} setTab={(t) => { setTab(t); setScreen(null); }} />
        {urgence && <UrgenceModal onClose={() => setUrgence(false)} openAI={() => setScreen({ type: 'ai' })} />}
        {showAdminLogin && (
          <AdminLogin
            onSuccess={(token) => { setIsAdmin(true); setAdminToken(token); setShowAdminLogin(false); }}
            onClose={() => setShowAdminLogin(false)}
          />
        )}
        {saveStatus && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl text-xs font-semibold fade-in shadow-lg" style={{ background: saveStatus.ok ? 'var(--primary)' : 'var(--accent-red)', color: 'white' }}>
            {saveStatus.msg}
          </div>
        )}
      </div>
    </div>
  );
}
