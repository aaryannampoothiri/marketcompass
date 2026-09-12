import React from 'react';
import { createRoot } from 'react-dom/client';
import HeroDemo from './hero-demo';

const container = document.getElementById('react-hero-root');
if (container) {
    const root = createRoot(container);
    root.render(<HeroDemo />);
}
