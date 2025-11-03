import React, { useEffect } from 'react';
import MainTemplate from '../templates/MainTemplate';
import CityMap from '../components/organisms/CityMap';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';
import BuildingSidebar from '../components/organisms/BuildingSidebar';
import GlobalNav from '../components/molecules/GlobalNav';
import { CityProvider, useCity } from '../components/organisms/CityContext';
import Header from '../components/molecules/Header';
import StatsPanel from '../components/organisms/StatsPanel';
import BuildingLogPanel from '../components/organisms/BuildingLogPanel';
import QualityIndex from '../components/organisms/QualityIndex';

const MapWrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  width: 100%;
  height: 100%;
  background-color: #111d3a;
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

const Icon = styled.img`
  height: 40px;
  width: auto;
  display: block;
`;

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

function DashboardContent() {
  const { user, setUser } = useAuth();
  const [note, setNote] = React.useState('');
  const cityContext = useCity();

  useEffect(() => {
    if (user?.role === 'MAYOR' && user.id) {
      axios.instance.get(`/users/${user.id}`)
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error("Failed to fetch mayor data", err);
        });
    }
  }, []);

  useEffect(() => {
    if (user?.notes && user.notes.length > 0) {
      setNote(user.notes[0].content);
    }
  }, [user]);

  const handleSave = () => {
    if (!user || !user.city || !cityContext) {
      return;
    }

    const { grid, buildingLog } = cityContext;

    const payload = {
      gridState: grid,
      buildingLog: buildingLog,
      note: note,
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
          {user && user.role === 'MAYOR' && user.city && (
            <>
              <h3>Mayor: {user.firstName} {user.lastName}</h3>
              <h2>{user.city.name}, {user.city.country}</h2>
            </>
          )}
          {user && user.role !== 'MAYOR' && (
            <>
              <h3>{user.firstName} {user.lastName}</h3>
              <h2>{user.role}</h2>
            </>
          )}
        </GridHeader>

        <StatsPanel />
      </ResourceColumn>

      <BuildingSidebar />

      <MainGridArea>
        <GridContainer>
          <MapPanel>{user && <CityMap />}</MapPanel>
        </GridContainer>
      </MainGridArea>
    
      <InfoColumn>
        <QualityBoxFromContext />

        {/* Building log now driven from CityContext */}
        <BuildingLogPanel />

        {user && user.role === 'MAYOR' && (
          <>
            <NotesInput 
              placeholder="Enter your notes here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <SaveButton onClick={handleSave}>Save City Data</SaveButton>
          </>
        )}
      </InfoColumn>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [serverTime, setServerTime] = React.useState<string | null>(null);

  useEffect(() => {
    // example call to backend
    axios.instance
      .get('/buildings')
      .then(() => setServerTime(new Date().toISOString()))
      .catch(() => {});
  }, []);

  return (
    <MainTemplate>
      <GlobalNav />
      <ColWrapper>
        <Header />
        <RowWrapper>
          <CityProvider initialCityData={user?.city}>
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

const Sidebar = styled.div`
  width: 80px;
  min-width: 80px;
  background: #111d3a;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
`;

const NavIcons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding-top: 5px;
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

const GridCell = styled.div`
  border: 1px solid #414e79;
  background: #1a1d23;
  border-radius: 4px;
`;

const InfoColumn = styled.div`
  width: 100%;
  max-width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  padding: 80px 20px;
`;

const QualityBox = styled.div`
  padding: 1rem;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
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

const BuildingLog = styled.div`
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: #192748;
  padding: 1rem;
  color: #ffffff;
  h4 {
    margin-bottom: 10px;
    margin-top: 0;
    font-weight: 400;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    font-size: 13px;
    padding: 0.25rem 0;
  }
`;

function QualityBoxFromContext() {
  // Render a QualityBox that uses the QualityIndex component.
  // This component is placed inside CityProvider in the page layout.
  return (
    <QualityBox>
      <QualityIndex />
      <h3>Quality Index</h3>
    </QualityBox>
  );
}
