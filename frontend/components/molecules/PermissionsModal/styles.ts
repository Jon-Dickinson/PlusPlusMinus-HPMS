import styled from 'styled-components';

export const PermissionsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin-top: 12px;
`;

export const PermissionRow = styled.div<{ dimmed?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  /* The modal must always render items at full opacity per UX spec */
  opacity: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
`;

export const PermissionInfo = styled.div``;

export const CategoryName = styled.div`
  font-weight: 600;
`;

// no category description column in the simplified modal UI

export const CheckboxLabel = styled.label`
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
`;

// removed Direct/Effective visual labels — modal simplified to single column
