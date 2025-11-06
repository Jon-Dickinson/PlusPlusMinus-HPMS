import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg) }
  to   { transform: rotate(360deg) }
`;

const S = styled.div<{ size?: number }>`
  width: ${(p) => p.size ?? 12}px;
  height: ${(p) => p.size ?? 12}px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: rgba(255, 255, 255, 0.9);
  animation: ${spin} 1s linear infinite;
`;

export default function Spinner({ size = 12 }: { size?: number }) {
  return <S size={size} aria-hidden role="presentation" />;
}
