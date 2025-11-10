/**
 * Shared Role Badge Styles
 * 
 * Common styled components for displaying user roles with hierarchy indicators.
 * Used across multiple components like Header, HierarchyTreeView, etc.
 */

import styled from 'styled-components';

// Container for role badge and status indicators
export const RoleBadgeContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

// Container for user role and status indicators (used in hierarchy tree)
export const UserRoleContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

// Role badge with color-coded backgrounds (base version)
export const RoleBadge = styled.span<{ role: string }>`
  display: inline-block;
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 10px;
  color: #ffffff;
  font-weight: 500;
  background: ${props => {
    switch (props.role.toUpperCase()) {
      case 'ADMIN': return '#FF2226';
      case 'MAYOR': return '#0048FF';
      case 'VIEWER': return '#28B216';
      default: return '#757575';
    }
  }};
`;

// Role badge variant with left margin (used in hierarchy tree)
export const UserRole = styled(RoleBadge)`
  margin-left: 8px;
`;

// Container for status dots indicating hierarchy level
export const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
`;

// Individual yellow status dot
export const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fae902ff;
`;

// Helper function to get the number of status dots based on hierarchy level
export const getStatusDotCount = (hierarchyLevel: number): number => {
  switch (hierarchyLevel) {
    case 1: return 3; // National - 3 dots
    case 2: return 2; // City - 2 dots  
    case 3: return 1; // Suburb - 1 dot
    default: return 0;
  }
};