/// <reference types="vite/client" />

import type * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties {
    [index: `--${string}`]: any;
  }
}

declare module 'react' {
  interface CSSProperties extends CSS.Properties<string | number> {
    [key: string]: any;
  }
}
