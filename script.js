// ============================================================
// PROMPT ENGINEERING FOR DEVELOPERS - VERSION 2 JAVASCRIPT
// Three.js 3D Background + GSAP ScrollTrigger + Interactive Tools
// 100% Static & GitHub Pages Ready
// ============================================================

// Safe global Three.js instance from CDN
const THREE = window.THREE || null;

// Global state
const state = {
  is3DEnabled: true,
  isSoundEnabled: true,
  audioCtx: null,
  mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
  activeCompareMode: 'engineered'
};

// ============================================================
// 1. SOUND SYNTHESIS ENGINE (Web Audio API)
// ============================================================
function initAudio() {
  if (!state.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioCtx();
  }
}

function playSound(type) {
  if (!state.isSoundEnabled) return;
  initAudio();
  if (!state.audioCtx) return;
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

  const now = state.audioCtx.currentTime;
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();

  if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(state.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'whoosh') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(state.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } else if (type === 'success') {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const o = state.audioCtx.createOscillator();
      const g = state.audioCtx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + idx * 0.06);
      g.gain.setValueAtTime(0.06, now + idx * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      o.connect(g);
      g.connect(state.audioCtx.destination);
      o.start(now + idx * 0.06);
      o.stop(now + idx * 0.06 + 0.22);
    });
  }
}

// ============================================================
// 2. THREE.JS 3D HERO & SCROLL SCENE
// ============================================================
let renderer, scene, camera, coreMesh, wireframeMesh, particleSystem, tokenGroup;
let isRendering = true;

function init3DScene() {
  const canvas = document.getElementById('bg-3d-canvas');
  if (!canvas || !THREE) return;

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    state.is3DEnabled = false;
    canvas.style.display = 'none';
    return;
  }

  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 18);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 1. Centerpiece: Neural Network Icosahedron Core
  const coreGeo = new THREE.IcosahedronGeometry(4, 2);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.28
  });
  coreMesh = new THREE.Mesh(coreGeo, coreMat);
  scene.add(coreMesh);

  // Inner pulsing sphere
  const innerGeo = new THREE.SphereGeometry(2.4, 24, 24);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x8a5cff,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  wireframeMesh = new THREE.Mesh(innerGeo, innerMat);
  coreMesh.add(wireframeMesh);

  // Glowing Outer Orbital Rings
  const ringGeo = new THREE.TorusGeometry(5.8, 0.04, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3df2, transparent: true, opacity: 0.5 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 3;
  coreMesh.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00ff9d, transparent: true, opacity: 0.45 }));
  ring2.rotation.y = Math.PI / 4;
  coreMesh.add(ring2);

  // 2. Floating 3D Code Tokens
  tokenGroup = new THREE.Group();
  const tokens = ['{ }', '</>', '=>', ';', 'fn()', 'async', 'return'];
  tokens.forEach((text, i) => {
    const sprite = createTokenSprite(text);
    const angle = (i / tokens.length) * Math.PI * 2;
    const radius = 8.5 + Math.random() * 3;
    sprite.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 8, Math.sin(angle) * radius);
    tokenGroup.add(sprite);
  });
  scene.add(tokenGroup);

  // 3. Deep Particle Starfield
  const partCount = 800;
  const partGeo = new THREE.BufferGeometry();
  const partPositions = new Float32Array(partCount * 3);
  const partColors = new Float32Array(partCount * 3);

  for (let i = 0; i < partCount * 3; i += 3) {
    partPositions[i] = (Math.random() - 0.5) * 80;
    partPositions[i + 1] = (Math.random() - 0.5) * 80;
    partPositions[i + 2] = (Math.random() - 0.5) * 60 - 10;

    // Cyan / Violet color mixing
    if (Math.random() > 0.5) {
      partColors[i] = 0; partColors[i + 1] = 0.94; partColors[i + 2] = 1;
    } else {
      partColors[i] = 0.54; partColors[i + 1] = 0.36; partColors[i + 2] = 1;
    }
  }

  partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
  partGeo.setAttribute('color', new THREE.BufferAttribute(partColors, 3));

  const partMat = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(partGeo, partMat);
  scene.add(particleSystem);

  // Window Resize
  window.addEventListener('resize', onWindowResize);

  // Mouse Move listener for 3D tilt
  window.addEventListener('mousemove', (e) => {
    state.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    state.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Tab visibility check for performance
  document.addEventListener('visibilitychange', () => {
    isRendering = !document.hidden;
  });

  // Start Animation Loop
  animate3D();

  // Connect GSAP ScrollTrigger if available
  setupScrollDriven3D();
}

function createTokenSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 44px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 12;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3, 1.5, 1);
  return sprite;
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate3D() {
  if (!isRendering || !state.is3DEnabled) return;
  requestAnimationFrame(animate3D);

  // Smooth mouse interpolation
  state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
  state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

  // Rotate Core
  if (coreMesh) {
    coreMesh.rotation.y += 0.003;
    coreMesh.rotation.x += 0.0015;
    coreMesh.rotation.y += state.mouse.x * 0.01;
    coreMesh.rotation.x -= state.mouse.y * 0.01;
  }

  if (wireframeMesh) {
    wireframeMesh.rotation.y -= 0.005;
  }

  // Orbit Tokens
  if (tokenGroup) {
    tokenGroup.rotation.y += 0.002;
    tokenGroup.rotation.x = state.mouse.y * 0.2;
  }

  // Drift starfield
  if (particleSystem) {
    particleSystem.rotation.y += 0.0004;
  }

  renderer.render(scene, camera);
}

