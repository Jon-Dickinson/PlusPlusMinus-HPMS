import styled from 'styled-components';
export type HealthState = 'online' | 'offline' | 'unknown';

export type SystemStatusState = {
  api: HealthState;
  db: HealthState;
};

export type Props = {
  maxReconnectAttempts?: number;
  className?: string;
};

export const STATUS_COLOR = {
  online: '#28B216',
  offline: '#FF2226',
  unknown: '#FAC902',
};

export const Wrapper = styled.div`
  margin-top: 15px;
  padding: 5px;
  font-size: 12px;
  width: max-content;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
`;

export const Label = styled.div`
  width: 50px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 12px;
`;

export const SingleLight = styled.div<{ status: HealthState }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ status }) => STATUS_COLOR[status]};
  transition: background 0.25s, box-shadow 0.25s;
`;

export const StatusText = styled.span`
  margin-left: 12px;
  font-size: 0.75rem;
  color: #555;
`;

export const ErrorText = styled(StatusText)`
  color: crimson;
`;
