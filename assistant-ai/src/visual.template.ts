// ============================================================
//  visual.template.ts — SAFE VERSION
//  Replace video URLs with your own CDN or local assets.
// ============================================================

// Idle video (character at rest)
// Option 1: host on Cloudinary / any HTTPS CDN (required for Power BI Service)
// Option 2: use local assets (dev only) — see README
export const VIDEO_SRC = "https://YOUR-CDN.com/Idle.webm";

// Talk video (character speaking)
export const VIDEO_SRC2 = "https://YOUR-CDN.com/Talk.webm";

// Format de la vidéo
export const VIDEO_TYPE = "video/webm";

// ── Textes de l interface ─────────────────────────────────────────────────────
export const UI_TEXT = {
  headerTitle:       "ATB Assistant",
  btnTestAPI:        "Test API",
  btnClear:          "Clear",
  placeholder:       "Posez votre question...",
  welcomeMessage:    "Bonjour ! Je suis l assistant virtuel ATB. Comment puis-je vous aider avec vos données ?",
  clearedMessage:    "Conversation effacée. Comment puis-je vous aider ?",
  testingMessage:    "Test de connexion",
  connectedMessage:  "connecté !",
  errorMessage:      "Erreur de connexion. Verifiez le proxy (voir README).",
  modelChanged:      "Modèle changé vers :",
  videoFallback:     "Vidéo non disponible",
  clientSelected:    "Client sélectionné",
};