// GSAP ScrollTrigger Integration for 3D Camera & Scene
function setupScrollDriven3D() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Camera flight and core position linked to scroll
  gsap.to(camera.position, {
    z: 10,
    y: -4,
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2
    }
  });

  // Morph core color across sections
  ScrollTrigger.create({
    trigger: '#basic-vs-engineered',
    start: 'top center',
    onEnter: () => {
      if (coreMesh) coreMesh.material.color.setHex(0xff3df2);
    },
    onLeaveBack: () => {
      if (coreMesh) coreMesh.material.color.setHex(0x00f0ff);
    }
  });

  ScrollTrigger.create({
    trigger: '#prompt-formula',
    start: 'top center',
    onEnter: () => {
      if (coreMesh) coreMesh.material.color.setHex(0x8a5cff);
    },
    onLeaveBack: () => {
      if (coreMesh) coreMesh.material.color.setHex(0xff3df2);
    }
  });

  ScrollTrigger.create({
    trigger: '#module-1',
    start: 'top center',
    onEnter: () => {
      if (coreMesh) coreMesh.material.color.setHex(0x00ff9d);
    },
    onLeaveBack: () => {
      if (coreMesh) coreMesh.material.color.setHex(0x8a5cff);
    }
  });
}

// 3D Shockwave Ripple on Click
window.addEventListener('click', (e) => {
  if (!state.is3DEnabled || !camera) return;
  playSound('click');

  if (coreMesh) {
    gsap.to(coreMesh.scale, {
      x: 1.15,
      y: 1.15,
      z: 1.15,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out'
    });
  }
});

// Toggle 3D Button Handler
function init3DToggle() {
  const toggleBtn = document.getElementById('btn-toggle-3d');
  const canvas = document.getElementById('bg-3d-canvas');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    state.is3DEnabled = !state.is3DEnabled;
    toggleBtn.innerHTML = state.is3DEnabled ? '<span>🔮</span> <span>3D ON</span>' : '<span>🔮</span> <span>3D OFF</span>';
    toggleBtn.classList.toggle('active', state.is3DEnabled);
    if (canvas) canvas.style.display = state.is3DEnabled ? 'block' : 'none';
    if (state.is3DEnabled) animate3D();
    showToast(state.is3DEnabled ? '3D Visual Engine Enabled' : '3D Effects Disabled for Low-Power Mode');
  });
}

