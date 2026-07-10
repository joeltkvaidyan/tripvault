function ConfirmDialog({ title, message, onConfirm, onCancel, confirming }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button onClick={onCancel} style={styles.cancelButton} disabled={confirming}>
            Cancel
          </button>
          <button onClick={onConfirm} style={styles.confirmButton} disabled={confirming}>
            {confirming ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    zIndex: 60,
  },
  dialog: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '10px',
    width: '340px',
    maxWidth: '100%',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  title: { marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' },
  message: { color: '#4b5563', marginBottom: '1.25rem', fontSize: '0.95rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  cancelButton: {
    flex: 1,
    padding: '0.55rem',
    background: '#fff',
    color: '#374151',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  confirmButton: {
    flex: 1,
    padding: '0.55rem',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default ConfirmDialog;
