import styled from 'styled-components';

export const Root = styled.header`
  position: relative;
  width: 100%;
  min-height: 80px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
`;

export const Info = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

export const Heading = styled.div`
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
`;

export const Icon = styled.img`
  height: 36px;
  width: auto;
  display: block;
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
`;