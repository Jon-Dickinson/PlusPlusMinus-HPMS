import React, { useState } from 'react';
import {
  TreeContainer,
  NodeContainer,
  NodeHeader,
  NodeInfo,
  NodeTitle,
  NodeLevel,
  UserCount,
  UserList,
  UserItem,
  ExpandButton,
} from './styles';
import { HierarchyLevel, BasicUser } from '../../../types/hierarchy';
import { 
  UserRole, 
  UserRoleContainer, 
  StatusIndicator, 
  StatusDot, 
  getStatusDotCount 
} from '../../molecules/--shared-styles';

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

  const toggleExpanded = (event: React.MouseEvent) => {
    event.stopPropagation();
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
                {user.firstName} {user.lastName}
                <UserRoleContainer>
                  <UserRole role={user.role}>{user.role.toLowerCase()}</UserRole>
                  {user.role === 'MAYOR' && (
                    <StatusIndicator>
                      {Array.from({ length: getStatusDotCount(node.level) }, (_, index) => (
                        <StatusDot key={index} />
                      ))}
                    </StatusIndicator>
                  )}
                </UserRoleContainer>
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