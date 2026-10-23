---
name: Sahayak
description: Teaching assistant for multi-grade classrooms, laid out like the term's school progress card.
colors:
  ground: "#f4f6f2"
  sheet: "#ffffff"
  rail: "#fafbf8"
  tray: "#e4e8e3"
  ink: "#17233a"
  ink-2: "#4f5b6b"
  ink-3: "#5f6a78"
  rule: "#c9d0cc"
  field: "#858f8a"
  brand: "#0f5a47"
  brand-deep: "#0b4a3a"
  brand-2: "#16637f"
  brand-tint: "#e3eee8"
  on-brand-muted: "#d7eae4"
  entry: "#2350a8"
  attention: "#b3312a"
  attention-tint: "#f8e4e1"
  caution: "#7a4f00"
  caution-tint: "#fdf1d8"
  success: "#1e6b45"
  success-tint: "#e2f0e7"
  band-a1: "#135a3a"
  band-a2: "#2a7f4c"
  band-b1: "#7faf3e"
  band-b2: "#c9b23c"
  band-c1: "#e7a93a"
  band-c2: "#e58a3e"
  band-d: "#b8432a"
  band-e: "#8e2620"
  subject-1: "#2b5fae"
  subject-2: "#7a3d9c"
  subject-3: "#a55a16"
  subject-4: "#2e7d4f"
  subject-5: "#b0304e"
  subject-6: "#0e7383"
  subject-7: "#6b4f2a"
  subject-8: "#4a5a7a"
typography:
  display:
    fontFamily: "Anek Latin, Anek Devanagari, Anek Tamil, Mukta, Mukta Malar, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 700
    lineHeight: "3.5rem"
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Anek Latin, Anek Devanagari, Anek Tamil, Mukta, Mukta Malar, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: "2.25rem"
  wordmark:
    fontFamily: "Anek Latin, Anek Devanagari, Anek Tamil, Mukta, Mukta Malar, sans-serif"
    fontSize: "1.5625rem"
    fontWeight: 700
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  subhead:
    fontFamily: "Anek Latin, Anek Devanagari, Anek Tamil, Mukta, Mukta Malar, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  title:
    fontFamily: "Anek Latin, Anek Devanagari, Anek Tamil, Mukta, Mukta Malar, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.625rem"
  body:
    fontFamily: "Mukta, Mukta Malar, Noto Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.625rem"
  body-long:
    fontFamily: "Mukta, Mukta Malar, Noto Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body-small:
    fontFamily: "Mukta, Mukta Malar, Noto Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.375rem"
  action:
    fontFamily: "Mukta, Mukta Malar, Noto Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.625rem"
  label:
    fontFamily: "Mukta, Mukta Malar, Noto Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.375rem"
  label-caps:
    fontFamily: "Anek Latin, Anek Devanagari, Anek Tamil, Mukta, Mukta Malar, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: "1.25rem"
    letterSpacing: "0.025em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  full: "9999px"
spacing:
  "1.5": "6px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.sheet}"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.brand-deep}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.ground}"
  button-danger:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.attention}"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.attention-tint}"
  button-on-brand:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.brand}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-on-brand-hover:
    backgroundColor: "{colors.brand-tint}"
  button-outline-on-brand:
    backgroundColor: "transparent"
    textColor: "{colors.sheet}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-outline-on-brand-hover:
    backgroundColor: "{colors.brand-deep}"
  button-quiet:
    textColor: "{colors.entry}"
    typography: "{typography.action}"
    padding: "0"
  button-small:
    typography: "{typography.label}"
    padding: "0 14px"
    height: "36px"
  button-large:
    padding: "0 24px"
    height: "48px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  input-disabled:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-3}"
  grade-toggle:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  grade-toggle-selected:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.sheet}"
  segment:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  segment-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
  topic-chip:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.sm}"
    padding: "4px 4px 4px 10px"
  band-chip-a1:
    backgroundColor: "{colors.band-a1}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
    width: "40px"
  band-chip-a2:
    backgroundColor: "{colors.band-a2}"
    textColor: "{colors.sheet}"
  band-chip-b1:
    backgroundColor: "{colors.band-b1}"
    textColor: "{colors.ink}"
  band-chip-b2:
    backgroundColor: "{colors.band-b2}"
    textColor: "{colors.ink}"
  band-chip-c1:
    backgroundColor: "{colors.band-c1}"
    textColor: "{colors.ink}"
  band-chip-c2:
    backgroundColor: "{colors.band-c2}"
    textColor: "{colors.ink}"
  band-chip-d:
    backgroundColor: "{colors.band-d}"
    textColor: "{colors.sheet}"
  band-chip-e:
    backgroundColor: "{colors.band-e}"
    textColor: "{colors.sheet}"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  sheet-title:
    typography: "{typography.title}"
    padding: "14px 20px"
  nav-item:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  nav-item-hover:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
  nav-item-active:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.ink}"
  masthead:
    textColor: "{colors.sheet}"
    typography: "{typography.wordmark}"
    padding: "0 20px"
    height: "64px"
  notice-error:
    backgroundColor: "{colors.attention-tint}"
    textColor: "{colors.attention}"
    typography: "{typography.body-small}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  notice-info:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-2}"
  notice-success:
    backgroundColor: "{colors.success-tint}"
    textColor: "{colors.success}"
  notice-caution:
    backgroundColor: "{colors.caution-tint}"
    textColor: "{colors.caution}"
  dialog:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    width: "min(1080px, calc(100vw - 2rem))"
