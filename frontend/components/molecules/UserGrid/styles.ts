import styled from 'styled-components';

export const DataGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 20px;
  /* ensure DataGrid can grow to fill parent's height so internal scroll works */
  width: 100%;
  height: 100%;
`;

export const GridHeader = styled.div`
  display: flex;
   width: 100%;
  flex-direction: column;
  align-items: flex-start;
  padding: 15px 0 10px;
`;

export const MayorGrid = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  /* Make the list of mayor/viewer rows a scrollable region while keeping
     the header (GridHeader) always visible above. */
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

export const HeadingRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 100px;
  gap: 2px;
  align-items: center;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  /* Keep header fully visible above the scrollable row list */
  position: sticky;
  top: 0;
  z-index: 5;
`;

export const HeadingLabel = styled.div`
  color: rgba(255, 255, 255, 0.87);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HeadingLabelRight = styled(HeadingLabel)`
  text-align: right;
`;

export const HeaderTitle = styled.div`
  margin: 0 0 20px;
  font-size: 20px;
  color: #ffffff;
  font-weight: 500;
  letter-spacing: 0.15px;
`;

export const Message = styled.div`
  color: rgba(255, 255, 255, 0.87);
  padding: 24px;
  text-align: center;
  font-size: 16px;
`;