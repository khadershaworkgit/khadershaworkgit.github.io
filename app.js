// ============================================================
// MAIN APPLICATION LOGIC (Futuristic Portal)
// Modes, Slide Deck Engine, Interactive Lab & Particle Background
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Avatar
  const avatar = new CyberAvatar('avatar-hud-slot');

  // 2. Initialize Particle Background
  initParticleBackground('cyber-canvas-bg');

  // 3. Mode Navigation Engine
  const modeButtons = document.querySelectorAll('.nav-mode-btn');
  const modeContainers = document.querySelectorAll('.app-mode-view');

  function switchMode(targetModeId) {
    window.soundEngine.playWhoosh();

    modeButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-mode') === targetModeId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    modeContainers.forEach(container => {
      const isTarget = container.id === targetModeId;
      container.classList.toggle('active-mode', isTarget);
      if (isTarget) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(12px)';
        setTimeout(() => {
          container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          container.style.opacity = '1';
          container.style.transform = 'translateY(0)';
        }, 30);
      }
    });

    // Notify Avatar
    if (targetModeId === 'mode-document') {
      avatar.speakMessage("Switched to Document Guide Mode. Here you will find the complete syllabus, before-and-after code deep dives, and live component previews.");
    } else if (targetModeId === 'mode-presentation') {
      avatar.speakMessage("Switched to Presentation Mode. Use arrow keys or the on-screen controls to navigate the slide deck.");
    } else if (targetModeId === 'mode-lab') {
      avatar.speakMessage("Welcome to the Prompt Engineering Lab! Select a mission, test your prompts, and inspect real-time AI code synthesis.");
    }
  }

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetMode = btn.getAttribute('data-mode');
      switchMode(targetMode);
    });
  });

  // Sound Toggle Button
  const btnMute = document.getElementById('btn-sound-toggle');
  if (btnMute) {
    btnMute.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      btnMute.innerHTML = isMuted ? '<span>🔇</span> <span>SFX OFF</span>' : '<span>🔊</span> <span>SFX ON</span>';
      btnMute.classList.toggle('muted', isMuted);
      if (!isMuted) window.soundEngine.playBlip();
    });
  }

  // 4. Slide Deck Engine (PPT Mode)
  initSlideDeck();

  // 5. Interactive Lab Engine
  initLabEngine();

  // 6. Copy Prompt Handlers
  initCopyPromptButtons();

  // 7. Pronunciation Button Handlers
  initPronunciationHandlers(avatar);

  // 8. Live SaaS Component Preview Controller
  initLivePricingWidget();
});

// ============================================================
// PARTICLE MATRIX BACKGROUND
// ============================================================
function initParticleBackground(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const particles = [];
  const count = Math.min(50, Math.floor(w / 30));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.08)';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================
