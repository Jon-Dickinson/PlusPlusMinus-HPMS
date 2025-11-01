import styled from 'styled-components';

interface RowProps {
  justify?: 'start' | 'center' | 'end';
}

export const Row = styled.div<RowProps>`
  position: relative;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: ${({ justify }) =>
    justify === 'start'
      ? 'flex-start'
      : justify === 'end'
      ? 'flex-end'
      : 'center'}; /* default center */
`;

export default Row;
