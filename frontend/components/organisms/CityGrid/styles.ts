import styled from 'styled-components';

export const GridContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  padding: 0;
  max-width: 960px;
`;

export const CellContainer = styled.div<{ isOver: boolean }>`
  min-width: 60px;
  min-height: 60px;
  max-width: 60px;
  max-height: 60px;
  margin: 0;
  border: ${({ isOver }) => (isOver ? '1px solid #ffffff' : '1px solid #414E79')};
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
  opacity: ${({ isDragging }) => (isDragging ? 0.3 : 1)};
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

export const PlaceholderBox = styled.div`
  min-width: 62px;
  min-height: 62px;
  margin: 0;
  background: rgba(255,255,255,0.04);
  border-radius: 4px;
`;