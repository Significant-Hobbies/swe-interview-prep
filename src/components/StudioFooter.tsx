import { createElement, useEffect } from 'react';

const config = {
  summary:
    'Personal, maintenance-only learning software for turning interview study into retained, artifact-backed understanding. No paid tier or checkout.',
  groups: [
    {
      title: 'Learn',
      links: [
        { label: 'How it works', href: '/login' },
        { label: 'Curriculum', href: '/curriculum/' },
      ],
    },
    {
      title: 'Product',
      links: [
        { label: 'Changelog', href: '/changelog' },
        { label: 'Privacy', href: '/privacy' },
      ],
    },
  ],
  art: {
    src: '/footer-art/swe-interview-prep.webp',
    alt: 'SWE Interview Prep: A practical learning workshop centers a small built artifact and review notebook. Concept sketches, a drill jig and an application folio form a physical sequence in the wings; the journey ends with evidence rather than a trophy.',
    position: '50% 50%',
  },
};

/** The SaaS Maker UI framework-free footer (public/footer.css + footer.js, from @saas-maker/ui). */
function loadFooterAssets() {
  if (!document.querySelector('link[data-studio-footer]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/footer.css';
    css.dataset.studioFooter = '';
    document.head.append(css);
  }
  if (!document.querySelector('script[data-studio-footer]')) {
    const js = document.createElement('script');
    js.type = 'module';
    js.src = '/footer.js';
    js.dataset.studioFooter = '';
    document.body.append(js);
  }
}

export function StudioFooter() {
  useEffect(loadFooterAssets, []);
  return createElement(
    'studio-footer',
    {
      product: 'SWE Interview Prep',
      url: 'https://learn.significanthobbies.com',
      'catalog-id': 'swe-interview-prep',
      capture: 'newsletter',
      variant: 'studio',
      'privacy-url': 'https://learn.significanthobbies.com/privacy',
      'data-mode': 'dark',
    },
    createElement('script', {
      type: 'application/json',
      dangerouslySetInnerHTML: { __html: JSON.stringify(config) },
    })
  );
}
