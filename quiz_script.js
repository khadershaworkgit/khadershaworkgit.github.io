/**
 * SECURE PROCTORED QUIZ ASSESSMENT CONTROLLER (V2 - SMART IFRAME DETECTION)
 * Fixes:
 * - Solved false-positive blur strikes when clicking/typing inside the Google Form iframe!
 * - True tab-switch detection via Page Visibility API (document.visibilityState)
 * - Single-strike tracking on fullscreen exit with grace periods
 * - Full anti-copy, anti-paste, anti-devtools, and hotkey security
 */

(function () {
  'use strict';

  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */
  const state = {
    isExamActive: false,
    studentName: '',
    studentSection: '',
    studentRoll: '',
    startTime: null,
    timerInterval: null,
    violationCount: 0,
    maxViolations: 3,
    lastViolationTime: 0,
    isSoundMuted: false,
    isOverlayOpen: false,
    isGracePeriod: false,
    isFullscreenViolationActive: false,
    incidentLogs: []
  };

  let isMouseOverIframe = false;

  /* ==========================================================================
     AUDIO ALERT SYNTHESIZER (WEB AUDIO API BUZZER)
     ========================================================================== */
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSecurityBuzzer() {
    if (state.isSoundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Urgent double-beep security buzzer
      [0, 0.18].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now + offset); // A5 high beep
        osc.frequency.exponentialRampToValueAtTime(440, now + offset + 0.12);

        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } catch (e) {
      console.warn('Audio buzzer note:', e);
    }
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showCopyBlockToast(message) {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2200);
  }

  /* ==========================================================================
     INCIDENT LOGGING
     ========================================================================== */
  function logIncident(type, details, isViolation = false) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const entry = {
      timestamp: timeStr,
      type: type,
      details: details,
      isViolation: isViolation
    };

    state.incidentLogs.push(entry);

    const logContainer = document.getElementById('incident-log-content');
    if (logContainer) {
      const div = document.createElement('div');
      div.className = `log-entry ${isViolation ? 'violation' : ''}`;
      div.innerHTML = `[${timeStr}] <strong>${type}</strong>: ${details}`;
      logContainer.appendChild(div);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

  /* ==========================================================================
     VIOLATION HANDLING & LOCKOUT
     ========================================================================== */
  function triggerViolation(reason) {
    // Guards: Do not trigger if exam not active, or if overlay is already open, or during grace period
    if (!state.isExamActive || state.isOverlayOpen || state.isGracePeriod) return;

    // Minimum 2 seconds debouncing between consecutive violations
    const now = Date.now();
    if (now - state.lastViolationTime < 2000) {
      return;
    }
    state.lastViolationTime = now;

    state.violationCount++;
    state.isOverlayOpen = true;

    logIncident('SECURITY VIOLATION', reason, true);
    playSecurityBuzzer();
    updateStrikeUI();

    // Check if max violations reached
    if (state.violationCount >= state.maxViolations) {
      lockoutStudent();
      return;
    }

    // Show violation overlay warning
    const overlay = document.getElementById('violation-overlay');
    const reasonText = document.getElementById('violation-reason-text');
    const strikeText = document.getElementById('violation-strike-display');

    if (reasonText) reasonText.textContent = reason;
    if (strikeText) strikeText.textContent = `Strike ${state.violationCount} of ${state.maxViolations}`;
    if (overlay) overlay.style.display = 'flex';
  }

  function updateStrikeUI() {
    const badge = document.getElementById('hud-strikes-badge');
    if (!badge) return;

    badge.textContent = `Strikes: ${state.violationCount} / ${state.maxViolations}`;

    if (state.violationCount === 0) {
      badge.className = 'hud-strike-badge clean';
    } else if (state.violationCount === 1) {
      badge.className = 'hud-strike-badge warning';
    } else {
      badge.className = 'hud-strike-badge danger';
    }
  }

  function lockoutStudent() {
    state.isExamActive = false;
    clearInterval(state.timerInterval);

    // Close violation overlay
    const overlay = document.getElementById('violation-overlay');
    if (overlay) overlay.style.display = 'none';

    // Show lockout overlay
    const lockout = document.getElementById('lockout-overlay');
    if (lockout) lockout.style.display = 'flex';

    logIncident('EXAM TERMINATED', 'Exceeded maximum permitted security strikes (Lockout triggered).', true);
  }

  /* ==========================================================================
     FULLSCREEN MANAGEMENT
     ========================================================================== */
  function requestBrowserFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  function checkFullscreenState() {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    const fsPill = document.getElementById('hud-fullscreen-indicator');

    if (fsPill) {
      if (isFull) {
        fsPill.innerHTML = '<span>🖥️</span> <span>Fullscreen: ON</span>';
        fsPill.style.color = 'var(--accent-emerald)';
        // Reset fullscreen violation state when user restores fullscreen
        state.isFullscreenViolationActive = false;
      } else {
        fsPill.innerHTML = '<span>⚠️</span> <span>Fullscreen: OFF</span>';
        fsPill.style.color = 'var(--accent-crimson)';
      }
    }

    // Only fire violation ONCE when fullscreen is exited, and not during grace period
    if (state.isExamActive && !isFull && !state.isFullscreenViolationActive && !state.isGracePeriod) {
      state.isFullscreenViolationActive = true;
      triggerViolation('Exited mandatory full-screen mode!');
    }
  }

  /* ==========================================================================
     SECURITY GUARDS & SMART IFRAME TRACKING
     ========================================================================== */
  function initSecurityGuards() {
    const iframe = document.getElementById('google-quiz-iframe');

    // 1. Track mouse hover over iframe to know when student is interacting with Google Form
    if (iframe) {
      iframe.addEventListener('mouseenter', () => { isMouseOverIframe = true; });
      iframe.addEventListener('mouseleave', () => { isMouseOverIframe = false; });
    }
    window.addEventListener('mousemove', (e) => {
      if (iframe) {
        const rect = iframe.getBoundingClientRect();
        isMouseOverIframe = (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
        );
      }
    });

    // 2. Right Click / Context Menu
    document.addEventListener('contextmenu', function (e) {
      if (state.isExamActive) {
        e.preventDefault();
        showCopyBlockToast('🚫 Right-click is prohibited during this proctored assessment.');
        logIncident('BLOCKED ACTION', 'Right-click context menu attempt prevented.');
      }
    });

    // 3. Copy Event
    document.addEventListener('copy', function (e) {
      if (state.isExamActive) {
        e.preventDefault();
        showCopyBlockToast('🚫 Text copying is disabled.');
        logIncident('BLOCKED ACTION', 'Clipboard COPY command blocked.');
      }
    });

    // 4. Cut Event
    document.addEventListener('cut', function (e) {
      if (state.isExamActive) {
        e.preventDefault();
        showCopyBlockToast('🚫 Text cutting is disabled.');
        logIncident('BLOCKED ACTION', 'Clipboard CUT command blocked.');
      }
    });

    // 5. Paste Event
    document.addEventListener('paste', function (e) {
      if (state.isExamActive) {
        e.preventDefault();
        showCopyBlockToast('🚫 Pasting is disabled in exam environment.');
        logIncident('BLOCKED ACTION', 'Clipboard PASTE command blocked.');
      }
    });

    // 6. Text Selection Dragging
    document.addEventListener('selectstart', function (e) {
      if (state.isExamActive) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    });

    // 7. Prohibited Hotkeys
    document.addEventListener('keydown', function (e) {
      if (!state.isExamActive) return;

      const key = e.key.toLowerCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // F12 (Developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
        showCopyBlockToast('🚫 Developer Tools are disabled.');
        logIncident('SECURITY ALERT', 'F12 DevTools shortcut blocked.');
        return;
      }

      // Ctrl+Shift+I / J / C (DevTools)
      if (isCtrlOrMeta && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        showCopyBlockToast('🚫 Developer Tools inspect is blocked.');
        logIncident('SECURITY ALERT', 'Ctrl+Shift+I/J/C DevTools blocked.');
        return;
      }

      // Ctrl+U (View Source)
      if (isCtrlOrMeta && key === 'u') {
        e.preventDefault();
        showCopyBlockToast('🚫 View Source is disabled.');
        logIncident('SECURITY ALERT', 'Ctrl+U View Source blocked.');
        return;
      }

      // Ctrl+S (Save), Ctrl+P (Print)
      if (isCtrlOrMeta && ['s', 'p'].includes(key)) {
        e.preventDefault();
        showCopyBlockToast('🚫 Saving and printing are disabled.');
        return;
      }

      // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
      if (isCtrlOrMeta && ['c', 'v', 'x', 'a'].includes(key)) {
        e.preventDefault();
        showCopyBlockToast(`🚫 Ctrl+${key.toUpperCase()} shortcut blocked.`);
        logIncident('BLOCKED ACTION', `Ctrl+${key.toUpperCase()} shortcut prevented.`);
        return;
      }
    });

    // 8. Tab Switching / Window Visibility Change (PRIMARY ACCURATE DETECTOR)
    // Fires ONLY when student actually changes tabs or minimizes browser
    document.addEventListener('visibilitychange', function () {
      if (state.isExamActive && document.visibilityState === 'hidden' && !state.isGracePeriod) {
        triggerViolation('Tab Switch Detected: You navigated away from the assessment tab!');
      }
    });

    // 9. Window Blur with Smart Iframe Filter
    // In browsers, clicking into an iframe fires window.blur.
    // We check if document.activeElement is the iframe OR mouse is over iframe.
    // If so, it is purely answering the quiz -> DO NOT STRIKE!
    window.addEventListener('blur', function () {
      if (!state.isExamActive || state.isOverlayOpen || state.isGracePeriod) return;

      setTimeout(() => {
        const activeEl = document.activeElement;
        const formIframe = document.getElementById('google-quiz-iframe');

        // Check if user clicked inside Google Form iframe
        if (activeEl === formIframe || isMouseOverIframe) {
          // Legitimate interaction inside the quiz form - ignore!
          return;
        }

        // Only trigger if document is actually hidden (tab switch/minimize)
        if (document.visibilityState === 'hidden') {
          triggerViolation('Window Focus Lost: Navigated away from the exam window!');
        }
      }, 250);
    });

    // 10. Fullscreen Change Listeners
    document.addEventListener('fullscreenchange', checkFullscreenState);
    document.addEventListener('webkitfullscreenchange', checkFullscreenState);
    document.addEventListener('msfullscreenchange', checkFullscreenState);
  }

  /* ==========================================================================
     TIMER ENGINE
     ========================================================================== */
  function startExamTimer() {
    state.startTime = Date.now();
    const timerEl = document.getElementById('hud-timer-display');

    state.timerInterval = setInterval(() => {
      const elapsedMs = Date.now() - state.startTime;
      const totalSec = Math.floor(elapsedMs / 1000);
      const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const secs = String(totalSec % 60).padStart(2, '0');

      if (timerEl) timerEl.textContent = `${hours}:${mins}:${secs}`;
    }, 1000);
  }

  /* ==========================================================================
     EXAM START & FINISH ACTIONS
     ========================================================================== */
  const REQUIRED_PASSWORD = 'sec_9_17_53';

  function startExam() {
    const pwdInput = document.getElementById('exam-password');
    const feedback = document.getElementById('password-feedback');

    const entered = pwdInput ? pwdInput.value.trim() : '';
    if (entered !== REQUIRED_PASSWORD) {
      if (feedback) {
        feedback.textContent = '❌ Invalid Access Key! Please enter the key provided by your instructor.';
        feedback.style.display = 'block';
      }
      if (pwdInput) {
        pwdInput.style.borderColor = 'var(--accent-crimson)';
        pwdInput.focus();
      }
      return;
    }

    if (feedback) feedback.style.display = 'none';

    state.isExamActive = true;
    state.violationCount = 0;
    state.isOverlayOpen = false;
    state.isFullscreenViolationActive = false;

    // Grace period for initial launch (3 seconds)
    state.isGracePeriod = true;
    setTimeout(() => {
      state.isGracePeriod = false;
    }, 3000);

    updateStrikeUI();

    // Switch Views
    const onboarding = document.getElementById('onboarding-screen');
    const proctorWrapper = document.getElementById('proctor-exam-wrapper');

    if (onboarding) onboarding.style.display = 'none';
    if (proctorWrapper) proctorWrapper.style.display = 'flex';

    // Enter Fullscreen
    requestBrowserFullscreen();

    // Start Timer
    startExamTimer();

    logIncident('EXAM COMMENCED', 'Candidate launched assessment in full-screen mode.');
  }

  function resumeFromViolation() {
    const overlay = document.getElementById('violation-overlay');
    if (overlay) overlay.style.display = 'none';

    // Request fullscreen again
    requestBrowserFullscreen();

    // Add a 3-second grace period so clicking back into the Google Form does NOT trigger blur!
    state.isGracePeriod = true;
    state.isOverlayOpen = false;

    setTimeout(() => {
      state.isGracePeriod = false;
      state.isFullscreenViolationActive = false;
    }, 3000);

    logIncident('FULLSCREEN RESUMED', 'Candidate acknowledged security warning and restored full screen.');
  }

  function finishExam() {
    const confirmed = confirm('Are you sure you have submitted the Google Form and wish to conclude this proctored session?');
    if (!confirmed) return;

    state.isExamActive = false;
    clearInterval(state.timerInterval);

    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    alert(`Assessment Concluded! Total Violations Recorded: ${state.violationCount}`);
    window.location.reload();
  }

  /* ==========================================================================
     DOM READY INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initSecurityGuards();

    // Start Button
    const btnLaunch = document.getElementById('btn-launch-exam');
    if (btnLaunch) {
      btnLaunch.addEventListener('click', startExam);
    }

    // Password Toggle & Enter Key
    const pwdInput = document.getElementById('exam-password');
    const btnTogglePwd = document.getElementById('btn-toggle-pwd');
    if (btnTogglePwd && pwdInput) {
      btnTogglePwd.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        btnTogglePwd.textContent = isPwd ? '🙈' : '👁️';
      });
    }
    if (pwdInput) {
      pwdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          startExam();
        }
      });
    }

    // Resume Fullscreen from violation overlay
    const btnResume = document.getElementById('btn-resume-fullscreen');
    if (btnResume) {
      btnResume.addEventListener('click', resumeFromViolation);
    }

    // Finish Assessment Button
    const btnFinish = document.getElementById('btn-finish-exam');
    if (btnFinish) {
      btnFinish.addEventListener('click', finishExam);
    }

    // Toggle Sound Warning
    const btnMute = document.getElementById('btn-toggle-sound');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        state.isSoundMuted = !state.isSoundMuted;
        btnMute.innerHTML = state.isSoundMuted ? '<span>🔇</span> <span>Sound: OFF</span>' : '<span>🔊</span> <span>Sound: ON</span>';
      });
    }

    // Toggle Incident Logs Drawer
    const btnToggleLogs = document.getElementById('btn-toggle-logs');
    const logsDrawer = document.getElementById('incident-drawer');
    const btnCloseLogs = document.getElementById('btn-close-drawer');

    if (btnToggleLogs && logsDrawer) {
      btnToggleLogs.addEventListener('click', () => {
        logsDrawer.classList.toggle('open');
      });
    }
    if (btnCloseLogs && logsDrawer) {
      btnCloseLogs.addEventListener('click', () => {
        logsDrawer.classList.remove('open');
      });
    }
  });

})();
