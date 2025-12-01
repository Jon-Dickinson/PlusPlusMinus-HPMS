import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { BrandContainer } from './styles';

const Brand = () => {
  const router = useRouter();
  const handleClick = useCallback(() => router.push('/'), [router]);
 
  return (
    <BrandContainer onClick={handleClick}>
      <img src="/logo.svg" alt="City Builder Logo" />
      <span>ity Builder</span>
    </BrandContainer>
  );
};

export default Brand;
