import React, { useState, useMemo } from 'react';
import {
  Calculator, Coins, FileText, HeartPulse, TrendingDown, Clock, ScrollText,
  AlertTriangle, CheckCircle2, ChevronLeft
} from 'lucide-react';

/* ============================================================
   6 NOUVEAUX CALCULATEURS - UNSA SULO
   ----------------------------------------------------------------
   Chaque calculateur = { id, title, icon, accent, desc, fields, compute }
   - fields[]  : champs du formulaire (text/number/select/radio)
   - compute() : reçoit les valeurs, renvoie { lines: [{label, value, highlight?, alert?}], notes: [] }

   Valeurs 2026 : SMIC mensuel 1801,80 €, plafond IJSS = 1,8 SMIC,
   3 jours de carence privé, repos quotidien 11h, 10h/jour max, etc.
   ============================================================ */

const SMIC_HORAIRE_2026 = 11.88;
const SMIC_MENSUEL_2026 = 1801.80;
const PLAFOND_IJSS_BRUT = SMIC_MENSUEL_2026 * 1.8;  // 3 243,24 €
const eur = (n) => isNaN(n) ? '—' : n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const eur0 = (n) => isNaN(n) ? '—' : n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export const CALCULATEURS_NOUVEAUX = [

  /* ============== 1. BRUT → NET ============== */
  {
    id: 'brut-net',
    title: 'Brut → Net',
    icon: Coins,
    accent: 'blue',
    desc: 'Estime ton salaire net à partir du brut (taux moyen 2026)',
    fields: [
      { id: 'brut', label: 'Salaire BRUT mensuel', type: 'number', suffix: '€', placeholder: '2200' },
      { id: 'statut', label: 'Statut', type: 'radio', options: [
        { value: 'non-cadre', label: 'Non-cadre (≈ 22%)' },
        { value: 'cadre', label: 'Cadre (≈ 25%)' },
      ], default: 'non-cadre' },
    ],
    compute: ({ brut, statut }) => {
      const b = parseFloat(brut) || 0;
      const taux = statut === 'cadre' ? 0.25 : 0.22;
      const net = b * (1 - taux);
      const csgNonDed = b * 0.0290;  // CSG/CRDS non déductible
      const netImposable = net + csgNonDed;
      return {
        lines: [
          { label: 'Net avant impôt sur le revenu', value: eur(net), highlight: true },
          { label: 'Net imposable (pour fisc)', value: eur(netImposable) },
          { label: 'Cotisations sociales', value: eur(b - net) },
          { label: 'Taux moyen appliqué', value: `${(taux * 100).toFixed(0)} %` },
        ],
        notes: [
          'Estimation indicative basée sur un taux moyen. Le vrai taux dépend de ta convention, ta mutuelle, ta retraite supplémentaire, etc.',
          'Pour le net à payer après prélèvement à la source, retire ton taux personnel (visible sur impots.gouv.fr).',
        ],
      };
    },
  },

  /* ============== 2. SOLDE DE TOUT COMPTE ============== */
  {
    id: 'stc',
    title: 'Solde de tout compte',
    icon: FileText,
    accent: 'amber',
    desc: 'Estime ce que tu dois toucher au départ (CP + préavis + indemnité)',
    fields: [
      { id: 'salaire', label: 'Salaire BRUT mensuel', type: 'number', suffix: '€', placeholder: '2200' },
      { id: 'anciennete', label: 'Ancienneté', type: 'number', suffix: 'années', placeholder: '5' },
      { id: 'cpRestants', label: 'CP non pris', type: 'number', suffix: 'jours ouvrés', placeholder: '8' },
      { id: 'motif', label: 'Motif de rupture', type: 'radio', options: [
        { value: 'licenciement', label: 'Licenciement (sauf faute grave)' },
        { value: 'rupture-conv', label: 'Rupture conventionnelle' },
        { value: 'demission', label: 'Démission' },
        { value: 'faute-grave', label: 'Licenciement faute grave/lourde' },
      ], default: 'licenciement' },
      { id: 'preavisExecute', label: 'Préavis exécuté ?', type: 'radio', options: [
        { value: 'oui', label: 'Oui, je travaille mon préavis' },
        { value: 'non', label: 'Non, dispensé par l\'employeur' },
      ], default: 'oui' },
    ],
    compute: ({ salaire, anciennete, cpRestants, motif, preavisExecute }) => {
      const s = parseFloat(salaire) || 0;
      const a = parseFloat(anciennete) || 0;
      const cp = parseFloat(cpRestants) || 0;

      // Indemnité de congés payés = 1/10 du salaire annuel par tranche restante,
      // approximation simple : (salaire mensuel / 21,67) × jours restants
      const indemniteCP = (s / 21.67) * cp;

      // Préavis : 1 mois si < 2 ans, 2 mois si ≥ 2 ans (CDI base légale, hors CC)
      let dureePreavis = 0;
      if (motif === 'licenciement' || motif === 'rupture-conv') {
        dureePreavis = a < 2 ? 1 : 2;
      } else if (motif === 'demission') {
        dureePreavis = a < 2 ? 1 : 2; // démission : variable selon CC, on garde l'estimation
      }
      const indemnitePreavis = preavisExecute === 'non' && motif !== 'demission'
        ? s * dureePreavis
        : 0;

      // Indemnité légale de licenciement : 1/4 mois × années (≤10) + 1/3 × années (>10)
      // Versée si licenciement non-faute grave OU rupture conventionnelle (min légal)
      let indemniteLeg = 0;
      if (motif === 'licenciement' || motif === 'rupture-conv') {
        const tranche1 = Math.min(a, 10) * (s / 4);
        const tranche2 = Math.max(a - 10, 0) * (s / 3);
        indemniteLeg = tranche1 + tranche2;
      }

      const total = indemniteCP + indemnitePreavis + indemniteLeg;

      return {
        lines: [
          { label: 'Indemnité de congés payés', value: eur(indemniteCP) },
          { label: `Indemnité préavis (${dureePreavis} mois${preavisExecute === 'oui' ? ', travaillé' : ''})`, value: eur(indemnitePreavis) },
          { label: 'Indemnité légale de licenciement', value: eur(indemniteLeg) },
          { label: 'TOTAL BRUT estimé', value: eur(total), highlight: true },
        ],
        notes: [
          motif === 'faute-grave' ? '⚠️ Faute grave/lourde : aucune indemnité de licenciement ni préavis. Seuls les CP sont dus.' : null,
          'Estimation indicative. Ta convention collective peut prévoir des montants supérieurs (notamment plasturgie pour l\'ancienneté).',
          'L\'indemnité de licenciement est exonérée d\'impôt et de cotisations dans la limite des minimums légaux.',
        ].filter(Boolean),
      };
    },
  },

  /* ============== 3. IJSS ARRÊT MALADIE ============== */
  {
    id: 'ijss',
    title: 'IJSS arrêt maladie',
    icon: HeartPulse,
    accent: 'red',
    desc: 'Estime ce que la Sécu va te verser pendant un arrêt',
    fields: [
      { id: 'salaire1', label: 'Salaire BRUT mois M-1', type: 'number', suffix: '€', placeholder: '2200' },
      { id: 'salaire2', label: 'Salaire BRUT mois M-2', type: 'number', suffix: '€', placeholder: '2200' },
      { id: 'salaire3', label: 'Salaire BRUT mois M-3', type: 'number', suffix: '€', placeholder: '2200' },
      { id: 'duree', label: 'Durée de l\'arrêt', type: 'number', suffix: 'jours calendaires', placeholder: '14' },
      { id: 'contexte', label: 'Contexte', type: 'radio', options: [
        { value: 'maladie', label: 'Maladie classique (3j carence)' },
        { value: 'at-mp', label: 'Accident travail / maladie pro (pas de carence)' },
      ], default: 'maladie' },
    ],
    compute: ({ salaire1, salaire2, salaire3, duree, contexte }) => {
      const s1 = parseFloat(salaire1) || 0;
      const s2 = parseFloat(salaire2) || 0;
      const s3 = parseFloat(salaire3) || 0;
      const d = parseInt(duree, 10) || 0;
      const moyenneBrut = (s1 + s2 + s3) / 3;
      const baseQuotidienne = Math.min(moyenneBrut, PLAFOND_IJSS_BRUT) / 91.25;
      const ijssJour = contexte === 'at-mp'
        ? baseQuotidienne * 0.60  // AT/MP : 60% les 28 premiers jours
        : baseQuotidienne * 0.50; // Maladie : 50%
      const carence = contexte === 'at-mp' ? 0 : 3;
      const joursIndemnises = Math.max(d - carence, 0);
      const total = ijssJour * joursIndemnises;
      const plafondAtteint = moyenneBrut > PLAFOND_IJSS_BRUT;

      return {
        lines: [
          { label: 'Salaire moyen 3 mois (brut)', value: eur(moyenneBrut) },
          { label: 'Salaire journalier de base', value: eur(baseQuotidienne) },
          { label: `IJSS brute par jour (${contexte === 'at-mp' ? '60%' : '50%'})`, value: eur(ijssJour), highlight: true },
          { label: `Jours indemnisés (${d} − ${carence} carence)`, value: `${joursIndemnises} jours` },
          { label: 'TOTAL IJSS brut estimé', value: eur(total), highlight: true },
        ],
        notes: [
          plafondAtteint ? `⚠️ Ton salaire dépasse le plafond CPAM (${eur(PLAFOND_IJSS_BRUT)}). L'IJSS est plafonnée.` : null,
          contexte === 'maladie' ? 'Les 3 jours de carence ne sont pas indemnisés par la Sécu (mais peuvent l\'être par l\'employeur selon la CC).' : null,
          'IJSS soumises à CSG/CRDS (~6,7%) et imposables sur le revenu.',
          'Estimation indicative — la CPAM applique ses propres règles d\'arrondi.',
        ].filter(Boolean),
      };
    },
  },

  /* ============== 4. PERTE DE SALAIRE EN ARRÊT ============== */
  {
    id: 'perte-arret',
    title: 'Perte de salaire en arrêt',
    icon: TrendingDown,
    accent: 'red',
    desc: 'Combien tu perds vraiment chaque mois en arrêt maladie',
    fields: [
      { id: 'netHabituel', label: 'Net habituel mensuel', type: 'number', suffix: '€', placeholder: '1700' },
      { id: 'ijssMensuelle', label: 'IJSS mensuelle estimée (nette ~93%)', type: 'number', suffix: '€', placeholder: '900' },
      { id: 'anciennete', label: 'Ancienneté', type: 'number', suffix: 'années', placeholder: '3' },
      { id: 'maintien', label: 'Maintien employeur', type: 'radio', options: [
        { value: 'aucun', label: 'Aucun (CC plasturgie : <1 an d\'ancienneté)' },
        { value: 'partiel', label: 'Partiel (90% pendant 30j puis 66%)' },
        { value: 'total', label: 'Total (100% complément IJSS)' },
      ], default: 'partiel' },
    ],
    compute: ({ netHabituel, ijssMensuelle, anciennete, maintien }) => {
      const net = parseFloat(netHabituel) || 0;
      const ijss = parseFloat(ijssMensuelle) || 0;
      const a = parseFloat(anciennete) || 0;

      let pctMaintien = 0;
      if (maintien === 'partiel') pctMaintien = 0.90;
      else if (maintien === 'total') pctMaintien = 1.0;

      // Complément employeur = (objectif × net) − IJSS (si > 0)
      const objectif = net * pctMaintien;
      const complementEmployeur = Math.max(objectif - ijss, 0);
      const totalRecu = ijss + complementEmployeur;
      const perte = Math.max(net - totalRecu, 0);

      const ineligible = a < 1 && maintien !== 'aucun';

      return {
        lines: [
          { label: 'Net habituel', value: eur(net) },
          { label: 'IJSS reçue (Sécu)', value: eur(ijss) },
          { label: `Complément employeur (objectif ${(pctMaintien*100).toFixed(0)}%)`, value: eur(complementEmployeur) },
          { label: 'Total perçu en arrêt', value: eur(totalRecu), highlight: true },
          { label: 'PERTE mensuelle estimée', value: eur(perte), highlight: true, alert: perte > 0 },
        ],
        notes: [
          ineligible ? '⚠️ Convention plasturgie : maintien de salaire conditionné à 1 an d\'ancienneté. À vérifier dans ton accord.' : null,
          a < 1 ? 'Avec moins d\'1 an d\'ancienneté, le maintien employeur est souvent nul → tu touches uniquement les IJSS.' : null,
          'N\'inclut pas la prévoyance complémentaire (si tu en as une, à ajouter).',
          'Estimation indicative — les règles exactes dépendent de ton accord d\'entreprise et de ta CC.',
        ].filter(Boolean),
      };
    },
  },

  /* ============== 5. TEMPS DE TRAVAIL / REPOS LÉGAL ============== */
  {
    id: 'temps-travail',
    title: 'Temps de travail',
    icon: Clock,
    accent: 'amber',
    desc: 'Vérifie si ton planning respecte les durées maximales',
    fields: [
      { id: 'heuresJour', label: 'Heures travaillées AUJOURD\'HUI', type: 'number', suffix: 'h', placeholder: '9' },
      { id: 'heuresSemaine', label: 'Heures sur la semaine en cours', type: 'number', suffix: 'h', placeholder: '42' },
      { id: 'moyenne12sem', label: 'Moyenne sur 12 dernières semaines', type: 'number', suffix: 'h', placeholder: '40' },
      { id: 'reposNuit', label: 'Repos entre fin de poste hier et début aujourd\'hui', type: 'number', suffix: 'h', placeholder: '11' },
      { id: 'reposHebdo', label: 'Plus long repos consécutif cette semaine', type: 'number', suffix: 'h', placeholder: '35' },
    ],
    compute: ({ heuresJour, heuresSemaine, moyenne12sem, reposNuit, reposHebdo }) => {
      const hJ = parseFloat(heuresJour) || 0;
      const hS = parseFloat(heuresSemaine) || 0;
      const h12 = parseFloat(moyenne12sem) || 0;
      const rN = parseFloat(reposNuit) || 0;
      const rH = parseFloat(reposHebdo) || 0;

      const check = (val, max, label, op = 'max') => {
        const dep = op === 'max' ? val > max : val < max;
        return {
          label,
          value: op === 'max' ? `${val} h / max ${max} h` : `${val} h / min ${max} h`,
          alert: dep,
          ok: !dep,
        };
      };

      const lines = [
        check(hJ, 10, 'Durée quotidienne (max 10h)'),
        check(hS, 48, 'Durée hebdomadaire absolue (max 48h)'),
        check(h12, 44, 'Moyenne sur 12 semaines (max 44h)'),
        check(rN, 11, 'Repos quotidien (min 11h consécutives)', 'min'),
        check(rH, 35, 'Repos hebdomadaire (min 35h = 11h+24h)', 'min'),
      ];

      const depassements = lines.filter(l => l.alert);

      return {
        lines: lines.map(l => ({
          label: l.label,
          value: l.value,
          alert: l.alert,
          ok: l.ok,
        })),
        notes: [
          depassements.length === 0
            ? '✅ Tous les seuils légaux sont respectés.'
            : `⚠️ ${depassements.length} dépassement(s) détecté(s). Tu peux contester via courrier RAR et alerter ton DP / CSE.`,
          'Dépassements répétés = motif de signalement à l\'Inspection du travail (Code du travail L. 3121-18 à L. 3132-2).',
          'Conserve tes plannings, badgeages, mails — la charge de la preuve sur le temps de travail incombe à l\'employeur.',
        ],
      };
    },
  },

  /* ============== 6. DÉCODEUR FICHE DE PAIE ============== */
  {
    id: 'decodeur-paie',
    title: 'Décodeur fiche de paie',
    icon: ScrollText,
    accent: 'blue',
    desc: 'Comprends ligne par ligne ce qui est prélevé sur ton brut',
    fields: [
      { id: 'brut', label: 'Salaire BRUT mensuel', type: 'number', suffix: '€', placeholder: '2200' },
      { id: 'statut', label: 'Statut', type: 'radio', options: [
        { value: 'non-cadre', label: 'Non-cadre' },
        { value: 'cadre', label: 'Cadre' },
      ], default: 'non-cadre' },
    ],
    compute: ({ brut, statut }) => {
      const b = parseFloat(brut) || 0;
      const isCadre = statut === 'cadre';

      // Approximations 2026 — pourcentages part salariale
      const lignes = [
        { label: 'Sécurité sociale - maladie maternité', taux: 0.0000, role: 'Couverture maladie de base (part patronale uniquement)' },
        { label: 'Sécurité sociale - vieillesse plafonnée', taux: 0.0690, role: 'Retraite de base, sur la part ≤ plafond SS' },
        { label: 'Sécurité sociale - vieillesse déplafonnée', taux: 0.0040, role: 'Retraite de base, sur la totalité du brut' },
        { label: 'Chômage', taux: 0.0000, role: 'Assurance chômage : 100% patronale depuis 2018' },
        { label: 'AGIRC-ARRCO T1', taux: 0.0315, role: 'Retraite complémentaire obligatoire' },
        ...(isCadre ? [{ label: 'AGIRC-ARRCO T2 (cadre)', taux: 0.0864, role: 'Retraite complémentaire cadre, tranche 2' }] : []),
        { label: 'APEC', taux: isCadre ? 0.00024 : 0, role: 'Cotisation cadres pour l\'emploi (cadres uniquement)' },
        { label: 'CEG (contribution équilibre général)', taux: 0.0086, role: 'Équilibre AGIRC-ARRCO' },
        { label: 'CSG déductible', taux: 0.0675, role: 'Contribution sociale généralisée déductible du revenu imposable' },
        { label: 'CSG/CRDS non déductible', taux: 0.0290, role: 'CSG + CRDS — non déductibles, à réintégrer dans le net imposable' },
        { label: 'Mutuelle (estimation)', taux: 0.0150, role: 'Variable selon contrat — part salariale moyenne' },
        { label: 'Prévoyance (estimation)', taux: isCadre ? 0.0150 : 0.0050, role: 'Couverture décès/invalidité — souvent obligatoire cadre' },
      ];

      const lignesAvecMontants = lignes
        .filter(l => l.taux > 0)
        .map(l => ({
          label: l.label,
          value: `${(l.taux * 100).toFixed(2)}% = ${eur(b * l.taux)}`,
          role: l.role,
        }));

      const totalCotis = lignes.reduce((sum, l) => sum + b * l.taux, 0);
      const net = b - totalCotis;

      return {
        lines: [
          { label: 'BRUT', value: eur(b), highlight: true },
          ...lignesAvecMontants,
          { label: '── TOTAL COTISATIONS ──', value: eur(totalCotis), alert: false },
          { label: 'NET avant impôt sur le revenu', value: eur(net), highlight: true },
        ],
        notes: [
          'Estimation indicative basée sur les taux moyens 2026. Ta fiche de paie peut différer (taxe sur les salaires, accord d\'entreprise, etc.).',
          'Le NET indiqué ici est AVANT prélèvement à la source. Le net à payer = ce montant − (taux PAS × net imposable).',
          'Sur ta vraie fiche de paie, chaque ligne doit indiquer base, taux, et montant. Vérifie que toutes les lignes obligatoires figurent (modèle simplifié obligatoire depuis 2018).',
        ],
      };
    },
  },
];

