import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, FileText, Download, Plus, Trash2, ExternalLink,
  BookOpen, Scale, Gift, Clock, Heart, Coins, Users, X
} from 'lucide-react';

/* ============================================================
   ECRAN DOCUMENTS - UNSA SULO
   ----------------------------------------------------------------
   - 7 PDFs pré-chargés organisés en 3 catégories
   - PDFs déposés dans /public/documents/  → URL : /documents/xxx.pdf
   - Mode admin : peut ajouter (URL ou file upload) + supprimer
   - Persistance localStorage (clé 'unsa-sulo-docs')
   - Tap → ouvre le PDF dans un nouvel onglet
   ============================================================ */

const STORAGE_KEY = 'unsa-sulo-docs';

/* PDFs par défaut — tu dépose les fichiers réels dans public/documents/ */
const DOCS_DEFAUT = [
  {
    id: 'cc-plasturgie',
    titre: 'Convention collective plasturgie 2026',
    desc: 'IDCC 0292 — texte intégral à jour',
    categorie: 'convention',
    url: '/documents/convention-plasturgie-2026.pdf',
    taille: '2,8 Mo',
    natif: true,
  },
  {
    id: 'livret-unsa',
    titre: 'Livret UNSA SULO',
    desc: 'Présentation, rôle des élus, contacts',
    categorie: 'unsa',
    url: '/documents/livret-unsa-sulo.pdf',
    taille: '1,2 Mo',
    natif: true,
  },
  {
    id: 'cadeaux',
    titre: 'Procédure cadeaux et invitations',
    desc: 'Règles internes — seuils et déclarations',
    categorie: 'unsa',
    url: '/documents/procedure-cadeaux.pdf',
    taille: '380 Ko',
    natif: true,
  },
  {
    id: 'rtt-cadres',
    titre: 'Accord RTT cadres',
    desc: 'Forfait jours, repos, suivi de charge',
    categorie: 'accords',
    url: '/documents/accord-rtt-cadres.pdf',
    taille: '950 Ko',
    natif: true,
  },
  {
    id: 'absences-familiales',
    titre: 'Absences payées événements familiaux',
    desc: 'Mariage, naissance, décès, déménagement',
    categorie: 'accords',
    url: '/documents/absences-familiales.pdf',
    taille: '420 Ko',
    natif: true,
  },
  {
    id: 'interessement',
    titre: 'Intéressement Réseau 2026',
    desc: 'Modalités de calcul, dates de versement',
    categorie: 'accords',
    url: '/documents/interessement-2026.pdf',
    taille: '680 Ko',
    natif: true,
  },
  {
    id: 'egalite',
    titre: 'Égalité professionnelle F/H 2026-2029',
    desc: 'Plan d\'action, indicateurs, objectifs',
    categorie: 'accords',
    url: '/documents/egalite-fh-2026-2029.pdf',
    taille: '1,1 Mo',
    natif: true,
  },
];

const CATEGORIES = [
  { id: 'convention', titre: 'Convention collective', icon: Scale, accent: '#1F5AA8' },
  { id: 'unsa', titre: 'Documents UNSA SULO', icon: BookOpen, accent: '#0F2D5C' },
  { id: 'accords', titre: 'Accords d\'entreprise', icon: FileText, accent: '#D97706' },
];

const ICONS_DOC = {
  'cc-plasturgie': Scale,
  'livret-unsa': BookOpen,
  'cadeaux': Gift,
  'rtt-cadres': Clock,
  'absences-familiales': Heart,
  'interessement': Coins,
  'egalite': Users,
};

/* ---------- Hook : récupère + persiste la liste des docs ---------- */
export function useDocs() {
  const [docs, setDocs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DOCS_DEFAUT;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }, [docs]);

  const ajouter = (doc) => setDocs((d) => [...d, { ...doc, id: Date.now().toString() }]);
  const supprimer = (id) => setDocs((d) => d.filter((x) => x.id !== id));
  const reinitialiser = () => setDocs(DOCS_DEFAUT);

  return { docs, ajouter, supprimer, reinitialiser };
}

/* ============================================================
   COMPOSANT PRINCIPAL
   Props :
     - onClose : callback de fermeture
     - isAdmin : booléen — si true, affiche les boutons ajouter/supprimer
   ============================================================ */
