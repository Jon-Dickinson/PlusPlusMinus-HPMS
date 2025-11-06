import styled from 'styled-components';

export const GridContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  padding: 8px;
  max-width: 964px;
  min-height: 420px;
`;

export const CellContainer = styled.div<{ isOver: boolean }>`
  min-width: 74px;
  min-height: 74px;
  margin: 2px;
  border: ${({ isOver }) => (isOver ? '1px solid #b6b9c5ff' : '1px solid #414E79')};
  background-color: transparent;
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const BuildingItemContainer = styled.div<{ offset: number; idx: number; isDragging: boolean }>`
  position: absolute;
  bottom: ${({ offset }) => offset}px;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${({ idx }) => idx + 1};
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