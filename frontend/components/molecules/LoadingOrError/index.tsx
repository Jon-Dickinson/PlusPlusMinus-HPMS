import React from 'react';
import LoggedInLayout from '../../templates/LoggedInLayout';
import { CenteredLoading } from './styles';

interface LoadingOrErrorProps {
  children: React.ReactNode;
}

const LoadingOrError: React.FC<LoadingOrErrorProps> = ({ children }) => (
  <LoggedInLayout>
    <CenteredLoading>
      {children}
    </CenteredLoading>
  </LoggedInLayout>
);

export default LoadingOrError;