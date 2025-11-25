import styled from 'styled-components';

export const ViewerCardStyled = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 100px;
  align-items: center;
  padding: 12px 24px;
  background: transparent;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%;
  text-align: left;

  &:last-child {
    border-bottom: none;
  }
`;

export const ViewerLocation = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const ViewerName = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const ViewerQualityIndex = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const ViewerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  justify-content: flex-end;
`;

export const Muted = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  letter-spacing: 0.25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DeleteButton = styled.button`
  color: #ef4444;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  background: none;
  border: none;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

export const PermissionButton = styled(DeleteButton)`
  color: #2FBF4A;
  &:hover {
    background: rgba(47, 191, 74, 0.12);
  }
`;