/**
 * THE AI DEVELOPER ATHENAEUM - INTERACTIVE CONTROLLER
 * Features:
 * - Web Audio API Magic Sound Synthesizer (Chime / Harp Arpeggio)
 * - Canvas Sparkle Particle Burst on Book Click
 * - Dynamic Section 9 Student Bookshelf with Roll Numbers
 * - Grand Athenaeum Book Reader Modal (Live Iframe Viewport Switcher & Hosted Portal Launcher)
 * - Daylight Paper & Midnight Scholar Theme Engine
 * - Interactive Curriculum Tools (Prompt Builder, Diff Comparison, SDLC Stepper, Quiz)
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. AUDIO SYSTEM (MAGIC SOUND SYNTHESIS & PRONUNCIATIONS)
     ========================================================================== */
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem('athenaeum_sound') !== 'muted';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Magical Celestial Chime Arpeggio using Web Audio API.
   * Plays a pentatonic cascade chord with bell harmonics and exponential decay.
   */
  function playMagicChime() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Celestial Pentatonic Frequencies (E5, G#5, B5, E6, G#6)
      const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22];

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        // Gentle volume curve
        gain.gain.setValueAtTime(0.001, now + index * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.18 / (index + 1), now + index * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.9);

        // Subtle stereo spread
        if (panner) {
          panner.pan.setValueAtTime((index - 2) * 0.35, now);
          osc.connect(panner);
          panner.connect(gain);
        } else {
          osc.connect(gain);
        }

        gain.connect(ctx.destination);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.95);
      });
    } catch (err) {
      console.warn('Audio synthesis note:', err);
    }
  }

  /**
   * Play technical vocabulary spoken pronunciation
   */
  function playPronunciation(wordFile) {
    try {
      const audio = new Audio(`./audio/${wordFile}`);
      audio.play().catch(e => console.warn('Pronunciation audio error:', e));
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /* ==========================================================================
     2. SPARKLE PARTICLE BURST CANVAS ANIMATION
     ========================================================================== */
  const sparkleCanvas = document.getElementById('sparkle-canvas');
  let sparkleCtx = null;
  let sparkles = [];
  let animFrameId = null;

  if (sparkleCanvas) {
    sparkleCtx = sparkleCanvas.getContext('2d');
    function resizeSparkleCanvas() {
      sparkleCanvas.width = window.innerWidth;
      sparkleCanvas.height = window.innerHeight;
    }
    resizeSparkleCanvas();
    window.addEventListener('resize', resizeSparkleCanvas);
  }

  function spawnSparkleBurst(x, y) {
    if (!sparkleCtx) return;

    const count = 36;
    const colors = ['#F59E0B', '#FBBF24', '#FDE68A', '#38BDF8', '#FFFFFF', '#60A5FA'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2.5 + Math.random() * 5.5;
      sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.025,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    if (!animFrameId) {
      updateSparkles();
    }
  }

  function updateSparkles() {
    if (!sparkleCtx) return;
    sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

    for (let i = sparkles.length - 1; i >= 0; i--) {
      const p = sparkles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // Gravity
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        sparkles.splice(i, 1);
        continue;
      }

      // Draw star/sparkle
      sparkleCtx.save();
      sparkleCtx.globalAlpha = p.alpha;
      sparkleCtx.translate(p.x, p.y);
      sparkleCtx.rotate(p.rotation);
      sparkleCtx.fillStyle = p.color;

      // 4-point star
      const s = p.size;
      sparkleCtx.beginPath();
      sparkleCtx.moveTo(0, -s * 2);
      sparkleCtx.quadraticCurveTo(0, 0, s * 2, 0);
      sparkleCtx.quadraticCurveTo(0, 0, 0, s * 2);
      sparkleCtx.quadraticCurveTo(0, 0, -s * 2, 0);
      sparkleCtx.quadraticCurveTo(0, 0, 0, -s * 2);
      sparkleCtx.fill();
      sparkleCtx.restore();
    }

    if (sparkles.length > 0) {
      animFrameId = requestAnimationFrame(updateSparkles);
    } else {
      animFrameId = null;
    }
  }

  /* ==========================================================================
     3. TOAST NOTIFICATION
     ========================================================================== */
  function showToast(message) {
    const toast = document.getElementById('toast-notice');
    if (!toast) return;
    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    toast.style.display = 'flex';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  /* ==========================================================================
     4. SECTION 9 STUDENT BOOKSHELF ENGINE
     ========================================================================== */
  const bookThemes = ['theme-navy', 'theme-burgundy', 'theme-forest', 'theme-slate', 'theme-amber'];

  function initSection9Bookshelf() {
    const grid = document.getElementById('books-shelf-grid');
    if (!grid) return;

    const students = window.SEC9_STUDENTS || [];
    if (!students || students.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center text-muted py-5">Loading Student Volumes...</div>';
      return;
    }

    renderBooks(students);

    // Search Input Listener
    const searchInput = document.getElementById('bookshelf-search');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase().trim();
        filterAndRender(query, getActiveFilterCategory());
      });
    }

    // Filter Pills Listener
    const filterBtns = document.querySelectorAll('.filter-pill-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        filterAndRender(query, this.getAttribute('data-filter'));
      });
    });
  }

  function getActiveFilterCategory() {
    const activeBtn = document.querySelector('.filter-pill-btn.active');
    return activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
  }

  function filterAndRender(query, category) {
    const students = window.SEC9_STUDENTS || [];
    const filtered = students.filter(s => {
      const matchQuery = !query || 
        s.roll.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query) || 
        s.title.toLowerCase().includes(query);

      let matchCat = true;
      if (category === 'hosted') {
        matchCat = s.is_link === true;
      } else if (category === 'html') {
        matchCat = s.is_link === false;
      }

      return matchQuery && matchCat;
    });

    renderBooks(filtered);

    // Update Counter Label
    const countLabel = document.getElementById('bookshelf-count');
    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${students.length} Books`;
    }
  }

  function renderBooks(studentList) {
    const grid = document.getElementById('books-shelf-grid');
    if (!grid) return;

    if (studentList.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📖</div>
          <h4 style="font-family: var(--font-serif); color: var(--ink-primary);">No Student Books Matched</h4>
          <p style="color: var(--ink-muted); font-size: 0.9rem;">Try searching for a different roll number (e.g. 4556, 4A, 4B) or student name.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';

    studentList.forEach((s, index) => {
      const themeClass = bookThemes[index % bookThemes.length];
      const isHosted = s.is_link === true;

      const bookItem = document.createElement('div');
      bookItem.className = 'book-item-container';

      bookItem.innerHTML = `
        <div class="interactive-book ${isHosted ? 'is-special-hosted' : ''}" 
             data-roll="${s.roll}" 
             data-file="${s.file}" 
             data-name="${escapeHtml(s.name)}" 
             data-title="${escapeHtml(s.title)}" 
             data-url="${s.target_url}" 
             data-islink="${isHosted}"
             tabindex="0"
             role="button"
             aria-label="Student Book Roll ${s.roll} - ${s.name}">
          
          ${isHosted ? `
            <div class="special-ribbon-badge">
              <span>✦</span> Hosted Portal
            </div>
          ` : ''}

          <div class="book-cover ${themeClass}">
            <div class="book-foil-border">
              <div class="book-top-crest">
                <span>VOL. IX</span>
                <span>🏛️ ATHENAEUM</span>
              </div>

              <!-- ROLL NUMBER GOLD EMBOSSED PLATE -->
              <div class="book-roll-plate">
                <span class="book-roll-label">ROLL NUMBER</span>
                <div class="book-roll-number">${s.roll}</div>
              </div>

              <div>
                <div class="book-student-name">${escapeHtml(s.name)}</div>
                <div class="book-project-title">${escapeHtml(s.title)}</div>
              </div>

              <div class="book-bottom-footer">
                <span class="book-type-badge">${isHosted ? '🌐 Live Cloud' : '📄 HTML App'}</span>
                <span>${s.size_kb} KB</span>
              </div>
            </div>
          </div>
        </div>
        <div class="book-shelf-stand"></div>
      `;

      // Book Click / Activation Handler
      const bookElem = bookItem.querySelector('.interactive-book');
      bookElem.addEventListener('click', function (e) {
        handleBookActivation(this, e);
      });

      bookElem.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleBookActivation(this, e);
        }
      });

      grid.appendChild(bookItem);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Triggers Magic Chime, Particle Burst, and opens the Reader Modal
   */
  function handleBookActivation(bookElem, evt) {
    // 1. Play Magic Audio
    playMagicChime();

    // 2. Spawn Magic Sparkles at coordinates
    const rect = bookElem.getBoundingClientRect();
    const clickX = evt.clientX || (rect.left + rect.width / 2);
    const clickY = evt.clientY || (rect.top + rect.height / 2);
    spawnSparkleBurst(clickX, clickY);

    // 3. Add Magic CSS animation class
    bookElem.classList.add('clicked-magic');
    setTimeout(() => {
      bookElem.classList.remove('clicked-magic');
    }, 700);

    // 4. Retrieve Book Data
    const roll = bookElem.getAttribute('data-roll');
    const name = bookElem.getAttribute('data-name');
    const title = bookElem.getAttribute('data-title');
    const url = bookElem.getAttribute('data-url');
    const isLink = bookElem.getAttribute('data-islink') === 'true';

    // 5. Open Reader Modal with appropriate presentation
    openReaderModal({ roll, name, title, url, isLink });
  }

  /* ==========================================================================
     5. GRAND ATHENAEUM BOOK READER MODAL
     ========================================================================== */
  function openReaderModal(item) {
    const modalElem = document.getElementById('readerModal');
    if (!modalElem) return;

    const rollBadge = document.getElementById('modal-roll-badge');
    const modalTitle = document.getElementById('modal-book-title');
    const modalSubtitle = document.getElementById('modal-book-subtitle');
    const iframeWrapper = document.getElementById('modal-iframe-wrapper');
    const modalIframe = document.getElementById('reader-project-iframe');
    const hostedLaunchScreen = document.getElementById('modal-hosted-screen');
    const btnOpenExternal = document.getElementById('btn-open-external-tab');
    const hostedRedirectBtn = document.getElementById('btn-hosted-teleport');
    const hostedUrlDisplay = document.getElementById('hosted-url-display');

    if (rollBadge) rollBadge.textContent = item.roll;
    if (modalTitle) modalTitle.textContent = item.name;
    if (modalSubtitle) modalSubtitle.textContent = item.title;

    if (btnOpenExternal) {
      btnOpenExternal.href = item.url;
      btnOpenExternal.target = '_blank';
    }

    if (item.isLink) {
      // It is a Special Hosted Book (Google Cloud / Gemini Link)
      if (iframeWrapper) iframeWrapper.style.display = 'none';
      if (hostedLaunchScreen) {
        hostedLaunchScreen.style.display = 'block';
        if (hostedUrlDisplay) hostedUrlDisplay.textContent = item.url;
        if (hostedRedirectBtn) {
          hostedRedirectBtn.onclick = function () {
            window.open(item.url, '_blank');
          };
        }
      }
    } else {
      // It is a local HTML Student Project
      if (hostedLaunchScreen) hostedLaunchScreen.style.display = 'none';
      if (iframeWrapper) {
        iframeWrapper.style.display = 'block';
        iframeWrapper.className = 'reader-iframe-wrapper'; // reset to 100% desktop
        if (modalIframe) {
          modalIframe.src = item.url;
        }
      }
    }

    // Reset viewport buttons
    document.querySelectorAll('.btn-viewport').forEach(btn => btn.classList.remove('active'));
    const defBtn = document.querySelector('.btn-viewport[data-viewport="desktop"]');
    if (defBtn) defBtn.classList.add('active');

    // Show Bootstrap Modal
    if (window.bootstrap && window.bootstrap.Modal) {
      const bsModal = window.bootstrap.Modal.getOrCreateInstance(modalElem);
      bsModal.show();
    } else {
      // Fallback
      modalElem.style.display = 'block';
      modalElem.classList.add('show');
    }

    showToast(`Opened Book for Roll ${item.roll}: ${item.name}`);
  }

  // Viewport switcher in reader modal
  function initViewportControls() {
    const vpButtons = document.querySelectorAll('.btn-viewport');
    const wrapper = document.getElementById('modal-iframe-wrapper');
    if (!wrapper) return;

    vpButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        vpButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const mode = this.getAttribute('data-viewport');
        wrapper.className = 'reader-iframe-wrapper';
        if (mode === 'mobile') {
          wrapper.classList.add('viewport-mobile');
        } else if (mode === 'tablet') {
          wrapper.classList.add('viewport-tablet');
        }
      });
    });
  }

  /* ==========================================================================
     6. THEME ENGINE (DAYLIGHT PAPER & MIDNIGHT SCHOLAR)
     ========================================================================== */
  function initTheme() {
    const savedTheme = localStorage.getItem('athenaeum_theme') || 'daylight';
    if (savedTheme === 'midnight') {
      document.documentElement.setAttribute('data-theme', 'midnight');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateThemeToggleUI();

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        const isCurrentMidnight = document.documentElement.getAttribute('data-theme') === 'midnight';
        if (isCurrentMidnight) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('athenaeum_theme', 'daylight');
          showToast('Switched to Daylight Reading Mode ☀️');
        } else {
          document.documentElement.setAttribute('data-theme', 'midnight');
          localStorage.setItem('athenaeum_theme', 'midnight');
          showToast('Switched to Midnight Scholar Mode 🌙');
        }
        updateThemeToggleUI();
      });
    }

    // Sound Toggle Button
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      updateSoundToggleUI();
      soundBtn.addEventListener('click', function () {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('athenaeum_sound', isSoundEnabled ? 'active' : 'muted');
        updateSoundToggleUI();
        if (isSoundEnabled) {
          playMagicChime();
          showToast('Magic Sound Activated 🔊');
        } else {
          showToast('Magic Sound Muted 🔇');
        }
      });
    }
  }

  function updateThemeToggleUI() {
    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (!toggleBtn) return;
    const isMidnight = document.documentElement.getAttribute('data-theme') === 'midnight';
    toggleBtn.innerHTML = isMidnight ? '<span>☀️</span> <span>Daylight Mode</span>' : '<span>🌙</span> <span>Midnight Scholar</span>';
  }

  function updateSoundToggleUI() {
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (!soundBtn) return;
    if (isSoundEnabled) {
      soundBtn.classList.remove('muted');
      soundBtn.innerHTML = '<span>🔊</span> <span>Magic Sound: ON</span>';
    } else {
      soundBtn.classList.add('muted');
      soundBtn.innerHTML = '<span>🔇</span> <span>Magic Sound: OFF</span>';
    }
  }

  /* ==========================================================================
     7. SCROLL PROGRESS INDICATOR
     ========================================================================== */
  function initScrollProgress() {
    const progressEl = document.getElementById('scroll-progress');
    if (!progressEl) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressEl.style.width = `${progress}%`;
    });
  }

  /* ==========================================================================
     8. INTERACTIVE PROMPT BUILDER
     ========================================================================== */
  function initPromptBuilder() {
    const roleInput = document.getElementById('pb-role');
    const taskInput = document.getElementById('pb-task');
    const contextInput = document.getElementById('pb-context');
    const formatInput = document.getElementById('pb-format');
    const constraintsInput = document.getElementById('pb-constraints');
    const previewEl = document.getElementById('pb-preview-code');
    const btnCopy = document.getElementById('btn-copy-builder-prompt');

    if (!previewEl) return;

    function assemblePrompt() {
      const r = roleInput ? roleInput.value.trim() : '';
      const t = taskInput ? taskInput.value.trim() : '';
      const c = contextInput ? contextInput.value.trim() : '';
      const f = formatInput ? formatInput.value.trim() : '';
      const con = constraintsInput ? constraintsInput.value.trim() : '';

      const assembled = 
`// Structured C-T-C-O / R-T-C-F-C Enterprise Engineering Prompt:
[ROLE]: ${r}
[TASK]: ${t}
[CONTEXT]: ${c}
[CONSTRAINTS]: ${con}
[FORMAT & SCHEMA]: ${f}`;

      previewEl.textContent = assembled;
    }

    [roleInput, taskInput, contextInput, formatInput, constraintsInput].forEach(inp => {
      if (inp) inp.addEventListener('input', assemblePrompt);
    });

    assemblePrompt();

    if (btnCopy) {
      btnCopy.addEventListener('click', function () {
        const text = previewEl.textContent;
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied Prompt to Clipboard! 📋');
        }).catch(() => {
          showToast('Prompt selected - ready to copy.');
        });
      });
    }
  }

  /* ==========================================================================
     9. BEFORE vs ENGINEERED COMPARISON TOGGLE
     ========================================================================== */
  function initComparisonToggle() {
    const btnBasic = document.getElementById('btn-tab-basic');
    const btnEng = document.getElementById('btn-tab-engineered');
    const promptDisplay = document.getElementById('compare-prompt-display');
    const outputDisplay = document.getElementById('compare-output-display');

    if (!btnBasic || !btnEng || !promptDisplay || !outputDisplay) return;

    const data = {
      basic: {
        prompt: `make a todo app`,
        output: `// Generic monolithic code without validation or persistence
