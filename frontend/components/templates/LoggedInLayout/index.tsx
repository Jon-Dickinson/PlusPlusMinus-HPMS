import React from 'react';
import styled from 'styled-components';
import MainTemplate from '../MainTemplate';
import Header from '../../molecules/Header';
import GlobalNav from '../../molecules/GlobalNav';

const ColWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

interface LoggedInLayoutProps {
  children: React.ReactNode;
}

export default function LoggedInLayout({ children }: LoggedInLayoutProps) {
  return (
    <MainTemplate>
      <GlobalNav />
      <ColWrapper>
        <Header key="app-header" />
        <RowWrapper>
          {children}
        </RowWrapper>
      </ColWrapper>
    </MainTemplate>
  );
}