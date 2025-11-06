import React, { useEffect } from 'react';
import MainTemplate from '../templates/MainTemplate';
import CityMap from '../components/organisms/CityMap';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { isAdminOrMayor } from '../utils/roles';
import axios from '../lib/axios';
import BuildingSidebar from '../components/organisms/BuildingSidebar';
import Authorized from '../components/atoms/Authorized';
import GlobalNav from '../components/molecules/GlobalNav';
import { CityProvider, useCity } from '../components/organisms/CityContext';
import Header from '../components/molecules/Header';
import StatsPanel from '../components/organisms/StatsPanel';
import BuildingLogPanel from '../components/organisms/BuildingLogPanel';

const SaveButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;

const NotesInput = styled.textarea`
  width: 100%;
  height: 100px;
  background-color: #192748;
  color: white;
  border: 1px solid #414e79;
  border-radius: 5px;
  padding: 10px;
  margin-top: 1rem;
  resize: vertical;
`;

const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  min-height: 420px;
  width: 100%;
`;

function DashboardContent() {
  const { user } = useAuth();
  const [note, setNote] = React.useState('');
  const cityContext = useCity();

  useEffect(() => {
    if (user?.notes && user.notes.length > 0) {
      setNote(user.notes[0].content);
    }
  }, [user]);

  const handleSave = () => {
    if (!user || !user.city || !cityContext) {
      return;
    }

    const { grid, buildingLog, getTotals } = cityContext;

    const totals = getTotals();
    const payload = {
      gridState: grid,
      buildingLog: buildingLog,
      note: note,
      qualityIndex: totals.qualityIndex,
    };

    axios.instance.put(`/cities/${user.city.id}/data`, payload)
      .then(response => {
        console.log('City data saved successfully', response.data);
        // Optionally, show a success message to the user
      })
      .catch(error => {
        console.error('Failed to save city data', error);
        // Optionally, show an error message to the user
      });
  };

  return (
    <>
      <ResourceColumn>
        <GridHeader>
          {user?.role === 'MAYOR' && user.city && (
            <>
              <h3>{user.city.name}</h3>
              <h2>{user.city.country}</h2>
            </>
          )}
        </GridHeader>

        <StatsPanel />
      </ResourceColumn>

  <Authorized allowed={[ 'ADMIN', 'MAYOR' ]}>
    <BuildingSidebar />
  </Authorized>

      <MainGridArea>
        <GridContainer>
          <MapPanel>{user && <CityMap />}</MapPanel>
        </GridContainer>
      </MainGridArea>
    
      <InfoColumn>
    

        {/* Building log now driven from CityContext */}
        <BuildingLogPanel />

        <Authorized allowed={[ 'ADMIN', 'MAYOR' ]}>
          <>
            <NotesInput 
              placeholder="Enter your notes here..."
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
            />
            <SaveButton onClick={handleSave}>Save City Data</SaveButton>
          </>
        </Authorized>
      </InfoColumn>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const canEdit = React.useMemo(() => isAdminOrMayor(user?.role), [user?.role]);

  return (
    <MainTemplate>
      <GlobalNav />
      <ColWrapper>
        <Header />
        <RowWrapper>
          <CityProvider initialCityData={user?.city} canEdit={canEdit}>
            <DashboardContent />
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

/* ==== MAIN GRID AREA ==== */
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
  max-width: 340px;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  padding: 80px 20px;
`;