---

# Design System: Sahayak

## Overview

**Creative North Star: "The School Progress Card"**

Sahayak is built to look like the register and report card a teacher already keeps. Pages sit on a cool card-stock ground; work happens on white sheets edged with hairline rules, with a blue-black ink rule under every header. Marks the teacher enters, and the averages computed from them, are written in fountain-pen blue. Anything below 33% is flagged in red ink and underlined. Every score is filed into one of the eight CBSE grade bands, weakest first. The only colour flourish is the green-to-teal masthead, which works like the school's letterhead.

This is an operating tool, not a showcase. Density is moderate and the type is deliberately large and plain for teachers with very different levels of digital confidence: 16px body, 44px controls, labels above every field. Numbers live in ruled tables, short sentences and the band strip. There are no big-number tiles, no illustrations and no decorative colour. Both type families carry Devanagari and Tamil siblings, so Hindi, Marathi and Tamil text sits in the same rhythm as English.

Depth comes from white sheets on card stock, edged by rules, never from shadow. Motion is a single gesture: a sheet rising 12px into place. Four user rules from PRODUCT.md are binding on every surface: no emojis anywhere; exactly one brand gradient; no glassmorphism; and each page lives in its own folder under `src/pages/` so it can be iterated on its own.

**Key Characteristics:**
- Card-stock ground, opaque white sheets and 1px rules, with an ink rule under every header.
- One gradient, used only on masthead bars and thin header bands.
- Every score is shown as one of eight CBSE grade bands and sorted weakest first.
- Colour carries meaning. Blue is an entered value or a link, red is below 33% or an error, and subject inks never change.
- State is shown by a mark (check, filled radio, underline, filled icon) as well as by colour.
- Square-shouldered corners: 4px on controls, 6px on sheets.
- Flat sheets. Shadow appears only on things that leave the page: the modal, the menu, the printed-page preview.

## Colors

A paper-and-ink palette: cool card stock and blue-black ink, one green-teal brand pair, two semantic inks, and two fixed data scales (grade bands and subject inks).

