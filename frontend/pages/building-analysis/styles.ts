import styled from 'styled-components';

export const SidebarList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-top: 84px;
  max-width: 140px;
`;

export const ImageButton = styled.button`
  background: transparent;
  border: none;
  padding: 6px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  overflow: visible;

  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
    display: block;
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.15);
    }
  }
`;

export const AnalysisPlaceholder = styled.div`
  border-radius: 6px;
  min-height: 420px;
  padding: 1rem;
  color: #ffffff;
`;

export const RowWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

export const ColWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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

export const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

export const LoadingText = styled.p`
  color: #ffffff;
  font-size: 16px;
`;

export const ErrorContainer = styled.div`
  color: #ffffff;
`;

export const ErrorTitle = styled.h3`
  color: #ff6b6b;
  margin: 0 0 10px 0;
`;

export const ErrorMessage = styled.p`
  color: #ffffff;
  margin: 0;
`;

export const BuildingContainer = styled.div`
  color: #ffffff;
`;

export const BuildingTitle = styled.h3`
  color: #ffffff;
  margin: 0 0 15px 0;
`;

export const DescriptionContainer = styled.div`
  margin-bottom: 20px;
`;

export const ResourcesContainer = styled.div`
  margin-top: 20px;
`;

export const ResourcesTitle = styled.h4`
  color: #ffffff;
  margin: 0 0 10px 0;
`;

export const ResourcesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

export const ResourceItem = styled.li`
  color: #ffffff;
  margin-bottom: 5px;
  padding: 5px 0;
  border-bottom: 1px solid #414e79;
`;

export const DefaultContainer = styled.div`
  color: #ffffff;
`;

export const DefaultTitle = styled.h3`
  color: #ffffff;
  margin: 0 0 10px 0;
`;

export const DefaultText = styled.p`
  color: #ffffff;
  margin: 0;
`;
