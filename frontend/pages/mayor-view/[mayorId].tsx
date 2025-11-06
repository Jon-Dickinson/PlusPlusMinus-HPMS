import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainTemplate from '../../templates/MainTemplate';
import CityMap from '../../components/organisms/CityMap';
import styled from 'styled-components';
import Authorized from '../../components/atoms/Authorized';
import useAuthorized from '../../hooks/useAuthorized';
import axios from '../../lib/axios';
import BuildingSidebar from '../../components/organisms/BuidlingSidebar/BuildingSidebar';
import GlobalNav from '../../components/molecules/GlobalNav';
import Header from '../../components/molecules/Header';
import StatsPanel from '../../components/organisms/StatsPanel';
import Spinner from '../../components/atoms/Spinner';
import BuildingLogPanel from '../../components/organisms/BuildingLogPanel';
import { City } from '../../types/city';
import CityPageLayout from '../../components/organisms/CityPageLayout';

const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  min-height: 420px;
  width: 100%;
`;

const Message = styled.div`
  position: relative;
  display: inline-flex;
  font-size: 16px;
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
    font-size: 18px;
    margin: 0;
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
  max-width:340px;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const CenteredLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 420px;
`;

const LoadingOrError = ({ children }: { children: React.ReactNode }) => (
  <MainTemplate>
    <GlobalNav />
    <ColWrapper>
      <Header />
      <RowWrapper>
        <CenteredLoading>
          {children}
        </CenteredLoading>
      </RowWrapper>
    </ColWrapper>
  </MainTemplate>
);

function MayorViewContent({ initialCity }: { initialCity?: City | null }) {
  return (
    <>
      <ResourceColumn>
        <GridHeader>
          {initialCity && (
            <>
             <Message>{ (initialCity as any).mayor ? (
                  <span> Mayor: {(initialCity as any).mayor.firstName} {(initialCity as any).mayor.lastName}</span>
                ) : null }</Message>
                 <Message>{initialCity.name}, {initialCity.country}</Message>
                
              
            </>
          )}
        </GridHeader>
        <StatsPanel />
      </ResourceColumn>

      <Authorized allowed={[ 'ADMIN' ]}>
        <BuildingSidebar />
      </Authorized>

      <MainGridArea>
        <GridContainer>
          <MapPanel><CityMap /></MapPanel>
        </GridContainer>
      </MainGridArea>
    
      <InfoColumn>
        <BuildingLogPanel />
      </InfoColumn>
    </>
  );
}

export default function MayorViewPage() {
  const router = useRouter();
  const { mayorId } = router.query;
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const canEdit = useAuthorized(['ADMIN']);

  useEffect(() => {
    if (mayorId) {
      axios.instance.get(`/cities/user/${mayorId}`)
        .then(response => {
          setCity(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch city data', error);
          setLoading(false);
        });
    }
  }, [mayorId]);

  if (loading) {
    return <LoadingOrError><Spinner size={40} /></LoadingOrError>;
  }

  if (!city) {
    return <LoadingOrError><Message>City not found</Message></LoadingOrError>;
  }

  return (
    <CityPageLayout initialCityData={city} canEdit={canEdit}>
      <MayorViewContent initialCity={city} />
    </CityPageLayout>
  );
}
