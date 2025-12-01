import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ModalOverlay, ModalContent, ModalTitle, ModalMessage, ModalButtons, CancelButton } from '../DeleteConfirmationModal/styles';
import UserAPI from '../../../lib/userAPI';

const formatDateSafe = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

interface AuditItem {
  id: number;
  callerId?: number | null;
  callerRole?: string | null;
  endpoint?: string | null;
  action?: string | null;
  decision?: string | null;
  reason?: string | null;
  durationMs?: number | null;
  requestId?: string | null;
  createdAt?: string | null;
}

interface AuditLogModalProps {
  isOpen: boolean;
  userId: number | null;
  onClose: () => void;
}

export default function AuditLogModal({ isOpen, userId, onClose }: AuditLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (!isOpen || !userId) return;

    setLoading(true);
    UserAPI.getAudits(Number(userId), { limit, offset })
      .then((data) => {
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotal(typeof data?.total === 'number' ? data.total : 0);
      })
      .catch((err) => console.error('Failed to load audits', err))
      .finally(() => setLoading(false));
  }, [isOpen, userId, limit, offset]);

  if (!isOpen || !userId) return null;

  const next = () => setOffset((o) => o + limit);
  const prev = () => setOffset((o) => Math.max(0, o - limit));

  const modal = (
    <ModalOverlay onClick={handleStopPropagation}>
      <ModalContent style={{ maxWidth: 920, width: '90%' }} onClick={handleStopPropagation}>
        <ModalTitle>Audit Logs</ModalTitle>
        <ModalMessage>{loading ? 'Loading...' : `Showing ${items.length} of ${total} entries`}</ModalMessage>

        <div style={{ margin: '8px 0 16px 0', maxHeight: 420, overflowY: 'auto' }}>
          {items.length === 0 && !loading && <div style={{ color: 'rgba(255,255,255,0.8)' }}>No audit logs</div>}

          {items.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '6px 4px' }}>When</th>
                  <th style={{ padding: '6px 4px' }}>Action</th>
                  <th style={{ padding: '6px 4px' }}>Decision</th>
                  <th style={{ padding: '6px 4px' }}>Endpoint</th>
                  <th style={{ padding: '6px 4px' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '6px 4px', fontSize: 12 }}>{mounted ? formatDateSafe(it.createdAt) : '—'}</td>
                    <td style={{ padding: '6px 4px', fontSize: 12 }}>{it.action || '—'}</td>
                    <td style={{ padding: '6px 4px', fontSize: 12 }}>{it.decision || '—'}</td>
                    <td style={{ padding: '6px 4px', fontSize: 12 }}>{it.endpoint || '—'}</td>
                    <td style={{ padding: '6px 4px', fontSize: 12 }}>{it.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button onClick={prev} disabled={offset === 0} style={{ marginRight: 8 }}>Prev</button>
            <button onClick={next} disabled={offset + limit >= total}>Next</button>
          </div>
          <ModalButtons>
            <CancelButton onClick={onClose}>Close</CancelButton>
          </ModalButtons>
        </div>
      </ModalContent>
    </ModalOverlay>
  );

  if (typeof document !== 'undefined') return createPortal(modal, document.body);
  return null;
}
