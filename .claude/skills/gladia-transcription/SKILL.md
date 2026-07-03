---
name: gladia-transcription
description: >
  Transcrire et analyser des fichiers audio/vidéo via le serveur MCP Gladia
  (outils mcp__gladia__*). Utiliser cette skill dès que l'utilisateur demande
  de transcrire un audio, une vidéo, une réunion, un enregistrement, de
  générer des sous-titres, un résumé de réunion, une traduction de
  transcription, ou d'identifier les intervenants d'un enregistrement.
  Déclencheurs : "transcris", "transcription", "sous-titres", "srt", "vtt",
  "compte-rendu de réunion", "qui parle", "diarisation", "traduis cet audio".
---

# Transcription audio avec Gladia

Ce projet embarque un serveur MCP Gladia (`mcp-gladia/`, déclaré dans `.mcp.json`).
Les outils sont exposés sous le préfixe `mcp__gladia__` :
`upload_file`, `transcribe`, `get_transcription_status`,
`list_transcription_jobs`, `delete_transcription_job`.

## Prérequis

Le serveur a besoin de `GLADIA_API_KEY` (fichier gitignoré `mcp-gladia/.env`
ou variable d'environnement). Si les outils `mcp__gladia__*` sont absents ou
échouent avec une erreur de clé, dire à l'utilisateur de créer
`mcp-gladia/.env` avec `GLADIA_API_KEY=<clé>` (clé sur
https://app.gladia.io/apikeys — 10 h gratuites/mois) puis de relancer la session.

## Workflow standard

1. **Fichier local** → `upload_file` avec `filePath` (chemin absolu).
   Formats : mp3, wav, m4a, mp4, mov, avi, flac — max 1 Go.
   Récupérer l'`audioUrl` retournée.
   **URL déjà en ligne** (http/https) → sauter l'upload, passer l'URL
   directement à `transcribe`.
2. **`transcribe`** avec `audioUrl` + options selon la demande (voir tableau).
   L'outil attend la fin du job (jusqu'à 5 min) et retourne le résultat complet.
3. **Si timeout** : l'outil retourne un `jobId` → interroger
   `get_transcription_status` avec ce `jobId` jusqu'à `status: done`.
   Espacer les vérifications (le traitement prend ~10–20 % de la durée audio).
4. Restituer le résultat sous la forme demandée (texte, fichier .srt/.vtt,
   compte-rendu markdown…). Écrire les fichiers produits sur disque si
   l'utilisateur veut les récupérer.

## Choisir les options de `transcribe`

| Demande de l'utilisateur | Options à activer |
|---|---|
| Transcription simple | rien (détection de langue auto par défaut) |
| Langue connue (ex. français) | `language: "fr"`, `detectLanguage: false` |
| Qui dit quoi / réunion à plusieurs | `diarization: true` (+ `diarizationConfig: { numberOfSpeakers }` si connu) |
| Sous-titres | `subtitles: true`, `subtitlesConfig: { formats: ["srt", "vtt"] }` |
| Résumé / compte-rendu | `summarization: true`, `summarizationConfig: { type: "bullet_points" }` (ou `general`/`concise`) |
| Traduction | `translation: true`, `translationConfig: { targetLanguages: ["en"], model: "base" }` (`enhanced` pour du contenu complexe) |
| Chapitres / sommaire horodaté | `chapterization: true` |
| Sentiment / émotions | `sentimentAnalysis: true` (combiner avec `diarization` pour attribuer aux intervenants) |
| Détection d'entités (noms, dates, PII…) | `namedEntityRecognition: true` |
| Question précise sur le contenu ("quelles décisions ?") | `audioToLlm: true`, `audioToLlmConfig: { prompts: ["…"] }` |
| Jargon / noms propres mal reconnus | `customVocabulary: ["UNSA", "SULO", …]` |

Pour un **compte-rendu de réunion**, activer d'emblée `diarization` +
`summarization` (type `bullet_points`) + éventuellement `chapterization`.

## Gestion des jobs

- `list_transcription_jobs` : retrouver un job passé (filtres `status`,
  `afterDate`, `limit`).
- `delete_transcription_job` : supprimer un job et ses données (RGPD /
  nettoyage). Confirmer avec l'utilisateur avant suppression.

## Pièges connus

- `upload_file` exige un chemin **local accessible au serveur MCP** ; dans un
  environnement distant, le fichier doit d'abord être présent sur le disque
  (uploadé dans la session).
- Ne jamais committer la clé API ni `mcp-gladia/.env`.
- Les résultats volumineux (audio long + toutes options) peuvent être très
  gros : n'extraire que ce qui répond à la demande plutôt que de tout coller
  dans la réponse.
