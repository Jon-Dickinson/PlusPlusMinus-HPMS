import styled from 'styled-components';

interface RowProps {
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between';
  height?: number;
}

export const Row = styled.div<RowProps>`
  position: relative;
  width: 100%;
  height: ${({ height }) => (height ? `${height}%` : 'auto')};
  display: inline-flex;
  align-items: ${({ align }) => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      default:
        return 'center';
    }
  }};
  gap: 8px;
  justify-content: ${({ justify }) => {
    switch (justify) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      case 'between':
        return 'space-between';
      default:
        return 'center';
    }
  }};
`;

interface ColumnProps {
  height?: number;
}

export const Column = styled.div<ColumnProps>`
  position: relative;
  width: 100%;
  height: ${({ height }) => (height ? `${height}%` : '100%')};
  display: inline-flex;
  flex-direction: column;
`;