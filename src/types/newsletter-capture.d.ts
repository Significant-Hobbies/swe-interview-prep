import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare module 'react' {
  // biome-ignore lint/style/noNamespace: React's JSX intrinsic element augmentation uses this namespace.
  namespace JSX {
    interface IntrinsicElements {
      'saas-maker-newsletter-capture': DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'catalog-id': string;
        'product-name'?: string;
        kind?: 'newsletter' | 'waitlist';
        source?: string;
        'privacy-url'?: string;
        theme?: 'dark' | 'light';
      };
    }
  }
}