// ============================================================
// 3. HERO TYPEWRITER EFFECT
// ============================================================
function initHeroTypewriter() {
  const target = document.getElementById('typewriter-text');
  if (!target) return;

  const phrases = [
    'Stop asking. Start engineering.',
    'Generate. Debug. Refactor. Ship.',
    'From vague hallucinations to production-grade code.',
    'Master the 5-Block Prompt Engineering Framework.'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const current = phrases[phraseIndex];
    if (isDeleting) {
      target.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      target.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 30 : 65;

    if (!isDeleting && charIndex === current.length) {
      typeSpeed = 2200; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

// ============================================================
// 4. ANIMATED STAT COUNTERS
// ============================================================
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalVal = parseInt(target.getAttribute('data-target') || '10', 10);
        const prefix = target.getAttribute('data-prefix') || '';
        const suffix = target.getAttribute('data-suffix') || '';

        let current = 0;
        const step = Math.max(1, Math.floor(finalVal / 30));
        const timer = setInterval(() => {
          current += step;
          if (current >= finalVal) {
            current = finalVal;
            clearInterval(timer);
          }
          target.textContent = `${prefix}${current}${suffix}`;
        }, 35);

        obs.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ============================================================
// 5. SECTION 3: BASIC vs. ENGINEERED CENTERPIECE
// ============================================================
const COMPARE_DATA = {
  basic: {
    prompt: `// Basic Prompt:\n"make a todo app"`,
    output: `<!-- Vague, monolithic, unvalidated -->
<div id="app">
  <input id="input">
  <button onclick="add()">Add</button>
  <ul id="list"></ul>
</div>
<script>
// Fragile globals, no localStorage, no keyboard support
function add() {
  var val = document.getElementById('input').value;
  var li = document.createElement('li');
  li.innerText = val; // Vulnerable to empty input
  document.getElementById('list').appendChild(li);
}
</script>`,
    metrics: { clarity: 20, quality: 25, bugs: 15, maintainability: 30, reusability: 10 }
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
    metrics: { clarity: 98, quality: 95, bugs: 96, maintainability: 94, reusability: 92 }
  }
};

let compareTypingInterval = null;

function initCenterpieceCompare() {
  const btnBasic = document.getElementById('btn-tab-basic');
  const btnEng = document.getElementById('btn-tab-engineered');
  const promptBox = document.getElementById('compare-prompt-display');
  const outputBox = document.getElementById('compare-output-display');

  function render(mode) {
    state.activeCompareMode = mode;
    playSound('whoosh');

    if (btnBasic) btnBasic.classList.toggle('active', mode === 'basic');
    if (btnEng) btnEng.classList.toggle('active', mode === 'engineered');

    const data = COMPARE_DATA[mode];
    if (promptBox) promptBox.textContent = data.prompt;

    // Typewriter effect for output box
    if (outputBox) {
      if (compareTypingInterval) clearInterval(compareTypingInterval);
      outputBox.textContent = '';
      let charIdx = 0;
      const text = data.output;
      compareTypingInterval = setInterval(() => {
        charIdx += 30;
        outputBox.textContent = text.slice(0, charIdx);
        if (charIdx >= text.length) {
          clearInterval(compareTypingInterval);
          outputBox.textContent = text;
        }
      }, 15);
    }

    // Animate Metric Bars
    updateMetricBars(data.metrics, mode);
  }

  if (btnBasic) btnBasic.addEventListener('click', () => render('basic'));
  if (btnEng) btnEng.addEventListener('click', () => render('engineered'));

  render('engineered');
}

function updateMetricBars(metrics, mode) {
  Object.keys(metrics).forEach(key => {
    const fillEl = document.getElementById(`bar-${key}`);
    const valEl = document.getElementById(`val-${key}`);
    if (fillEl && valEl) {
      const val = metrics[key];
      fillEl.style.width = `${val}%`;
      fillEl.className = `metric-fill ${mode}`;
      valEl.textContent = `${val}%`;
    }
  });
}

// ============================================================
// 6. SECTION 4: THE PROMPT FORMULA (R-T-C-F-C) & BUILDER
// ============================================================
function initPromptFormula() {
  // Flip cards
  document.querySelectorAll('.formula-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('click');
      card.classList.toggle('flipped');
    });
  });

  // Prompt Builder Tool
  const roleInput = document.getElementById('pb-role');
  const taskInput = document.getElementById('pb-task');
  const ctxInput = document.getElementById('pb-context');
  const fmtInput = document.getElementById('pb-format');
  const constrInput = document.getElementById('pb-constraints');
  const previewBox = document.getElementById('pb-preview-code');
  const copyBtn = document.getElementById('btn-copy-builder-prompt');

  function updatePreview() {
    const role = roleInput?.value.trim() || 'Principal Systems Engineer';
    const task = taskInput?.value.trim() || 'Build a resilient caching service';
    const ctx = ctxInput?.value.trim() || 'Node.js 20+ microservice environment with Redis cluster';
    const fmt = fmtInput?.value.trim() || 'TypeScript class with Jest unit tests and docstrings';
    const constr = constrInput?.value.trim() || 'Time complexity O(1), memory cap 64MB, zero external libs';

    const assembled = `[ROLE]: ${role}
[TASK]: ${task}
[CONTEXT]: ${ctx}
[FORMAT]: ${fmt}
[CONSTRAINTS]: ${constr}`;

    if (previewBox) previewBox.textContent = assembled;
  }

  [roleInput, taskInput, ctxInput, fmtInput, constrInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updatePreview);
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = previewBox?.textContent;
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          playSound('success');
          showToast('Engineered Prompt Copied to Clipboard!');
        });
      }
    });
  }

  updatePreview();
}

