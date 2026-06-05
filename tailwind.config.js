module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#12121A',
        primary: '#7C3AED',
        secondary: '#06B6D4',
        accent: '#EC4899',
        auroraTeal: '#4EE1C1',
        auroraCyan: '#22D3EE',
        auroraMagenta: '#FF6EC7',
        gold: '#FFD56B'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
}
