import styled from 'styled-components';

export const LeftColumn = styled.div`
  position: relative;
  padding-top: calc((100vh / 9) - 40px);
  height: 100%;
  display: flex;
  width: 100%;
  max-width: 110px;
  padding-right: 10px;
  gap: 5px;
  align-items: center;
  flex-direction: column;
`;

export const IconContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: calc((100vh / 9) - 30px);
  min-height: 60px;
`;