var tasks = [];
function addTask() {
  var val = document.getElementById("input").value;
  tasks.push(val); // No validation against empty string!
  render();
}
function render() {
  var list = document.getElementById("list");
  list.innerHTML = "";
  for (var i = 0; i < tasks.length; i++) {
    list.innerHTML += "<li>" + tasks[i] + "</li>"; // XSS injection risk!
  }
}`,
        metrics: { clarity: '25%', quality: '20%', bugs: '15%', maintainability: '18%', reusability: '10%' }
      },
      engineered: {
        prompt: `// Engineered C-T-C-O Prompt:
[ROLE]: Senior Frontend Architect.
[TASK]: Build a to-do list web component using vanilla HTML, CSS & JS.
[REQUIREMENTS]:
1. Features: Add, delete, toggle complete, and persist in localStorage.
2. Defensive Validation: Block empty submissions with inline error alerts.
3. Accessibility: Full WCAG 2.1 AA keyboard support and aria-live announcements.
4. Modular Structure: Decouple state management, DOM rendering, and storage.
[OUTPUT]: Three cleanly annotated blocks (HTML, CSS, JS) with zero external libraries.`,
        output: `<!-- Production-ready, modular, accessible Web Component -->
<section class="todo-app" aria-labelledby="todo-title">
  <form id="todo-form" aria-label="Add new task">
    <input type="text" id="task-input" aria-required="true" placeholder="Enter task...">
    <button type="submit" aria-label="Add Task">Add</button>
  </form>
  <ul id="task-list" aria-live="polite"></ul>
