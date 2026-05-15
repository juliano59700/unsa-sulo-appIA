import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';

/* ============================================================
   ECRAN DE VERROUILLAGE - UNSA SULO
   ----------------------------------------------------------------
   - PIN à 4 chiffres, stocké en clair dans localStorage
     (suffisant pour empêcher un curieux d'ouvrir l'app si le
      téléphone est posé sur la table 30 sec — pas une protection
      cryptographique)
   - 1er lancement : l'utilisateur choisit son PIN
   - Lancements suivants : il doit le saisir
   - Bouton "Oublié ?" = réinitialise (efface aussi le profil pour
     éviter qu'un voleur ne lise les données)
   - PIN admin universel : 7890 (à changer ci-dessous)
   - Verrouillage auto après 5 min en arrière-plan
   ============================================================ */

const STORAGE_KEY = 'unsa-sulo-pin';
const LAST_ACTIVE_KEY = 'unsa-sulo-last-active';
const ADMIN_BYPASS_PIN = '7890';        // ← change-le si tu veux
const AUTO_LOCK_MS = 5 * 60 * 1000;     // 5 minutes

/* ---------- Hook : faut-il afficher l'écran de verrouillage ? ---------- */
export function useLockState() {
  const [locked, setLocked] = useState(() => {
    const pin = localStorage.getItem(STORAGE_KEY);
    if (!pin) return true; // pas de PIN défini → setup
    const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
    return Date.now() - last > AUTO_LOCK_MS;
  });

  // Verrouille quand l'app revient au premier plan après inactivité
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
        if (Date.now() - last > AUTO_LOCK_MS) setLocked(true);
      } else {
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    // Met à jour le timestamp en continu pendant l'utilisation
    const ticker = setInterval(() => {
      if (!document.hidden) localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    }, 30000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(ticker);
    };
  }, []);

  const unlock = () => {
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    setLocked(false);
  };

  return { locked, unlock };
}

/* ---------- Composant principal ---------- */
export default function LockScreen({ onUnlock }) {
  const existingPin = localStorage.getItem(STORAGE_KEY);
  const isSetup = !existingPin;

  const [step, setStep] = useState(isSetup ? 'choose' : 'enter'); // choose | confirm | enter
  const [pin, setPin] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  /* Soumission auto quand 4 chiffres saisis */
  useEffect(() => {
    if (pin.length !== 4) return;

    if (step === 'choose') {
      setTempPin(pin);
      setPin('');
      setStep('confirm');
      return;
    }
    if (step === 'confirm') {
      if (pin === tempPin) {
        localStorage.setItem(STORAGE_KEY, pin);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        onUnlock();
      } else {
        setError('Les deux codes ne correspondent pas. Recommence.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin('');
        setTempPin('');
        setStep('choose');
      }
      return;
    }
    if (step === 'enter') {
      if (pin === existingPin || pin === ADMIN_BYPASS_PIN) {
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        onUnlock();
      } else {
        setError('Code incorrect');
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
          setError('');
        }, 600);
      }
    }
  }, [pin, step, tempPin, existingPin, onUnlock]);

  const press = (digit) => {
    if (pin.length < 4) setPin((p) => p + digit);
  };
  const del = () => setPin((p) => p.slice(0, -1));

  const reset = () => {
    if (confirm('Réinitialiser le code ? Ton profil local (prénom, préférences) sera aussi effacé.')) {
      localStorage.removeItem(STORAGE_KEY);
      // Efface aussi le profil pour ne pas laisser de traces personnelles
      Object.keys(localStorage)
        .filter((k) => k.startsWith('unsa-sulo-'))
        .forEach((k) => localStorage.removeItem(k));
      location.reload();
    }
  };

  const titles = {
    choose: 'Choisis un code à 4 chiffres',
    confirm: 'Confirme ton code',
    enter: 'Entre ton code',
  };
  const subtitles = {
    choose: 'Ce code te sera demandé à chaque ouverture',
    confirm: 'Resaisis le même code',
    enter: error || 'Pour déverrouiller l\'application',
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6"
      style={{
        background: 'linear-gradient(160deg, #0F2D5C 0%, #1F5AA8 100%)',
      }}
    >
      {/* Logo + titre */}
      <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-4">
        <Lock size={28} className="text-white" />
      </div>
      <div className="text-white font-bold text-xl mb-1">UNSA SULO</div>
      <div className="text-white/70 text-sm mb-8">{titles[step]}</div>

      {/* Bullets PIN */}
      <div
        className={`flex gap-4 mb-3 transition-transform ${shake ? 'animate-pulse' : ''}`}
        style={shake ? { animation: 'shake 0.5s' } : {}}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border-2 border-white/60 transition-all"
            style={{
              background: i < pin.length ? 'white' : 'transparent',
              transform: i < pin.length ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Message d'erreur / sous-titre */}
      <div
        className="text-sm h-5 mb-6"
        style={{ color: error ? '#FFB4AC' : 'rgba(255,255,255,0.7)' }}
      >
        {subtitles[step]}
      </div>

      {/* Pavé numérique */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => press(String(n))}
            className="h-16 rounded-2xl text-2xl font-light text-white transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={reset}
          className="h-16 rounded-2xl text-xs font-medium text-white/70 active:scale-95"
        >
          Oublié ?
        </button>
        <button
          onClick={() => press('0')}
          className="h-16 rounded-2xl text-2xl font-light text-white transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
        >
          0
        </button>
        <button
          onClick={del}
          className="h-16 rounded-2xl flex items-center justify-center text-white active:scale-95"
        >
          <Delete size={24} />
        </button>
      </div>

      {/* Pied de page */}
      <div className="text-white/40 text-xs mt-8 text-center max-w-xs">
        Code stocké localement sur cet appareil uniquement. Aucune donnée n'est envoyée à un serveur.
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