// SLIDE DECK ENGINE (PPT MODE)
// ============================================================
function initSlideDeck() {
  const slides = document.querySelectorAll('.presentation-slide');
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');
  const currentNumEl = document.getElementById('slide-current-num');
  const totalNumEl = document.getElementById('slide-total-num');
  const selectEl = document.getElementById('slide-selector');
  const fullscreenBtn = document.getElementById('btn-slide-fullscreen');
  const notesToggleBtn = document.getElementById('btn-slide-notes');
  const notesDrawer = document.getElementById('slide-notes-drawer');
  const progressBar = document.getElementById('slide-progress-fill');

  let currentIndex = 0;
  const total = slides.length;

  if (totalNumEl) totalNumEl.textContent = total;

  // Populate Dropdown
  if (selectEl) {
    selectEl.innerHTML = '';
    slides.forEach((s, idx) => {
      const title = s.getAttribute('data-title') || `Slide ${idx + 1}`;
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${idx + 1}. ${title}`;
      selectEl.appendChild(opt);
    });
    selectEl.addEventListener('change', (e) => {
      showSlide(parseInt(e.target.value, 10));
    });
  }

  function showSlide(index) {
    if (index < 0) index = 0;
    if (index >= total) index = total - 1;
    currentIndex = index;

    window.soundEngine.playWhoosh();

    slides.forEach((s, idx) => {
      s.classList.toggle('active-slide', idx === currentIndex);
    });

    if (currentNumEl) currentNumEl.textContent = currentIndex + 1;
    if (selectEl) selectEl.value = currentIndex;
    if (progressBar) progressBar.style.width = `${((currentIndex + 1) / total) * 100}%`;

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === total - 1;

    // Update notes drawer
    const activeSlide = slides[currentIndex];
    const notes = activeSlide ? activeSlide.getAttribute('data-notes') : '';
    if (notesDrawer) {
      notesDrawer.innerHTML = notes ? `<div class="notes-content"><strong>Presenter Insights:</strong> ${notes}</div>` : '<div class="notes-content"><em>No notes for this slide.</em></div>';
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    const isPresentationActive = document.getElementById('mode-presentation')?.classList.contains('active-mode');
    if (!isPresentationActive) return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      showSlide(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showSlide(currentIndex - 1);
    }
  });

  // Fullscreen
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const deck = document.getElementById('presentation-viewport');
      if (!deck) return;
      if (!document.fullscreenElement) {
        deck.requestFullscreen().catch(err => alert("Fullscreen error: " + err.message));
      } else {
        document.exitFullscreen();
      }
    });
  }

  // Notes drawer
  if (notesToggleBtn && notesDrawer) {
    notesToggleBtn.addEventListener('click', () => {
      notesDrawer.classList.toggle('open');
      notesToggleBtn.classList.toggle('active', notesDrawer.classList.contains('open'));
      window.soundEngine.playBlip();
    });
  }

  showSlide(0);
}

// ============================================================
// INTERACTIVE PROMPT ENGINEERING LAB
// ============================================================
const LAB_MISSIONS = {
  logic: {
    title: "Mission 1: Synthesize Discount & Tax Logic",
    category: "Program Logic Generation",
    badge: "PRECISION ALGORITHM",
    description: "Formulate a C-T-C-O prompt to calculate tiered customer discounts with zero binary floating-point rounding errors and strict input validations.",
    initialPrompt: `[CONTEXT]: You are a Principal Financial Systems Engineer building an e-commerce checkout engine.
[TASK]: Write a Python function calculate_order_totals(cart_items, customer_tier, coupon_code).
[CONSTRAINTS]:
1. Financial Accuracy: Use decimal.Decimal with ROUND_HALF_UP. No floats.
2. Tier Discounts: 'bronze' (5%), 'silver' (10%), 'gold' (15%).
3. Coupon: 'SAVE20' gives $20 deduction only if post-tier subtotal >= $100.
4. Validation: Raise ValueError on empty cart or negative prices.
[OUTPUT]: Typed Python 3.11+ code with dataclass models and docstrings.`,
    solutionCode: `from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class CustomerTier(str, Enum):
    STANDARD = "standard"
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"

@dataclass(frozen=True)
class CartItem:
    sku: str
    unit_price: Decimal
    quantity: int

    def __post_init__(self):
        if self.unit_price < Decimal("0.00"):
            raise ValueError(f"Price for {self.sku} cannot be negative.")
        if self.quantity <= 0:
            raise ValueError(f"Quantity for {self.sku} must be > 0.")

@dataclass(frozen=True)
class OrderCalculationResult:
    gross_subtotal: Decimal
    tier_discount: Decimal
    final_total: Decimal

def calculate_order_totals(cart_items: List[CartItem], tier: CustomerTier = CustomerTier.STANDARD) -> OrderCalculationResult:
    if not cart_items:
        raise ValueError("Cannot calculate empty cart.")
    gross = sum(i.unit_price * i.quantity for i in cart_items)
    rate = {CustomerTier.STANDARD: Decimal("0.0"), CustomerTier.BRONZE: Decimal("0.05"), CustomerTier.SILVER: Decimal("0.10"), CustomerTier.GOLD: Decimal("0.15")}[tier]
    disc = (gross * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return OrderCalculationResult(gross, disc, gross - disc)`
  },
  debug: {
    title: "Mission 2: Diagnose & Patch Concurrency Failure",
    category: "Error Debugging",
    badge: "CONCURRENCY RESILIENCE",
    description: "Provide the stack trace and ask the AI assistant to isolate the shared mutable default argument and eliminate socket exhaustion with asyncio.Semaphore.",
    initialPrompt: `[ROLE]: Senior Python Distributed Systems Engineer.
[SYMPTOM]: fetch_all_services crashes with ClientConnectorError under load, and state leaks across invocations.
[CODE]:
async def fetch_all(endpoints, results=[]):
    async with aiohttp.ClientSession() as s:
        tasks = [s.get(url) for url in endpoints]
        return await asyncio.gather(*tasks)
[OBJECTIVE]:
1. Root cause analysis for state leakage and socket exhaustion.
2. Provide a patch utilizing asyncio.Semaphore(10) and gather(..., return_exceptions=True).`,
    solutionCode: `import asyncio, aiohttp
from typing import List, Dict, Any, Optional

async def fetch_single(session: aiohttp.ClientSession, url: str, sem: asyncio.Semaphore) -> Optional[Dict[str, Any]]:
    # 1. Semaphore limits active connections to prevent OS socket exhaustion
    async with sem:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=5.0)) as resp:
                return await resp.json() if resp.status == 200 else None
        except Exception:
            return None

async def fetch_all(endpoints: List[str], max_concurrency: int = 10) -> List[Dict[str, Any]]:
    # 2. Eliminated mutable default parameter!
    if not endpoints: return []
    sem = asyncio.Semaphore(max_concurrency)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_single(session, u, sem) for u in endpoints]
        # 3. return_exceptions=True isolates failures
        res = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in res if isinstance(r, dict)]`
  },
  refactor: {
    title: "Mission 3: Monolith to Strategy Pattern Refactoring",
    category: "Code Structure Modernization",
    badge: "SOLID ARCHITECTURE",
    description: "Transform a 120-line monolithic notification function into an extensible Strategy Pattern architecture with Dependency Injection.",
    initialPrompt: `[TASK]: Refactor legacy send_notification_to_user to adhere to SOLID principles.
[REQUIREMENTS]:
1. Single Responsibility: Decouple database retrieval, dispatching, and logging.
2. Open/Closed: Abstract Base Class NotificationChannel so adding new channels requires ZERO edits to existing code.
3. Dependency Injection: Inject UserRepository and AuditLogger protocols.`,
    solutionCode: `from abc import ABC, abstractmethod
from typing import Protocol, Dict, Optional

class NotificationChannel(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str) -> bool: pass

class EmailChannel(NotificationChannel):
    def send(self, recipient: str, message: str) -> bool:
        print(f"Dispatched Email to {recipient}")
        return True

class SmsChannel(NotificationChannel):
    def send(self, recipient: str, message: str) -> bool:
        print(f"Dispatched SMS to {recipient}")
        return True

class NotificationService:
    def __init__(self, channels: Dict[str, NotificationChannel]):
        self._channels = channels
    def notify(self, channel_name: str, recipient: str, msg: str) -> bool:
        channel = self._channels.get(channel_name)
        if not channel: raise ValueError("Channel not found")
        return channel.send(recipient, msg)`
  },
  component: {
    title: "Mission 4: Accessible Reactive Web Component",
    category: "AI-Supported Frontend",
    badge: "WCAG 2.1 AA COMPLIANT",
    description: "Command AI to engineer a responsive SaaS Pricing Switcher with ARIA switch attributes, CSS Grid, and zero global scope pollution.",
    initialPrompt: `[TASK]: Build an accessible Web Component: PricingCalculator.
[REQUIREMENTS]:
1. Semantic HTML5: <section>, <article>, and proper <button role="switch">.
2. WCAG 2.1 AA: aria-checked, keyboard navigation (Space, Enter), and screen reader updates.
3. Responsive CSS: Fluid CSS Grid and CSS custom variables.
4. Scoped ES6 Class: Zero global window variables.`,
    solutionCode: `<!-- Accessible Web Component -->
<section class="pricing-widget" aria-labelledby="p-title">
  <button type="button" role="switch" aria-checked="false" id="t-btn">Annual</button>
  <div class="grid">
    <article class="card">
      <h3>Pro</h3>
      <div aria-live="polite" class="price">$39/mo</div>
    </article>
  </div>
</section>
<script>
class PricingWidget {
  constructor(el) {
    this.btn = el.querySelector('#t-btn');
    this.isAnnual = false;
    this.btn.addEventListener('click', () => this.toggle());
  }
  toggle() {
    this.isAnnual = !this.isAnnual;
    this.btn.setAttribute('aria-checked', String(this.isAnnual));
  }
}
</script>`
  }
};

function initLabEngine() {
  const missionBtns = document.querySelectorAll('.lab-mission-tab');
  const missionTitle = document.getElementById('lab-mission-title');
  const missionBadge = document.getElementById('lab-mission-badge');
  const missionDesc = document.getElementById('lab-mission-desc');
  const promptInput = document.getElementById('lab-prompt-input');
  const runBtn = document.getElementById('btn-run-lab-prompt');
  const outputCode = document.getElementById('lab-output-code');
  const statusBadge = document.getElementById('lab-status-badge');

  let activeMissionKey = 'logic';

  function loadMission(key) {
    activeMissionKey = key;
    const m = LAB_MISSIONS[key];
    if (!m) return;

    missionBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-mission') === key));
    if (missionTitle) missionTitle.textContent = m.title;
    if (missionBadge) missionBadge.textContent = m.badge;
    if (missionDesc) missionDesc.textContent = m.description;
    if (promptInput) promptInput.value = m.initialPrompt;
    if (outputCode) outputCode.textContent = '// Click "Execute AI Pipeline ⚡" to run prompt...';
    if (statusBadge) {
      statusBadge.textContent = 'STANDBY';
      statusBadge.className = 'hud-badge standby';
    }
    window.soundEngine.playBlip();
  }

  missionBtns.forEach(b => {
    b.addEventListener('click', () => loadMission(b.getAttribute('data-mission')));
  });

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      window.soundEngine.playPowerUp();
      runBtn.disabled = true;
      runBtn.innerHTML = '<span>⚡</span> <span>Synthesizing...</span>';

      if (statusBadge) {
        statusBadge.textContent = 'SYNTHESIZING...';
        statusBadge.className = 'hud-badge running';
      }

      const fullCode = LAB_MISSIONS[activeMissionKey].solutionCode;
      let charIndex = 0;
      outputCode.textContent = '';

      const interval = setInterval(() => {
        charIndex += 18;
        outputCode.textContent = fullCode.slice(0, charIndex);
        if (charIndex >= fullCode.length) {
          clearInterval(interval);
          outputCode.textContent = fullCode;
          runBtn.disabled = false;
          runBtn.innerHTML = '<span>⚡</span> <span>Execute AI Pipeline</span>';
          if (statusBadge) {
            statusBadge.textContent = 'VERIFIED & PASSED';
            statusBadge.className = 'hud-badge passed';
          }
          window.soundEngine.playSuccess();
        }
      }, 25);
    });
  }

  loadMission('logic');
}

// ============================================================
// COPY PROMPT BUTTONS
// ============================================================
function initCopyPromptButtons() {
  document.querySelectorAll('.btn-copy-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const promptTargetId = btn.getAttribute('data-copy-target');
      const textToCopy = document.getElementById(promptTargetId)?.innerText;
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          window.soundEngine.playSuccess();
          const origText = btn.innerHTML;
          btn.innerHTML = '<span>✅</span> <span>Copied to Clipboard!</span>';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = origText;
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });
}

// ============================================================
// PRONUNCIATION BUTTON HANDLERS
// ============================================================
function initPronunciationHandlers(avatar) {
  document.querySelectorAll('.btn-audio-pronounce').forEach(btn => {
    btn.addEventListener('click', () => {
      const audioSrc = btn.getAttribute('data-audio-src');
      const term = btn.getAttribute('data-term') || 'term';

      btn.classList.add('playing');
      btn.innerHTML = '<span>🔊</span> <span>Playing...</span>';

      window.soundEngine.playTermAudio(
        audioSrc,
        term,
        () => avatar.setTalking(true),
        () => {
          avatar.setTalking(false);
          btn.classList.remove('playing');
          btn.innerHTML = '<span>🔊</span> <span>Listen</span>';
        }
      );
    });
  });
}

// ============================================================
// LIVE SAAS PRICING WIDGET (Mode 1 Embedded Preview)
// ============================================================
function initLivePricingWidget() {
  const switchBtn = document.getElementById('live-preview-switch');
  const starterPrice = document.getElementById('live-price-starter');
  const proPrice = document.getElementById('live-price-pro');
  const periodEls = document.querySelectorAll('.live-price-period');

  let isAnnual = false;
  if (!switchBtn) return;

  switchBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    window.soundEngine.playBlip();
    switchBtn.setAttribute('aria-checked', String(isAnnual));

    if (starterPrice) starterPrice.textContent = isAnnual ? '144' : '15';
    if (proPrice) proPrice.textContent = isAnnual ? '374' : '39';

    periodEls.forEach(el => {
      el.textContent = isAnnual ? '/year (20% off)' : '/mo';
    });
  });
}
