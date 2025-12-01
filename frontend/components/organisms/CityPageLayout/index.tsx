import React from 'react';
import LoggedInLayout from '../../templates/LoggedInLayout';
import { CityProvider } from '../CityContext';

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
    <LoggedInLayout>
      <CityProvider initialCityData={initialCityData} canEdit={canEdit}>
        {children}
      </CityProvider>
    </LoggedInLayout>
  );
}