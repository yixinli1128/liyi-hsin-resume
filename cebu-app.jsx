import React from 'react';
import { createRoot } from 'react-dom/client';
import FlexCarousel from './components/FlexCarousel.jsx';

const aspects = [1200 / 1600, 1600 / 1200, 1600 / 1200, 900 / 1600, 1200 / 1600, 900 / 1600, 900 / 1600, 1600 / 1200, 1199 / 1600, 1199 / 1600, 1199 / 1600];
const items = aspects.map((aspect, index) => ({
  src: `assets/cebu/cebu-${String(index + 1).padStart(2, '0')}.jpg`,
  alt: `宿霧遊學照片 ${index + 1}`,
  title: `Cebu Moment ${String(index + 1).padStart(2, '0')}`,
  subtitle: 'IMS Academy Cebu',
  aspect
}));

// The OGL canvas needs WebGL2. Use the React Bits component on the deployed
// HTTPS site, while direct file:// previews intentionally use the HTML gallery.
if (window.location.protocol !== 'file:') {
  document.documentElement.dataset.flexCarousel = 'true';

  createRoot(document.querySelector('#cebu-carousel')).render(
    <FlexCarousel
      items={items}
      preset="ribbon"
      intro="spin"
      cardHeight={0.57}
      gap={12}
      squeeze={0.2}
      focusOnClick
      captions
      lensWidth={0.8}
      lensHeight={0.8}
      tilt={0}
      reach={0.34}
      curl="rise"
      dispersion={0.4}
    />
  );
}
