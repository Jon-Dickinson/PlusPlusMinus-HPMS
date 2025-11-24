import styled from 'styled-components';

export const PermissionsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin-top: 12px;
`;

export const PermissionRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
`;

export const PermissionInfo = styled.div``;

export const CategoryName = styled.div`
  font-weight: 600;
`;

export const CategoryDescription = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,0.6);
`;

export const PermissionActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
`;

export const DirectLabel = styled.span`
  font-size: 13px;
`;

export const EffectiveText = styled.div<{ effective: boolean }>`
  font-size: 12px;
  color: ${p => (p.effective ? '#A3FFAB' : 'rgba(255,255,255,0.5)')};
`;
