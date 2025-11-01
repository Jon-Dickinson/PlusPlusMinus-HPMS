declare module '@/data/*' {
  const content: any;
  export const buildings: any;
  export default content;
}

declare module '@/context/*' {
  import React from 'react';

  // Provide common exports used from context modules so TypeScript can resolve
  // named imports like `import { useCity } from '@/context/CityContext'`.
  export const CityProvider: React.FC<{ children?: React.ReactNode }>;
  export function useCity(): any;

  const content: any;
  export default content;
}

declare module '@/components/*' {
  const content: any;
  export default content;
}

declare module '@/*' {
  const content: any;
  export default content;
}
