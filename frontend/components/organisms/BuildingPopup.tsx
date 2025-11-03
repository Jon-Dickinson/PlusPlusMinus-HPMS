import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../lib/axios';

const Popup = styled.div`
  position: fixed;
  right: 0;
  top: 60px;
  width: 420px;
  height: calc(100vh - 60px);
  background: #f9fafb;
  border-left: 2px solid #0068ff;
  padding: 20px;
  overflow-y: auto;
  z-index: 1200;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
  transform: translateX(0);
  transition: transform 180ms ease-in-out;
`;

const Close = styled.button`
  background: transparent;
  border: none;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
`;

export default function BuildingPopup({
  id,
  initialData,
  data,
  onClose,
}: {
  id?: number;
  initialData?: any;
  data?: any;
  onClose: () => void;
}) {
  const [payload, setPayload] = useState<any>(data ?? initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if an id is provided, fetch fresh details from the API; fall back to initialData
    if (!id) return;
    let mounted = true;
    async function fetchBuilding() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.instance.get(`/api/building/${id}`);
        const p = res.data?.building ?? res.data;
        if (mounted) setPayload(p);
      } catch (err: any) {
        // if the fetch fails, keep initialData if present, otherwise show an error
        if (mounted) {
          if (!initialData) setError('Unable to load building details from server');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // always attempt fetch to get latest server record
    fetchBuilding();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <Popup>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{payload?.name || 'Building'}</h2>
        <Close onClick={onClose}>Close</Close>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <p>
              <strong>Category:</strong> {payload?.category || '—'}
            </p>
            {/* support multiple backend/frontend shapes: server returns `stats`, older JSON uses `resources`,
                or flat top-level fields */}
            <p>
              <strong>Power (usage):</strong>{' '}
              {payload?.stats?.powerUsage ?? payload?.resources?.power ?? payload?.power ?? '—'}
            </p>
            <p>
              <strong>Power Output:</strong>{' '}
              {payload?.stats?.powerOutput ??
                payload?.resources?.powerOutput ??
                payload?.powerOutput ??
                '—'}
            </p>
            <p>
              <strong>Water (usage):</strong>{' '}
              {payload?.stats?.waterUsage ?? payload?.resources?.water ?? payload?.water ?? '—'}
            </p>
            <p>
              <strong>Water Output:</strong>{' '}
              {payload?.stats?.waterOutput ??
                payload?.resources?.waterOutput ??
                payload?.waterOutput ??
                '—'}
            </p>
            <p>
              <strong>Employment:</strong>{' '}
              {payload?.stats?.employs ??
                payload?.stats?.employment ??
                payload?.resources?.employment ??
                payload?.employment ??
                '—'}
            </p>
            <p>
              <strong>Population / Houses:</strong>{' '}
              {payload?.stats?.houses ??
                payload?.resources?.population ??
                payload?.population ??
                payload?.houses ??
                '—'}
            </p>
            <p>
              <strong>Service Coverage:</strong>{' '}
              {payload?.stats?.services ??
                payload?.resources?.serviceCoverage ??
                payload?.serviceCoverage ??
                '—'}
            </p>
            <p>
              <strong>Food Production:</strong>{' '}
              {payload?.stats?.feeds ??
                payload?.resources?.foodProduction ??
                payload?.foodProduction ??
                '—'}
            </p>

            {/* raw JSON for debugging */}
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer' }}>Raw data</summary>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                {JSON.stringify(payload ?? {}, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </Popup>
  );
}