</section>

<script>
class TodoStore {
  constructor(storageKey = 'todos_v1') {
    this.key = storageKey;
  }
  getTasks() { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
  saveTasks(tasks) { localStorage.setItem(this.key, JSON.stringify(tasks)); }
}
// Clean separation of concerns with full ARIA and localStorage persistence.
</script>`,
        metrics: { clarity: '98%', quality: '95%', bugs: '96%', maintainability: '94%', reusability: '92%' }
      }
    };

    function setComparison(type) {
      if (type === 'basic') {
        btnBasic.classList.add('active');
        btnEng.classList.remove('active');
        promptDisplay.textContent = data.basic.prompt;
        outputDisplay.textContent = data.basic.output;
        updateMetrics(data.basic.metrics, 'basic');
      } else {
        btnEng.classList.add('active');
        btnBasic.classList.remove('active');
        promptDisplay.textContent = data.engineered.prompt;
        outputDisplay.textContent = data.engineered.output;
        updateMetrics(data.engineered.metrics, 'engineered');
      }
    }

    function updateMetrics(m, type) {
      const keys = ['clarity', 'quality', 'bugs', 'maintainability', 'reusability'];
      keys.forEach(k => {
        const bar = document.getElementById(`bar-${k}`);
        const val = document.getElementById(`val-${k}`);
        if (bar && val) {
          bar.style.width = m[k];
          bar.className = `metric-fill ${type}`;
          val.textContent = m[k];
        }
      });
    }

    btnBasic.addEventListener('click', () => setComparison('basic'));
    btnEng.addEventListener('click', () => setComparison('engineered'));

    // Init with engineered
    setComparison('engineered');
  }

  /* ==========================================================================
     10. MODULE 2 SDLC 7-STEP TIMELINE STEPPER
     ========================================================================== */
  const sdlcSteps = {
    1: {
      title: "Step 1: Plan",
      tip: "Define data contracts, system boundaries, and error invariants before opening your AI chat.",
      prompt: "'Decompose this checkout feature into 4 atomic architectural stages with isolated failure boundaries.'"
    },
    2: {
      title: "Step 2: Prompt",
      tip: "Apply the C-T-C-O / R-T-C-F-C framework to generate clear, deterministic code specifications.",
      prompt: "'[ROLE]: Senior Systems Architect. [TASK]: Write CartItem validator with Decimal precision.'"
    },
    3: {
      title: "Step 3: Generate",
      tip: "Review AI output critically: check edge cases, complexity benchmarks, and strict typing.",
      prompt: "'Generate complete implementation without placeholder ellipses; include boundary guards.'"
    },
    4: {
      title: "Step 4: Run & Test",
      tip: "Execute code immediately in an isolated sandbox with automated parameterized test suites.",
      prompt: "'Write a parameterized pytest suite testing empty inputs, negative values, and max boundary integers.'"
    },
    5: {
      title: "Step 5: Debug",
      tip: "Feed exact stack traces and expected-versus-actual behavior back into the model for root cause analysis.",
      prompt: "'Analyze this IndexError root cause; explain why the pointer slipped and provide a regression test.'"
    },
    6: {
      title: "Step 6: Refine",
      tip: "Refactor working logic into clean, decoupled functions adhering to SOLID and clean code standards.",
      prompt: "'Refactor this 80-line function into 3 single-responsibility methods with cyclomatic complexity under 4.'"
    },
    7: {
      title: "Step 7: Ship",
      tip: "Verify documentation, accessibility, WCAG compliance, and deploy to production.",
      prompt: "'Generate deployment checklist and verify zero external unverified dependencies.'"
    }
  };

  function initSDLCStepper() {
    const nodes = document.querySelectorAll('.sdlc-step-node');
    const tipTitle = document.getElementById('timeline-tip-title');
    const tipText = document.getElementById('timeline-tip-text');
    const tipPrompt = document.getElementById('timeline-tip-prompt');

    if (nodes.length === 0) return;

    nodes.forEach(node => {
      node.addEventListener('click', function () {
        nodes.forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const stepNum = this.getAttribute('data-step');
        const data = sdlcSteps[stepNum];
        if (data && tipTitle && tipText && tipPrompt) {
          tipTitle.textContent = data.title;
          tipText.textContent = data.tip;
          tipPrompt.textContent = data.prompt;
        }
      });
    });
  }

  /* ==========================================================================
     11. QUICK QUIZ ENGINE
     ========================================================================== */
  const quizData = [
    {
      q: "What does the 'C' in the foundational C-T-C-O prompting formula stand for?",
      options: [
        "Code and Compiler",
        "Context and Constraints",
        "Control and Computation",
        "Character and Comments"
      ],
      correct: 1,
      explanation: "In C-T-C-O, the two C's represent Context (the environment and inputs) and Constraints (the strict non-negotiable rules)."
    },
    {
      q: "Why does prompting 'fix this error' usually lead to poor software quality?",
      options: [
        "Because AI models do not read tracebacks",
        "Because it treats symptoms without root cause analysis, often adding fragile patches",
        "Because modern compilers forbid AI patches",
        "Because Python errors cannot be fixed automatically"
      ],
      correct: 1,
      explanation: "Without providing execution context, expected behavior, and asking for root-cause analysis, the AI applies superficial band-aids."
    },
    {
      q: "What is the primary risk of using standard floating-point numbers in financial code?",
      options: [
        "Syntax error at compile time",
        "Binary floating-point drift leading to rounding discrepancies (e.g. 0.1 + 0.2 != 0.3)",
        "Database connections close automatically",
        "Slow CPU cache misses"
      ],
      correct: 1,
      explanation: "Standard IEEE 754 floats cause fractional rounding drift; financial systems enforce Decimal arithmetic."
    },
    {
      q: "In prompt engineering, what is the role of the [FORMAT] block?",
      options: [
        "To dictate font size and page margins",
        "To enforce output schema (e.g., pure typed Python, JSON without markdown, separate files)",
        "To format the hard drive before compilation",
        "To choose between light and dark themes"
      ],
      correct: 1,
      explanation: "The Format block guarantees the exact syntax structure and forbids conversational pleasantries or markdown clutter."
    },
    {
      q: "When prompting for code refactoring, which invariant must ALWAYS be protected?",
      options: [
        "Behavioral equivalence (the external observable behavior must not break)",
        "Line numbers must stay identical",
        "Variable names must remain one character long",
        "All classes must be converted to global functions"
      ],
      correct: 0,
      explanation: "Refactoring improves internal structure without altering external observable behavior."
    }
  ];

  let currentQuizIdx = 0;
  let quizScore = 0;

  function initQuiz() {
    const qNum = document.getElementById('quiz-q-num');
    const qText = document.getElementById('quiz-question-text');
    const optList = document.getElementById('quiz-options-list');
    const feedback = document.getElementById('quiz-feedback');
    const btnNext = document.getElementById('btn-quiz-next');
    const scoreDisplay = document.getElementById('quiz-score-display');

    if (!qText || !optList) return;

    function renderQuestion(idx) {
      const q = quizData[idx];
      if (qNum) qNum.textContent = `Question ${idx + 1} of ${quizData.length}`;
      qText.textContent = q.q;
      optList.innerHTML = '';
      if (feedback) feedback.innerHTML = '';
      if (btnNext) btnNext.disabled = true;

      q.options.forEach((opt, oIdx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `<span style="font-weight: 700; opacity: 0.7;">${String.fromCharCode(65 + oIdx)}.</span> <span>${opt}</span>`;
        btn.addEventListener('click', () => handleOptionClick(oIdx, btn));
        optList.appendChild(btn);
      });
    }

    function handleOptionClick(selectedIdx, clickedBtn) {
      const q = quizData[currentQuizIdx];
      const allBtns = optList.querySelectorAll('.quiz-option-btn');
      allBtns.forEach(b => b.disabled = true);

      if (selectedIdx === q.correct) {
        clickedBtn.classList.add('selected-correct');
        quizScore++;
        playMagicChime();
        if (feedback) {
          feedback.innerHTML = `<div style="color: var(--accent-emerald); font-weight: 600; margin-top: 1rem;">✅ Correct! ${q.explanation}</div>`;
        }
      } else {
        clickedBtn.classList.add('selected-incorrect');
        if (allBtns[q.correct]) allBtns[q.correct].classList.add('selected-correct');
        if (feedback) {
          feedback.innerHTML = `<div style="color: var(--accent-crimson); font-weight: 600; margin-top: 1rem;">❌ Incorrect. ${q.explanation}</div>`;
        }
      }

      if (btnNext) btnNext.disabled = false;
      if (scoreDisplay) scoreDisplay.textContent = `Current Score: ${quizScore} / ${currentQuizIdx + 1}`;
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        currentQuizIdx++;
        if (currentQuizIdx < quizData.length) {
          renderQuestion(currentQuizIdx);
        } else {
          showQuizSummary();
        }
      });
    }

    function showQuizSummary() {
      if (qNum) qNum.textContent = 'Quiz Completed';
      qText.textContent = `You scored ${quizScore} out of ${quizData.length}!`;
      optList.innerHTML = '';
      if (quizScore >= 4) {
        spawnSparkleBurst(window.innerWidth / 2, window.innerHeight / 2);
        showToast('🎉 Mastery Achieved! Excellent prompt engineering instincts.');
      }
      if (feedback) {
        feedback.innerHTML = `
          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 1.5rem; text-align: center;">
            <p style="font-size: 1.1rem; color: var(--ink-primary); margin-bottom: 1rem;">
              ${quizScore >= 4 ? '🌟 Outstanding work! You have mastered the foundational engineering invariants.' : '📚 Good effort! Review the C-T-C-O and SDLC sections above to sharpen your skills.'}
            </p>
            <button class="btn-primary" id="btn-restart-quiz" style="padding: 0.6rem 1.5rem; border-radius: 50px; background: var(--accent-navy); color: #fff; border: none; cursor: pointer;">
              Restart Quiz 🔄
            </button>
          </div>
        `;
        const restartBtn = document.getElementById('btn-restart-quiz');
        if (restartBtn) {
          restartBtn.addEventListener('click', () => {
            currentQuizIdx = 0;
            quizScore = 0;
            renderQuestion(0);
          });
        }
      }
      if (btnNext) btnNext.style.display = 'none';
    }

    renderQuestion(0);
  }

  /* ==========================================================================
     12. CHEAT SHEET COPY BUTTONS & PRONUNCIATIONS
     ========================================================================== */
  function initCheatSheetAndAudio() {
    document.querySelectorAll('.btn-copy-template').forEach(btn => {
      btn.addEventListener('click', function () {
        const text = this.closest('.cheat-card').querySelector('.cheat-code-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
          showToast('Template Copied to Clipboard! 📋');
        });
      });
    });

    document.querySelectorAll('.btn-pronounce').forEach(btn => {
      btn.addEventListener('click', function () {
        const file = this.getAttribute('data-audio');
        if (file) playPronunciation(file);
      });
    });
  }

  /* ==========================================================================
     13. INITIALIZATION ON DOM READY
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScrollProgress();
    initSection9Bookshelf();
    initViewportControls();
    initPromptBuilder();
    initComparisonToggle();
    initSDLCStepper();
    initQuiz();
    initCheatSheetAndAudio();
  });

})();
