# Design System Document: The Parent’s Sanctuary

## 1. Overview & Creative North Star: "The Nurturing Light"
This design system moves beyond the cold, utilitarian nature of typical tracking apps. Our Creative North Star is **"The Nurturing Light"**—a digital experience that feels like a sun-drenched nursery. 

We break the "template" look by rejecting rigid, boxed grids in favor of **Organic Asymmetry** and **Editorial Breathing Room**. By utilizing a sophisticated scale of tonal layering and overlapping elements, we create a sense of professional warmth. The interface shouldn't feel like a form to be filled; it should feel like a soft, guided conversation.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
We use color not just for branding, but to define the architecture of the space.

### The Palette
*   **Primary (Warm Apricot - #8A5108 / #FFB366):** The core "Nutritional" energy. Used for growth tracking and essential CTAs.
*   **Secondary (Medical Blue - #0060AC / #4A90E2):** The "Protective" layer. Reserved for vaccinations and health records.
*   **Tertiary (Forest Green - #3A6A00 / #7ED321):** The "Growth" layer. Used for educational content and expert tips.
*   **Neutral (Rice White - #FEF8F3):** The canvas. A warm alternative to clinical white.

### Color Rules for High-End Execution
1.  **The "No-Line" Rule:** Prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` card sits on a `surface` background.
2.  **Surface Hierarchy:** Use nested depth. Treat the UI as stacked sheets of fine paper. An inner card should be `surface-container-highest` to pop against a `surface-container-low` background.
3.  **The Glass & Gradient Rule:** For floating elements (like bottom navigation or FABs), use **Glassmorphism**. Apply `surface` colors at 80% opacity with a 16px backdrop-blur. 
4.  **Signature Textures:** Main buttons should use a subtle linear gradient from `primary` (#8A5108) to `primary_container` (#FFB366) at a 135° angle to provide "soul" and dimension.

---

## 3. Typography: Editorial Authority
We pair the geometric clarity of **Plus Jakarta Sans** with the rhythmic precision of **PingFang SC**.

*   **Display (3.5rem - 2.25rem):** Used for large, welcoming headers (e.g., "Good morning, Baby"). Tight letter-spacing (-0.02em) to create a premium editorial feel.
*   **Headline & Title (2rem - 1rem):** The "Professional" voice. Bold weights are used for data points (e.g., "Weight: 8.5kg") to instill confidence.
*   **Body (1rem - 0.75rem):** The "Nurturing" voice. Increased line-height (1.6) ensures readability for tired parents in low-light environments.
*   **Labels (0.75rem - 0.68rem):** Uppercase with slight letter-spacing for metadata, ensuring it feels distinct from the narrative text.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often too "heavy" for a healing style. We use **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. 
    *   *Base:* `surface` (#FEF8F3)
    *   *Section:* `surface-container-low` (#F8F3EE)
    *   *Interactive Card:* `surface-container-lowest` (#FFFFFF)
*   **Ambient Shadows:** When a card must float, use a shadow with a 32px blur, 0px offset, and 4% opacity, tinted with the `on-surface` color (#1D1B19). This mimics natural ambient light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components: The Soft Interaction Suite

### Buttons & Chips
*   **Primary Action:** Large 24px (xl) corner radius. Use the Signature Gradient. On click, apply a **micro-scale transform (0.96)** to simulate a physical "soft press."
*   **Selection Chips:** No borders. Active state: `primary_fixed`. Inactive state: `surface-container-high`.
*   **The "Floating" FAB:** Circular, using Glassmorphism with a subtle `primary` tint.

### Cards & Lists
*   **The "Comfort" Card:** 24px (xl) corner radius is mandatory. 
*   **No Dividers:** Forbid the use of divider lines. Separate list items using 16px of vertical white space or alternating `surface-container` shifts.
*   **Visual Soul:** Cards for "Vaccines" should have a subtle background glow of `secondary_container` in the top-right corner to categorize the content at a glance without clinical iconography.

### Inputs & Progress
*   **Text Inputs:** Soft `surface-container-highest` fills instead of outlined boxes. Focus state is indicated by a 2px "Ghost Border" in `primary`.
*   **Progress Orbs:** Instead of thin lines, use thick, rounded tracks (12px height) for baby milestones to feel more substantial and "playful."

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins (e.g., 24px left, 32px right) for header sections to create a custom editorial look.
*   **Do** overlap elements (e.g., an icon slightly breaking the top boundary of a card) to create depth.
*   **Do** use "Warm Grey" (#524438) for secondary text instead of pure black to maintain the "healing" vibe.

### Don't
*   **Don't** use 90-degree corners. Everything must feel approachable and "hand-finished."
*   **Don't** use "Alert Red" for errors unless critical. Use a soft `error_container` (#FFDAD6) to reduce parental anxiety.
*   **Don't** use harsh, fast animations. All transitions should use a custom cubic-bezier (0.2, 0.8, 0.2, 1) for a "floating" feel.

---

## 7. Signature Brand Personality
This design system is a **"Reliable Partner."** Every interaction should feel like a supportive hand—stable through professional typography, yet warm through soft textures and sun-drenched tones. We are building an sanctuary, not a spreadsheet.