import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sakuga-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: string;
          disabled?: boolean;
          type?: string;
          ref?: any;
        },
        HTMLElement
      >;
    }
  }

  namespace React.JSX {
    interface IntrinsicElements {
      'sakuga-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: string;
          disabled?: boolean;
          type?: string;
          ref?: any;
        },
        HTMLElement
      >;
    }
  }

  interface HTMLElement {
    done?: (hold?: number) => void;
    impact?: () => void;
  }
}

export {};
