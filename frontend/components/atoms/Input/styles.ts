import styled from 'styled-components';

export const Input = styled.input`
  position: relative;
  width: 100%;
  display: inline-flex;
  padding: 0 12px;
  min-height: 38px;
  height: 38px;
  margin-bottom: 10px;
  background: #ffffff !important;
  border-radius: 3px;
  border: 1px solid #a8a8a8ff;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &[type='text'],
  &[type='email'],
  &[type='password'],
  &[type='search'],
  &[type='url'] {
    background: #ffffff !important;
  }

  /* Hide Edge/IE clear and reveal buttons */
  &::-ms-clear,
  &::-ms-reveal {
    display: none;
    width: 0;
    height: 0;
  }

  /* Placeholder compatibility */
  &::-ms-input-placeholder {
    color: #6b7280;
    opacity: 1;
  }
  &::-webkit-input-placeholder {
    color: #6b7280;
    opacity: 1;
  }
  &::-moz-placeholder {
    color: #6b7280;
    opacity: 1;
  }

  /* Remove focus styles entirely (no outline/box-shadow) */
  &:focus,
  &:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
`;