/* ============================================================
   COMPOSANT D'AFFICHAGE GÉNÉRIQUE
   À utiliser pour afficher n'importe lequel des calculateurs.
   Props : calc = un objet de CALCULATEURS_NOUVEAUX, onClose = callback
   ============================================================ */

const ACCENT = {
  blue: { bg: '#1F5AA8', light: '#E8F0FB' },
  amber: { bg: '#D97706', light: '#FEF3E2' },
  red: { bg: '#B8332A', light: '#FCE8E6' },
};

export function CalculateurScreen({ calc, onClose }) {
  const Icon = calc.icon;
  const a = ACCENT[calc.accent] || ACCENT.blue;
  const initial = calc.fields.reduce((acc, f) => {
    acc[f.id] = f.default !== undefined ? f.default : '';
    return acc;
  }, {});
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted) return null;
    try { return calc.compute(values); }
    catch (e) { return { lines: [], notes: ['Erreur de calcul : vérifie tes saisies.'] }; }
  }, [submitted, values, calc]);

  const update = (id, v) => setValues((p) => ({ ...p, [id]: v }));
  const canSubmit = calc.fields.every(f => f.type === 'radio' || values[f.id] !== '');

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--bg, #F8F9FB)' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3" style={{ background: a.bg, color: 'white' }}>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-95">
          <ChevronLeft size={20} />
        </button>
        <Icon size={22} />
        <div className="font-bold">{calc.title}</div>
      </div>

      <div className="px-4 pt-4">
        <p className="text-sm text-gray-600 mb-4">{calc.desc}</p>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          {calc.fields.map((f) => (
            <div key={f.id} className="mb-4 last:mb-0">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>

              {f.type === 'radio' ? (
                <div className="space-y-1.5">
                  {f.options.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => update(f.id, o.value)}
                      className="w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2"
                      style={{
                        borderColor: values[f.id] === o.value ? a.bg : '#E5E7EB',
                        background: values[f.id] === o.value ? a.light : 'white',
                        color: values[f.id] === o.value ? a.bg : '#374151',
                        fontWeight: values[f.id] === o.value ? 600 : 400,
                      }}
                    >
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                           style={{ borderColor: values[f.id] === o.value ? a.bg : '#9CA3AF' }}>
                        {values[f.id] === o.value && (
                          <div className="w-2 h-2 rounded-full" style={{ background: a.bg }} />
                        )}
                      </div>
                      <span className="text-sm">{o.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type={f.type}
                    inputMode={f.type === 'number' ? 'decimal' : 'text'}
                    value={values[f.id]}
                    onChange={(e) => update(f.id, e.target.value)}
                    placeholder={f.placeholder || ''}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-current focus:outline-none text-base"
                    style={{ color: a.bg }}
                  />
                  {f.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{f.suffix}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setSubmitted(true)}
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: a.bg }}
        >
          <Calculator size={18} className="inline mr-2 -mt-1" />
          Calculer
        </button>

        {/* Résultats */}
        {result && (
          <div className="mt-5 bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: a.bg }}>
              Résultat
            </div>

            {result.lines.map((l, i) => (
              <div
                key={i}
                className="flex justify-between items-start py-2 border-b last:border-b-0 border-gray-100"
                style={l.highlight ? {
                  background: a.light, margin: '4px -16px', padding: '10px 16px',
                  borderRadius: '12px', border: 'none'
                } : {}}
              >
                <div className="flex-1 pr-3">
                  <div className={`text-sm ${l.highlight ? 'font-semibold' : ''}`}
                       style={{ color: l.alert ? '#B8332A' : (l.highlight ? a.bg : '#374151') }}>
                    {l.label}
                  </div>
                  {l.role && <div className="text-xs text-gray-500 mt-0.5">{l.role}</div>}
                </div>
                <div className={`text-sm font-semibold whitespace-nowrap flex items-center gap-1`}
                     style={{ color: l.alert ? '#B8332A' : (l.highlight ? a.bg : '#374151') }}>
                  {l.alert && <AlertTriangle size={14} />}
                  {l.ok && <CheckCircle2 size={14} style={{ color: '#16A34A' }} />}
                  {l.value}
                </div>
              </div>
            ))}

            {/* Notes / disclaimer */}
            {result.notes && result.notes.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                {result.notes.map((n, i) => (
                  <div key={i} className="text-xs text-gray-600 leading-relaxed">{n}</div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-center">
              📊 Estimation indicative — ne remplace pas un conseil juridique
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
