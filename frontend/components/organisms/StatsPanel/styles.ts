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
  height: calc((100vh - 160px) / 6);
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px 18px;
  margin: 5px 0;
  width: 100%;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: #192748;

  :hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }

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
  margin-bottom: 6px;
`;

export const IconWrapper = styled.div<{ color?: string }>`
  color: ${({ color }) => color || '#000'};
  svg {
    width: 28px;
    height: 28px;
    stroke-width: 2;
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
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
`;

export const Stat = styled.span<{ color?: string; outlined?: boolean; outlineColor?: string }>`
  color: ${({ color }) => color || '#ffffff'};
  ${({ outlined, outlineColor }) =>
    outlined &&
    `
      border: 1px solid ${outlineColor || '#ef4444'};
      border-radius: 8px;
      padding: 2px 6px;
    `}
`;