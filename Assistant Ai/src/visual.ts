// ============================================================
//  visual.ts  —  Logique principale (TypeScript pur)
//  SAFE GITHUB VERSION — no secrets, API URL configurable
// ============================================================

import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions      = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual                  = powerbi.extensibility.visual.IVisual;

import { STYLES }              from "./visual.styles";
import { VIDEO_SRC, VIDEO_SRC2, VIDEO_TYPE, UI_TEXT } from "./visual.template";

// ── Configuration API ─────────────────────────────────────────────────────────
// IMPORTANT: never hardcode API keys here.
// Point this to YOUR proxy (local or deployed).
// Examples:
//   Local dev:  http://localhost:3000/chat
//   Prod:       https://YOUR-APP.onrender.com/chat
const API_URL  = "http://localhost:3000/chat";

// ── Types ─────────────────────────────────────────────────────────────────────
type ChatMessage = { role: string; parts: { text: string }[] };

// ─────────────────────────────────────────────────────────────────────────────
export class Visual implements IVisual {

  private container:    HTMLElement;
  private messagesDiv!: HTMLElement;
  private input!:       HTMLInputElement;
  private clientBadge!: HTMLElement;

  private messages:      ChatMessage[] = [];
  private dataContext:   string        = "";
  private selectedModel: string        = "gemini";

  private fullDataContext: string = "";
  private selectedClientId: string = "";
  private selectedClientData: string = "";
  private speechBubble!: HTMLElement;
  private speechText!: HTMLElement;

  // ── Constructeur ────────────────────────────────────────────────────────────
  constructor(options: VisualConstructorOptions) {
    this.container = options.element;
    this.injectStyles();
    this.buildUI();
  }

