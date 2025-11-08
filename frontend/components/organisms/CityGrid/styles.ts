import styled from 'styled-components';

export const GridContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  padding: 8px;
  max-width: 964px;
  min-height: 420px;
`;

export const CellContainer = styled.div<{ isOver: boolean }>`
  /* Use vmin so it scales with both width and height of the screen */
  width: 6vmin;
  height: 6vmin;

  /* Optional min/max limits so it doesn’t get too big or too small */
  min-width: 50px;
  min-height: 50px;
  max-width: 90px;
  max-height: 90px;

  margin: 2px;
  border: ${({ isOver }) => (isOver ? '1px solid #b6b9c5ff' : '1px solid #414E79')};
  background-color: transparent;
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease; /* smoother scaling */
`;


export const BuildingItemContainer = styled.div<{ offset: number; buildingIndex: number; isDragging: boolean }>`
  position: absolute;
  bottom: ${({ offset }) => offset}px;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${({ buildingIndex }) => buildingIndex + 1};
  opacity: ${({ isDragging }) => (isDragging ? 0.1 : 1)};
`;

export const BuildingImage = styled.img<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  object-fit: contain;
  display: block;
`;

export const PlaceholderDiv = styled.div<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background-color: #e5e7eb;
`;

export const CountIndicator = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 12px;
  color: #374151;
`;