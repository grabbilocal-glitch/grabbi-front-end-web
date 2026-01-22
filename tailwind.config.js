/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: '#0f2a1d',
          emerald: '#1f4b2c',
          mint: '#52c98b',
          cream: '#fdf8ef',
          gold: '#f4ce6a',
          graphite: '#0b1115',
        },
        surface: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 60px -15px rgba(16, 107, 68, 0.45)',
        glass: '0 15px 50px -10px rgba(0,0,0,0.35)',
        card: '0 10px 30px -12px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xs: '4px',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 20% 20%, rgba(82,201,139,0.18), transparent 25%), radial-gradient(circle at 80% 0%, rgba(244,206,106,0.2), transparent 30%), radial-gradient(circle at 50% 80%, rgba(31,75,44,0.3), transparent 35%)',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
