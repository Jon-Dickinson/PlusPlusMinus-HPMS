import styled from 'styled-components';

export const LogBoxHeading = styled.h4`
  color: #ffffff;
  margin: 20px 0 10px;
  font-weight: 400;
`;

export const LogBox = styled.div`
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: #192748;
  padding: 1rem;
  color: #ffffff;
  overflow-y: auto;
  max-height: 50vh;
`;