import React, { useState, useEffect } from 'react';
import MainTemplate from '../templates/MainTemplate';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CityProvider } from '../components/organisms/CityContext';
import Header from '../components/molecules/Header';
import GlobalNav from '../components/molecules/GlobalNav';
import buildings from '../data/buildings.json';
import api from '../lib/axios';

// A simple vertical list of all building images; clicking one fetches its description
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
    <MainTemplate>
      <GlobalNav />

      <ColWrapper>
        <Header />
        <RowWrapper>
          <CityProvider>
            <ResourceColumn>
              {/* New vertical buildings column for analysis view */}
              <SidebarList>
                {buildings.map((b: any) => (
                  <ImageButton
                    key={b.id}
                    onClick={() => handleSelectBuilding(b.id)}
                    title={b.name}
                  >
                    <img src={(b.icon as string) || `/buildings/${b.id}.png`} alt={b.name} />
                  </ImageButton>
                ))}
              </SidebarList>
            </ResourceColumn>

            <MainGridArea>
              <GridContainer>
                <AnalysisPlaceholder>
                  {loading ? (
                    <p>Loading...</p>
                  ) : selected ? (
                    selected.error ? (
                      <div>
                        <h3>Error</h3>
                        <p>{selected.message || 'Unable to load building details.'}</p>
                      </div>
                    ) : (
                      <div>
                        <h3>{selected.name || 'Building'}</h3>
                        <div dangerouslySetInnerHTML={{ __html: selected.longDescription || '<p>No description available.</p>' }} />
                        {selected.resources && (
                          <div>
                            <h4>Resources:</h4>
                            <ul>
                              {Object.entries(selected.resources).map(([key, value]) => (
                                <li key={key}>
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}: {String(value)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div>
                      <h3>Building Analysis</h3>
                      <p>Select a building on the left to see its details.</p>
                    </div>
                  )}
                </AnalysisPlaceholder>
              </GridContainer>
            </MainGridArea>
          </CityProvider>
        </RowWrapper>
      </ColWrapper>
    </MainTemplate>
  );
}

/* Reuse layout styled definitions from dashboard */
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

/* ==== MAIN GRID AREA ==== */
const MainGridArea = styled.div`
  margin-top: 72px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;