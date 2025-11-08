import styled, { keyframes } from 'styled-components';

export const spin = keyframes`
  from { transform: rotate(0deg) }
  to   { transform: rotate(360deg) }
`;

export const LoadingSpinner = styled.div<{ size?: number }>`
  width: ${(props) => props.size ?? 12}px;
  height: ${(props) => props.size ?? 12}px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: rgba(255, 255, 255, 0.9);
  animation: ${spin} 1s linear infinite;
`;