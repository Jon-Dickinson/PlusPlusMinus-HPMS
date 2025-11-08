import styled from 'styled-components';

export const SaveButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;

export const NotesInput = styled.textarea`
  width: 100%;
  height: 100px;
  background-color: #192748;
  color: white;
  border: 1px solid #414e79;
  border-radius: 5px;
  padding: 10px;
  margin-top: 1rem;
  resize: vertical;
`;

export const MapPanel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  min-height: 420px;
  width: 100%;
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

/* ==== MAIN GRID AREA ==== */
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

export const InfoColumn = styled.div`
  width: 100%;
  max-width: 340px;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
`;

export const MessageDiv = styled.div<{ type: 'success' | 'error' }>`
  margin-top: 1rem;
  color: ${(props) => (props.type === 'success' ? 'green' : 'red')};
`;