import React from 'react';
import { LoadingSpinner } from './styles';

export default function Spinner({ size = 12 }: { size?: number }) {
  return <LoadingSpinner size={size} aria-hidden role="presentation" />;
}
