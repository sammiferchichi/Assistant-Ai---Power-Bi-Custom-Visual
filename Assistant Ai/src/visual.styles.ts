// ============================================================
//  visual.styles.ts  —  Tous les styles CSS du visual ATB
//  Nouvelle disposition : Messages (haut) | Vidéo (centre) | Saisie (bas)
// ============================================================

export const STYLES = `

  /* ── Animations ─────────────────────────────────────────── */
  @keyframes pulse-ring {
    0%   { transform: scale(1);    opacity: 0.6; }
    50%  { transform: scale(1.08); opacity: 0.3; }
    100% { transform: scale(1);    opacity: 0.6; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes thinking {
    0%,80%,100% { opacity: 0.3; transform: scale(0.8); }
    40%         { opacity: 1;   transform: scale(1);   }
  }

  /* ── Conteneur principal ────────────────────────────────── */
  .atb-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    font-family: 'Segoe UI', sans-serif;
    background: #f5f5f5;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    padding: 10px;
    gap: 8px;
  }

  /* ── En-tête ────────────────────────────────────────────── */
  .atb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #6B2328;
    border: 1px solid #6B2328;
    border-radius: 12px;
    padding: 8px 12px;
    flex-shrink: 0;
    z-index: 1;
  }

  .atb-client-badge {
    display: inline;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.4);
    color: #ffffff;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 6px;
    white-space: nowrap;
    flex-shrink: 0;
    font-weight: 600;
  }

  .atb-header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 13px;
    color: #ffffff;
  }

  .atb-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 0 6px rgba(255,255,255,0.4);
    animation: pulse-ring 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .atb-header-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .atb-btn {
    border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.1);
    color: #f0e0e0;
    padding: 3px 9px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 10.5px;
    font-family: 'Segoe UI', sans-serif;
    transition: all .2s;
  }
  .atb-btn:hover {
    background: rgba(255,255,255,0.25);
    color: white;
    border-color: rgba(255,255,255,0.5);
  }

  .atb-select {
    border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.1);
    color: #f0e0e0;
    padding: 3px 6px;
    border-radius: 6px;
    font-size: 10.5px;
    cursor: pointer;
    font-family: 'Segoe UI', sans-serif;
  }
  .atb-select option {
    background: #6B2328;
    color: #f0e0e0;
  }

  /* ── Zone des messages (HAUT) ───────────────────────────── */
  .atb-messages {
    flex: none;
    max-height: 28%;
    overflow-y: auto;
    padding: 6px 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    scrollbar-width: thin;
    scrollbar-color: #d0d0d0 transparent;
    z-index: 1;
    min-height: 0;
  }
  .atb-messages::-webkit-scrollbar { width: 4px; }
  .atb-messages::-webkit-scrollbar-track { background: transparent; }
  .atb-messages::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 4px;
  }

  /* ── Bulles de message ──────────────────────────────────── */
  .atb-bubble {
    max-width: 88%;
    padding: 9px 13px;
    border-radius: 14px;
    font-size: 14px;
    line-height: 1.6;
    word-wrap: break-word;
    white-space: pre-wrap;
    animation: fadeInUp 0.25s ease;
  }
  .atb-bubble.bot {
    background: white;
    border: 1px solid #e8e8e8;
    color: #333333;
    font-weight: 600;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .atb-bubble.user {
    background: linear-gradient(135deg, #8b1a2b, #6b0f1a);
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 8px rgba(107,15,26,0.2);
  }

  /* ── Indicateur typing ──────────────────────────────────── */
  .atb-typing {
    display: flex;
    align-items: center;
    gap: 5px;
    background: white;
    border: 1px solid #e8e8e8;
    padding: 10px 14px;
    border-radius: 14px;
    border-bottom-left-radius: 4px;
    align-self: flex-start;
  }
  .atb-typing span {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: #b0b0b0;
    border-radius: 50%;
    animation: thinking 1.4s infinite ease-in-out;
  }
  .atb-typing span:nth-child(2) { animation-delay: 0.2s; }
  .atb-typing span:nth-child(3) { animation-delay: 0.4s; }

  /* ── Bloc vidéo (CENTRE) ──────────────────── */
  .atb-video-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 1;
    min-height: 0;
    overflow: hidden;
  }

  .atb-video-wrapper {
    position: relative;
    border: none;
    box-shadow: none;
    background: transparent;
    height: 100%;
    width: 100%;
  }
  /* ── Bulle de dialogue au-dessus de la vidéo ────────────── */
  .atb-speech-bubble {
    position: relative;
    align-self: center;
    max-width: 80%;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 10px 14px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    animation: fadeInUp 0.3s ease;
    flex-shrink: 0;
    z-index: 1;
  }
  .atb-speech-bubble::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 12px solid white;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.05));
  }
  .atb-speech-text {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 80px;
    overflow-y: auto;
  }

  .atb-video-wrapper video {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
    z-index: 1;
  }

  .atb-video-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: rgba(180,180,180,0.5);
    font-size: 11px;
    font-family: 'Segoe UI', sans-serif;
  }
  .atb-video-placeholder svg {
    opacity: 0.35;
  }

  /* ── Zone de saisie (BAS) ───────────────────────────────── */
  .atb-input-area {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    flex-shrink: 0;
    z-index: 1;
  }

  .atb-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #333333;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Segoe UI', sans-serif;
    caret-color: #8b1a2b;
  }
  .atb-input::placeholder {
    color: #b0b0b0;
  }

  .atb-send-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #8b1a2b, #6b0f1a);
    color: white;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform .15s, box-shadow .15s;
    box-shadow: 0 2px 8px rgba(107,15,26,0.25);
  }
  .atb-send-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 14px rgba(107,15,26,0.35);
  }
`;