// ============================================================
// 7. SECTION 5: MODULE 1 TABS & ANIMATED CODE DIFF
// ============================================================
function initModule1Tabs() {
  const tabs = document.querySelectorAll('.btn-module-tab');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('whoosh');
      const targetId = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.toggle('active', t === tab));
      panes.forEach(p => p.classList.toggle('active-pane', p.id === targetId));
    });
  });
}

// ============================================================
// 8. SECTION 6: MODULE 2 WORKFLOW TIMELINE & MINI DEMO
// ============================================================
const TIMELINE_TIPS = {
  1: { title: "Step 1: Plan", tip: "Map data contracts and error boundaries before opening your AI chat.", prompt: "'Given this functional requirement, decompose it into 4 atomic architectural stages.'" },
  2: { title: "Step 2: Prompt", tip: "Apply the C-T-C-O formula. Always state constraints (e.g. no floats, Big-O limits).", prompt: "'Act as a backend lead. Write a Python function using Decimal math with zero external packages.'" },
  3: { title: "Step 3: Generate", tip: "Generate in bite-sized modules rather than an entire application in one shot.", prompt: "'Implement only the repository layer with defensive file reading for now.'" },
  4: { title: "Step 4: Run & Test", tip: "Execute code immediately. Generate test suites in tandem with the business logic.", prompt: "'Write 5 parameterized pytest cases testing edge cases: negative amounts and empty lists.'" },
  5: { title: "Step 5: Debug", tip: "Feed the exact traceback and observed behavior. Never say just 'fix this'.", prompt: "'Analyze this ClientConnectorError stack trace. 1) Identify root cause. 2) Provide a rate-limited patch.'" },
  6: { title: "Step 6: Refine", tip: "Refactor for readability, SOLID principles, and accessibility standards.", prompt: "'Refactor this function to the Strategy Pattern to decouple SMS, Email, and Slack channels.'" },
  7: { title: "Step 7: Ship", tip: "Audit generated code for security vulnerabilities, secrets, and licensing compliance.", prompt: "'Perform a security and edge-case audit on this code snippet prior to deployment.'" }
};

function initWorkflowTimeline() {
  const nodes = document.querySelectorAll('.timeline-node');
  const tipTitle = document.getElementById('timeline-tip-title');
  const tipText = document.getElementById('timeline-tip-text');
  const tipPrompt = document.getElementById('timeline-tip-prompt');

  nodes.forEach(node => {
    node.addEventListener('click', (e) => {
      e.preventDefault();
      playSound('click');
      const step = node.getAttribute('data-step');
      nodes.forEach(n => n.classList.toggle('active', n === node));

      const data = TIMELINE_TIPS[step];
      if (data) {
        if (tipTitle) tipTitle.textContent = data.title;
        if (tipText) tipText.textContent = data.tip;
        if (tipPrompt) tipPrompt.textContent = data.prompt;
      }
    });
  });

  // Live Sandboxed Demo: Interactive Cyber Theme Switcher
  const demoSwitch = document.getElementById('demo-theme-btn');
  const demoBox = document.getElementById('demo-sandbox-box');
  let isDemoCyan = true;

  if (demoSwitch && demoBox) {
    demoSwitch.addEventListener('click', () => {
      playSound('click');
      isDemoCyan = !isDemoCyan;
      demoBox.style.borderColor = isDemoCyan ? 'var(--neon-cyan)' : 'var(--neon-magenta)';
      demoBox.style.boxShadow = isDemoCyan ? 'var(--glow-cyan)' : 'var(--glow-magenta)';
      demoSwitch.textContent = isDemoCyan ? 'Switch to Neon Magenta' : 'Switch to Neon Cyan';
    });
  }
}

