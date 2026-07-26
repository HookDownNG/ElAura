# UI & Responsive Design Rules

## Mobile-First Architecture

- **Default Styles Target Mobile:** Always write base CSS classes for mobile screens first (without breakpoint prefixes).
- **Progressive Enhancement:** Use responsive breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`) strictly to override mobile styles for larger screens (e.g., `flex-col md:flex-row`, `w-full md:w-auto`).
- **Touch-Friendly Controls:** Ensure interactive elements (buttons, inputs, tap targets) maintain a comfortable tap target size on mobile layouts (e.g., `min-h-11` or `h-11`).

## Tailwind CSS Rules

- **No Arbitrary Values:** Never use arbitrary bracket values (e.g., `min-h-[44px]`, `w-[320px]`, `p-[16px]`) when a standard Tailwind scale utility exists.
- **Strict Scale Usage:** Always map pixel measurements to the closest standard Tailwind spacing scale (e.g., use `min-h-11` instead of `min-h-[44px]`, `p-4` instead of `p-[16px]`, `w-80` instead of `w-[320px]`).
- **Custom Config Exemption:** Only use bracket values for custom CSS variables or unique values outside the default 4px grid system.
