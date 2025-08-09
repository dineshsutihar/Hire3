/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    foreground: 'var(--color-primary-foreground)'
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    foreground: 'var(--color-secondary-foreground)'
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    foreground: 'var(--color-accent-foreground)'
                },
                muted: 'var(--color-muted)',
                background: 'var(--color-bg)',
                foreground: 'var(--color-fg)',
                border: 'var(--color-border)'
            },
            boxShadow: {
                card: '0 2px 4px -2px rgba(0,0,0,0.08), 0 6px 16px -4px rgba(0,0,0,0.08)'
            }
        },
    },
    plugins: [],
};
