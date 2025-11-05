import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainTemplate from '../../templates/MainTemplate';
import CityMap from '../../components/organisms/CityMap';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import axios from '../../lib/axios';
import GlobalNav from '../../components/molecules/GlobalNav';
import { CityProvider } from '../../components/organisms/CityContext';
import Header from '../../components/molecules/Header';
import StatsPanel from '../../components/organisms/StatsPanel';
import BuildingLogPanel from '../../components/organisms/BuildingLogPanel';


const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  min-height: 420px;
  width: 100%;
`;

export default function MayorView() {
  const router = useRouter();
  const { id } = router.query;
  const { user: authUser } = useAuth();
  const [mayor, setMayor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.instance.get(`/users/${id}`)
        .then(res => {
          setMayor(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch mayor data", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <MainTemplate><p>Loading...</p></MainTemplate>;
  }

  if (!mayor) {
    return <MainTemplate><p>Mayor not found.</p></MainTemplate>;
  }

  return (
    <MainTemplate>
      <GlobalNav />
      <ColWrapper>
        <Header />
        <RowWrapper>
          <CityProvider initialCityData={mayor.city}>
            <ResourceColumn>
              <GridHeader>
                <h3>Mayor: {mayor.firstName} {mayor.lastName}</h3>
                <h2>{mayor.city?.name}, {mayor.city?.country}</h2>
              </GridHeader>
              <StatsPanel />
            </ResourceColumn>

            <MainGridArea>
              <GridContainer>
                <MapPanel>
                  <CityMap />
                </MapPanel>
              </GridContainer>
            </MainGridArea>
          
            <InfoColumn>
           
              <BuildingLogPanel />
              <NotesPanel>
                <h4>Mayor's Notes</h4>
                {mayor.notes && mayor.notes.length > 0 ? (
                  <ul>
                    {mayor.notes.map((note: any) => (
                      <li key={note.id}>{note.content}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No notes from this mayor.</p>
                )}
              </NotesPanel>
            </InfoColumn>
          </CityProvider>
        </RowWrapper>
      </ColWrapper>
    </MainTemplate>
  );
}

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
  margin-top: 72px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GridHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 10px;

  h2 {
    font-size: 12px;
    margin: 0;
    color: #ffffff;
    font-weight: 400;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    color: #ffffff;
    font-weight: 500;
  }
`;

const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

const InfoColumn = styled.div`
  width: 100%;
  max-width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  padding: 80px 20px;
  gap: 1rem;
`;

const QualityBox = styled.div`
  padding: 1rem;
  text-align: center;
  border-radius: 5px;
  background-color: #192748;

  h3 {
    color: #ffffff;
    font-weight: 400;
  }
  span {
    font-size: 2rem;
    font-weight: 500;
    color: #ffcc00;
  }
`;

const NotesPanel = styled.div`
  background-color: #192748;
  color: white;
  padding: 1rem;
  border-radius: 5px;
  h4 {
    margin-top: 0;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 13px;
  }
  li {
    padding: 0.25rem 0;
  }
`;
