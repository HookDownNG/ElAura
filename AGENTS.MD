# UI & Responsive Design Rules

## Mobile-First Architecture

- **Default Styles Target Mobile:** Always write base CSS classes for mobile screens first (without breakpoint prefixes).
- **Progressive Enhancement:** Use responsive breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`) strictly to override mobile styles for larger screens (e.g., `flex-col md:flex-row`, `w-full md:w-auto`).
- **Touch-Friendly Controls:** Ensure interactive elements (buttons, inputs, tap targets) maintain a comfortable tap target size on mobile layouts (e.g., `min-h-11` or `h-11`).

## Tailwind CSS Rules

- **No Arbitrary Values:** Never use arbitrary bracket values (e.g., `min-h-[44px]`, `w-[320px]`, `p-[16px]`) when a standard Tailwind scale utility exists.
- **Strict Scale Usage:** Always map pixel measurements to the closest standard Tailwind spacing scale (e.g., use `min-h-11` instead of `min-h-[44px]`, `p-4` instead of `p-[16px]`, `w-80` instead of `w-[320px]`).
- **Custom Config Exemption:** Only use bracket values for custom CSS variables or unique values outside the default 4px grid system.

# Code Cleanliness & Dead Code Rules

## No Unused Variables or Imports

- **Zero Dead Imports:** Always remove unused `import` statements immediately after modifying or refactoring a file.
- **No Unused Variables:** Never leave declared variables, parameters, or types unused.
- **Naming Exceptions:** If an argument or variable _must_ be declared but is intentionally unused (e.g., in a signature or callback), prefix it with an underscore (e.g., `_req`, `_index`).
- **Pre-Output Self-Check:** Before completing any file edit, verify that every imported module and declared variable in the file is actively referenced.

# Style & Color Palette Rules

## Strict Global CSS & Theme Usage

- **Single Source of Truth:** Only use design tokens, brand colors, and utility variables defined in `app/globals.css` .
- **No Direct Color Hardcoding:** Never hardcode raw hex values, RGB/HSL strings, or inline color definitions directly inside JSX/TSX component files (e.g., avoid `bg-[#121212]`, `text-[#0055FF]`, or `style={{ color: '#...' }}`).
- **Adding New Colors:** If a component requires a new color or design token that does not exist in the current configuration, you MUST add the CSS variable / theme definition directly to `globals.css` first, then reference its generated class (e.g., `bg-brand-primary`) in the component.
