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
  
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const GridHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: space-between;
  padding-left: 20px;
  width: 100%;
  margin-bottom: 10px;

  h2 {
    margin: 0;
    font-size: 14px;
    color: #ffffff;
    font-weight: 500;
  }

  h3 {
     margin: 10px 0;
    font-size: 14px;
    color: #ffffff;
    font-weight: 500;
  }
`;

export const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;