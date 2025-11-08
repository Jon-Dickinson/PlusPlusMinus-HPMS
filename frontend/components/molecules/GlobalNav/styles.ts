import styled from 'styled-components';

export const Sidebar = styled.nav`
  width: 80px;
  min-width: 80px;
  background: #111d3a;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
`;

export const NavIcons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding-top: 5px;
`;

export const Logo = styled.img`
  height: 40px;
  width: auto;
  display: block;
  margin-bottom: 15px;
`;

export const Icon = styled.img`
  height: 40px;
  width: auto;
  display: block;
  opacity: ${(props: { active?: boolean }) => (props.active ? 1 : 0.7)};
  filter: ${(props: { active?: boolean }) => (props.active ? 'none' : 'grayscale(60%)')};
  transition: opacity 0.15s ease, filter 0.15s ease;
`;

export const ExitButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-top: auto;
  margin-bottom: 1rem;

  img:hover {
    opacity: 1;
  }
`;