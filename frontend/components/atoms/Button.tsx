import styled from 'styled-components'

const Button = styled.button`
  background: ${(p: any) => p.theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default Button