// ============================================================
// 9. SECTION 7: BEFORE vs. AFTER SKILL METER
// ============================================================
function initSkillMeters() {
  const cards = document.querySelectorAll('.skill-meter-card');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const progressEl = card.querySelector('.radial-progress');
        const textEl = card.querySelector('.radial-text');
        const targetPercent = parseInt(card.getAttribute('data-percent') || '90', 10);

        if (progressEl) {
          const circumference = 2 * Math.PI * 45; // r=45 -> ~283
          const offset = circumference - (targetPercent / 100) * circumference;
          progressEl.style.strokeDashoffset = offset;
        }

        if (textEl) {
          let curr = 0;
          const timer = setInterval(() => {
            curr += 2;
            if (curr >= targetPercent) {
              curr = targetPercent;
              clearInterval(timer);
            }
            textEl.textContent = `${curr}%`;
          }, 25);
        }

        obs.unobserve(card);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(c => observer.observe(c));
}

// ============================================================
// 10. SECTION 8: PROMPT CHEAT SHEET COPY BUTTONS
// ============================================================
function initCheatSheet() {
  document.querySelectorAll('.btn-copy-cheat').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.cheat-card');
      const text = card?.querySelector('.cheat-prompt-text')?.textContent;
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          playSound('success');
          showToast('Template Copied to Clipboard!');
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy', 2000);
        });
      }
    });
  });
}

// ============================================================
// 11. SECTION 9: QUICK QUIZ & CONFETTI ENGINE
// ============================================================
const QUIZ_QUESTIONS = [
  {
    q: "Why is a basic prompt like 'make a discount calculator' dangerous for production code?",
    options: [
      "AI models cannot write math functions.",
      "It defaults to IEEE 754 floats causing binary rounding drift and misses boundary checks.",
      "It takes longer to type than writing manual code.",
      "It requires a paid API subscription."
    ],
    answer: 1,
    explanation: "Standard binary floats cannot represent decimals like 0.1 accurately. Engineered prompts specify Decimal arithmetic and invariant boundary validation."
  },
  {
    q: "What does the 'C' in the R-T-C-F-C prompt formula stand for?",
    options: [
      "Compiler and Compute",
      "Context and Constraints",
      "Code and Certification",
      "Condition and Class"
    ],
    answer: 1,
    explanation: "The two C's represent Context (runtime environment, schemas) and Constraints (invariants, complexity, typing)."
  },
  {
    q: "When debugging an asynchronous socket crash with AI, what is the most critical item to include in your prompt?",
    options: [
      "Only the line number.",
      "The full stack trace, observed concurrency behavior, and reproducible sample.",
      "A request to 'make it fast'.",
      "The CPU clock speed."
    ],
    answer: 1,
    explanation: "AI needs the exact traceback and execution profile to diagnose race conditions and recommend rate limiters like asyncio.Semaphore."
  },
  {
    q: "What design pattern did we use to refactor the monolithic 120-line notification function?",
    options: [
      "Singleton Pattern",
      "Strategy Pattern with Dependency Injection",
      "Prototype Pattern",
      "Decorator Pattern"
    ],
    answer: 1,
    explanation: "The Strategy Pattern isolates each delivery channel (Email, SMS, Slack) behind an interface, complying with the Open/Closed Principle."
  },
  {
    q: "Why should multi-step applications be engineered across staged prompting milestones?",
    options: [
      "To prevent context overflow, verify architecture early, and avoid hallucinations.",
      "AI models only allow 10 lines of code per turn.",
      "It makes the code run faster on the CPU.",
      "Because GitHub Pages requires separate commits."
    ],
    answer: 0,
    explanation: "Iterative scaffolding (Model -> Domain -> CLI -> Tests) ensures each layer is verified before adding dependencies."
  }
];

let currentQuizIdx = 0;
let userScore = 0;

