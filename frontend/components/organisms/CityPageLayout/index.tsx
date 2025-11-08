import React from 'react';
import MainTemplate from '../../templates/MainTemplate';
import { CityProvider } from '../CityContext';
import Header from '../../molecules/Header';
import GlobalNav from '../../molecules/GlobalNav';
import { RowWrapper, ColWrapper } from './styles';

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