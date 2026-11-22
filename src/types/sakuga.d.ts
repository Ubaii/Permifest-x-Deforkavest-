import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sakuga-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'secondary';
          type?: 'button' | 'submit' | 'reset';
          disabled?: boolean;
          class?: string;
        },
        HTMLElement
      >;
    }
  }

  interface HTMLElement {
    done?: (hold?: number) => void;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'sakuga-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'secondary';
          type?: 'button' | 'submit' | 'reset';
          disabled?: boolean;
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
