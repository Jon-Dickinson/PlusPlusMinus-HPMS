import styled from 'styled-components';

/**
 * Shared Organism Components Index
 * 
 * Central export point for shared organism-level components and styles
 */

/**
 * Dashboard Organism Components
 * 
 * Complex page-level layout components for dashboard interfaces
 */

export const MainGridArea = styled.div`
  margin-top: 72px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const GridHeader = styled.div`
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

export const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;