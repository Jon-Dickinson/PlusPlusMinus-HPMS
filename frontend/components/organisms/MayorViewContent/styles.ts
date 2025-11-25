import styled from 'styled-components';

export const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  min-height: 420px;
  width: 100%;
`;

export const Message = styled.div`
  position: relative;
  display: inline-flex;
  font-size: 15px;
  color: #ffffff;
`;

export const ResourceColumn = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MainGridArea = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const GridHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 20px;

  h2 {
    font-size: 16px;
    margin: 0;
    color: #ffffff;
    font-weight: 500;
  }
`;

export const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

export const InfoColumn = styled.div`
  width: 100%;
  max-width:340px;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;