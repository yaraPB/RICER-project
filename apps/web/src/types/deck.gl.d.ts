declare module '@deck.gl/core' {
  export class Layer<Props = Record<string, unknown>> {
    constructor(props: Props);
  }
}

declare module '@deck.gl/layers' {
  export class IconLayer<T = unknown> {
    constructor(props: {
      id: string;
      data: T[];
      getPosition: (d: T) => [number, number];
      getIcon: (d: T) => { url: string; width: number; height: number };
      getSize?: () => number;
      [key: string]: unknown;
    });
  }

  export class PathLayer<T = unknown> {
    constructor(props: {
      id: string;
      data: T[];
      getPath: (d: T) => [number, number][];
      getColor?: () => number[];
      getWidth?: () => number;
      [key: string]: unknown;
    });
  }
}

declare module '@deck.gl/mapbox' {
  import type { ReactNode } from 'react';

  export interface MapboxOverlayProps {
    layers?: unknown[];
    children?: ReactNode;
  }

  export function MapboxOverlay(props: MapboxOverlayProps): ReactNode;
}
