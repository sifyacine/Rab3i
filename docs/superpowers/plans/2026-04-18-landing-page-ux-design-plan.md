# Landing Page UX & Animation Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the landing page user experience by adding a subtle custom cursor, magnetic button interactions, and cinematic parallax scrolling.

**Architecture:** Use Framer Motion for highly optimized, hardware-accelerated animations (`useMotionValue`, `useSpring`, `useScroll`). Create reusable atomic components (`Cursor`, `MagneticButton`) to inject into existing pages.

**Tech Stack:** React, Framer Motion, Tailwind CSS

---

### Task 1: Create Global Custom Cursor

**Files:**
- Create: `src/components/ui/Cursor.tsx`
- Modify: `src/index.css` (hide default cursor)
- Modify: `src/pages/public/Index.tsx`

- [ ] **Step 1: Write Cursor Component**
Create `src/components/ui/Cursor.tsx` using `framer-motion` to track `mousemove` events via `useEffect` and `useMotionValue`. Implement hover state scaling.

- [ ] **Step 2: Hide default cursor globally**
Add `@media (hover: hover) and (pointer: fine) { * { cursor: none !important; } }` to `src/index.css`.

- [ ] **Step 3: Inject Cursor into layout**
Import and add `<Cursor />` at the root of `src/pages/public/Index.tsx`.

- [ ] **Step 4: Run dev server and verify**
Run `npm run dev` and visually confirm the cursor follows the mouse smoothly and hides native cursor on desktop.

- [ ] **Step 5: Commit**
`git add src/components/ui/Cursor.tsx src/index.css src/pages/public/Index.tsx && git commit -m "feat(ui): add global framer-motion custom cursor"`

---

### Task 2: Create Magnetic Button Component

**Files:**
- Create: `src/components/ui/MagneticButton.tsx`
- Modify: `src/components/home/HeroSection.tsx` (apply to CTA)

- [ ] **Step 1: Write MagneticButton**
Create `src/components/ui/MagneticButton.tsx`. Use `useMotionValue` and `useSpring`. Track `onMouseMove` over the button bounding client rect to calculate distance, moving `x` and `y` up to a max offset (e.g., 20px). Reset on `onMouseLeave`.

- [ ] **Step 2: Apply to Hero CTA**
Wrap the primary "Contact Us" or "Get Started" button in `HeroSection.tsx` with `<MagneticButton>`.

- [ ] **Step 3: Verify interaction**
Run dev server, hover over the button to verify the magnetic pull effect.

- [ ] **Step 4: Commit**
`git add src/components/ui/MagneticButton.tsx src/components/home/HeroSection.tsx && git commit -m "feat(ui): add magnetic button interaction to hero cta"`

---

### Task 3: Implement Parallax Backgrounds

**Files:**
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/components/home/WhatWeDoSection.tsx`

- [ ] **Step 1: Add Parallax to Hero**
In `HeroSection.tsx`, use `useScroll()` and `useTransform(scrollY, [0, 1000], [0, 300])`. Convert the background image container to `<motion.div>` and apply `style={{ y }}`.

- [ ] **Step 2: Add Parallax to WhatWeDoSection**
In `WhatWeDoSection.tsx`, apply the same `useScroll` tracking. Since it's lower down the page, map the intersection or use global scrollY relative to offset to move the background `img` slightly.

- [ ] **Step 3: Verify parallax effect**
Scroll through the page in dev server. Ensure background images move at a different rate than the foreground content without breaking layout.

- [ ] **Step 4: Commit**
`git add src/components/home/HeroSection.tsx src/components/home/WhatWeDoSection.tsx && git commit -m "feat(ui): add scroll parallax to hero and services backgrounds"`

---

### Task 4: Fine-tune ScrollReveal

**Files:**
- Modify: `src/components/ScrollReveal.tsx`

- [ ] **Step 1: Adjust animation constants**
Change transition duration from `0.65` to `0.8` or `1.0`. Adjust easing from `[0.16, 1, 0.3, 1]` to a more dramatic cinematic curve like `[0.25, 1, 0.5, 1]`.

- [ ] **Step 2: Verify smooth reveals**
Scroll down the page quickly to ensure reveals feel graceful and not jarring.

- [ ] **Step 3: Commit**
`git add src/components/ScrollReveal.tsx && git commit -m "chore(ui): refine scroll reveal easing for cinematic feel"`

---

### Task 5: Final Verification Build

- [ ] **Step 1: Run diagnostics & tests**
Run `npm run lint` and `npm run build` to ensure no unused imports or type errors were introduced by Framer Motion additions.

- [ ] **Step 2: Commit fixes if needed**
Fix any warnings. `git commit -m "fix(ui): resolve build warnings for ux upgrades"`