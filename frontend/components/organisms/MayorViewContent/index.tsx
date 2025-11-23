import React from 'react';
import CityGrid from '../CityGrid';
import Authorized from '../../atoms/Authorized';
import BuildingSidebar from '../BuidlingSidebar/BuildingSidebar';
import StatsPanel from '../StatsPanel';
import BuildingLogPanel from '../BuildingLogPanel';
import { City } from '../../../types/city';
import { Row, Column } from '../../../components/atoms/Blocks';
import { MapPanel, Message, ResourceColumn, MainGridArea, GridHeader, GridContainer, InfoColumn } from './styles';

interface MayorViewContentProps {
  initialCity?: City | null;
}

const MayorViewContent: React.FC<MayorViewContentProps> = ({ initialCity }) => {
  return (
     <Column>
         
    
          <Row justify="start">
          
              
     
            <GridHeader>
              {initialCity && (
                <>
                <Message>{ (initialCity as any).mayor ? (
                      <span> Mayor: {(initialCity as any).mayor.firstName} {(initialCity as any).mayor.lastName}</span>
                    ) : null }</Message>
                    <Message>{initialCity.name}, {initialCity.country}</Message>


                </>
              )}
            </GridHeader>

          </Row>


      <Row align="start">
               <ResourceColumn>
          <StatsPanel />
          <BuildingLogPanel />
        </ResourceColumn>

        <Authorized allowed={[ 'ADMIN' ]}>
          <BuildingSidebar />
        </Authorized>

        <MainGridArea>
          <GridContainer>
            <MapPanel><CityGrid /></MapPanel>
          </GridContainer>
        </MainGridArea>

        <InfoColumn>
        
        </InfoColumn>

      </Row>
    </Column>

  );
};

export default MayorViewContent;