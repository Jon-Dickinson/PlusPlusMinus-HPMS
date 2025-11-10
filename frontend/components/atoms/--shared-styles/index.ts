import styled from 'styled-components';

/**
 * Shared Atom Components Index
 * 
 * Central export point for shared atom-level components and styles
 */

/**
 * Dashboard Atomic Components
 * 
 * Basic UI elements used across dashboard interfaces
 */

export const SaveButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;

export const NotesInput = styled.textarea`
  width: 100%;
  height: 100px;
  background-color: #192748;
  color: white;
  border: 1px solid #414e79;
  border-radius: 5px;
  padding: 10px;
  margin-top: 1rem;
  resize: vertical;
`;

export const MessageDiv = styled.div<{ type: 'success' | 'error' }>`
  margin-top: 1rem;
  color: ${(props) => (props.type === 'success' ? 'green' : 'red')};
`;