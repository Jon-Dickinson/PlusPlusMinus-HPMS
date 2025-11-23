import styled from 'styled-components';

export const Layer = styled.div`
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4000;
`;

export const Icon = styled.div<{ x: number; y: number }>`
  position: absolute;
  transform: translate(-50%, -50%);
  left: ${(p) => p.x}px;
  top: ${(p) => p.y}px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));

  svg {
    width: 100%;
    height: 100%;
    fill: var(--color-danger, #ff4444) !important;
    transform-origin: 50% 50%;
    animation: destroy-pop 0.3s cubic-bezier(0.2, 0.9, 0.2, 1) both;
  }

  @keyframes destroy-pop {
    0% {
      transform: scale(0.28) rotate(-100deg);
      opacity: 0;
      filter: blur(2px) drop-shadow(0 2px 6px rgba(0,0,0,0.2));
    }
    60% {
      transform: scale(1.4) rotate(180deg);
      opacity: 1;
      filter: drop-shadow(0 6px 20px rgba(0,0,0,0.32));
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.28));
    }
  }
`;
