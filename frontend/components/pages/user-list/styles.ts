import styled from 'styled-components';

export const ColWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

export const ContentWrapper = styled.div`
  padding: 1rem;
  height: calc(100vh - 120px);
  overflow: hidden;
`;

export const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
    /* Do not allow the entire left panel to scroll — the UserGrid itself will
      provide a scrollable area for rows while headers remain visible. */
    overflow: hidden;
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

export const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.active ? '#004AEE' : 'transparent'};
  color: ${props => props.active ? 'white' : '#ffffff'};
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#004AEE' : 'rgba(255, 255, 255, 0.1)'};
  }
`;
