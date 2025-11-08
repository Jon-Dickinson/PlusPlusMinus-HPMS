import styled from 'styled-components';

export const Root = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: #ffffff;
`;

export const Form = styled.div`
  position: relative;
  display: inline-flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;

  z-index: 1;

  input:focus,
  textarea:focus,
  select:focus,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }

  h2 {
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
  }
`;

export const Jonathan = styled.div`
  position: absolute;
  bottom: 10px;
  right: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;

  p {
    color: #000000;
  }

  @media (max-width: 960px) {
    margin-top: 20px;
    position: relative;
    bottom: auto;
    right: auto;
  }
`;

export const Panel = styled.div`
  position: relative;
  display: inline-flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  z-index: 1;

  img {
    max-width: 100%;
    height: auto;

    @media (max-width: 960px) {
      padding-top: 50px;
      max-width: 280px;
    }
  }
`;

export const InnerPanel = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  max-width: 480px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`;

export const SignIn = styled.h3`
  color: #000000;
  margin: 0 0 15px;
  font-size: 18px;
  text-align: left;
  width: 100%;
  padding: 0 2px;
`;

export const Register = styled.div`
  color: #000000;
  margin: 0;
  font-size: 13px;
`;

export const ErrorMsg = styled.div`
  color: #b91c1c;
  margin: 8px 0 12px 0;
`;

export const ButtonContent = styled.div`
  display: inline-flex;
  align-items: center;
`;