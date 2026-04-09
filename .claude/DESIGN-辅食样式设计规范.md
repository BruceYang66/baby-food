# Design System Specification: The Nurtured Grid

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curator**

This design system rejects the "utilitarian warehouse" look of traditional admin panels. Instead, it adopts the persona of a **Digital Curator**: an authoritative yet gentle expert. For a baby food platform, the interface must balance clinical precision (safety and nutrition data) with a soft, editorial elegance (the care of a child).

To move beyond the "template" look, we employ **Intentional Asymmetry** and **Tonal Depth**. While the 1440px grid remains the foundation, we break the monotony by using overlapping layers, oversized typography for key metrics, and varying "surface weights." The goal is a premium, high-end experience that feels bespoke and intentional, rather than generated.

---

## 2. Colors: Tonal Authority
Our palette moves away from harsh black-and-white contrasts toward a sophisticated, multi-layered blue and neutral spectrum.

### The Palette (Material Design Convention)
*   **Primary Core:** `primary` (#005daa) for main brand actions; `primary_container` (#0075d5) for secondary emphasis.
*   **Surface Hierarchy:** `surface` (#f7f9fc) serves as our canvas, while `surface_container_lowest` (#ffffff) is reserved for the most critical interactive cards.
*   **Functional Status:** 
    *   *Online/Safe:* `secondary` (#40608b) mixed with soft green accents.
    *   *Pending:* `tertiary` (#934600) for an earthy, sophisticated amber.
    *   *Error/Alert:* `error` (#ba1a1a) for clear, non-negotiable feedback.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** Do not use 1px solid lines to separate the sidebar from the main content or to divide table rows. Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` sidebar sitting against a `surface` main stage creates a sophisticated, architectural break without the visual "noise" of a stroke.

### The "Glass & Gradient" Rule
To add "soul" to the data, use subtle linear gradients (from `primary` to `primary_container`) for primary action buttons and KPI card backgrounds. For floating navigation or modal overlays, apply **Glassmorphism**: use semi-transparent surface colors with a `12px` backdrop-blur. This makes the UI feel light and breathable.

---

## 3. Typography: The Editorial Scale
We use a dual-typeface system to bridge the gap between "data-heavy admin" and "premium brand."

*   **Headlines (Manrope):** A geometric sans-serif that feels modern and approachable. Used for `display` and `headline` roles to provide a signature, "magazine" feel to the dashboard.
*   **Interface (Inter):** A high-legibility sans-serif used for `title`, `body`, and `label` roles. Inter excels at high data density, ensuring nutritional facts and SKU numbers remain crystal clear.

| Token | Typeface | Size | Weight | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Manrope | 3.5rem | 700 | Hero metrics (e.g., Total Revenue) |
| `headline-sm` | Manrope | 1.5rem | 600 | Section headers |
| `title-md` | Inter | 1.125rem | 500 | Card titles, Navigation items |
| `body-md` | Inter | 0.875rem | 400 | Standard data entries |
| `label-sm` | Inter | 0.6875rem | 600 | Micro-caps for table headers |

---

## 4. Elevation & Depth: Tonal Layering
We move away from the "shadow-on-everything" approach. Depth is achieved through the **Layering Principle**.

### The Stacking Order
1.  **Level 0 (Base):** `surface` (#f7f9fc) - The background of the entire application.
2.  **Level 1 (Sectioning):** `surface_container_low` (#f2f4f7) - Used for sidebars or secondary content areas.
3.  **Level 2 (Interaction):** `surface_container_lowest` (#ffffff) - Used for primary cards containing data.
4.  **Level 3 (Focus):** `surface_bright` (#f7f9fc) - Used for active states or highlighted rows.

### Ambient Shadows & Ghost Borders
*   **Shadows:** Only used for "floating" elements (Modals, Popovers). Use a 32px blur with 4% opacity of the `on_surface` color.
*   **The Ghost Border:** If a container requires a physical boundary for accessibility (e.g., an input field), use the `outline_variant` token at **20% opacity**. Never use 100% opaque borders.

---

## 5. Components: Refined Primitives

### Buttons & Inputs
*   **Primary Action:** `primary` background, `0.25rem` (4px) roundedness. Use a subtle top-to-bottom gradient for depth.
*   **Input Fields:** `surface_container_lowest` background with a "Ghost Border." Focus state uses a 2px `primary` glow with 10% opacity.

### Cards & Data Lists
*   **The Divider Forbiddance:** Never use horizontal lines between list items. Use 16px of vertical whitespace or a subtle toggle to `surface_container_high` on hover to separate items.
*   **Nurtured Corner Scale:** 
    *   `lg` (8px): Dashboard cards and main containers.
    *   `DEFAULT` (4px): Buttons, inputs, and small utility chips.

### Contextual Components
*   **The "Nutritional Score" Chip:** A custom component using `tertiary_container` with `tertiary_fixed` text to highlight organic or premium ingredient ratings.
*   **Batch Status Pills:** Use high-contrast "On-Color" combinations (e.g., `on_primary_container` text on `primary_fixed` background) for manufacturing status (e.g., "In Sterilization").

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. If a left margin is 48px, try a right margin of 64px for a more editorial, less "boxed-in" feel.
*   **Do** lean into `surface` color shifts. A subtle change from `#f7f9fc` to `#ffffff` is more elegant than any border.
*   **Do** use `display-lg` typography for single, high-impact numbers to create a visual anchor.

### Don’t
*   **Don’t** use pure black (#000000) for text. Use `on_surface` (#191c1e) to maintain a soft, premium feel.
*   **Don’t** use standard "drop shadows" on cards. If a card doesn't pop via color, use a "Ghost Border."
*   **Don’t** crowd the layout. In a baby food admin, "clean" equals "safe." If in doubt, increase the `surface` area (whitespace).