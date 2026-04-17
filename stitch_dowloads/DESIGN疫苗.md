# Design System Strategy: The Nurturing Atelier

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Sanctuary"**
This design system moves away from the rigid, clinical "app-grid" feel common in utility tools. Instead, it adopts an **Editorial High-End** approach. We treat the user interface as a digital concierge—a soft, breathable sanctuary for parents. 

The visual language is rooted in **Organic Flow**. By utilizing intentional asymmetry, overlapping elements, and extreme tonal depth, we create a sense of "tactile softness." We break the "template" look by using exaggerated typography scales and a "no-line" philosophy, ensuring the experience feels like a premium lifestyle magazine rather than a database.

---

## 2. Color & Surface Architecture
The palette is designed to evoke trust through warmth. We avoid harsh blacks and stark whites in favor of a sophisticated, milky base.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. 
Boundaries must be created through:
- **Background Color Shifts:** Placing a `surface_container_low` card on a `surface` background.
- **Tonal Transitions:** Using subtle shifts in saturation to guide the eye.
- **Negative Space:** Using the Spacing Scale to create "invisible containers."

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
- **Layer 0 (Base):** `surface` (#fef8f3) – The canvas.
- **Layer 1 (Main Content):** `surface_container_low` (#f8f3ee) – For large content blocks.
- **Layer 2 (Interactive Elements):** `surface_container_highest` (#e6e2dd) – For prominent interactive cards.
- **Floating Layer:** Semi-transparent `surface_variant` with a 20px Backdrop Blur (Glassmorphism) for navigation bars and modal overlays.

### Signature Textures
To add "soul" to the UI, use **Tonal Gradients** for primary CTAs. Instead of flat `#FFB366`, use a linear gradient from `primary` (#8a5108) to `primary_container` (#ffb366) at a 135-degree angle. This provides a soft, sun-kissed glow that flat design cannot replicate.

---

## 3. Typography: Editorial Authority
We utilize a high-contrast typography scale to create an "Editorial" hierarchy.

*   **The Display Scale:** Use `display-lg` (3.5rem) and `display-md` (2.75rem) for hero moments (e.g., "Your baby is 3 months old today"). The `plusJakartaSans` (or a high-end Chinese equivalent like *Source Han Serif* for headings) creates a sense of prestige.
*   **The Headline Scale:** `headline-sm` (1.5rem) is the workhorse for card titles. It should feel authoritative but approachable.
*   **The Body Scale:** `body-lg` (1rem) is optimized for readability. We use `beVietnamPro` (or *Source Han Sans*) with generous line-height (1.6) to ensure exhausted parents can scan text easily under low-light conditions.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "digital." We use **Ambient Depth**.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface_container_lowest` (#ffffff) card on a `surface_container` (#f2ede8) background. This creates a soft "lift" without visual noise.
*   **Ambient Shadows:** If a shadow is required for a floating CTA, use:
    *   `Color`: `on_surface` (#1d1b19) at 6% opacity.
    *   `Blur`: 40px to 60px.
    *   `Spread`: -5px (to keep the shadow tight and modern).
*   **The "Ghost Border":** If a container requires definition against an identical background (rare), use the `outline_variant` token at **15% opacity**. Never 100%.
*   **Glassmorphism:** For top navigation headers, use `surface` at 80% opacity with a `blur(20px)`. This allows the vibrant colors of the "Food Center" or "Encyclopedia" to bleed through as the user scrolls, creating a dynamic, integrated feel.

---

## 5. Components & UI Elements

### Cards (The Core Container)
- **Rule:** Forbid divider lines within cards.
- **Styling:** Use `DEFAULT` (1rem) or `lg` (2rem) corner radius. 
- **Structure:** Separate content using vertical white space. Use `surface_container_low` for the card body and a subtle `surface_bright` for the header area of the card.

### Buttons (The "Pill" Interaction)
- **Primary (High Emphasis):** Rounded `full`. Gradient from `primary` to `primary_container`. White text.
- **Secondary (The Soft Action):** `surface_container_highest` background with `on_surface` text. No border.
- **Tertiary (The Ghost):** No background, `primary` text, bold weight.

### Chips (Categorization)
- **Vaccine/Wiki Tones:** Use the specific functional tokens. 
    - *Free Vaccine:* `secondary_container` (#68abff) background with `on_secondary_container` (#003e73) text.
    - *Encyclopedia:* `tertiary_container` (#eaadff) background with `on_tertiary_container` (#772d96) text.
- **Shape:** `sm` (0.5rem) radius for a slightly "structured" but soft look.

### Input Fields
- **State:** Background should be `surface_container_lowest`. 
- **Focus:** Transition the "Ghost Border" from 15% to 60% opacity using the `primary` color. Avoid heavy glows.

---

## 6. Do’s and Don’ts

### Do:
- **Use Asymmetry:** Place hero images slightly off-center or overlapping card boundaries to break the "boxed-in" feel.
- **Embrace White Space:** If you think there is enough padding, add 8px more. Breathability is luxury.
- **Contextual Coloring:** Shift the theme colors based on the section (e.g., the UI should subtly "warm up" in the Food Center and "cool down" in the Vaccine section).

### Don’t:
- **No 1px Dividers:** Never use a line to separate a list. Use a 4px-8px `surface_container` gap instead.
- **No Pure Black:** Never use #000000. Use `on_surface` (#1d1b19) for all text to maintain the soft "ink on paper" feel.
- **No Sharp Corners:** Every element must have at least a `sm` (0.5rem) radius to maintain the "parent-child safe" brand persona.