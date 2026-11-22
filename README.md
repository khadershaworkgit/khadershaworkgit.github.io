# Prompt Engineering for Developers ⚡ (Version 2)
> **A Production-Ready, Futuristic Single-Page Web Application**  
> *100% Static, Zero Build Step, Ready for GitHub Pages (`https://<username>.github.io/`)*

This project bridges the gap between **basic prompting** (*"write a login page"*) and **professional prompt engineering** for software development. It demonstrates what developers gain across two core topics:
1. **Prompt-Based Coding**: Using structured prompts to synthesize program logic, diagnose and patch complex runtime errors, and modernize legacy code structure through refactoring.
2. **AI-Supported Program Development**: Building standalone programs and accessible web components using iterative AI-assisted workflows.

---

## 🌟 Key Features & Architecture

* **Three.js 3D Hero Scene & Neural Mesh**:
  * Pinned Three.js (v0.160.0) from CDN via `<script type="importmap">`.
  * Central rotating glowing neural-network icosahedron with orbital rings.
  * Drifting 3D code tokens (`{ }`, `</>`, `=>`, `;`, `fn()`) with depth parallax.
  * Starfield of 800+ 3D particles with smooth mouse-tilt easing.
  * Click ripple / shockwave pulse animation.
* **Scroll-Driven 3D & GSAP ScrollTrigger**:
  * Seamless camera flight and scene color shifts tied to scroll progress.
  * Performance safeguards: DPR capped at 2, rendering pauses when tab is hidden, and `prefers-reduced-motion` detection.
  * Dedicated "🔮 3D Toggle" button in the navigation bar for low-power devices.
* **10 Ordered Curriculum Sections**:
  1. **Hero**: Futuristic glitch heading, animated typewriter line cycling through *"Stop asking. Start engineering."* / *"Generate. Debug. Refactor. Ship."*, animated stat counters.
  2. **The Problem**: 3 animated pain-point cards explaining vague output, unexplained bugs, and messy monoliths.
  3. **Basic vs. Engineered (Centerpiece)**: Interactive comparison toggle showing the input prompt and typewriter-animated AI output for a To-Do web component, paired with animated metric bars (Clarity, Quality, Bug Resistance, Maintainability, Reusability).
  4. **The Prompt Formula (R-T-C-F-C)**: 5 interactive 3D flip cards (Role, Task, Context, Format, Constraints) plus a live **Prompt Builder Mini-Tool** that previews and copies assembled prompts with toast feedback.
  5. **Module 1 (Prompt-Based Coding)**: 3 interactive tabs (*Generate Logic*, *Debug Errors*, *Improve Code Structure*) with an **animated code diff** (red removed $\rightarrow$ green added) and a **Continuous Debug Loop diagram**.
  6. **Module 2 (AI-Supported Program Dev)**: Interactive 7-step horizontal timeline stepper (*Plan $\rightarrow$ Prompt $\rightarrow$ Generate $\rightarrow$ Run $\rightarrow$ Debug $\rightarrow$ Refine $\rightarrow$ Ship*), 3 mini-project prompt cards, and a **live working sandboxed theme switcher demo**.
  7. **Before vs. After Skill Meter**: Animated radial progress gauges comparing pre-course vs post-course engineering competencies.
  8. **Prompt Cheat Sheet**: 6 copyable production-ready prompt templates with instant clipboard copy and notifications.
  9. **Quick Interactive Quiz**: 5 MCQs with instant feedback, explanations, and a celebratory canvas confetti burst upon completion.
  10. **Resources & Footer**: Download links for the comprehensive Word guide (`.docx`) and PowerPoint presentation (`.pptx`), plus back-to-top navigation.

---

## 🚀 How to Host on GitHub Pages

The repository contains only pure static files with relative paths (`./style.css`, `./script.js`, etc.) and a `.nojekyll` file.

### Option 1: Root Domain (`https://<username>.github.io/`)
1. Create a repository on GitHub named:
   ```text
   <username>.github.io
   ```
2. In your terminal / PowerShell:
   ```bash
   cd website
   git init
   git add .
   git commit -m "Deploy Prompt Engineering v2 Portal"
   git branch -M main
   git remote add origin https://github.com/<username>/<username>.github.io.git
   git push -u origin main
   ```
3. In your GitHub repository:
   * Go to **Settings** &rarr; **Pages**.
   * Under **Branch**, select `main` and folder `/ (root)` &rarr; Click **Save**.
4. In under 60 seconds, your site is live at:
   ```text
   https://<username>.github.io/
   ```

---

### Option 2: Project Repository (`https://<username>.github.io/repo-name/`)
1. Create a repository on GitHub (e.g. `prompt-engineering`).
2. Push the files:
   ```bash
   cd website
   git init
   git add .
   git commit -m "Deploy Prompt Engineering Portal"
   git branch -M main
   git remote add origin https://github.com/<username>/prompt-engineering.git
   git push -u origin main
   ```
3. Enable GitHub Pages in **Settings** &rarr; **Pages** &rarr; `main` branch.
4. Your site will be live at `https://<username>.github.io/prompt-engineering/`.

---

## 📁 Repository Contents

```text
website/
├── index.html                                        # Complete 10-section semantic webpage
├── style.css                                         # Cyberpunk glassmorphism theme, animations & 3D styling
├── script.js                                         # Three.js 3D scene, GSAP ScrollTrigger, quiz & tools
├── .nojekyll                                         # Disables Jekyll processing on GitHub Pages
├── README.md                                         # Deployment documentation
├── Prompt_Based_Coding_and_AI_Development_Guide.docx # Comprehensive Word Reference Guide
├── Prompt_Based_Coding_and_AI_Development_Overview.pptx # 19-Slide PowerPoint Presentation Deck
└── audio/                                            # Pronunciation audio files (.wav)
```