  // ── Injection des styles ────────────────────────────────────────────────────
  private injectStyles(): void {
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  // ── Construction de l'interface ─────────────────────────────────────────────
  //  Disposition verticale :
  //   1. Header
  //   2. Zone messages  (flex: 1 — grandit pour remplir l'espace)
  //   3. Section vidéo  (hauteur fixe)
  //   4. Zone de saisie (hauteur fixe)
  // ────────────────────────────────────────────────────────────────────────────
  private buildUI(): void {
    const wrapper = document.createElement("div");
    wrapper.className = "atb-wrapper";

    // 1. En-tête
    wrapper.appendChild(this.buildHeader());

    // 2. Zone messages (en haut, scrollable)
    this.messagesDiv = document.createElement("div");
    this.messagesDiv.className = "atb-messages";
    wrapper.appendChild(this.messagesDiv);

    // 3. Bulle de dialogue (entre messages et vidéo)
    this.speechBubble = document.createElement("div");
    this.speechBubble.className = "atb-speech-bubble";
    this.speechBubble.style.display = "none";
    this.speechText = document.createElement("div");
    this.speechText.className = "atb-speech-text";
    this.speechBubble.appendChild(this.speechText);
    wrapper.appendChild(this.speechBubble);

    // 4. Vidéo (au centre)
    const videoSection = this.buildVideoSection();
    wrapper.appendChild(videoSection);

    // 4. Zone de saisie (en bas)
    wrapper.appendChild(this.buildInputArea());

    this.container.appendChild(wrapper);

    // Message de bienvenue
    this.addMessage("bot", UI_TEXT.welcomeMessage);
  }

  // ── En-tête ─────────────────────────────────────────────────────────────────
  private buildHeader(): HTMLElement {
    const header = document.createElement("div");
    header.className = "atb-header";

    const titleDiv = document.createElement("div");
    titleDiv.className = "atb-header-title";
    const dot = document.createElement("div");
    dot.className = "atb-status-dot";
    titleDiv.append(dot, document.createTextNode(UI_TEXT.headerTitle));

    const controls = document.createElement("div");
    controls.className = "atb-header-controls";

    const testBtn  = this.makeButton(UI_TEXT.btnTestAPI, () => this.testAPI());
    const clearBtn = this.makeButton(UI_TEXT.btnClear, () => {
      this.messages = [];
      this.messagesDiv.innerHTML = "";
      this.speechBubble.style.display = "none";
      this.addMessage("bot", UI_TEXT.clearedMessage);
    });

    controls.append(testBtn, clearBtn, this.buildModelSelect());
    this.clientBadge = document.createElement("span");
    this.clientBadge.className = "atb-client-badge";
    this.clientBadge.style.display = "none";
    header.append(titleDiv, this.clientBadge, controls);
    return header;
  }

  // ── Section Vidéo ───────────────────────────────────────────────────────────
  // Deux vidéos préchargées simultanément — on affiche/cache instantanément
  private videoIdle!: HTMLVideoElement;
  private videoTalk!: HTMLVideoElement;

  private buildVideoSection(): HTMLElement {
    const section = document.createElement("div");
    section.className = "atb-video-section";

    const wrapper = document.createElement("div");
    wrapper.className = "atb-video-wrapper";
    wrapper.style.position = "relative";

    // Fond décoratif derrière la vidéo
    const bg = document.createElement("div");
    bg.className = "atb-video-bg";
    bg.style.position = "absolute";
    bg.style.bottom = "0";
    bg.style.left = "50%";
    bg.style.transform = "translateX(-50%)";
    bg.style.width = "100%";
    bg.style.height = "100%";
    bg.style.background = "#6B2328";
    bg.style.borderRadius = "16px";
    bg.style.boxShadow = "inset 0 2px 12px rgba(0,0,0,0.15)";
    bg.style.pointerEvents = "none";
    bg.style.zIndex = "0";

    // ── Vidéo Idle (visible au départ) ──
    this.videoIdle = this.createVideoEl(VIDEO_SRC, true);

    // ── Vidéo Talk (invisible au départ, préchargée) ──
    this.videoTalk = this.createVideoEl(VIDEO_SRC2, false);

    wrapper.appendChild(bg);
    wrapper.appendChild(this.videoIdle);
    wrapper.appendChild(this.videoTalk);
    section.appendChild(wrapper);
    return section;
  }

  // Crée un élément vidéo préchargé
  private createVideoEl(src: string, visible: boolean): HTMLVideoElement {
    const video = document.createElement("video");
    video.autoplay    = true;
    video.loop        = true;
    video.muted       = true;
    video.playsInline = true;
    video.style.position   = "absolute";
    video.style.bottom     = "0";
    video.style.left       = "50%";
    video.style.transform  = "translateX(-50%)";
    video.style.height     = "100%";
    video.style.width      = "auto";
    video.style.objectFit  = "contain";
    video.style.transition = "opacity 0.3s ease";
    video.style.opacity    = visible ? "1" : "0";
    video.style.pointerEvents = "none";

    const source = document.createElement("source");
    source.src  = src;
    source.type = VIDEO_TYPE;
    video.appendChild(source);
    video.load();
    return video;
  }

  // ── Switch instantané Idle ↔ Talk ────────────────────────────────────────
  private setVideo(mode: "idle" | "talk"): void {
    if (mode === "talk") {
      this.videoIdle.style.opacity = "0";
      this.videoTalk.style.opacity = "1";
      this.videoTalk.play().catch(() => {});
    } else {
      this.videoTalk.style.opacity = "0";
      this.videoIdle.style.opacity = "1";
      this.videoIdle.play().catch(() => {});
    }
  }

  // Placeholder SVG affiché si la vidéo est absente
  private buildVideoPlaceholder(): HTMLElement {
    const div = document.createElement("div");
    div.className = "atb-video-placeholder";
    div.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4facfe" stroke-width="1.5">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
      <span>${UI_TEXT.videoFallback}</span>
      <span style="font-size:10px;opacity:0.6;">Remplacez VIDEO_SRC dans visual.template.ts</span>
    `;
    return div;
  }

  // ── Sélecteur de modèle ─────────────────────────────────────────────────────
  private buildModelSelect(): HTMLSelectElement {
    const models: [string, string][] = [
      ["gemini", "Gemini"],
      ["groq",   "Groq (Llama)"],
      ["local",  "Local LLM (Ollama)"],
    ];
    const select = document.createElement("select");
    select.className = "atb-select";
    models.forEach(([val, label]) => {
      const o = document.createElement("option");
      o.value = val; o.textContent = label;
      select.appendChild(o);
    });
    select.addEventListener("change", () => {
      this.selectedModel = select.value;
      this.addMessage("bot", `${UI_TEXT.modelChanged} ${select.options[select.selectedIndex].textContent}`);
    });
    return select;
  }

  // ── Zone de saisie ──────────────────────────────────────────────────────────
  private buildInputArea(): HTMLElement {
    const area = document.createElement("div");
    area.className = "atb-input-area";

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = UI_TEXT.placeholder;
    this.input.className = "atb-input";
    this.input.addEventListener("keydown", e => { if (e.key === "Enter") this.sendMessage(); });

    const sendBtn = document.createElement("button");
    sendBtn.className = "atb-send-btn";
    sendBtn.innerHTML = "&#10148;";
    sendBtn.addEventListener("click", () => this.sendMessage());

    area.append(this.input, sendBtn);
    return area;
  }

  // ── Helpers DOM ─────────────────────────────────────────────────────────────
  private makeButton(label: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "atb-btn";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  private addMessage(role: "bot" | "user", text: string): void {
    if (role === "bot") {
      this.speechText.textContent = text;
      this.speechBubble.style.display = "block";
    } else {
      this.speechBubble.style.display = "none";
      const bubble = document.createElement("div");
      bubble.className = "atb-bubble user";
      bubble.textContent = text;
      this.messagesDiv.appendChild(bubble);
      this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }
  }

  private showTyping(): HTMLElement {
    const el = document.createElement("div");
    el.className = "atb-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    this.messagesDiv.appendChild(el);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    return el;
  }

  private removeElement(el: HTMLElement): void {
    if (el.parentNode === this.messagesDiv) this.messagesDiv.removeChild(el);
  }

  // ── Test API ─────────────────────────────────────────────────────────────────
  private async testAPI(): Promise<void> {
    const loading = this.showTyping();
    try {
      const res  = await this.callAPI([{ role: "user", parts: [{ text: "dis juste: API OK" }] }]);
      const data = await res.json();
      this.removeElement(loading);
      this.addMessage("bot", `${UI_TEXT.connectedMessage} ${this.selectedModel} — ${data.reply}`);
    } catch {
      this.removeElement(loading);
      this.addMessage("bot", UI_TEXT.errorMessage);
    }
  }

  // ── Envoi d'un message ───────────────────────────────────────────────────────
  private async sendMessage(): Promise<void> {
    const question = this.input.value.trim();
    if (!question) return;

    this.addMessage("user", question);
    this.input.value = "";
    this.messages.push({ role: "user", parts: [{ text: question }] });

    const loading = this.showTyping();
    this.setVideo("talk");       // ← Talk démarre pendant la réflexion
    try {
      const res  = await this.callAPI(this.messages, this.buildSystemPrompt());
      const data = await res.json();
      this.messages.push({ role: "model", parts: [{ text: data.reply }] });
      this.removeElement(loading);
      // ← Typewriter en même temps que Talk continue
      await this.addMessageTypewriter("bot", data.reply);
    } catch {
      this.removeElement(loading);
      this.addMessage("bot", UI_TEXT.errorMessage);
    } finally {
      this.setVideo("idle");     // ← Idle reprend quand le texte est fini
    }
  }

  // ── Animation Typewriter ─────────────────────────────────────────────────
  private addMessageTypewriter(role: "bot" | "user", text: string): Promise<void> {
    return new Promise((resolve) => {
      if (role === "bot") {
        // Bot → bulle de dialogue sur la vidéo uniquement
        this.speechText.textContent = "";
        this.speechBubble.style.display = "block";
      } else {
        // User → bulle dans la zone messages
        const bubble = document.createElement("div");
        bubble.className = "atb-bubble user";
        bubble.textContent = "";
        this.messagesDiv.appendChild(bubble);
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
      }

      let i = 0;
      const speed = 18;

      const type = () => {
        if (i < text.length) {
          const ch = text.charAt(i);
          if (role === "bot") {
            this.speechText.textContent += ch;
          } else {
            const last = this.messagesDiv.lastElementChild as HTMLElement;
            if (last) last.textContent += ch;
            this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
          }
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };
      type();
    });
  }

  // ── Prompt système ──────────────────────────────────────────────────────────
  // Customize this prompt for your own use case (banking / churn / other).
  private buildSystemPrompt(): string {
    let prompt = `Tu es un analyste expert en Explainable AI (XAI) pour ATB (Arab Tunisian Bank).
Tu t'appelles "ATB Assistant". Tu réponds UNIQUEMENT aux questions bancaires.
Réponds toujours en français, professionnel et concis.`;

    if (this.selectedClientId) {
      prompt += `\n\nUn client spécifique est sélectionné (ID: ${this.selectedClientId}).
Analyse ce client en respectant STRICTEMENT ces règles :
- Niveau de risque = probabilité de churn. Seuils : <0.30 faible, 0.30-0.60 moyen, >0.60 élevé. NE JAMAIS CONTREDIRE ces seuils.
- Un client avec probabilité > 0.30 ne peut PAS être "risque moyen" ET "churn élevé" en même temps.
Réponds en MAXIMUM 6 lignes :
• Profil client (1 ligne)
• Risque : [niveau] avec probabilité [valeur] — facteurs principaux (1-2 lignes)
• Recommandation (1 ligne)
IMPORTANT: Si l'utilisateur demande "debug" ou "affiche les données", montre les données brutes reçues.`;
    }

    if (this.dataContext) {
      prompt += `\n\nDonnées du dashboard:\n${this.dataContext}`;
    }
    return prompt;
  }

