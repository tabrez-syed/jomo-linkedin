export const backgroundSystem = {
  imageLayerOpacity: 0.86,
  skyOverlayGradient:
    'linear-gradient(180deg, rgba(139, 160, 151, 0.3) 0%, rgba(143, 164, 156, 0.34) 45%, rgba(231, 239, 234, 0.47) 100%)',
  imageParallaxSpeed: 0.06,
  hillsParallaxSpeed: 0.03,
  treesParallaxSpeed: 0.05,
  enableParallaxByDefault: false
} as const;

export function mountAtmosphereLayers() {
  if (document.querySelector('[data-jomo-atmosphere="true"]')) {
    return;
  }

  const atmosphere = document.createElement('div');
  atmosphere.className = 'jomo-atmosphere';
  atmosphere.setAttribute('data-jomo-atmosphere', 'true');

  const sky = document.createElement('div');
  sky.className = 'jomo-layer jomo-layer-sky';

  const skyOverlay = document.createElement('div');
  skyOverlay.className = 'jomo-layer jomo-layer-sky-overlay';

  const hills = document.createElement('div');
  hills.className = 'jomo-layer jomo-layer-hills';

  const trees = document.createElement('div');
  trees.className = 'jomo-layer jomo-layer-trees';

  atmosphere.append(sky, skyOverlay, hills, trees);
  document.body.prepend(atmosphere);
}

export function applyBackgroundSystem() {
  const root = document.documentElement;
  root.style.setProperty('--j-bg-image-opacity', String(backgroundSystem.imageLayerOpacity));
  root.style.setProperty('--j-bg-sky-gradient', backgroundSystem.skyOverlayGradient);
}

export function setupParallaxBehavior() {
  const prefersReducedMotion = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  if (prefersReducedMotion || !backgroundSystem.enableParallaxByDefault) {
    return () => {};
  }

  const root = document.documentElement;
  const update = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    root.style.setProperty('--j-parallax-sky-y', `${(scrollY * backgroundSystem.imageParallaxSpeed).toFixed(2)}px`);
    root.style.setProperty('--j-parallax-hills-y', `${(scrollY * backgroundSystem.hillsParallaxSpeed).toFixed(2)}px`);
    root.style.setProperty('--j-parallax-trees-y', `${(scrollY * backgroundSystem.treesParallaxSpeed).toFixed(2)}px`);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });

  return () => {
    window.removeEventListener('scroll', update);
  };
}

export function initializeBackgroundSystem() {
  mountAtmosphereLayers();
  applyBackgroundSystem();
  return setupParallaxBehavior();
}
