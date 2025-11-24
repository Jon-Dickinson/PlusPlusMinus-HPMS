import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #192748;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  color: #ffffff;
`;

export const ModalTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
`;

export const ModalMessage = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const CancelButton = styled.button`
  background: #6b7280;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #4b5563;
  }
`;

export const DeleteButton = styled.button`
  background: #ef4444;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #dc2626;
  }
`;

export const SaveButton = styled.button`
  background: #16a34a;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #15803d;
  }
`;