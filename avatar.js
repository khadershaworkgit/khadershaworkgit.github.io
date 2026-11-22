// ============================================================
// HOLOGRAPHIC CYBER AVATAR (NOVA-7)
// Interactive Vector Face with Cursor Tracking, Blinking & Voice Sync
// ============================================================

class CyberAvatar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isTalking = false;
    this.eyeTargetX = 0;
    this.eyeTargetY = 0;
    this.eyeCurrentX = 0;
    this.eyeCurrentY = 0;
    this.wavePhase = 0;
    this.animId = null;

    if (this.container) {
      this.render();
      this.bindEvents();
      this.startLoop();
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="avatar-wrapper">
        <div class="avatar-hologram-ring ring-1"></div>
        <div class="avatar-hologram-ring ring-2"></div>
        <div class="avatar-canvas-box">
          <canvas id="avatar-canvas" width="160" height="160"></canvas>
        </div>
        <div class="avatar-badge">
          <span class="status-dot"></span>
          <span class="avatar-name">NOVA-7 // AI MENTOR</span>
        </div>
      </div>
      <div class="avatar-dialog-bubble" id="avatar-bubble">
        <div class="bubble-header">
          <span class="bubble-tag">TRANSMISSION RECEIVED</span>
          <span class="bubble-voice-indicator" id="voice-indicator">MUTED</span>
        </div>
        <p class="bubble-text" id="avatar-speech-text">
          "Welcome to the AI Coding Experience! I am NOVA-7. Choose a mode above to explore the full curriculum, present the slide deck, or practice in the interactive lab."
        </p>
        <div class="bubble-actions">
          <button class="btn-bubble-action" id="btn-speak-welcome">
            <span>🔊</span> <span>Hear Greeting</span>
          </button>
          <button class="btn-bubble-action secondary" id="btn-avatar-tip">
            <span>💡</span> <span>Quick Tip</span>
          </button>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('avatar-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.speechText = document.getElementById('avatar-speech-text');
    this.voiceIndicator = document.getElementById('voice-indicator');
  }

  bindEvents() {
    // Mouse tracking to move eyes
    window.addEventListener('mousemove', (e) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      this.eyeTargetX = Math.max(-6, Math.min(6, dx * 6));
      this.eyeTargetY = Math.max(-4, Math.min(4, dy * 4));
    });

    // Welcome speech button
    const btnWelcome = document.getElementById('btn-speak-welcome');
    if (btnWelcome) {
      btnWelcome.addEventListener('click', () => {
        window.soundEngine.playPowerUp();
        this.speakMessage(
          "Greetings! Welcome to the Prompt-Based Coding and AI-Supported Program Development interactive portal. Explore the documents, switch to presentation mode, or test your prompt engineering skills in the live lab!"
        );
      });
    }

    // Quick tip button
    const btnTip = document.getElementById('btn-avatar-tip');
    if (btnTip) {
      btnTip.addEventListener('click', () => {
        window.soundEngine.playBlip();
        const tips = [
          "Tip: Always specify numerical precision constraints like Decimal in financial prompts to avoid floating-point drift!",
          "Tip: For debugging async code, provide the exact traceback and ask the AI for concurrency limits using asyncio.Semaphore.",
          "Tip: Avoid monolithic God functions. Prompt the AI to separate database querying from message dispatching using the Strategy Pattern.",
          "Tip: In the Lab mode, you can test live prompts and compare the Before vs After code diffs!"
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.speakMessage(randomTip);
      });
    }
  }

  setTalking(isTalking) {
    this.isTalking = isTalking;
    if (this.voiceIndicator) {
      this.voiceIndicator.textContent = isTalking ? "TRANSMITTING..." : "ONLINE";
      this.voiceIndicator.style.color = isTalking ? "#00FF9D" : "#38BDF8";
    }
  }

  speakMessage(text) {
    if (this.speechText) {
      this.speechText.textContent = `"${text}"`;
    }
    window.soundEngine.speak(
      text,
      () => this.setTalking(true),
      () => this.setTalking(false)
    );
  }

  startLoop() {
    let blinkTimer = 0;
    let isBlinking = false;

    const renderFrame = () => {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Smooth eye interpolation
      this.eyeCurrentX += (this.eyeTargetX - this.eyeCurrentX) * 0.1;
      this.eyeCurrentY += (this.eyeTargetY - this.eyeCurrentY) * 0.1;

      // Blinking logic
      blinkTimer++;
      if (blinkTimer > 180 && Math.random() < 0.05) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (blinkTimer > 12) {
        isBlinking = false;
      }

      // 1. Cyber Head Base (Chiseled Glass Shield)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - 36, cy - 40);
      ctx.lineTo(cx + 36, cy - 40);
      ctx.lineTo(cx + 46, cy + 10);
      ctx.lineTo(cx + 26, cy + 48);
      ctx.lineTo(cx - 26, cy + 48);
      ctx.lineTo(cx - 46, cy + 10);
      ctx.closePath();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0284C7';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // 2. Forehead Cyber Nodes
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(cx, cy - 30, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 15, cy - 31, 8, 2);
      ctx.fillRect(cx + 7, cy - 31, 8, 2);

      // 3. Cybernetic Glowing Eyes
      const leftEyeX = cx - 18 + this.eyeCurrentX;
      const rightEyeX = cx + 18 + this.eyeCurrentX;
      const eyeY = cy - 8 + this.eyeCurrentY;

      ctx.save();
      ctx.shadowColor = this.isTalking ? '#00FF9D' : '#00F0FF';
      ctx.shadowBlur = 12;

      if (!isBlinking) {
        // Glowing Eye Apertures
        ctx.fillStyle = this.isTalking ? '#00FF9D' : '#00F0FF';
        
        // Left Eye
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right Eye
        ctx.beginPath();
        ctx.ellipse(rightEyeX, eyeY, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye Pupils / Core highlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX + 1, eyeY - 1, 2.5, 0, Math.PI * 2);
        ctx.arc(rightEyeX + 1, eyeY - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Blink Line
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftEyeX - 8, eyeY);
        ctx.lineTo(leftEyeX + 8, eyeY);
        ctx.moveTo(rightEyeX - 8, eyeY);
        ctx.lineTo(rightEyeX + 8, eyeY);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Cheeks & Jaw Cyber Circuit Decals
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 12);
      ctx.lineTo(cx - 18, cy + 22);
      ctx.moveTo(cx + 30, cy + 12);
      ctx.lineTo(cx + 18, cy + 22);
      ctx.stroke();

      // 5. Reactive Mouth / Audio Waveform
      ctx.save();
      this.wavePhase += 0.15;
      const mouthY = cy + 30;

      if (this.isTalking) {
        // Animated dynamic frequency bars
        ctx.fillStyle = '#00FF9D';
        ctx.shadowColor = '#00FF9D';
        ctx.shadowBlur = 8;
        const barCount = 7;
        const barWidth = 3;
        const gap = 3;
        const startX = cx - ((barCount * (barWidth + gap)) / 2) + 1.5;

        for (let i = 0; i < barCount; i++) {
          const barH = 4 + Math.abs(Math.sin(this.wavePhase + i * 0.8)) * 12;
          ctx.fillRect(startX + i * (barWidth + gap), mouthY - barH / 2, barWidth, barH);
        }
      } else {
        // Subtle resting cyber smile / light bar
        ctx.strokeStyle = '#38BDF8';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 12, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + 3, cx + 12, mouthY);
        ctx.stroke();
      }
      ctx.restore();

      this.animId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }
}

window.CyberAvatar = CyberAvatar;
