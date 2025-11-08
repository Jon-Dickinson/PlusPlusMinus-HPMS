import styled from 'styled-components';

export const ViewersList = styled.div`
  margin-top: 10px;
`;

export const ViewersTitle = styled.div`
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

export const ViewerItem = styled.div`
  color: #ffffff;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ViewerDeleteButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;