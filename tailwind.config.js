/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light theme surfaces
        'light-bg':       '#F2F4F8',
        'light-surface':  '#FFFFFF',
        'light-surface-2':'#EEF0F5',
        'light-border':   '#E4E7EE',
        'light-text':     '#0D1117',
        'light-muted':    '#6C7585',

        // Dark theme surfaces
        'dark-bg':        '#0A0F1E',
        'dark-surface':   '#111827',
        'dark-surface-2': '#1A2236',
        'dark-border':    '#1E2D45',
        'dark-text':      '#F0F4FF',
        'dark-muted':     '#8896B0',

        // Brand
        primary:        '#5B54F5',
        'primary-dark': '#4B44E8',
        accent:         '#8B5CF6',
        'accent-light': '#A78BFA',

        // Status
        online:  '#22C55E',
        away:    '#F59E0B',
        offline: '#6B7280',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        'glow-primary': '0 0 20px rgba(91, 84, 245, 0.4)',
        'glow-accent':  '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-sm':      '0 0 8px rgba(91, 84, 245, 0.3)',
        'card-light':   '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-dark':    '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.25)',
        'bubble':       '0 1px 4px rgba(0,0,0,0.1)',
        'premium':      '0 4px 14px rgba(91, 84, 245, 0.35)',
        'popup':        '0 8px 30px rgba(0,0,0,0.12)',
      },

      backgroundImage: {
        'gradient-brand':      'linear-gradient(135deg, #5B54F5 0%, #8B5CF6 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(91,84,245,0.12) 0%, rgba(139,92,246,0.12) 100%)',
        'gradient-dark':       'linear-gradient(135deg, #0A0F1E 0%, #1A2236 100%)',
        'gradient-bubble-sent':'linear-gradient(135deg, #5B54F5 0%, #8B5CF6 100%)',
      },

      animation: {
        'float':         'float 3.5s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2.5s ease-in-out infinite',
        'wave':          'waveAnim 0.9s ease-in-out infinite alternate',
        'typing-bounce': 'typingBounce 1.2s ease-in-out infinite',
        'message-in':    'messageIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer':       'shimmer 1.6s infinite linear',
        'bounce-soft':   'bounce-soft 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'ping-hey':      'heyPingRing 1s cubic-bezier(0,0,0.2,1)',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(91,84,245,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(91,84,245,0.15)' },
        },
        waveAnim: {
          from: { transform: 'scaleY(0.4)' },
          to:   { transform: 'scaleY(1.8)' },
        },
        typingBounce: {
          '0%, 60%, 100%': { transform: 'translateY(0)',    opacity: '0.4' },
          '30%':           { transform: 'translateY(-5px)', opacity: '1' },
        },
        messageIn: {
          from: { opacity: '0', transform: 'scale(0.92) translateY(6px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        'bounce-soft': {
          '0%':  { transform: 'scale(0.4)', opacity: '0' },
          '70%': { transform: 'scale(1.08)' },
          '100%':{ transform: 'scale(1)',   opacity: '1' },
        },
        heyPingRing: {
          '0%':   { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      height: {
        '13': '3.25rem',
      },
    },
  },
  plugins: [],
};
