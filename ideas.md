# Rinovabd Redesign Directions

## Three considered approaches

| Theme Name | Very Brief Intro | Probability |
| --- | --- | --- |
| Ribbon Modernism | A vivid pink editorial storefront where product commerce is threaded through wide typographic ribbons and tactile paper-like layers. It feels candid, assured, and contemporary rather than conventionally “pretty.” | 0.07 |
| Botanical Atelier | A pale mineral world inspired by apothecary labels, pressed florals, and considered rituals. It makes the brand calm and ingredient-led. | 0.03 |
| Pulse Studio | A high-energy art-direction system built from saturated blocks, cropped beauty photography, and rhythmic motion. It is made for launches, social storytelling, and conversion moments. | 0.09 |

## Chosen approach — Ribbon Modernism

### Design Movement

**Neo-editorial beauty retail** informed by contemporary independent magazines, colour-field printmaking, and the disciplined visual hierarchy of premium product packaging. The supplied pink image becomes the origin point for the signature colour, not a generic gradient.

### Core Principles

1. **Colour carries navigation.** Hot pink is used as an intentional route-marker, status signal, and launch surface, while paper-white space gives product information room to breathe.
2. **Editorial imbalance creates energy.** Layouts use deliberate offsets, full-bleed visual fields, rails, and horizontal bands rather than a conventional centered-card landing page.
3. **Commerce stays legible.** Product decisions, inventory state, price, and task completion are always crisp and accessible even when the art direction becomes expressive.
4. **Every interaction feels printed, then physical.** Rules, label tabs, and ribbon edges are reused across storefront and admin views so that operations feel part of the brand rather than a disconnected utility.

### Color Philosophy

The primary colour is **Rinova Pink (#F767A5)**, sampled to evoke the user’s provided pink reference: expressive, optimistic, and unmistakably ownable. It is paired with warm parchment (#FFF9F5) rather than stark white so product photography and operational data feel tactile. Ink black (#231D23) brings necessary confidence and accessible contrast; blush clay (#F4D7DD) acts as a soft secondary surface; leaf green (#41665A) is reserved for success and in-stock signals. Pink becomes brighter and more abundant at customer-facing launch moments, while the admin workspace deploys it in focused highlights to support concentration.

### Layout Paradigm

The public site is a **ribbon-led editorial sequence**: a fixed narrow utility bar, an asymmetric masthead, a two-column hero with an oversized product/portrait field, a scrolling launch ribbon, and a staggered product archive. Content enters from alternating edges rather than collecting in a central grid. The admin workspace is a **studio desk**: a vertical command rail, a flexible work canvas, and an optional right-side production panel for upload and inventory actions.

### Signature Elements

1. **Ribbon lines:** solid pink bands with compact uppercase labels thread through major sections and mark important dashboard state.
2. **Pill + rule pairing:** soft capsule tags always sit against a thin graphite rule, balancing softness with editorial control.
3. **Cut-corner panels:** featured modules have a subtle top-right corner cut, echoing physical product labels and differentiating them from generic rounded cards.

### Interaction Philosophy

Interactions reward intent rather than distract from it. Product tiles lift by a few pixels and reveal a quick-add action; dashboard controls give immediate inline feedback; navigation changes retain orientation through persistent rails and clear page titles. No action should strand a user without an obvious exit, status, or reversal.

### Animation

The launch ribbon moves slowly only when motion is permitted, creating an ambient editorial rhythm. Content groups enter with 40–60ms staggered fades and small vertical translations. Buttons use a 120–160ms press response and hover underlines draw from left to right. Upload, drawer, and modal transitions use an assertive 220ms ease-out. All nonessential motion is disabled under `prefers-reduced-motion`.

### Typography System

**DM Serif Display** is reserved for headlines, price moments, and large editorial numbers, bringing an elegant but contemporary contrast. **Manrope** is the operational workhorse for body copy, controls, data, and navigation. Headline hierarchy is intentionally high-contrast: tight display leading, generous body leading, and compact all-caps Manrope labels with tracking for system navigation. No default-system or Inter-led presentation is used.

### Brand Essence

**Rinovabd is a Bangladesh-first beauty house for people who treat a daily ritual as a form of personal expression, combining expressive edits with transparent, operator-ready commerce.**

The brand personality is **bright, discerning, and candid**.

### Brand Voice

Headlines sound decisive, intimate, and image-aware; calls to action use useful verbs; microcopy says exactly what will happen. Empty lifestyle superlatives and generic onboarding language are excluded.

> “Colour, considered.”

> “Put a better ritual in your bag.”

### Wordmark & Logo

The wordmark uses a custom-feeling serif lockup with a deliberately extended **R** leg and an offset dot motif. The accompanying standalone logo mark is a bold, abstract **R/ribbon loop**: a folded pink strip that creates a flower-like aperture without using text. It appears visibly in the masthead, app icon, favicon, and admin rail.

### Signature Brand Color

**Rinova Pink — #F767A5**

## Style Decisions

- The provided pink reference is a colour reference only; it anchors the signature Rinova Pink and surface treatment.
- Prominent imagery must use distinct, generated visual assets rather than repeat a single photograph.
- The redesign must be a standalone replacement architecture; none of the former Worker, D1, KV, or R2 resources are to be referenced or modified.
- Product archive views must never resolve into a plain centered ecommerce grid; every shelf page carries a visible ribbon rail, asymmetric break, or editorial band.
- The standalone Rinova mark is a folded ribbon-loop symbol with a visible aperture; the wordmark includes a deliberately tailored serif detail.
- Repeated imagery is only used when deliberately re-cropped or re-treated; each major section introduces a distinct campaign image, still life, or ribbon composition within the same pink/parchment world.
- Every public commerce route carries a visibly art-directed merchandising field before product browsing: a ribbon rail, asymmetric shelf, editorial band, or cut-corner panel.
- Utility moments, including account and Studio access, use the same printed-physical vocabulary as the storefront through pink label tabs, graphite rules, and cut-corner panels.
- Rinova Pink carries navigation and status: it marks category index rails, selected controls, secure entry cues, launch surfaces, and other high-intent commerce signals.
