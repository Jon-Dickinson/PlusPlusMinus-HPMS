import React, { useEffect } from 'react';
import CityGrid from '../../components/organisms/CityGrid';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { isAdminOrMayor } from '../../utils/roles';
import axios from '../../lib/axios';
import BuildingSidebar from '../../components/organisms/BuidlingSidebar/BuildingSidebar';
import Authorized from '../../components/atoms/Authorized';
import { useCity } from '../../components/organisms/CityContext';
import StatsPanel from '../../components/organisms/StatsPanel';
import BuildingLogPanel from '../../components/organisms/BuildingLogPanel';
import CityPageLayout from '../../components/organisms/CityPageLayout';
import {
  SaveButton,
  NotesInput,
  MapPanel,
  RowWrapper,
  ColWrapper,
  ResourceColumn,
  MainGridArea,
  GridHeader,
  GridContainer,
  InfoColumn,
  MessageDiv,
} from '../../styles/dashboard';

function DashboardContent() {
  const { user } = useAuth();
  const [note, setNote] = React.useState('');
  const cityContext = useCity();
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

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

    axios.instance
      .put(`/cities/${user.city.id}/data`, payload)
      .then((response) => {
        setMessage({ type: 'success', text: 'City data saved successfully!' });
      })
      .catch((error) => {
        setMessage({ type: 'error', text: 'Failed to save city data.' });
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

      <Authorized allowed={['ADMIN', 'MAYOR']}>
        <BuildingSidebar />
      </Authorized>

      <MainGridArea>
        <GridContainer>
          <MapPanel>{user && <CityGrid />}</MapPanel>
        </GridContainer>
      </MainGridArea>

      <InfoColumn>
      
        <BuildingLogPanel />

        <Authorized allowed={['ADMIN', 'MAYOR']}>
          
            <NotesInput
              placeholder="Enter your notes here..."
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
            />
            <SaveButton onClick={handleSave}>Save City Data</SaveButton>
            {message && <MessageDiv type={message.type}>{message.text}</MessageDiv>}
          
        </Authorized>
      </InfoColumn>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const canEdit = React.useMemo(() => isAdminOrMayor(user?.role), [user?.role]);

  return (
    <CityPageLayout initialCityData={user?.city} canEdit={canEdit}>
      <DashboardContent />
    </CityPageLayout>
  );
}
