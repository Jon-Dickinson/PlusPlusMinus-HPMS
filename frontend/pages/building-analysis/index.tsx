import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import buildings from '../../data/buildings.json';
import api from '../../lib/axios';
import parse from 'html-react-parser';
import CityPageLayout from '../../components/organisms/CityPageLayout';
import {
  SidebarList,
  ImageButton,
  AnalysisPlaceholder,
  ResourceColumn,
  MainGridArea,
  GridContainer,
  LoadingText,
  ErrorContainer,
  ErrorTitle,
  ErrorMessage,
  BuildingContainer,
  BuildingTitle,
  DescriptionContainer,
  ResourcesContainer,
  ResourcesTitle,
  ResourcesList,
  ResourceItem,
  DefaultContainer,
  DefaultTitle,
  DefaultText,
} from '../../components/pages/building-analysis/styles';



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
      setSelected(null);
    }
  }, [router.query]);

  // Function to handle building selection from the list
  const handleSelectBuilding = useCallback((buildingId: number) => {
    router.push(`/building-analysis?buildingId=${buildingId}`, undefined, { shallow: true });
  }, [router]);

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
