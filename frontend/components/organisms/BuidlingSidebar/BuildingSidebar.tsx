'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import buildings from '../../../data/buildings.json';
import { LeftColumn } from './styles';
import DraggableBuilding from '../DraggableBuilding';
import HierarchicalBuildingSidebar from './HierarchicalBuildingSidebar';

interface BuildingSidebarProps {
  useHierarchicalPermissions?: boolean;
  onBuildingSelect?: (building: any) => void;
  selectedBuildingId?: number;
}

const BuildingSidebar: React.FC<BuildingSidebarProps> = ({
  useHierarchicalPermissions = true, // Default to new system
  onBuildingSelect,
  selectedBuildingId
}) => {
  const { user } = useAuth();

  // Use hierarchical permissions if user has hierarchy assignment and feature is enabled
  const shouldUseHierarchical = useHierarchicalPermissions && user?.hierarchyId;

  if (shouldUseHierarchical) {
    return (
      <HierarchicalBuildingSidebar
        onBuildingSelect={onBuildingSelect}
        selectedBuildingId={selectedBuildingId}
      />
    );
  }

  // Fallback to original static building list
  return (
    <LeftColumn>
      {buildings.map((building: any) => (
        <DraggableBuilding key={building.id} building={building} />
      ))}
    </LeftColumn>
  );
};

export default BuildingSidebar;
