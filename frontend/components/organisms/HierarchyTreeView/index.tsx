import React, { useState } from 'react';
import styled from 'styled-components';
import { HierarchyLevel, BasicUser } from '../../../types/hierarchy';

interface HierarchyTreeProps {
  tree: HierarchyLevel[];
  onNodeSelect?: (node: HierarchyLevel) => void;
  selectedNodeId?: number;
}

interface HierarchyNodeProps {
  node: HierarchyLevel;
  onSelect?: (node: HierarchyLevel) => void;
  isSelected?: boolean;
  level?: number;
}

const TreeContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  background: transparent;
  height: calc(100% - 60px);
  overflow-y: auto;
  color: #ffffff;
`;

const NodeContainer = styled.div<{ level: number; isSelected: boolean }>`
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

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NodeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NodeTitle = styled.span`
  font-weight: 600;
  color: #ffffff;
`;

const NodeLevel = styled.span`
  font-size: 0.8rem;
  color: #111d3a;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 12px;
`;

const UserCount = styled.span`
  font-size: 0.8rem;
  color: #ffffff;
`;

const UserList = styled.div`
  margin-top: 8px;
  padding-left: 16px;
`;

const UserItem = styled.div`
  padding: 4px 0;
  font-size: 0.9rem;
  color: #ffffff;
`;

const UserRole = styled.span<{ role: string }>`
  display: inline-block;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  color: #111d3a;
  font-weight: 600;
  background: ${props => {
    switch (props.role) {
      case 'ADMIN': return '#f44336';
      case 'MAYOR': return '#2196f3';
      case 'VIEWER': return '#4caf50';
      default: return '#757575';
    }
  }};
`;

const ExpandButton = styled.button`
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

const HierarchyNode: React.FC<HierarchyNodeProps> = ({ 
  node, 
  onSelect, 
  isSelected = false, 
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const hasUsers = node.users && node.users.length > 0;

  const handleNodeClick = () => {
    if (onSelect) {
      onSelect(node);
    }
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <NodeContainer level={level} isSelected={isSelected} onClick={handleNodeClick}>
        <NodeHeader>
          <NodeInfo>
            {(hasChildren || hasUsers) && (
              <ExpandButton onClick={toggleExpanded}>
                {isExpanded ? '▼' : '▶'}
              </ExpandButton>
            )}
            <NodeTitle>{node.name}</NodeTitle>
            <NodeLevel>Level {node.level}</NodeLevel>
          </NodeInfo>
          {hasUsers && (
            <UserCount>{node.users!.length} user{node.users!.length !== 1 ? 's' : ''}</UserCount>
          )}
        </NodeHeader>
        
        {isExpanded && hasUsers && (
          <UserList>
            {node.users!.map((user: BasicUser) => (
              <UserItem key={user.id}>
                {user.firstName} {user.lastName} ({user.username})
                <UserRole role={user.role}>{user.role}</UserRole>
              </UserItem>
            ))}
          </UserList>
        )}
      </NodeContainer>
      
      {isExpanded && hasChildren && (
        <>
          {node.children!.map((child: HierarchyLevel) => (
            <HierarchyNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              isSelected={isSelected}
              level={level + 1}
            />
          ))}
        </>
      )}
    </>
  );
};

const HierarchyTreeView: React.FC<HierarchyTreeProps> = ({ 
  tree, 
  onNodeSelect, 
  selectedNodeId 
}) => {
  if (!tree || tree.length === 0) {
    return (
      <TreeContainer>
        <div style={{ textAlign: 'center', color: '#ffffff', padding: '2rem' }}>
          No hierarchy data available
        </div>
      </TreeContainer>
    );
  }

  return (
    <TreeContainer>
      {tree.map((rootNode) => (
        <HierarchyNode
          key={rootNode.id}
          node={rootNode}
          onSelect={onNodeSelect}
          isSelected={selectedNodeId === rootNode.id}
        />
      ))}
    </TreeContainer>
  );
};

export default HierarchyTreeView;