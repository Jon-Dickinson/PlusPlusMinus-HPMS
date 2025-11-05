import React, { useEffect, useState } from 'react';
import MainTemplate from '../templates/MainTemplate';
import CityMap from '../components/organisms/CityMap';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CityProvider } from '../components/organisms/CityContext';
import Header from '../components/molecules/Header';
import MayorCard from '../components/molecules/MayorCard';
import GlobalNav from '../components/molecules/GlobalNav';
import BuildingLogPanel from '../components/organisms/BuildingLogPanel';
import axios from '../lib/axios';

const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  min-height: 420px;
  width: 100%;
`;

import { useAuth } from '../context/AuthContext';
import { isAdmin, isMayor } from '../utils/roles';
import useAuthorized from '../hooks/useAuthorized';


export default function UserList() {
  const router = useRouter();
  const { user } = useAuth();

  const canNavigateAdmin = useAuthorized(['ADMIN']);

  const isActive = (path: string) => router.pathname === path;

  const [mayors, setMayors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchMayors() {
      try {
        const res = await axios.instance.get('/users');
        if (mounted) setMayors(res.data || []);
      } catch (e) {
        // for now, swallow — could show toast
        console.error('Failed to load mayors', e);
        if (mounted) setMayors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMayors();
    return () => { mounted = false; };
  }, []);

  return (
    <MainTemplate>
      <GlobalNav />

      <ColWrapper>
        <Header />
        <ColWrapper>
          <CityProvider>
           
              <GridHeader>
                <HeaderTitle>Mayors</HeaderTitle>
                <HeadingRow>
                  <HeadingLabel>Location</HeadingLabel>
                  <HeadingLabel>Mayor</HeadingLabel>
                  <HeadingLabelRight>Notes</HeadingLabelRight>
                </HeadingRow>
              </GridHeader>

              <MayorGrid>
                {loading ? (
                  <Message>Loading mayors...</Message>
                ) : mayors.length === 0 ? (
                  <Message>No mayors found.</Message>
                ) : (
                  mayors.map((m: any) => (
                    <MayorCard
                      key={m.id}
                      id={m.id}
                      onClick={(id: number | string) => {
                        if (canNavigateAdmin) {
                          router.push(`/mayor-view/${id}`);
                        }
                      }}
                    />
                  ))
                )}
              </MayorGrid>
          

          
      
          </CityProvider>
        </ColWrapper>
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

const GridHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 5px;

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
    padding-left: 20px;
  }
`;

const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

const MayorGrid = styled.div`
  display: inline-flex;
  width: 100%;
  flex-direction: column;
  padding: 25px;
`;

const InfoColumn = styled.div`
  width: 100%;
  max-width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  padding: 80px 20px;
  gap: 1.5rem;
`;

const HeadingRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: center;
  padding: 0 25px 8px 25px;
  margin-top: 20px;
`;

const HeadingLabel = styled.div`
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeadingLabelRight = styled(HeadingLabel)`
  text-align: right;
`;

const HeaderTitle = styled.div`
  margin: 0;
  font-size: 18px;
  color: #ffffff;
  font-weight: 500;
  padding-left: 20px;
`;

const Message = styled.div`
  color: #ffffff;
  padding: 1rem;
`;