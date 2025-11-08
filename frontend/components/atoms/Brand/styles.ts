import styled from 'styled-components';

export const BrandContainer = styled.div`
  position: absolute;
  top: 30px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  width: 100%;

  img {
    max-width: 60px;
  }

  span {
    transform: translateX(-10px);
    color: #004AEE;
  }

  @media (max-width: 960px) {
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
  }
`;