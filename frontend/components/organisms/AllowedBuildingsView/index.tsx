import React from 'react';
import { LoadingSpinner } from '../../atoms/Spinner';
import styled from 'styled-components';
import { AllowedBuildingCategory, BuildingDetails } from '../../../types/hierarchy';

interface AllowedBuildingsProps {
  allowedBuildings: AllowedBuildingCategory[];
  onBuildingSelect?: (building: BuildingDetails) => void;
  selectedBuildingId?: number;
  isLoading?: boolean;
}

const Container = styled.div`
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  max-height: 600px;
  overflow-y: auto;
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  color: #ffffff;
  font-size: 1.2rem;
`;

const CategoryContainer = styled.div`
  margin-bottom: 2rem;
`;

const CategoryHeader = styled.div`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin-bottom: 0.5rem;
`;

const CategoryName = styled.h4`
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
`;

const CategoryDescription = styled.p`
  margin: 0.25rem 0 0 0;
  color: #ffffff;
  font-size: 0.9rem;
`;

const BuildingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
`;

const BuildingCard = styled.div<{ isSelected: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.isSelected ? '#2196f3' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  background: ${props => props.isSelected ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2196f3;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  }
`;

const BuildingName = styled.h5`
  margin: 0 0 0.5rem 0;
  color: #ffffff;
  font-size: 1rem;
`;

const BuildingInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ffffff;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const InfoLabel = styled.span`
  font-weight: 500;
`;

const InfoValue = styled.span<{ isPositive?: boolean; isNegative?: boolean }>`
  color: ${props => 
    props.isPositive ? '#4caf50' : 
    props.isNegative ? '#f44336' : 
    'inherit'
  };
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #ffffff;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #ffffff;
`;

const AllowedBuildingsView: React.FC<AllowedBuildingsProps> = ({
  allowedBuildings,
  onBuildingSelect,
  selectedBuildingId,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Container>
        <LoadingState>
          <LoadingSpinner size={20} aria-hidden role="presentation" />
        </LoadingState>
      </Container>
    );
  }

  if (!allowedBuildings || allowedBuildings.length === 0) {
    return (
      <Container>
        <Title>Available Buildings</Title>
        <EmptyState>
          No buildings available for your permission level.
          <br />
          Contact an administrator for access to more building types.
        </EmptyState>
      </Container>
    );
  }

  const handleBuildingClick = (building: BuildingDetails) => {
    if (onBuildingSelect) {
      onBuildingSelect(building);
    }
  };

  return (
    <Container>
      <Title>Available Buildings ({allowedBuildings.reduce((total, cat) => total + cat.buildings.length, 0)} total)</Title>
      
      {allowedBuildings.map((category) => (
        <CategoryContainer key={category.categoryId}>
          <CategoryHeader>
            <CategoryName>{category.categoryName} ({category.buildings.length})</CategoryName>
            {category.description && (
              <CategoryDescription>{category.description}</CategoryDescription>
            )}
          </CategoryHeader>
          
          <BuildingGrid>
            {category.buildings.map((building) => (
              <BuildingCard
                key={building.id}
                isSelected={selectedBuildingId === building.id}
                onClick={() => handleBuildingClick(building)}
              >
                <BuildingName>{building.name}</BuildingName>
                <BuildingInfo>
                  <InfoItem>
                    <InfoLabel>Size:</InfoLabel>
                    <InfoValue>{building.sizeX}×{building.sizeY}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Level:</InfoLabel>
                    <InfoValue>{building.level}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Power:</InfoLabel>
                    <InfoValue 
                      isPositive={building.powerOutput > 0}
                      isNegative={building.powerUsage > 0}
                    >
                      {building.powerOutput > 0 ? `+${building.powerOutput}` : 
                       building.powerUsage > 0 ? `-${building.powerUsage}` : '0'}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Water:</InfoLabel>
                    <InfoValue 
                      isPositive={building.waterOutput > 0}
                      isNegative={building.waterUsage > 0}
                    >
                      {building.waterOutput > 0 ? `+${building.waterOutput}` : 
                       building.waterUsage > 0 ? `-${building.waterUsage}` : '0'}
                    </InfoValue>
                  </InfoItem>
                </BuildingInfo>
              </BuildingCard>
            ))}
          </BuildingGrid>
        </CategoryContainer>
      ))}
    </Container>
  );
};

export default AllowedBuildingsView;