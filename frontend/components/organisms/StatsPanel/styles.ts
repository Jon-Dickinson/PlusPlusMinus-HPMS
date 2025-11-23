import styled from 'styled-components';

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 0 0 10px 10px;
`;

export const Card = styled.div<{ warn?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px 18px;
  margin: 0;
  width: 100%;
  background-color: #192748;

  ${({ warn }) =>
    warn &&
    `
      border-color: #ef4444;
    `}
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const IconWrapper = styled.div<{ color?: string }>`
  img {
    width: 28px;
    height: 28px;
  }
`;

export const Title = styled.h3`
  font-weight: 500;
  font-size: 14px;
  color: #ffffff;
  margin: 0;
`;

export const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  width: 100%;

  span {
    width: auto;
  }

  span:nth-child(1n) {
    margin-left: 15px;
  }

  span:nth-child(2n) {
    text-align: right;
    margin-right: 5px;
  }
`;

export const Stat = styled.span<{ color?: string; outlined?: boolean; outlineColor?: string; rightAlign?: boolean }>`
  color: ${({ color }) => color || '#ffffff'};
  ${({ outlined, outlineColor }) =>
    outlined &&
    `
      border: 1px solid ${outlineColor || '#ef4444'};
      border-radius: 8px;
      padding: 2px 6px;
    `}
    `;