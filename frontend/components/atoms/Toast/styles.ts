import styled, { keyframes } from 'styled-components';

const slideDown = keyframes`
  from { transform: translate(-50%, 0); opacity: 0 };
  to   { transform: translate(-50%, 20px); opacity: 1 };
`;

export const Container = styled.div<{ type?: string }>`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate(-50%, 20px);
  z-index: 9999;
  display: inline-block;
  min-width: 240px;
  max-width: 75vw;
  padding: 0.65rem 1rem;
  border-radius: 6px;
  color: #fff;
  box-shadow: 0 6px 18px rgba(0,0,0,0.45);
  font-weight: 600;
  animation: ${slideDown} 200ms ease-out;

  background: ${(p) => (p.type === 'success' ? '#4caf50' : p.type === 'error' ? '#ef4444' : '#ffffff')};
  @media (max-width: 520px) {
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 2rem);
    max-width: calc(100% - 2rem);
  }
`;

export default Container;
