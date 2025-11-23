'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import buildings from '../../../data/buildings.json';
import { LeftColumn } from './styles';
import { LoadingSpinner } from '../../atoms/Spinner';
import DraggableBuilding from '../DraggableBuilding';
import { HierarchyAPI } from '../../../lib/hierarchyAPI';
import { AllowedBuildingCategory, BuildingDetails } from '../../../types/hierarchy';

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

  // --- Hierarchical state (only relevant if permission system enabled) ---
  const [allowedBuildings, setAllowedBuildings] = useState<AllowedBuildingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldUseHierarchical || !user?.id) return;

    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const fetched = await HierarchyAPI.getAllowedBuildings(user.id);
        if (!active) return;
        setAllowedBuildings(fetched || []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load buildings');
        console.error('Error loading allowed buildings:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [shouldUseHierarchical, user?.id]);

  // render hierarchical path
  if (shouldUseHierarchical) {
    if (loading) {
      return (
        <LeftColumn>
          <div style={{ padding: '1rem', textAlign: 'center', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LoadingSpinner size={18} aria-hidden role="presentation" />
            <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }} aria-live="polite">Loading available buildings...</span>
          </div>
        </LeftColumn>
      );
    }

    if (error) {
      return (
        <LeftColumn>
          <div style={{ padding: '1rem', textAlign: 'center', color: '#f44336' }}>Error: {error}</div>
        </LeftColumn>
      );
    }

    if (!allowedBuildings || allowedBuildings.length === 0) {
      return (
        <LeftColumn>
          <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>No buildings available for your permission level.</div>
        </LeftColumn>
      );
    }

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

    const allBuildings = allowedBuildings.flatMap(category =>
      category.buildings.map(b => convertToLegacyFormat(b, category.categoryName))
    );

    return (
      <LeftColumn>
        {allBuildings.map((building) => (
          <DraggableBuilding key={building.id} building={building} />
        ))}
      </LeftColumn>
    );
  }

  // fallback static list
  return (
    <LeftColumn>
      {buildings.map((building: any) => (
        <DraggableBuilding key={building.id} building={building} />
      ))}
    </LeftColumn>
  );
};

// helpers
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

export default BuildingSidebar;
