import React from 'react';
import LoginForm from '../components/organisms/LoginForm';
import MainTemplate from '../components/templates/MainTemplate';

export default function Home() {
  return (
    <MainTemplate>
      <LoginForm />
    </MainTemplate>
  );
}
