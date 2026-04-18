# Design Spec: Landing Page UX & Animation Upgrade

## 1. Overview
Rab3i is a creative agency focusing on visual identity and digital presence. The current landing page has a strong visual foundation (dark theme, tailored typography, brand colors) but lacks the premium interactive "feel" expected of a high-end design agency.

**Goal:** Implement the "Subtle & Refined" UX approach to elevate the digital experience without overwhelming the content or hurting performance.

## 2. Core Interactive Elements

### 2.1 Custom Cursor
- **Visuals:** A small, elegant dot (likely brand-ochre or white) that smoothly trails the native mouse position.
- **Hover States:** 
  - When hovering over clickable elements (buttons, links, cards), the cursor expands smoothly into a larger, semi-transparent circle.
  - The native cursor will be hidden on devices that support hover (desktop).
- **Implementation:** React state tracking mouse coordinates with Framer Motion (`useMotionValue`, `useSpring`) for butter-smooth interpolation.

### 2.2 Magnetic Buttons
- **Behavior:** Primary CTA buttons will gently "pull" towards the user's cursor when the mouse is nearby.
- **Implementation:** Framer Motion wrapper calculating distance from mouse to button center, applying a capped translation `x` and `y`.

### 2.3 Scroll Reveals & Parallax
- **Reveal Refinement:** The existing `ScrollReveal` component works but will be fine-tuned for a slightly longer duration and softer easing curve (`ease: [0.16, 1, 0.3, 1]`) to feel more cinematic.
- **Parallax Backgrounds:** The hero image and placeholder backgrounds in sections like `WhatWeDoSection` will have a subtle parallax effect (moving slower than the scroll speed) to add depth.
- **Implementation:** Framer Motion's `useScroll` and `useTransform`.

## 3. Component Updates

1. **`Cursor.tsx` (New):** A global component mounted in `App.tsx` or `Index.tsx`.
2. **`MagneticButton.tsx` (New):** A wrapper component to apply the magnetic effect to existing buttons.
3. **`HeroSection.tsx` & `WhatWeDoSection.tsx`:** Add parallax to the background images.
4. **`ScrollReveal.tsx`:** Fine-tune the easing curve and duration for a more premium feel.

## 4. Anti-Patterns & Constraints
- **Do not** use heavy, blocking animations that prevent the user from scrolling or reading.
- **Do not** apply custom cursors on mobile/touch devices (use `(hover: hover) and (pointer: fine)` media queries).
- **Ensure** `prefers-reduced-motion` is respected across all new Framer Motion animations.
- **Maintain** 60fps performance by using hardware-accelerated properties (`transform`, `opacity`) instead of layout properties (`width`, `margin`).

## 5. Testing Plan
- Verify cursor works smoothly on Desktop Chrome/Safari.
- Verify cursor is hidden entirely on iOS/Android.
- Ensure parallax doesn't cause horizontal overflow or layout thrashing.