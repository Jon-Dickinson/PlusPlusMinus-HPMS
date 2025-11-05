import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';


const BrandContainer = styled.div`
  position: absolute;
  top: 10px;
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


const Brand = () => {
  const router = useRouter();
  return (
    <BrandContainer onClick={() => router.push('/')}>
      <img src="/logo.svg" alt="City Builder Logo" />
      <span>ity Builder</span>
    </BrandContainer>
  );
};


export default Brand;



