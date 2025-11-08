import styled from 'styled-components';

export const DataGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 20px;
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
  overflow: hidden;
`;

export const HeadingRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: center;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
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