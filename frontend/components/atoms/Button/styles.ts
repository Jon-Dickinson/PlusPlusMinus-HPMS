import styled from 'styled-components';

export const Button = styled.button`
  background: ${(props: any) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0 15px;
  min-height: 32px;
  height: 32px;
  border-radius: 3px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    opacity: 0.6;
  }
`;