function initQuiz() {
  const qNumEl = document.getElementById('quiz-q-num');
  const qTextEl = document.getElementById('quiz-question-text');
  const optList = document.getElementById('quiz-options-list');
  const feedbackEl = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('btn-quiz-next');
  const scoreEl = document.getElementById('quiz-score-display');

  function renderQuestion(idx) {
    if (idx >= QUIZ_QUESTIONS.length) {
      showQuizResults();
      return;
    }

    const item = QUIZ_QUESTIONS[idx];
    if (qNumEl) qNumEl.textContent = `Question ${idx + 1} of ${QUIZ_QUESTIONS.length}`;
    if (qTextEl) qTextEl.textContent = item.q;
    if (feedbackEl) {
      feedbackEl.className = 'quiz-feedback';
      feedbackEl.textContent = '';
    }
    if (nextBtn) nextBtn.disabled = true;

    if (optList) {
      optList.innerHTML = '';
      item.options.forEach((optText, oIdx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = optText;
        btn.addEventListener('click', () => handleAnswer(oIdx, btn));
        optList.appendChild(btn);
      });
    }
  }

  function handleAnswer(selectedIndex, clickedBtn) {
    const item = QUIZ_QUESTIONS[currentQuizIdx];
    const allBtns = optList.querySelectorAll('.quiz-option-btn');
    allBtns.forEach(b => b.disabled = true);

    if (selectedIndex === item.answer) {
      userScore++;
      clickedBtn.classList.add('correct');
      playSound('success');
      feedbackEl.textContent = `✅ Correct! ${item.explanation}`;
      feedbackEl.style.color = 'var(--neon-green)';
    } else {
      clickedBtn.classList.add('incorrect');
      allBtns[item.answer].classList.add('correct');
      playSound('click');
      feedbackEl.textContent = `❌ Incorrect. ${item.explanation}`;
      feedbackEl.style.color = 'var(--neon-red)';
    }

    feedbackEl.classList.add('show');
    if (nextBtn) nextBtn.disabled = false;
  }

  function showQuizResults() {
    if (qTextEl) qTextEl.textContent = `Quiz Complete! You scored ${userScore} out of ${QUIZ_QUESTIONS.length}.`;
    if (qNumEl) qNumEl.textContent = "RESULT SCORE";
    if (optList) optList.innerHTML = `<div style="text-align: center; padding: 2rem; font-size: 1.2rem; color: var(--neon-cyan);">${userScore >= 4 ? '🎉 Outstanding Prompt Engineer Mastery!' : 'Keep practicing the C-T-C-O framework!'}</div>`;
    if (feedbackEl) feedbackEl.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    if (userScore >= 4) {
      launchConfetti();
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playSound('click');
      currentQuizIdx++;
      renderQuestion(currentQuizIdx);
    });
  }

  renderQuestion(0);
}

// Canvas Confetti Burst
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 120;
  const particles = [];
  const colors = ['#00f0ff', '#8a5cff', '#ff3df2', '#00ff9d', '#ffb800'];

  for (let i = 0; i < confettiCount; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      radius: Math.random() * 6 + 4,
      rotation: Math.random() * 360,
      alpha: 1
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.alpha -= 0.012;

      if (p.alpha > 0) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.5);
        ctx.restore();
      }
    });

    if (activeCount > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  renderConfetti();
}

// ============================================================
// 12. UTILITIES: TOAST NOTIFICATIONS & NAVBAR SCROLL
// ============================================================
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const progress = document.getElementById('scroll-progress');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], article[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (scrollY / maxScroll) * 100;
    if (progress) progress.style.width = `${pct}%`;

    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 60);
    }

    // Scroll spy
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  });

  // Mobile hamburger
  const hamburger = document.querySelector('.hamburger-btn');
  const menu = document.querySelector('.nav-links');
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('open');
      playSound('click');
    });
    menu.querySelectorAll('.nav-link').forEach(l => {
      l.addEventListener('click', () => menu.classList.remove('open'));
    });
  }
}

// Custom Cursor Follower
function initCursorFollower() {
  const dot = document.querySelector('.cursor-dot');
  const follower = document.querySelector('.cursor-follower');
  if (!dot || !follower) return;

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover expansion on interactive elements
  document.querySelectorAll('a, button, input, .formula-card, .btn-module-tab').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.style.width = '52px';
      follower.style.height = '52px';
      follower.style.borderColor = 'var(--neon-cyan)';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width = '34px';
      follower.style.height = '34px';
      follower.style.borderColor = 'rgba(0, 240, 255, 0.6)';
    });
  });
}

// ============================================================
// INITIALIZATION ENTRY POINT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  init3DScene();
  init3DToggle();
  initHeroTypewriter();
  initStatCounters();
  initCenterpieceCompare();
  initPromptFormula();
  initModule1Tabs();
  initWorkflowTimeline();
  initSkillMeters();
  initCheatSheet();
  initQuiz();
  initNavbar();
  initCursorFollower();
});
