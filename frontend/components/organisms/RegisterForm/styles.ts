import styled from 'styled-components';
import Button from '../../atoms/Button';

export const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: #ffffff;
  flex-direction: column;
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  width: 100%;
  max-width: 500px;
`;

export const Title = styled.h2`
  margin-bottom: 24px;
  text-align: center;
`;

export const ErrorMsg = styled.div`
  color: #b91c1c;
  margin-bottom: 16px;
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
`;

export const RadioLabel = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  height: 38px;
  padding-left: 25px;

  input {
    position: absolute;
    top: 40%;
    left: 0;
    transform: translateY(-50%);
  }
`;

export const MayorSelect = styled.select`
  width: 100%;
  padding: 8px;
  margin-top: 8px;
`;

export const MayorSelectContainer = styled.div`
  margin: 40px 0;
`;

export const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
`;