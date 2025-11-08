'use client';

import React from 'react';

import styled from 'styled-components';
import DndShell from '../molecules/DndShell';

const Root = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: calc(100% - 1px);
  height: 100%;
  overflow: hidden;
`;

const Dashboard = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #111d3a;
`;

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <Root>
      <DndShell>
        <Dashboard>{children}</Dashboard>
      </DndShell>
    </Root>
  );
}
