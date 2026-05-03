---
name: Nurture & Guide
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#3f4a3c'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#6f7a6b'
  outline-variant: '#becab9'
  surface-tint: '#006e1c'
  primary: '#006e1c'
  on-primary: '#ffffff'
  primary-container: '#4caf50'
  on-primary-container: '#003c0b'
  inverse-primary: '#78dc77'
  secondary: '#b80049'
  on-secondary: '#ffffff'
  secondary-container: '#e2165f'
  on-secondary-container: '#fffbff'
  tertiary: '#b02f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff6e43'
  on-tertiary-container: '#641700'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#94f990'
  primary-fixed-dim: '#78dc77'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005313'
  secondary-fixed: '#ffd9de'
  secondary-fixed-dim: '#ffb2be'
  on-secondary-fixed: '#400014'
  on-secondary-fixed-variant: '#900038'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a0'
  on-tertiary-fixed: '#3b0900'
  on-tertiary-fixed-variant: '#862200'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-data:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  button-text:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style

The design system is anchored in the concept of "Guided Growth." It balances the clinical precision required for medical tracking with the emotional warmth essential for childcare. The visual language is **Modern and Warm**, utilizing soft geometry and generous whitespace to reduce parental cognitive load. 

The aesthetic is characterized by clarity and approachability. It avoids clinical coldness by utilizing rounded corners and organic icon shapes, while maintaining professionalism through structured information density and authoritative data visualization. The target audience—modern parents—requires a tool that feels like a supportive expert rather than just a database.

## Colors

The palette is strategically divided to signify function:
- **Primary (Health Green):** Used for growth-related progress, health status, and "safe" states.
- **Accent (Rose Pink):** Reserved for high-frequency "Add" actions and positive emotional triggers.
- **Alert/Action (Deep Orange):** Dedicated to warnings, urgent notifications, and interactive gamified elements like the selection roulette.
- **Neutrals:** The background uses a soft gray to reduce eye strain, while pure white surfaces create a "layered paper" effect for data containers.

## Typography

This design system utilizes **Plus Jakarta Sans** for its inherent warmth and geometric clarity. 

- **Data Numbers:** Large, bold weights are used for physiological metrics (height, weight) to ensure they are the primary focal point of the dashboard.
- **Titles:** Strong #333 headers provide clear section breaks.
- **Body & Secondary:** Uses varying shades of gray to establish hierarchy, ensuring that primary information is read first while metadata remains accessible but unobtrusive.
- **Numeric Keypad:** Fonts should be centered with high tap-target legibility.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a base unit of 8px. 
- **Margins:** Screens maintain a standard 16px lateral margin.
- **Gaps:** 12px gutters between cards in a grid view (e.g., the 2x4 functional menu).
- **Rhythm:** Vertical spacing between cards is 16px to maintain a clear separation of concerns.
- **Functional Menu:** The 2x4 grid uses equal-height containers to maintain a sense of order and reliability.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and surface layering. 
- **Card Depth:** Surfaces use a soft, low-opacity shadow (4% - 8% alpha) with a large blur radius (12px - 16px) and a slight Y-offset (4px). This creates a "floated" effect that feels tactile and safe.
- **Interaction:** Upon press, cards should visually "sink" by reducing the shadow spread.
- **Bottom Sheets:** These utilize a higher elevation (z-index) with a 20% background dim (scrim) to focus the user on data entry without losing context of the previous screen.

## Shapes

The shape language is consistently **Rounded**. 
- **Cards:** Use a 16px (1rem) corner radius to evoke a sense of softness and friendliness.
- **Buttons:** Primary action buttons use a fully rounded (pill-shaped) style to maximize "tapability."
- **Charts:** Line chart vertices are smoothed using Catmull-Rom splines rather than sharp angles to align with the "growth" narrative.
- **Icons:** All icons must feature 2px strokes with rounded end-caps and joins to avoid any "sharp" edges in the UI.

## Components

- **Cards:** White surfaces with 16px padding. Content should be vertically stacked with labels above data points.
- **Bottom Sheets:** Triggered for all data entry. Includes a "Grabber" handle at the top (40x4px, rounded).
- **Custom Keypad:** Large numeric keys (60px min height) with the Rose Pink color used for the "Enter/Done" key and Health Green for the decimal point.
- **Growth Charts:** Line charts featuring a bold primary line for the baby's data and a semi-transparent Health Green shaded area representing the "Healthy Reference Range" (3rd to 97th percentiles).
- **Functional Menu:** 2x4 icon grid. Icons are centered within a light-tinted version of the primary color (10% opacity green background) to create a soft visual anchor for each function.
- **Bottom Navigation:** Uses linear icons. The active state is indicated by the icon changing to a solid fill or a change to the Primary Green color.