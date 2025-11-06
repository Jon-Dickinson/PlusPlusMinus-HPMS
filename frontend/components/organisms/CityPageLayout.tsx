import React from 'react';
import MainTemplate from '../../templates/MainTemplate';
import styled from 'styled-components';
import { CityProvider } from './CityContext';
import Header from '../molecules/Header';
import GlobalNav from '../molecules/GlobalNav';

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

interface CityPageLayoutProps {
  children: React.ReactNode;
  initialCityData?: any;
  canEdit?: boolean;
}

export default function CityPageLayout({
  children,
  initialCityData,
  canEdit = false,
}: CityPageLayoutProps) {
  return (
    <MainTemplate>
      <GlobalNav />
      <ColWrapper>
        <Header />
        <RowWrapper>
          <CityProvider initialCityData={initialCityData} canEdit={canEdit}>
            {children}
          </CityProvider>
        </RowWrapper>
      </ColWrapper>
    </MainTemplate>
  );
}