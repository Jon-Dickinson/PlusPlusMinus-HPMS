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
  // When provided, load allowed buildings for this user (subject) instead
  // of the currently-authenticated user. Useful for Admins viewing a mayor.
  subjectUserId?: number | null;
}

const BuildingSidebar: React.FC<BuildingSidebarProps> = ({
  useHierarchicalPermissions = true, // Default to new system
  onBuildingSelect,
  selectedBuildingId,
  subjectUserId = null,
}) => {
  const { user } = useAuth();

  // Use hierarchical permissions if user has hierarchy assignment and feature is enabled
  const shouldUseHierarchical = useHierarchicalPermissions && (user?.hierarchyId || !!subjectUserId);

  // --- Hierarchical state (only relevant if permission system enabled) ---
  const [allowedBuildings, setAllowedBuildings] = useState<AllowedBuildingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldUseHierarchical) return;

    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // If we're showing the sidebar for a subject user (admin viewing a mayor),
        // request allowed buildings for that subject. Otherwise request for the
        // current logged-in user.
        const targetId = subjectUserId ?? user?.id;
        if (!targetId) {
          // Nothing to fetch for permissions (shouldn't happen in normal flows)
          setAllowedBuildings([]);
          return;
        }
        const fetched = await HierarchyAPI.getAllowedBuildings(targetId);
        if (!active) return;
        // If viewing a subject user (Admin -> Mayor), also fetch their effective
        // permissions so we can mark which categories are enabled/disabled.
        let effectiveMap: Record<number, boolean> = {};
        if (subjectUserId) {
          try {
            const eff = await HierarchyAPI.getEffectivePermissions(Number(subjectUserId));
            effectiveMap = (eff || []).reduce((acc: Record<number, boolean>, r: any) => {
              acc[r.categoryId] = !!r.effectiveCanBuild; return acc;
            }, {});
          } catch (err) {
            console.error('Failed to load effective permissions for subject user', err);
          }
        }
        // If we have effectiveMap, annotate category/buildings with disabled flag
        const annotated = (fetched || []).map((cat: any) => ({
          ...cat,
          disabledForSubject: subjectUserId ? !effectiveMap[cat.categoryId] : false,
        }));
        setAllowedBuildings(annotated);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load buildings');
        console.error('Error loading allowed buildings:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [shouldUseHierarchical, user?.id, subjectUserId]);

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

    const convertToLegacyFormat = (building: BuildingDetails, categoryName: string, categoryDisabled?: boolean) => ({
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
      icon: getCategoryIcon(categoryName),
      disabled: !!categoryDisabled,
    });

    const allBuildings = allowedBuildings.flatMap((category: any) =>
      category.buildings.map((b: any) => convertToLegacyFormat(b, category.categoryName, category.disabledForSubject))
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
