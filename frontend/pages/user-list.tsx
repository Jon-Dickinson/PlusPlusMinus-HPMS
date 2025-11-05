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


export default function UserList() {
  const router = useRouter();
  const { user } = useAuth();

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
        <RowWrapper>
          <CityProvider>
            <ResourceColumn>
              <GridHeader>
                {user && isMayor(user?.role) && user.city && (
                  <>
                    <h3>Mayor: {user.firstName} {user.lastName}</h3>
                    <h2>{user.city.name}, {user.city.country}</h2>
                  </>
                )}
                 {user && !isMayor(user?.role) && (
                  <>
                    <h3>{user.firstName} {user.lastName}</h3>
                    <h2>{user.role}</h2>
                  </>
                )}
              </GridHeader>

              {loading ? (
                <div style={{ color: '#fff', padding: '1rem' }}>Loading mayors...</div>
              ) : mayors.length === 0 ? (
                <div style={{ color: '#fff', padding: '1rem' }}>No mayors found.</div>
              ) : (
                <MayorGrid>
                  {mayors.map((m: any) => (
                    <MayorCard
                      key={m.id}
                      id={m.id}
                      firstName={m.firstName}
                      lastName={m.lastName}
                      cityName={m.city?.name}
                      country={m.city?.country}
                      qualityIndex={m.city?.qualityIndex}
                      hasNotes={Array.isArray(m.notes) && m.notes.length > 0}
                      onClick={(id) => {
                        if (isAdmin(user?.role)) {
                          router.push(`/mayor-view/${id}`);
                        }
                      }}
                    />
                  ))}
                </MayorGrid>
              )}
            </ResourceColumn>

          
      
          </CityProvider>
        </RowWrapper>
      </ColWrapper>
    </MainTemplate>
  );
}

/* Layout styled components copied from dashboard for consistency */
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

const MayorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
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