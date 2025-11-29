import styled from 'styled-components';

export const TreeContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  background: transparent;
  height: calc(100% - 60px);
  overflow-y: auto;
  color: #ffffff;
`;

export const NodeContainer = styled.div<{ level: number; isSelected: boolean }>`
  margin-left: ${props => props.level * 20}px;
  padding: 15px;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.isSelected ? 'rgba(33, 150, 243, 0.2)' : 'transparent'};
  border: ${props => props.isSelected ? '2px solid #2196f3' : '2px solid transparent'};
  margin-bottom: 4px;
  transition: all 0.2s ease;
  color: #ffffff;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const NodeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NodeTitle = styled.span`
  font-weight: 600;
  color: #ffffff;
`;

export const NodeLevel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #111d3a;
  background: rgba(255, 255, 255, 1);
  padding: 1px 9px;
  border-radius: 12px;
`;

export const UserCount = styled.span`
  font-size: 0.8rem;
  color: #ffffff;
`;

export const UserList = styled.div`
  margin-top: 8px;
  padding-left: 30px;
`;

export const UserItem = styled.div`
  padding: 4px 0;
  font-size: 14px;
  color: #ffffff;
`;



export const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #ffffff;
  font-size: 0.8rem;
  
  &:hover {
    color: #2196f3;
  }
`;

