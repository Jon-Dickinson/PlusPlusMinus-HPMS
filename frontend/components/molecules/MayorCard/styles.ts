import styled from 'styled-components';

export const Card = styled.button`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 100px;
  align-items: center;
  padding: 16px 24px;
  background: transparent;
  color: #fff;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const Meta = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const Muted = styled.div`
  color: rgba(255, 255, 255, 0.87);
  font-size: 14px;
  letter-spacing: 0.25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Center = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const QualityIndex = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const DeleteButton = styled.div`
  color: #ef4444;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

export const PermissionButton = styled(DeleteButton)`
  color: #2FBF4A;
  &:hover {
    /* slightly green background instead of red */
    background: rgba(47, 191, 74, 0.12);
  }
`;

export const AuditButton = styled(DeleteButton)`
  color: #60A5FA; /* blue */
  &:hover {
    background: rgba(96, 165, 250, 0.12);
  }
`;

export const Properties = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  justify-content: flex-end;
`;