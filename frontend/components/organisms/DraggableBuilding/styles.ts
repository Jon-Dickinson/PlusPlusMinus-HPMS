import styled from 'styled-components';

export const DragHandle = styled.div<{ isDragging?: boolean }>`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
`;

export const BuildingImage = styled.img`
  width: 56px;
  height: 56px;
  object-fit: contain;
  display: block;
  border: none;
  background: transparent;
`;

export const PlaceholderImage = styled.img`
  width: 40px;
  height: 40px;
`;