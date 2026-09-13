# ReadEase Accessibility Checker

ReadEase is a web-based accessibility evaluation tool designed to help developers and designers identify, understand, and improve common accessibility issues in their interfaces.

It provides real-time feedback for color contrast, readability, color-vision simulation, and multi-color palette contrast — helping users move from identifying an issue to understanding what they can do next.

## Live Demo

https://readease-accessibility-checker.vercel.app/

## Overview

Accessibility issues are not always easy to identify from visual inspection alone. A color combination may look readable while failing recommended contrast levels, and numerical accessibility results can be difficult to interpret without additional guidance.

ReadEase was built to make selected accessibility checks more understandable and actionable.

Instead of only displaying calculated results, the tool also provides plain-language interpretations, improvement guidance, and accessible foreground color recommendations.

## Key Features

### Color Contrast Checker

Evaluate foreground and background colors using WCAG-based contrast calculations.

ReadEase displays:

- Contrast ratio
- AA and AAA results for normal text
- AA and AAA results for large text
- Plain-language interpretation of the result
- Live visual preview

### Fix My Contrast

When a color pairing needs improvement, ReadEase can recommend a nearby foreground color that satisfies a selected WCAG contrast target while keeping the background unchanged.

Recommendations are generated deterministically by preserving the original foreground hue and saturation while searching for a suitable lightness value.

Users can apply a recommendation directly and immediately re-evaluate the interface.

### Palette Checker

Evaluate multiple colors together instead of checking every combination manually.

Users can add between 2 and 6 colors. ReadEase evaluates every unique color pair and categorizes the results as:

- Strong — AAA for normal text
- Usable — AA for normal text
- Large text only — AA for large text
- Needs improvement — insufficient text contrast

A six-color palette produces 15 unique pair evaluations.

### Readability Analyzer

Analyze English text using:

- Flesch Reading Ease
- Flesch-Kincaid Grade Level
- Word count
- Sentence count

ReadEase also explains the meaning of each readability metric instead of displaying unexplained scores.

To avoid presenting extremely short samples with excessive confidence, a minimum sample of 20 words is required before readability results are presented as a meaningful estimate.

### Color Vision Simulator

Preview foreground and background colors under approximate simulations of:

- Protanopia
- Deuteranopia
- Tritanopia

The simulations are based on color transformation matrices and are intended as design evaluation aids rather than medical representations of individual color vision.

ReadEase also re-evaluates text contrast under the simulated color pairs.

### Accessibility Summary

ReadEase combines results into a concise summary that helps users understand what may require attention.

The summary provides guidance for:

- Text contrast
- Readability
- Color-vision evaluation

These checks cover selected aspects of accessibility and do not establish full WCAG compliance.

## How It Works

### WCAG Contrast Calculation

ReadEase converts sRGB color values to linear RGB, calculates relative luminance, and derives the contrast ratio between two colors.

The resulting ratio is evaluated against WCAG contrast thresholds for normal and large text.

Representative validation cases include:

- Black / White → `21:1`
- `#777777` / White → approximately `4.48:1`

The contrast calculation is centralized and reused across the Contrast Checker, Palette Checker, color recommendations, and simulated contrast evaluation.

### Accessible Color Recommendations

The Fix My Contrast engine searches for an alternative foreground color while keeping the selected background fixed.

The algorithm:

1. Converts the foreground color into HSL.
2. Preserves its hue and saturation.
3. Searches deterministic lightness values.
4. Evaluates each candidate using the existing contrast engine.
5. Selects the closest passing candidate for the requested WCAG target.

AA and AAA recommendations are evaluated independently.

This approach avoids random or hard-coded color suggestions while keeping recommendations related to the user's original color.

### Palette Evaluation

For `N` valid colors, ReadEase evaluates every unique unordered pair:

`N × (N - 1) / 2`

For example:

- 2 colors → 1 pair
- 4 colors → 6 pairs
- 6 colors → 15 pairs

Each pair uses the same centralized WCAG contrast engine.

### Readability Analysis

ReadEase calculates Flesch Reading Ease and Flesch-Kincaid Grade Level using word, sentence, and estimated syllable counts.

Because extremely small samples can produce mathematically valid but misleading-looking scores, ReadEase withholds the main readability interpretation until at least 20 words are provided.

### Color Vision Simulation

ReadEase uses deterministic color transformations based on the Machado–Oliveira–Fernandes color-vision-deficiency model.

Color transformations are performed using linear RGB values before being converted back to displayable sRGB colors.

The resulting simulated foreground/background colors are then evaluated again using the existing WCAG contrast engine.

## Accessibility Considerations

The interface was designed with accessibility principles in mind, including:

- Keyboard-operable controls
- Visible focus states
- Explicit form labels
- Text-based pass/fail information
- Color swatches accompanied by HEX values
- Reduced-motion handling
- Responsive layouts
- Avoidance of color-only status communication
- Controlled live-region announcements

Accessibility was considered as part of both the product being evaluated and the interface performing the evaluation.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vercel

The application runs client-side and does not require a backend, database, authentication system, or external AI service.

## Validation

During development, ReadEase was checked using:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Representative contrast calculations and edge cases were also verified, including:

- Black and white
- Identical colors
- Light-on-light combinations
- Dark-on-dark combinations
- Invalid HEX values
- AA-only and AAA-passing combinations
- Duplicate palette colors
- Empty and insufficient readability samples

Responsive behavior was checked across mobile, tablet, and desktop widths.

## Limitations

ReadEase evaluates selected accessibility characteristics rather than performing a complete accessibility audit.

Important limitations include:

- Passing the included checks does not establish full WCAG compliance.
- Readability scores are estimates and depend on the intended audience and content.
- The 20-word readability threshold is a product guidance rule intended to avoid over-interpreting very small samples.
- Color-vision simulations are approximations and do not represent every individual's visual perception.
- Palette Checker evaluates pairwise text contrast, not overall palette quality or color harmony.
- Fix My Contrast currently adjusts the foreground while keeping the background fixed.

## Future Improvements

Potential future improvements include:

- Accessible palette generation
- Moving problematic palette pairs directly into the contrast fixer
- Text and UI use-case presets
- Design-token export
- Additional accessibility evaluation tools

## What I Learned

Building ReadEase helped me understand accessibility as more than a checklist or a final testing step.

Implementing the contrast engine gave me a deeper understanding of how sRGB conversion, relative luminance, and contrast ratios work. Developing the recommendation and palette features also showed me that identifying an accessibility problem is only part of the user experience — users also need understandable guidance for resolving it.

The project reinforced the importance of designing accessibility tools that are themselves understandable, keyboard-friendly, responsive, and careful about the limitations of the results they present.

## Links

**Live Demo:**  
https://readease-accessibility-checker.vercel.app/

**GitHub Repository:**  
https://github.com/AldoKT/readease-accessibility-checker