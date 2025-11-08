import React from 'react';
import MainTemplate from '../../templates/MainTemplate';
import GlobalNav from '../GlobalNav';
import Header from '../Header';
import { RowWrapper, ColWrapper, CenteredLoading } from './styles';

interface LoadingOrErrorProps {
  children: React.ReactNode;
}

const LoadingOrError: React.FC<LoadingOrErrorProps> = ({ children }) => (
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

export default LoadingOrError;