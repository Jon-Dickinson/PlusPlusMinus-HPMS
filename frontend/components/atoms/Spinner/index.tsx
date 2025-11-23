import React from 'react';
import { LoadingSpinner } from './styles';

// Default convenience export — small wrapper still available
export default function Spinner({ size = 12 }: { size?: number }) {
  return <LoadingSpinner size={size} aria-hidden role="presentation" />;
}

// Allow direct import of the styled LoadingSpinner where callers need to apply
// accessible text or additional surrounding markup.
export { LoadingSpinner };
