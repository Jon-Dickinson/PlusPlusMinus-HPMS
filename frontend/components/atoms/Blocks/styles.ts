import styled from 'styled-components';

interface RowProps {
  justify?: 'start' | 'center' | 'end' | 'between';
  height?: number;
}

export const Row = styled.div<RowProps>`
  position: relative;
  width: 100%;
  height: ${({ height }) => (height ? `${height}%` : 'auto')};
  display: inline-flex;
  align-items: center;
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