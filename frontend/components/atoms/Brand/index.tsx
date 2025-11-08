import React from 'react';
import { useRouter } from 'next/router';
import { BrandContainer } from './styles';

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
