import { createVuetify } from 'vuetify';

export default createVuetify({
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme: {
        dark: false,
        colors: {
          primary: '#008448',
          secondary: '#00592f',
          info: '#e9ecef',
          background: '#f8f9fa',
          surface: '#ffffff',
          error: '#f44336',
          warning: '#ff9800',
          success: '#4caf50',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff'
        }
      }
    }
  }
});
