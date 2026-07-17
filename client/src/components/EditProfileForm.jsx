import { useState } from 'react';

function EditProfileForm({ user, onSubmit, onCancel, submitting, error }) {
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username: username.trim().toLowerCase(), bio: bio.trim() });
  };

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Edit Profile</h2>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            pattern="[a-z0-9_.]+"
            title="Lowercase letters, numbers, underscores, and dots only"
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={4}
            placeholder="Tell people about your travels..."
            style={styles.textarea}
          />
          <span style={styles.charCount}>{bio.length}/280</span>
        </label>

        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancelButton} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
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
    zIndex: 50,
  },
  form: {
    background: '#fff',
    padding: '1.75rem',
    borderRadius: '10px',
    width: '400px',
    maxWidth: '100%',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  heading: { marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#374151',
    marginBottom: '0.75rem',
    fontWeight: 500,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '0.55rem',
    marginTop: '0.3rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontWeight: 400,
  },
  textarea: {
    display: 'block',
    width: '100%',
    padding: '0.55rem',
    marginTop: '0.3rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontWeight: 400,
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  charCount: { display: 'block', textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  cancelButton: {
    flex: 1,
    padding: '0.6rem',
    background: '#fff',
    color: '#374151',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '0.6rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: { color: '#dc2626', marginBottom: '0.75rem', fontSize: '0.9rem' },
};

export default EditProfileForm;
