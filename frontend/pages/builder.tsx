import React from 'react';
import MainTemplate from '../templates/MainTemplate';
import styled from 'styled-components';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #0f0f12 0%, #1c1f25 100%);
  color: #fff;
  font-family: 'Inter', sans-serif;
`;

/* ==== LEFT SIDEBAR ==== */
const Sidebar = styled.div`
  width: 80px;
  background: #15171b;
  border-right: 2px solid red;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
`;

const Logo = styled.div`
  height: 60px;
  width: 60px;
  border: 2px solid red;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavIcons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/* ==== RESOURCE COLUMN ==== */
const ResourceColumn = styled.div`
  width: 240px;
  padding: 1rem;
  border-right: 2px solid red;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  color: #ccc;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.9rem;
`;

const ResourceCard = styled.div`
  height: 80px;
  border: 2px solid red;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
`;

/* ==== MAIN GRID AREA ==== */
const MainGridArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-right: 2px solid red;
`;

const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  grid-template-rows: repeat(9, 1fr);
  gap: 4px;
  flex: 1;
`;

const GridCell = styled.div`
  border: 1px solid #333;
  background: #1a1d23;
  border-radius: 4px;
`;

/* ==== RIGHT INFO COLUMN ==== */
const InfoColumn = styled.div`
  width: 240px;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1.5rem;
`;

const QualityBox = styled.div`
  border: 2px solid red;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  span {
    font-size: 2rem;
    font-weight: bold;
    color: #ffcc00;
  }
`;

const BuildingLog = styled.div`
  border: 2px solid red;
  border-radius: 8px;
  padding: 1rem;
  h4 {
    margin-bottom: 0.5rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    border-bottom: 1px solid #333;
    padding: 0.25rem 0;
  }
`;

export default function BuilderPage() {
  return (
    <PageWrapper>
      <Sidebar>
        <Logo>Logo</Logo>
        <NavIcons>
          <button>🏙</button>
          <button>📊</button>
          <button>📝</button>
        </NavIcons>
      </Sidebar>

      <ResourceColumn>
        <SectionTitle>Resources</SectionTitle>
        <ResourceCard>Power</ResourceCard>
        <ResourceCard>Water</ResourceCard>
        <ResourceCard>Population</ResourceCard>
        <ResourceCard>Services</ResourceCard>
        <ResourceCard>Food</ResourceCard>
      </ResourceColumn>
      <ResourceColumn></ResourceColumn>
      <MainGridArea>
        <GridHeader>
          <h2>City Name, Country</h2>
          <h3>Mayor: Paul Sims</h3>
        </GridHeader>
        <GridContainer>
          {Array.from({ length: 9 * 11 }).map((_, i) => (
            <GridCell key={i} />
          ))}
        </GridContainer>
      </MainGridArea>

      <InfoColumn>
        <QualityBox>
          <h3>Quality Index</h3>
          <span>73%</span>
        </QualityBox>

        <BuildingLog>
          <h4>Building Log</h4>
          <ul>
            <li>Residential</li>
            <li>Power</li>
            <li>Water</li>
            <li>Residential</li>
          </ul>
        </BuildingLog>
      </InfoColumn>
    </PageWrapper>
  );
}
