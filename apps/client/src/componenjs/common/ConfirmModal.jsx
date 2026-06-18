import { useEffect } from 'react';

export default function ConfirmModal({
  open,
  title = '확인',
  message = '',
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onCancel, open]);

  if (!open) return null;

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget && !loading) {
      onCancel?.();
    }
  };

  return (
    <div className="confirm-modal-backdrop" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <h2 id="confirm-modal-title">{title}</h2>
        {message && <p>{message}</p>}
        <div className="confirm-modal-actions">
          <button type="button" className="secondary" disabled={loading} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`primary-action ${variant === 'danger' ? 'confirm-modal-danger' : ''}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? '처리 중...' : confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
