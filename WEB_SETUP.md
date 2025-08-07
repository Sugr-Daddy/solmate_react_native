# Solmate App - Web Setup

This document explains how to run the Solmate app on the web platform.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install web-specific dependencies:
```bash
npm install @expo/webpack-config react-dom react-native-web
```

## Running on Web

### Development Mode
```bash
npm run web
# or
npm run dev
```

This will start the development server and open the app in your browser at `http://localhost:8080`.

### Production Build
```bash
npm run build
```

This will create a production build in the `web-build` directory.

### Preview Production Build
```bash
npm run preview
```

This will serve the production build locally.

## Web-Specific Features

### Responsive Design
The app is optimized for mobile-first design but works well on desktop browsers. The web wrapper ensures the app maintains a mobile-like experience on larger screens.

### Web-Specific Styling
- Custom scrollbars
- Hover effects for buttons and cards
- Focus states for accessibility
- Responsive breakpoints

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `webpack.config.js`
2. **Build errors**: Clear node_modules and reinstall dependencies
3. **Styling issues**: Ensure Tailwind CSS is properly configured

### Development Tips

- Use browser dev tools to debug web-specific issues
- Check the console for any React Native Web warnings
- Test on different screen sizes to ensure responsiveness

## File Structure

```
solmate_app/
├── index.html              # Web entry point
├── webpack.config.js       # Webpack configuration
├── src/
│   ├── main.tsx           # Web entry point
│   ├── index.css          # Web-specific styles
│   └── components/
│       └── WebWrapper.tsx # Web wrapper component
└── tailwind.config.js     # Tailwind configuration
```

## Deployment

The web build can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3

Simply upload the contents of the `web-build` directory to your hosting service. 