### Primary
- **Register Green** (#0f5a47): primary buttons, selected grade toggles, completed step marks, the active nav icon, the working spinner, the text caret, and the left stop of the masthead gradient. White text on it reaches 8.16:1.
- **Deep Register Green** (#0b4a3a): hover for primary buttons and the hover wash for controls that sit on the masthead.
- **Slate Teal** (#16637f): the right stop of the masthead gradient, the global focus ring and the focused field stroke. It is never used as a fill.
- **Pale Sage Tint** (#e3eee8): background for the active nav item and the selected row in a choice list, and the hover for the white on-brand button.
- **Masthead Mist** (#d7eae4): secondary text on the gradient (date, tagline). It reaches 5.37:1 at the teal end.

### Secondary
- **Fountain-Pen Blue** (#2350a8): values the teacher entered and the averages computed from them, text links and quiet buttons. Never decorative.

### Tertiary
- **Red Ink** (#b3312a): averages below 33% (always with a 2px underline), the "below 33%" name list, errors, invalid field strokes and danger buttons.
- **Red Ink Wash** (#f8e4e1): behind error notices and the danger-button hover.

### Neutral
- **Card-Stock Ground** (#f4f6f2): the page background on every route, the secondary-button hover and the disabled-field fill.
- **Report Sheet White** (#ffffff): sheets, dialogs, inputs, secondary buttons and the printed worksheet.
- **Rail Paper** (#fafbf8): the left navigation rail and the mobile drawer.
- **Tray Grey** (#e4e8e3): the tray behind the worksheet page preview, and skeleton bars.
- **Blue-Black Ink** (#17233a): text, headings, header rules, the secondary-button stroke and the fill of a selected single-choice segment. 15.7:1 on white.
- **Slate Secondary Ink** (#4f5b6b): descriptions, hints, captions and inactive nav labels. 6.91:1 on white.
- **Faded Pencil Grey** (#5f6a78): placeholders, rail group labels, upcoming step labels, inactive nav icons and empty-state icons. 5.1:1 on the card-stock ground and 5.5:1 on white.
- **Hairline Rule Grey** (#c9d0cc): row dividers, ordinary sheet borders and the rail edge.
- **Field Stroke Grey** (#858f8a): strokes on inputs, selects, unselected toggles and the upload drop zone. 3.3:1 on white, meeting the 3:1 non-text minimum.

### States
- **Caution** (#7a4f00 on #fdf1d8) and **Success** (#1e6b45 on #e2f0e7): notices and the server-status line. Each tone uses a 1px stroke in its ink colour over its tint.

### Grade Bands
The eight-point CBSE scale, from dark green to oxblood: **A1 Forest** (#135a3a, 91 to 100), **A2 Green** (#2a7f4c), **B1 Leaf** (#7faf3e), **B2 Mustard** (#c9b23c), **C1 Marigold** (#e7a93a), **C2 Saffron** (#e58a3e), **D Brick** (#b8432a) and **E Oxblood** (#8e2620, 32 and below). A1, A2, D and E carry white text. B1 to C2 carry blue-black ink. Every pairing reaches at least 4.95:1.

### Subject Inks
Eight fixed inks, assigned from one lookup: Science (#2b5fae), Maths (#7a3d9c), Hindi (#a55a16), EVS (#2e7d4f), Marathi (#b0304e), English (#0e7383), Tamil (#6b4f2a) and Social science (#4a5a7a). An unknown subject is hashed to one of the eight. The ink appears only as a 10px square swatch before the subject name.

### Named Rules
**The One Gradient Rule.** Binding user rule. The brand has exactly one gradient: Register Green to Slate Teal, left to right, applied only through the masthead utility. It may appear on the app masthead, the public masthead and the mobile drawer header, and as the thin 6-8px band that caps the At a glance dialog, the login card and the landing excerpt. Never on buttons, text, sheets, page backgrounds or charts. Never add a second gradient.

**The Grade Band Rule.** Every score is shown as its CBSE band with the percentage beside it. There is no other score colour scale, and band colours are used for nothing but scores.

**The Meaningful Ink Rule.** Blue means "a value you entered, or a link". Red means "below 33%, or something failed". A subject's ink is the same on every screen. If a colour does not carry one of these meanings, the element stays ink, grey or white.

## Typography

**Display Font:** Anek Latin (with Anek Devanagari, Anek Tamil, then Mukta)
**Body Font:** Mukta (with Mukta Malar for Tamil, Noto Sans, system-ui)
**Icons:** Material Symbols Outlined (weight 400, optical size 24)

**Character:** a slightly condensed, firm-shouldered display face set over a warm, open, Indic-first sans. Together they read like a printed school form, and both families render Devanagari and Tamil natively.

### Hierarchy
- **Display** (700, 52px on 56px, -0.025em; 38px on 44px below 640px): the landing headline only.
- **Headline** (700, 30px on 36px): one page title per route (in the page header), landing section titles, the At a glance title and the login title.
- **Wordmark** (700, 25px on 32px, -0.025em): "Sahayak" in the masthead and drawer.
- **Subhead** (600, 21px on 28px): headings inside a generated result, landing step names, the scanned-page subject.
- **Title** (600, 18px on 26px): sheet titles and dialog section headings.
- **Body** (400, 16px on 26px): default text, table cells, inputs, nav items and page-header descriptions.
- **Body Long** (400, 18px, 1.625 leading): generated stories and explanations, and the landing lede. Measure 58-70ch.
- **Body Small** (400, 14px on 22px): descriptions, hints, notices and secondary lines. This is the most-used size in the app.
- **Action** (600, 16px on 26px): text on standard buttons.
- **Label** (600, 14px on 22px): form labels and legends, small buttons, toggles.
- **Label Caps** (Anek 600, 13px on 20px, 0.025em, uppercase): table column headers and landing definition terms. Nav group labels use the same size at 700 with 0.08em tracking.

Weights in use: 400 for reading, 500 for student names in the first table column and for notice text, 600 for labels, titles and values, and 700 for display sizes, headlines, band IDs, step numbers and the wordmark.

### Named Rules
**The Two Families Rule.** Anek sets headings, the wordmark, column headers, band IDs and step numbers. Mukta sets everything else. A new face enters the system only if it ships Devanagari and Tamil glyphs.

**The Tabular Figures Rule.** Every mark, average, count and grade number uses tabular figures and sits right-aligned in its column, so a register can be scanned straight down.

**The Caps Are Column Heads Rule.** Small uppercase type is only for table column headers, definition terms and nav group labels. It never sits above a heading as a kicker.

## Layout

**Signed-in shell.** A sticky 64px gradient masthead sits above a 256px left rail (shown from 1024px). The rail is grouped Overview, Plan, Prepare, Assess and Account. Below 1024px the rail becomes a 288px drawer, opened from the masthead menu button, over a solid ink scrim. The main column has 16px side gutters on phones, 32px from 640px and 40px from 1024px, with 32px top and bottom padding. Content is capped at 1200px.

**Public pages.** Landing and login have no rail and use a 1160px column. Landing is one ink-bordered sheet divided into ruled sections. Login is a single 448px card.

**Page anatomy.** Every signed-in page opens with the page header: a Headline title with a Body description in Slate Secondary Ink on the left, actions on the right, and a 1px ink rule below with 32px of space after it. Sections then stack at 32px. Two-column splits appear only on wide screens: Home pairs the main column with a 360px side column from 1024px, At a glance splits 1.35fr to 1fr from 1024px, and Students splits into two equal columns from 1280px. Form columns are capped at 672px and reading text at 68-70ch. The worksheet preview renders at 794px (A4 at 96dpi) on a Tray Grey tray.

**Rhythm.** Spacing follows a 4px base: 6px from label to control, 8px between chips and buttons, 10px of vertical padding in table cells, 12px between list items, 20px inside sheets and between form fields, and 32px between sections.

**Responsive behaviour.** Below 640px, tables drop their secondary columns instead of scrolling sideways, filters and toggles wrap, and the step tracker loses its connectors. Below 768px, the landing week table becomes a stacked list. Breakpoints are 640, 768, 1024 and 1280px.

## Elevation & Depth

The system is flat and tonal. Depth comes from white sheets sitting on card-stock ground, edged by a 1px rule, and hierarchy comes from ink rules rather than lift. Shadows exist only for three things that leave the page plane. All three are tinted with the ink colour and use a negative spread, so they fall below the object rather than glowing around it.

### Shadow Vocabulary
- **Modal** (`box-shadow: 0 24px 48px -16px rgba(23,35,58,0.4)`): the At a glance dialog.
- **Popover** (`box-shadow: 0 12px 32px -12px rgba(23,35,58,0.35)`): the account menu.
- **Paper** (`box-shadow: 0 8px 24px -12px rgba(23,35,58,0.35)`): the worksheet page on its preview tray. It is removed in print.

Scrims are solid ink: the dialog backdrop at 55% and the drawer scrim at 50%.

### Named Rules
**The Flat Sheet Rule.** Sheets, tables, forms and nav never cast shadows. Anything that is part of the page is edged by a 1px rule.

**The Solid Scrim Rule.** Binding user rule. No glassmorphism: no backdrop blur, no translucent floating panels and no blur blobs. Overlays sit on a solid ink scrim, and every panel is opaque.

## Shapes

Corners are square-shouldered. Buttons, inputs, toggles, chips, band chips, notices, nav items and the band strip use 4px. Sheets, dialogs, the account menu, the landing article, the upload drop zone and the worksheet tray use 6px. Full circles are reserved for the 32px step marks and the account initial. Subject swatches use 2px.

There is one stroke weight. Ink-coloured 1px rules mark structure: under page headers, sheet titles and table heads, across dialog headers and footers, and around featured containers (the landing article, the login card, the landing excerpt, the band legend). Grey 1px rules divide rows and edge ordinary sheets. The build has three deliberate exceptions: a 2px underline under red-ink averages, a 2px ink rule under the printed worksheet title (a printed document, not UI), and a dashed field stroke that marks the file drop zone. Gradient bands sit inside clipped containers so they inherit the container's corners.

**The One Hairline Rule.** Interface borders are 1px. To add emphasis, change the rule's colour to ink. Never make it thicker.

## Components

### Buttons
Plain, firm and square-shouldered.
- **Shape:** 4px corners.
- **Primary:** Register Green fill with white Action text, 44px tall with 20px sides. The small size is 36px with 14px sides and Label text. The large size is 48px with 24px sides and 18px text. A leading icon (20px, or 18px when small) sits 8px from the text.
- **Hover / Focus:** primary darkens to Deep Register Green, and secondary and danger take a ground or wash fill. The change is a 150ms colour transition only, with no lift. Focus is a 2px Slate Teal outline with a 2px offset on every focusable element.
- **Secondary:** white with a 1px ink stroke and ink text.
- **Danger:** white with a Red Ink stroke and text, and a Red Ink Wash on hover.
- **Quiet:** Fountain-Pen Blue text with no box. The underline appears on hover.
- **On the masthead:** a white button with green text ("Open Sahayak"), or a 1px white outline with white text ("Sign in", "At a glance"), which darkens to Deep Register Green on hover.
- **Loading / Disabled:** a spinning progress icon replaces the leading icon, `aria-busy` is set and the label may change ("Refreshing"). Disabled buttons drop to 50% opacity.
- **Google sign-in** is a primary button with the Google mark on a 24px white tile. It is the only place a foreign brand's colours appear.

### Chips
- **Band chip:** at least 40px wide with 2px by 6px padding, Anek 13px at 700, filled with its band colour. A tooltip gives the percentage range. When there is no score it reads "Not assessed" in Faded Pencil Grey.
- **Grade toggle (multi-select):** 40px tall, white with a Field Stroke Grey stroke. Selected toggles turn Register Green with white text and gain a leading check icon. On hover, an unselected toggle's stroke turns ink.
- **Segment (single choice):** worksheet grade tabs, library filters and planner days. Same shape as the grade toggle. The selected segment is filled with ink and has white text.
- **Topic chip:** ground fill, rule stroke, Body Small text, and a 24px remove button.

### Cards / Containers (Sheet)
- **Corner Style:** 6px.
- **Background:** Report Sheet White on Card-Stock Ground.
- **Shadow Strategy:** none (see the Flat Sheet Rule).
- **Border:** 1px Hairline Rule Grey. Featured containers use ink.
- **Title row:** 14px by 20px padding, Title text, an optional Body Small description, and an action on the right, closed by a 1px ink rule.
- **Internal Padding:** 20px. Sheets led by a table or list set the body padding to zero so rows run edge to edge.

### Inputs / Fields
- **Style:** 44px tall, white, 1px Field Stroke Grey, 4px corners, 12px sides, 16px text. Placeholders are Faded Pencil Grey. Textareas have 10px vertical padding and resize vertically. Selects are native, with a chevron 10px from the right edge.
- **Label and hint:** the Label sits above the control with a 6px gap. The hint sits below in Body Small Slate Secondary Ink.
- **Focus:** the stroke turns Slate Teal and the global focus ring is added.
- **Error / Disabled:** errors get a Red Ink stroke, `aria-invalid`, and a Red Ink message with an error icon below the control. Disabled fields take a Card-Stock Ground fill and Faded Pencil Grey text.
- **Choice group:** a ruled radio list with one hairline per option. The selected row takes Pale Sage Tint and a filled green radio mark. From 640px the option hint sits inline.

### Navigation
- **Masthead:** a 64px sticky gradient bar. It holds the Anek wordmark, the long date in Masthead Mist (from 768px), the outline "At a glance" button (from 640px; on phones the Home page header shows a secondary button instead), a language select with a white stroke on a transparent ground, and the account menu. The account menu is a white circle showing the user's initial, opening a white popover with an ink border and the Popover shadow.
- **Side rail:** Rail Paper with a 1px rule on its right edge. Group labels are Anek 13px at 700, uppercase, 0.08em. Items are 40px tall with 4px corners and Body text. Inactive items use Slate Secondary Ink with an outlined icon in Faded Pencil Grey. Hover adds a ground wash. The active item takes Pale Sage Tint, 600 weight and a filled Register Green icon. A server-status line sits at the foot of the rail.
- **Mobile:** a 40px menu button opens a 288px drawer on the left edge that rises 12px into place, with a gradient header. Escape or a tap on the scrim closes it.
- **Step tracker:** 32px circle marks. Done is a green fill with a check, current is an ink fill with the step number, and upcoming is a rule stroke with a faded number. A 24px rule connects the steps and is hidden on phones.

### Progress Table (signature)
The register at the heart of the system. Column heads are Label Caps on a 1px ink rule. Rows have 10px of vertical padding and 1px rule dividers. Student names are set at 500. Averages are 600, tabular and right-aligned, in Fountain-Pen Blue, or in Red Ink with a 2px underline below 33%. The band chip comes last. Rows sort weakest first by default, and secondary columns hide below 640px.

### Band Strip (signature)
A 20px bar (32px in the tall variant) with a 1px ink stroke and 4px corners. Its segments are sized by count and filled in band colours. Below it, an eight-column legend lists each band ID (Anek 13px at 700) above its count (14px, tabular). The bar is exposed to assistive tech as an image with a text summary.

### At a Glance Dialog (signature)
A native modal dialog, up to 1080px wide, with 6px corners, a 1px ink border and the Modal shadow, capped by an 8px gradient band. It rises 12px into place over 220ms. The header holds the Headline title, a date-and-class line and a 40px close button. From 1024px the body splits into two panes, class progress and today's periods, divided by a 1px rule. The footer, above an ink rule, holds a quiet link on the left and the primary "Close and continue" button on the right.

### Feedback
- **Notice:** 4px corners, a 1px stroke in the tone colour over its tint, Body Small text at 500 and a 20px tone icon. Errors announce as alerts. Info notices use ground, rule and Slate Secondary Ink.
- **Empty state:** left-aligned, with a 28px Faded Pencil Grey icon, a 16px title at 600, one line of Body Small and a single action.
- **Waiting:** 20px Tray Grey skeleton bars with 4px corners pulse every 1.4s. A working line shows a spinning green icon next to 14px status text.

## Do's and Don'ts

### Do:
- **Do** put every page in its own folder under `src/pages/<page>/`, with its page-only parts beside it, and take shared parts from `src/components/ui/` and `src/components/layout/`. (Binding user rule.)
- **Do** open every signed-in page with the page header: a Headline title, a Body description, actions on the right, and a 1px ink rule below.
- **Do** build on the sheet: white, 6px corners, a 1px rule border, its title on an ink rule, and 20px padding.
- **Do** show every score as a band chip beside its percentage, sorted weakest first. Write averages in Fountain-Pen Blue, and in Red Ink with a 2px underline below 33%.
- **Do** show state with a mark as well as colour: a check on done steps and selected grade toggles, a filled radio in choice lists, an underline on red values, a filled icon on the active nav item.
- **Do** use tabular figures, right-aligned, for every number column.
- **Do** keep controls 44px tall (36px for small) with 4px corners and the 2px Slate Teal focus ring.
- **Do** use Material Symbols Outlined at 16, 18, 20 or 24px. Use the filled style only for the active nav item and status marks.
- **Do** label any demonstration data as sample data in a visible caption.

### Don't:
- **Don't** use emojis anywhere: not in copy, labels, buttons, empty states or around generated content. (Binding user rule.)
- **Don't** add a second gradient, or use the masthead gradient anywhere except masthead bars and the thin 6-8px bands that cap dialogs and cards. (Binding user rule.)
- **Don't** use glassmorphism: no backdrop-filter or blur, no translucent floating panels, no blur blobs. Scrims are solid ink. (Binding user rule.)
- **Don't** present numbers as big-number stat tiles, or float cards on shadows. Numbers belong in ruled tables, sentences and the band strip.
- **Don't** invent another score colour scale, or use band colours for anything other than scores.
- **Don't** use Red Ink or Fountain-Pen Blue decoratively.
- **Don't** lighten Faded Pencil Grey below #5f6a78; anything paler drops under 4.5:1 on the ground and the rail.
- **Don't** set uppercase kickers or eyebrows above headings.
- **Don't** thicken a border for emphasis. Change the 1px rule to ink instead.
- **Don't** add motion beyond the 220ms sheet rise, 150ms colour transitions and the loading indicators. Every animation must collapse under reduced motion.