  // ── Fetch vers le proxy ──────────────────────────────────────────────────────
  private callAPI(contents: ChatMessage[], systemInstruction?: string): Promise<Response> {
    const body: Record<string, unknown> = { model: this.selectedModel, contents };
    if (systemInstruction) {
      body.system_instruction = { parts: [{ text: systemInstruction }] };
    }
    return fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
  }

  // ── Mise à jour des données Power BI (agrégation complète) ────────────────
  public update(options: VisualUpdateOptions): void {
    try {
      const dataView = options.dataViews?.[0];
      if (!dataView?.table) return;
      const { columns, rows = [] } = dataView.table;
      if (rows.length === 0) { this.dataContext = ""; return; }

      const colNames = columns.map(c => c.displayName);
      const totalRows = rows.length;

      // Si un seul client sélectionné → mode XAI
      if (totalRows === 1) {
        const row = rows[0];
        this.selectedClientId = String(row[0] ?? "");
        this.selectedClientData = colNames.map((n, i) => `${n}: ${row[i]}`).join("\n");
        this.clientBadge.textContent = `${UI_TEXT.clientSelected} #${this.selectedClientId}`;
        this.clientBadge.style.display = "inline";
        this.dataContext = this.fullDataContext
          ? `${this.fullDataContext}\n\n--- CLIENT SÉLECTIONNÉ ---\n${this.selectedClientData}`
          : this.selectedClientData;
        return;
      }

      // Mode normal : plusieurs lignes → on agrège
      this.selectedClientId = "";
      this.selectedClientData = "";
      this.clientBadge.style.display = "none";
      const isNum: boolean[] = columns.map((_, i) => typeof rows[0]?.[i] === "number");

      // Collecteurs : valeurs numériques + distributions catégorielles
      const numData  = new Map<number, number[]>();
      const catData  = new Map<number, Map<string, number>>();
      const uniqVals = new Map<number, Set<number>>();

      columns.forEach((_, i) => {
        if (isNum[i]) { numData.set(i, []); uniqVals.set(i, new Set()); }
        else catData.set(i, new Map());
      });

      // Passe unique : collecter toutes les données
      for (const row of rows) {
        for (const [idx, arr] of numData) {
          const v = Number(row[idx]);
          if (!isNaN(v)) { arr.push(v); uniqVals.get(idx)!.add(v); }
        }
        for (const [idx, map] of catData) {
          const v = String(row[idx] ?? "(vide)");
          map.set(v, (map.get(v) || 0) + 1);
        }
      }

      // Détection des colonnes binaires (0/1) — probable colonne churn
      const binaryCols: number[] = [];
      for (const [idx, vals] of uniqVals) {
        const a = [...vals];
        if (a.length <= 2 && a.every(v => v === 0 || v === 1)) binaryCols.push(idx);
      }

      // Construction du résumé agrégé
      let s = `=== DONNÉES DASHBOARD ATB ===\n`;
      s += `Total enregistrements: ${totalRows.toLocaleString("fr")}\n`;
      s += `Colonnes (${colNames.length}): ${colNames.join(", ")}\n\n`;

      // 1. Distributions catégorielles
      if (catData.size > 0) {
        s += `--- RÉPARTITIONS ---\n`;
        for (const [idx, map] of catData) {
          const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
          s += `${colNames[idx]} (${map.size} valeurs uniques):\n`;
          for (const [val, count] of sorted.slice(0, 10))
            s += `  ${val}: ${count} (${(count/totalRows*100).toFixed(1)}%)\n`;
        }
      }

      // 2. Statistiques numériques
      if (numData.size > 0) {
        s += `\n--- STATISTIQUES ---\n`;
        for (const [idx, vals] of numData) {
          if (vals.length === 0) continue;
          vals.sort((a, b) => a - b);
          const sum = vals.reduce((a, b) => a + b, 0);
          const avg = sum / vals.length;
          const med = vals[Math.floor(vals.length / 2)];
          s += `${colNames[idx]}: `;
          s += `Moy=${avg.toFixed(2)} | Med=${med.toFixed(2)} | Min=${vals[0]} | Max=${vals[vals.length-1]}`;
          const variance = vals.reduce((a, v) => a + (v - avg) ** 2, 0) / vals.length;
          s += ` | σ=${Math.sqrt(variance).toFixed(2)}\n`;
        }
      }

      // 3. Analyse croisée (si churn binaire détecté)
      if (binaryCols.length > 0) {
        s += `\n=== ANALYSE CROISÉE ===\n`;
        for (const binIdx of binaryCols) {
          const binVals = numData.get(binIdx)!;
          const count1 = binVals.filter(v => v === 1).length;
          const rate   = (count1 / totalRows * 100);
          s += `Cible: ${colNames[binIdx]} — Taux positif: ${rate.toFixed(2)}% (${count1}/${totalRows})\n\n`;

          // Par catégorie
          for (const [catIdx, map] of catData) {
            const groups = new Map<string, { total: number; pos: number }>();
            for (const row of rows) {
              const cv = String(row[catIdx] ?? "(vide)");
              const bv = Number(row[binIdx]);
              if (isNaN(bv)) continue;
              const g = groups.get(cv) || { total: 0, pos: 0 };
              g.total++; if (bv === 1) g.pos++;
              groups.set(cv, g);
            }
            const top = [...groups.entries()]
              .map(([k, v]) => ({ label: k, rate: v.pos / v.total * 100, count: v.total }))
              .sort((a, b) => b.rate - a.rate).slice(0, 5);
            if (top.length > 0) {
              s += `Par ${colNames[catIdx]}:\n`;
              for (const g of top) s += `  ${g.label}: ${g.rate.toFixed(1)}% (${g.count} clients)\n`;
            }
          }

          // Moyennes conditionnelles
          s += `\nMoyennes churnés vs non-churnés:\n`;
          for (const [numIdx] of numData) {
            if (binaryCols.includes(numIdx)) continue;
            let s0 = 0, c0 = 0, s1 = 0, c1 = 0;
            for (const row of rows) {
              const bv = Number(row[binIdx]);
              const nv = Number(row[numIdx]);
              if (isNaN(bv) || isNaN(nv)) continue;
              if (bv === 1) { s1 += nv; c1++; } else { s0 += nv; c0++; }
            }
            const a0 = c0 ? s0 / c0 : 0;
            const a1 = c1 ? s1 / c1 : 0;
            s += `  ${colNames[numIdx]}: Non-churnés=${a0.toFixed(2)} | Churnés=${a1.toFixed(2)} | Écart=${(a1-a0).toFixed(2)}\n`;
          }
        }
      }

      this.fullDataContext = s;
      this.dataContext = s;
    } catch {
      this.dataContext = "";
    }
  }
}
