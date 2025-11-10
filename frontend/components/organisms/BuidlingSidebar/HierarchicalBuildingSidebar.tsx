import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { HierarchyAPI } from '../../../lib/hierarchyAPI';
import { AllowedBuildingCategory, BuildingDetails } from '../../../types/hierarchy';
import { LeftColumn } from './styles';
import DraggableBuilding from '../DraggableBuilding';
import AllowedBuildingsView from '../AllowedBuildingsView';

interface HierarchicalBuildingSidebarProps {
  onBuildingSelect?: (building: BuildingDetails) => void;
  selectedBuildingId?: number;
}

const HierarchicalBuildingSidebar: React.FC<HierarchicalBuildingSidebarProps> = ({
  onBuildingSelect,
  selectedBuildingId
}) => {
  const { user } = useAuth();
  const [allowedBuildings, setAllowedBuildings] = useState<AllowedBuildingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllowedBuildings = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const buildings = await HierarchyAPI.getAllowedBuildings(user.id);
        setAllowedBuildings(buildings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load buildings');
        console.error('Error loading allowed buildings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllowedBuildings();
  }, [user?.id]);

  // Convert hierarchical buildings to the format expected by DraggableBuilding
  const convertToLegacyFormat = (building: BuildingDetails, categoryName: string) => ({
    id: building.id,
    name: building.name,
    category: categoryName.toLowerCase(),
    color: getCategoryColor(categoryName),
    resources: {
      power: building.powerUsage || 0,
      powerOutput: building.powerOutput || 0,
      water: building.waterUsage || 0,
      waterOutput: building.waterOutput || 0,
    },
    sizeX: building.sizeX,
    sizeY: building.sizeY,
    level: building.level,
    icon: getCategoryIcon(categoryName)
  });

  const getCategoryColor = (categoryName: string): string => {
    const colors: Record<string, string> = {
      'Commercial': '#004AEE',
      'Emergency': '#EE3E36', 
      'Industrial': '#F79E1B',
      'Agriculture': '#704214',
      'Government': '#1C1C1C',
      'Energy': '#FFD52B',
      'Residential': '#2FBF4A',
      'Utilities': '#0068FF',
    };
    return colors[categoryName] || '#666666';
  };

  const getCategoryIcon = (categoryName: string): string => {
    const iconMap: Record<string, string> = {
      'commercial': 'commercial.png',
      'emergency': 'emergency-services.png',
      'industrial': 'factory.png',
      'agriculture': 'farm.png',
      'government': 'government.png',
      'energy': 'power-station.png',
      'residential': 'residential.png',
      'utilities': 'water-pump.png',
    };
    const key = categoryName.toLowerCase();
    return `/buildings/${iconMap[key] || 'commercial.png'}`;
  };

  if (loading) {
    return (
      <LeftColumn>
        <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
          Loading available buildings...
        </div>
      </LeftColumn>
    );
  }

  if (error) {
    return (
      <LeftColumn>
        <div style={{ padding: '1rem', textAlign: 'center', color: '#f44336' }}>
          Error: {error}
        </div>
      </LeftColumn>
    );
  }

  if (!allowedBuildings || allowedBuildings.length === 0) {
    return (
      <LeftColumn>
        <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
          No buildings available for your permission level.
        </div>
      </LeftColumn>
    );
  }

  // Flatten all buildings for the draggable interface
  const allBuildings = allowedBuildings.flatMap(category =>
    category.buildings.map(building => convertToLegacyFormat(building, category.categoryName))
  );

  return (
    <LeftColumn>
      {allBuildings.map((building) => (
        <DraggableBuilding key={building.id} building={building} />
      ))}
    </LeftColumn>
  );
};

export default HierarchicalBuildingSidebar;