export default function DocumentsScreen({ onClose, isAdmin = false }) {
  const { docs, ajouter, supprimer } = useDocs();
  const [ajoutOuvert, setAjoutOuvert] = useState(false);

  const ouvrir = (doc) => {
    // Ouvre le PDF dans un nouvel onglet (lecteur natif du navigateur)
    window.open(doc.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: '#F8F9FB' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3"
           style={{ background: 'linear-gradient(135deg, #1F5AA8 0%, #0F2D5C 100%)', color: 'white' }}>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-95">
          <ChevronLeft size={20} />
        </button>
        <FileText size={22} />
        <div className="font-bold flex-1">Documents</div>
        {isAdmin && (
          <button onClick={() => setAjoutOuvert(true)}
                  className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-95">
            <Plus size={20} />
          </button>
        )}
      </div>

      <div className="px-4 pt-4">
        <p className="text-sm text-gray-600 mb-4">
          {docs.length} document{docs.length > 1 ? 's' : ''} à ta disposition. Tap pour ouvrir, appui long pour télécharger.
        </p>

        {CATEGORIES.map((cat) => {
          const docsDeCat = docs.filter((d) => d.categorie === cat.id);
          if (docsDeCat.length === 0) return null;
          const Icon = cat.icon;

          return (
            <div key={cat.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Icon size={16} style={{ color: cat.accent }} />
                <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: cat.accent }}>
                  {cat.titre}
                </div>
              </div>

              <div className="space-y-2">
                {docsDeCat.map((doc) => {
                  const DocIcon = ICONS_DOC[doc.id] || FileText;
                  return (
                    <div key={doc.id}
                         className="bg-white rounded-2xl p-3.5 shadow-sm flex items-start gap-3 transition-transform active:scale-[0.99]">
                      <button onClick={() => ouvrir(doc)} className="flex items-start gap-3 flex-1 text-left">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                             style={{ background: cat.accent + '15' }}>
                          <DocIcon size={20} style={{ color: cat.accent }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 leading-tight">{doc.titre}</div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-snug">{doc.desc}</div>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                            <FileText size={11} />
                            <span>PDF</span>
                            {doc.taille && <><span>·</span><span>{doc.taille}</span></>}
                            <ExternalLink size={11} className="ml-1" />
                          </div>
                        </div>
                      </button>

                      {isAdmin && !doc.natif && (
                        <button onClick={() => {
                          if (confirm(`Supprimer "${doc.titre}" ?`)) supprimer(doc.id);
                        }} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 active:scale-95">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Note de bas de page */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Documents indicatifs.</strong> Vérifie toujours la version officielle auprès de la DRH
            ou sur Légifrance pour la convention collective. Les accords d'entreprise sont archivés ici à
            titre informatif uniquement.
          </div>
        </div>
      </div>

      {/* Modal d'ajout (admin) */}
      {ajoutOuvert && isAdmin && (
        <ModalAjout
          onClose={() => setAjoutOuvert(false)}
          onSave={(doc) => { ajouter(doc); setAjoutOuvert(false); }}
        />
      )}
    </div>
  );
}

/* ---------- Modal pour ajouter un PDF (admin) ---------- */
function ModalAjout({ onClose, onSave }) {
  const [titre, setTitre] = useState('');
  const [desc, setDesc] = useState('');
  const [categorie, setCategorie] = useState('accords');
  const [url, setUrl] = useState('');
  const [fichier, setFichier] = useState(null);

  const onFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      alert('Choisis un fichier PDF.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5 Mo en localStorage).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFichier({ name: f.name, data: reader.result, taille: `${Math.round(f.size / 1024)} Ko` });
      setUrl(reader.result);
    };
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!titre.trim() || !url.trim()) {
      alert('Titre et URL/fichier requis.');
      return;
    }
    onSave({
      titre: titre.trim(),
      desc: desc.trim() || 'Document ajouté',
      categorie,
      url,
      taille: fichier ? fichier.taille : '',
      natif: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-lg">Ajouter un document</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Titre</label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)}
                   className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description courte</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)}
                   className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Catégorie</label>
            <select value={categorie} onChange={(e) => setCategorie(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none">
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-700">Méthode 1 : URL externe</label>
            <input value={url.startsWith('data:') ? '' : url}
                   onChange={(e) => { setUrl(e.target.value); setFichier(null); }}
                   placeholder="https://..."
                   className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Méthode 2 : Uploader un PDF</label>
            <input type="file" accept="application/pdf" onChange={onFileSelect}
                   className="w-full mt-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium" />
            {fichier && <div className="text-xs text-green-700 mt-1">✓ {fichier.name} ({fichier.taille})</div>}
            <div className="text-xs text-gray-400 mt-1">Max 5 Mo (stockage local)</div>
          </div>

          <button onClick={submit}
                  className="w-full py-3 rounded-2xl font-semibold text-white mt-3"
                  style={{ background: '#1F5AA8' }}>
            <Plus size={18} className="inline mr-1 -mt-0.5" /> Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
