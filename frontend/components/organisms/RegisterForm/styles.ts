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
  padding-left: 28px;

  input {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    opacity: 0;
    margin: 0;
  }

  span {
    position: relative;
    padding-left: 8px;
  }

  span::before {
    content: '';
    position: absolute;
    left: -28px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid #9ca3af;
    background: #fff;
    box-sizing: border-box;
  }

  input:checked + span::after {
    content: '';
    position: absolute;
    left: -24px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #3b82f6;
  }

  input:focus + span::before {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    border-color: #3b82f6;
  }
`;

export const InnerContainer = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 5px;
`;

export const MayorSelect = styled.select`
  width: 100%;
  margin-top: 8px;
  border-radius: 3px;
  border: 1px solid #a8a8a8ff;
  background-color: #ffffff;
  padding: 0 12px;
  min-height: 38px;
  height: 38px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }

  option {
    padding: 8px;
    background-color: #ffffff;
    color: #374151;
  }
`;

export const MayorOption = styled.option``;

export const LoadingText = styled.div`
  color: #6b7280;
`;


export const MayorSelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 20px 0;
  width: 100%;
`;

export const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
`;

export const RadioInput = styled.input`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  opacity: 0;
  margin: 0;
`;

export const RadioText = styled.span`
  position: relative;
  padding-left: 8px;

  &::before {
    content: '';
    position: absolute;
    left: -28px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid #9ca3af;
    background: #fff;
    box-sizing: border-box;
  }
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
`;