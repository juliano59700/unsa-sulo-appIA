import React from 'react';
import {
  ChevronLeft, Shield, Database, Bot, UserCheck, Cookie, Lock, Mail, Scale
} from 'lucide-react';

/* ============================================================
   POLITIQUE DE CONFIDENTIALITÉ - UNSA SULO
   ----------------------------------------------------------------
   7 sections RGPD :
   1. Qui sommes-nous
   2. Données collectées
   3. Utilisation de l'IA
   4. Tes droits
   5. Cookies & traceurs
   6. Sécurité & durée de conservation
   7. Contacter le DPO
   ============================================================ */

const DPO_EMAIL = 'appli-unsa@outlook.com';   // ← change selon le mail réel
const RESPONSABLE_NOM = 'Section UNSA SULO';
const RESPONSABLE_ADRESSE = '[Adresse de la section UNSA SULO]';
const DATE_MAJ = '15 mai 2026';

const SECTIONS = [
  {
    id: 'qui',
    icon: Shield,
    titre: '1. Qui sommes-nous',
    contenu: (
      <>
        <p>
          L'application <strong>UNSA SULO</strong> est éditée par {RESPONSABLE_NOM},
          section syndicale UNSA présente chez SULO. Elle a pour but d'informer les
          salariés sur leurs droits, mettre à disposition des modèles de courriers,
          des calculateurs et une documentation juridique simplifiée.
        </p>
        <p className="mt-2">
          Cette application est <strong>gratuite, sans publicité, sans suivi commercial</strong>.
          Elle ne crée pas de compte utilisateur et ne nous demande aucune identification.
        </p>
      </>
    ),
  },
  {
    id: 'donnees',
    icon: Database,
    titre: '2. Données collectées',
    contenu: (
      <>
        <p className="font-medium mb-2">Ce qui reste sur ton téléphone (jamais transmis) :</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Ton prénom (si tu choisis de le saisir)</li>
          <li>Ton code de verrouillage (si activé)</li>
          <li>Tes préférences d'affichage (mode sombre, taille de texte)</li>
          <li>Les courriers que tu remplis (champs sauvegardés localement)</li>
          <li>Le statut admin (oui/non)</li>
        </ul>
        <p className="font-medium mb-2 mt-4">Ce qui est transmis à nos serveurs :</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            La liste publique des élus et des annonces (lecture seule pour les
            utilisateurs, modification réservée aux administrateurs).
          </li>
          <li>
            <strong>Aucune donnée personnelle</strong> n'est stockée côté serveur sur
            l'usage que tu fais de l'application.
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Si tu réinitialises ton code de verrouillage, <strong>toutes</strong> les
          données locales sont effacées de cet appareil.
        </p>
      </>
    ),
  },
  {
    id: 'ia',
    icon: Bot,
    titre: '3. Utilisation de l\'intelligence artificielle',
    contenu: (
      <>
        <p>
          L'assistant IA — lorsqu'il est activé — utilise le modèle Claude
          d'<strong>Anthropic</strong> (États-Unis, encadrement RGPD via clauses
          contractuelles types).
        </p>
        <p className="mt-2 font-medium">Quand tu poses une question à l'assistant :</p>
        <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
          <li>Le texte de ta question est envoyé à Anthropic pour générer la réponse.</li>
          <li>Anthropic conserve les requêtes maximum 30 jours pour la modération abus.</li>
          <li>
            Anthropic <strong>n'utilise pas</strong> nos requêtes pour entraîner ses modèles
            (offre Anthropic for Business / Workspaces).
          </li>
          <li>
            Aucune donnée personnelle identifiante n'est ajoutée à ta question par
            l'application.
          </li>
        </ul>
        <p className="mt-3 text-sm">
          ⚠️ Conseil : ne mets pas dans ta question d'informations sensibles (nom de
          collègue, numéro de sécurité sociale, etc.). Reformule en termes généraux.
        </p>
      </>
    ),
  },
  {
    id: 'droits',
    icon: UserCheck,
    titre: '4. Tes droits',
    contenu: (
      <>
        <p className="mb-2">
          Conformément au RGPD (règlement UE 2016/679) et à la loi Informatique et
          Libertés, tu disposes des droits suivants :
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Accès</strong> : connaître les données qui te concernent. Pour
            l'app : aucune donnée personnelle nous concernant côté serveur, donc rien
            à demander. Pour les données locales : ouvre les paramètres de ton
            navigateur → Données du site.
          </li>
          <li>
            <strong>Rectification</strong> : corriger une donnée inexacte (ex. ton prénom,
            modifiable dans l'onglet Profil).
          </li>
          <li>
            <strong>Effacement (droit à l'oubli)</strong> : supprimer tes données
            localement via Profil → Réinitialiser, ou en désinstallant l'app.
          </li>
          <li>
            <strong>Portabilité</strong> : récupérer tes données dans un format
            réutilisable. Demande au DPO.
          </li>
          <li>
            <strong>Opposition</strong> : refuser certains traitements.
          </li>
          <li>
            <strong>Réclamation auprès de la CNIL</strong> : si tu estimes que tes droits ne
            sont pas respectés, tu peux saisir la CNIL — <a href="https://www.cnil.fr/fr/plaintes" className="underline" style={{ color: '#1F5AA8' }}>www.cnil.fr/fr/plaintes</a>.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    icon: Cookie,
    titre: '5. Cookies & traceurs',
    contenu: (
      <>
        <p>
          L'application <strong>n'utilise aucun cookie tiers</strong>, aucun pixel de
          tracking, aucun outil de mesure d'audience (Google Analytics, Matomo, etc.).
        </p>
        <p className="mt-2">
          Le seul stockage utilisé est <code>localStorage</code> de ton navigateur, pour
          conserver tes préférences et tes saisies entre deux visites. Aucune
          information n'est envoyée à un serveur tiers.
        </p>
        <p className="mt-2 text-sm">
          C'est pour ça qu'il n'y a pas de bandeau cookies à l'ouverture : nous n'en
          posons aucun de tiers.
        </p>
      </>
    ),
  },
  {
    id: 'securite',
    icon: Lock,
    titre: '6. Sécurité & durée de conservation',
    contenu: (
      <>
        <p>
          Les communications avec nos serveurs (API IA, base d'élus) sont chiffrées
          en HTTPS (TLS 1.3).
        </p>
        <p className="mt-2 font-medium">Durées de conservation :</p>
        <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
          <li>Données locales : tant que tu n'as pas désinstallé / réinitialisé l'app.</li>
          <li>Annonces publiques : tant qu'un administrateur les laisse en ligne.</li>
          <li>Requêtes IA chez Anthropic : maximum 30 jours.</li>
          <li>Logs serveur (anonymes) : 12 mois maximum.</li>
        </ul>
        <p className="mt-3 text-sm">
          En cas de violation de données qui te concerne, nous t'informerons dans les
          72 heures conformément à l'article 33 du RGPD.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    icon: Mail,
    titre: '7. Contact & DPO',
    contenu: (
      <>
        <p>
          Pour toute question relative à tes données personnelles ou pour exercer tes
          droits :
        </p>
        <div className="mt-3 p-3 rounded-xl" style={{ background: '#F4F8FE' }}>
          <div className="text-sm font-semibold" style={{ color: '#1F5AA8' }}>Délégué à la Protection des Données</div>
          <div className="text-sm mt-1">{RESPONSABLE_NOM}</div>
          <div className="text-sm text-gray-600">{RESPONSABLE_ADRESSE}</div>
          <a
            href={`mailto:${DPO_EMAIL}?subject=Exercice%20de%20mes%20droits%20RGPD%20-%20App%20UNSA%20SULO&body=Bonjour%2C%0A%0AJe%20souhaite%20exercer%20le%20droit%20suivant%20concernant%20mes%20donn%C3%A9es%20personnelles%20dans%20le%20cadre%20de%20l%27application%20UNSA%20SULO%20%3A%0A%0A-%20%5B%20%5D%20Acc%C3%A8s%0A-%20%5B%20%5D%20Rectification%0A-%20%5B%20%5D%20Effacement%0A-%20%5B%20%5D%20Portabilit%C3%A9%0A-%20%5B%20%5D%20Opposition%0A%0AMerci%20de%20me%20r%C3%A9pondre%20dans%20le%20d%C3%A9lai%20l%C3%A9gal%20d%27un%20mois.%0A%0ACordialement%2C%0A%5BTon%20nom%5D`}
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-white text-sm font-medium active:scale-95"
            style={{ background: '#1F5AA8' }}
          >
            <Mail size={14} /> Contacter le DPO
          </a>
          <div className="text-xs text-gray-500 mt-2">{DPO_EMAIL}</div>
        </div>
        <p className="mt-4 text-sm">
          Délai de réponse maximal : <strong>1 mois</strong> à compter de la réception
          de ta demande (article 12 du RGPD).
        </p>
        <p className="mt-2 text-sm">
          En cas de litige non résolu, tu peux saisir la <strong>CNIL</strong> :
          3 place de Fontenoy, 75007 Paris — <a href="https://www.cnil.fr" className="underline">www.cnil.fr</a>.
        </p>
      </>
    ),
  },
];

/* ============================================================
   COMPOSANT
   Props : onClose = callback de fermeture
   ============================================================ */
export default function PrivacyScreen({ onClose }) {
  return (
    <div className="min-h-screen pb-32" style={{ background: '#F8F9FB' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3"
           style={{ background: 'linear-gradient(135deg, #1F5AA8 0%, #0F2D5C 100%)', color: 'white' }}>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-95">
          <ChevronLeft size={20} />
        </button>
        <Shield size={22} />
        <div className="font-bold flex-1">Confidentialité & RGPD</div>
      </div>

      <div className="px-4 pt-4">
        {/* Intro */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={16} style={{ color: '#1F5AA8' }} />
            <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#1F5AA8' }}>
              Politique de confidentialité
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Nous prenons tes données au sérieux. Cette page explique en termes clairs
            ce que l'application collecte, ce qu'elle ne collecte pas, et comment
            faire valoir tes droits.
          </p>
          <div className="text-xs text-gray-400 mt-3">Dernière mise à jour : {DATE_MAJ}</div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <details key={s.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                <summary className="p-4 cursor-pointer flex items-center gap-3 list-none">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: '#E8F0FB' }}>
                    <Icon size={18} style={{ color: '#1F5AA8' }} />
                  </div>
                  <div className="flex-1 font-semibold text-sm text-gray-900">{s.titre}</div>
                  <div className="text-gray-400 group-open:rotate-90 transition-transform">›</div>
                </summary>
                <div className="px-4 pb-4 pt-1 text-sm text-gray-700 leading-relaxed">
                  {s.contenu}
                </div>
              </details>
            );
          })}
        </div>

        {/* Footer légal */}
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 leading-relaxed">
          <p>
            <strong>Bases légales du traitement :</strong> intérêt légitime
            (information syndicale des adhérents) et consentement de l'utilisateur.
          </p>
          <p className="mt-2">
            <strong>Responsable de traitement :</strong> {RESPONSABLE_NOM}.
          </p>
          <p className="mt-2">
            Conformité : <strong>RGPD</strong> (UE 2016/679) et <strong>loi
            Informatique et Libertés</strong> modifiée du 6 janvier 1978.
          </p>
        </div>
      </div>
    </div>
  );
}
