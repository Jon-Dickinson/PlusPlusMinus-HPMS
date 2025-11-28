import React, { useEffect } from 'react';
import CityGrid from '../../components/organisms/CityGrid';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { isAdminOrMayor } from '../../utils/roles';
// axios usage moved into Header save handler
import { Row, Column } from '../../components/atoms/Blocks';
import BuildingSidebar from '../../components/organisms/BuidlingSidebar/BuildingSidebar';
import Authorized from '../../components/atoms/Authorized';
import { useCity } from '../../components/organisms/CityContext';
import StatsPanel from '../../components/organisms/StatsPanel';
import BuildingLogPanel from '../../components/organisms/BuildingLogPanel';
import CityPageLayout from '../../components/organisms/CityPageLayout';
import {
  MapPanel,
  ResourceColumn,
  MainGridArea,
  GridHeader,
  GridContainer,
} from '../../styles/dashboard';

function DashboardContent() {
  const { user, setUser } = useAuth();
  const [note, setNote] = React.useState('');
  const cityContext = useCity();

  useEffect(() => {
    if (user?.notes && user.notes.length > 0) {
      setNote(user.notes[0].content);
    }
  }, [user]);

  return (
    <Column>
      <Row justify="start">
        <GridHeader>
          {user?.role === 'MAYOR' && user.city && (
            <>
              <h3>{user.city.name}</h3>
              <h2>{user.city.country}</h2>
            </>
          )}
        </GridHeader>
      </Row>
      <Row align="start">
        <ResourceColumn>
          <StatsPanel />
          <BuildingLogPanel />
        </ResourceColumn>

        <Authorized allowed={['ADMIN', 'MAYOR']}>
          <BuildingSidebar />
        </Authorized>

        <MainGridArea>
          <GridContainer>
            <MapPanel>{user && <CityGrid />}</MapPanel>
          </GridContainer>
        </MainGridArea>
      </Row>
    </Column>
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
