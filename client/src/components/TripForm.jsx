import { useEffect, useState } from 'react';

// Converts an ISO date string (or Date) into the yyyy-mm-dd format <input type="date"> expects
function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const emptyTrip = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  description: '',
  rating: '',
};

function TripForm({ mode, initialData, onSubmit, onCancel, submitting, error }) {
  const [formData, setFormData] = useState(() =>
    initialData
      ? {
          title: initialData.title || '',
          destination: initialData.destination || '',
          startDate: toDateInputValue(initialData.startDate),
          endDate: toDateInputValue(initialData.endDate),
          description: initialData.description || '',
          rating: initialData.rating || '',
        }
      : emptyTrip
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.coverImage || '');

  // Revoke the object URL when it's replaced or the form unmounts, to avoid leaking memory
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title.trim(),
      destination: formData.destination.trim(),
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      description: formData.description.trim(),
      rating: formData.rating === '' ? undefined : Number(formData.rating),
    };

    onSubmit(payload, photoFile);
  };

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>{mode === 'edit' ? 'Edit Trip' : 'New Trip'}</h2>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>
          Title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Backwaters weekend"
          />
        </label>

        <label style={styles.label}>
          Destination
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Alappuzha, Kerala"
          />
        </label>

        <label style={styles.label}>
          Cover photo
          <input type="file" accept="image/*" onChange={handlePhotoChange} style={styles.fileInput} />
        </label>

        {previewUrl && (
          <div style={styles.previewWrap}>
            <img src={previewUrl} alt="Trip photo preview" style={styles.previewImage} />
          </div>
        )}

        <div style={styles.row}>
          <label style={{ ...styles.label, flex: 1 }}>
            Start date
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={{ ...styles.label, flex: 1 }}>
            End date
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
        </div>

        <label style={styles.label}>
          Rating (1–5)
          <input
            type="number"
            name="rating"
            min="1"
            max="5"
            value={formData.rating}
            onChange={handleChange}
            style={styles.input}
            placeholder="5"
          />
        </label>

        <label style={styles.label}>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="What made this trip memorable?"
            rows={3}
          />
        </label>

        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancelButton} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Trip'}
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
    width: '420px',
    maxWidth: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  row: { display: 'flex', gap: '0.75rem' },
  fileInput: { display: 'block', width: '100%', marginTop: '0.3rem', fontWeight: 400 },
  previewWrap: { marginBottom: '0.75rem' },
  previewImage: {
    width: '100%',
    maxHeight: '160px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
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

export default TripForm;
