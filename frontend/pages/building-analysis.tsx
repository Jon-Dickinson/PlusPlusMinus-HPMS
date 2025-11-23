import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import buildings from '../data/buildings.json';
import api from '../lib/axios';
import parse from 'html-react-parser';
import CityPageLayout from '../components/organisms/CityPageLayout';

const SidebarList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-top: 84px;
  max-width: 140px;
`;

const ImageButton = styled.button`
  background: transparent;
  border: none;
  padding: 6px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  overflow: visible;

  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
    display: block;
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.15);
    }
  }
`;

const AnalysisPlaceholder = styled.div`
  border-radius: 6px;
  min-height: 420px;
  padding: 1rem;
  color: #ffffff;
`;

const RowWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const ColWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const ResourceColumn = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;


const MainGridArea = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

const LoadingText = styled.p`
  color: #ffffff;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  color: #ffffff;
`;

const ErrorTitle = styled.h3`
  color: #ff6b6b;
  margin: 0 0 10px 0;
`;

const ErrorMessage = styled.p`
  color: #ffffff;
  margin: 0;
`;

const BuildingContainer = styled.div`
  color: #ffffff;
`;

const BuildingTitle = styled.h3`
  color: #ffffff;
  margin: 0 0 15px 0;
`;

const DescriptionContainer = styled.div`
  margin-bottom: 20px;
`;

const ResourcesContainer = styled.div`
  margin-top: 20px;
`;

const ResourcesTitle = styled.h4`
  color: #ffffff;
  margin: 0 0 10px 0;
`;

const ResourcesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ResourceItem = styled.li`
  color: #ffffff;
  margin-bottom: 5px;
  padding: 5px 0;
  border-bottom: 1px solid #414e79;
`;

const DefaultContainer = styled.div`
  color: #ffffff;
`;

const DefaultTitle = styled.h3`
  color: #ffffff;
  margin: 0 0 10px 0;
`;

const DefaultText = styled.p`
  color: #ffffff;
  margin: 0;
`;

export default function BuildingAnalysis() {
  const router = useRouter();
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch building data
  const fetchBuildingData = async (buildingId: string) => {
    setLoading(true);
    try {
      const res = await api.instance.get(`/buildings/${buildingId}`);
      setSelected(res.data);
    } catch (e) {
      setSelected({ error: true, message: 'Failed to load building details' });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when buildingId query param changes
  useEffect(() => {
    const { buildingId } = router.query;
    if (buildingId && typeof buildingId === 'string') {
      fetchBuildingData(buildingId);
    } else {
      setSelected(null); // Clear selection if no ID
    }
  }, [router.query]);

  // Function to handle building selection from the list
  const handleSelectBuilding = (buildingId: number) => {
    router.push(`/building-analysis?buildingId=${buildingId}`, undefined, { shallow: true });
  };

  return (
    <CityPageLayout>
      <ResourceColumn>
        <SidebarList>
          {buildings.map((b: any) => (
            <ImageButton key={b.id} onClick={() => handleSelectBuilding(b.id)} title={b.name}>
              <img src={(b.icon as string) || `/buildings/${b.id}.png`} alt={b.name} />
            </ImageButton>
          ))}
        </SidebarList>
      </ResourceColumn>

      <MainGridArea>
        <GridContainer>
          <AnalysisPlaceholder>
            {loading ? (
              <LoadingText>Loading...</LoadingText>
            ) : selected ? (
              selected.error ? (
                <ErrorContainer>
                  <ErrorTitle>Error</ErrorTitle>
                  <ErrorMessage>{selected.message || 'Unable to load building details.'}</ErrorMessage>
                </ErrorContainer>
              ) : (
                <BuildingContainer>
                  <BuildingTitle>{selected.name || 'Building'}</BuildingTitle>
                  <DescriptionContainer>
                    {parse(selected.longDescription || '<p>No description available.</p>')}
                  </DescriptionContainer>
                  {selected.resources && (
                    <ResourcesContainer>
                      <ResourcesTitle>Resources:</ResourcesTitle>
                      <ResourcesList>
                        {/* Support two shapes returned by the API:
                            1) An object map: { water: 10, powerOutput: 5 }
                            2) An array of resource objects: [{ type: 'Water', amount: 10 }, ...]
                        */}
                        {Array.isArray(selected.resources)
                          ? selected.resources.map((r: any, idx: number) => (
                              <ResourceItem key={r.id ?? r.type ?? idx}>
                                {(r.type || r.name || `Resource ${idx + 1}`)}: {String(r.amount ?? r.value ?? JSON.stringify(r))}
                              </ResourceItem>
                            ))
                          : Object.entries(selected.resources).map(([key, value]) => (
                              <ResourceItem key={key}>
                                {key
                                  .replace(/([A-Z])/g, ' $1')
                                  .replace(/^./, (str) => str.toUpperCase())}
                                : {String(value)}
                              </ResourceItem>
                            ))}
                      </ResourcesList>
                    </ResourcesContainer>
                  )}
                </BuildingContainer>
              )
            ) : (
              <DefaultContainer>
                <DefaultTitle>Building Analysis</DefaultTitle>
                <DefaultText>Select a building on the left to see its details.</DefaultText>
              </DefaultContainer>
            )}
          </AnalysisPlaceholder>
        </GridContainer>
      </MainGridArea>
    </CityPageLayout>
  );
}
