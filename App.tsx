import React from 'react';
import Navigation from './src/navigation/navigation';
import { ThemeProvider } from 'styled-components/native';
import { theme } from './src/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Navigation />
    </ThemeProvider>
  );
}