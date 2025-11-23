import styled from 'styled-components';

export const Root = styled.header`
  position: relative;
  width: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  min-height: 80px;
  margin-bottom: 15px;
  border-bottom: 1px solid #414e79;
`;

export const Info = styled.div`
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  max-width: 320px;
  justify-content: flex-end;
`;

export const Heading = styled.div`
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
`;

export const Icon = styled.img`
  height: 36px;
  width: 36px;
   display: inline-flex;
  align-items: center;
  margin-left: 20px;
`;

export const Left = styled.div`
   display: inline-flex;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  max-width: 320px;
`;