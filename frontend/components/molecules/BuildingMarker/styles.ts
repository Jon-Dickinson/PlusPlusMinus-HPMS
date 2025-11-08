import styled from 'styled-components';

export const Placed = styled.div`
  position: absolute;
  transform: translate(-50%, -100%);
  z-index: 3;
  cursor: pointer;
  transition: transform 120ms ease, filter 120ms ease;
  &:hover {
    transform: translate(-50%, -100%) scale(1.03);
    filter: drop-shadow(0 8px 16px rgba(2, 6, 23, 0.12));
  }
`;

export const Img = styled.img`
  width: auto;
  height: auto;
  display: block;
  pointer-events: none;
`;