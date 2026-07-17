import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTrip, uploadTripPhoto } from '../api/trips';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchTrip = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTrip(id);
      setTrip(res.data.trip);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load this trip.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const res = await uploadTripPhoto(id, file);
      setTrip(res.data.trip);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file
    }
  };

  if (loading) {
    return <p style={styles.centeredText}>Loading trip...</p>;
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <p>{error}</p>
          <Link to="/dashboard" style={styles.backLink}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const start = formatDate(trip.startDate);
  const end = formatDate(trip.endDate);
  let dateRange = null;
  if (start && end) dateRange = `${start} → ${end}`;
  else if (start) dateRange = `From ${start}`;
  else if (end) dateRange = `Until ${end}`;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Back to Dashboard
        </button>

        <div style={styles.headerCard}>
          {trip.coverImage && <img src={trip.coverImage} alt={trip.title} style={styles.heroImage} />}

          <div style={styles.headerBody}>
            <h1 style={styles.title}>{trip.title}</h1>
            <p style={styles.destination}>📍 {trip.destination}</p>
            {dateRange && <p style={styles.dates}>🗓️ {dateRange}</p>}
            {trip.rating && (
              <p style={styles.rating}>
                {'★'.repeat(trip.rating)}
                {'☆'.repeat(5 - trip.rating)}
              </p>
            )}
            {trip.description && <p style={styles.description}>{trip.description}</p>}
          </div>
        </div>

        <div style={styles.photosSection}>
          <div style={styles.photosHeader}>
            <h2 style={styles.photosHeading}>Photos</h2>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                style={{ display: 'none' }}
              />
              <button onClick={handleAddPhotoClick} disabled={uploading} style={styles.addPhotoButton}>
                {uploading ? 'Uploading...' : '+ Add Photo'}
              </button>
            </div>
          </div>

          {uploadError && <p style={styles.uploadError}>{uploadError}</p>}

          {trip.photos && trip.photos.length > 0 ? (
            <div style={styles.photoGrid}>
              {trip.photos.map((url, i) => (
                <img key={url + i} src={url} alt={`${trip.title} photo ${i + 1}`} style={styles.photoThumb} />
              ))}
            </div>
          ) : (
            <p style={styles.emptyPhotos}>No photos yet. Add your first one!</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '2rem 1rem' },
  container: { maxWidth: '800px', margin: '0 auto' },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '0.95rem',
    padding: 0,
    marginBottom: '1rem',
  },
  backLink: { color: '#2563eb' },
  centeredText: { textAlign: 'center', marginTop: '3rem', color: '#6b7280' },
  errorBox: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '1.5rem',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '2rem auto',
  },
  headerCard: {
    background: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '1.5rem',
  },
  heroImage: { width: '100%', height: '280px', objectFit: 'cover', display: 'block' },
  headerBody: { padding: '1.5rem' },
  title: { margin: '0 0 0.4rem', fontSize: '1.6rem' },
  destination: { margin: '0 0 0.25rem', color: '#374151', fontWeight: 500 },
  dates: { margin: '0 0 0.25rem', color: '#6b7280' },
  rating: { color: '#f59e0b', margin: '0 0 0.5rem', fontSize: '1.1rem' },
  description: { color: '#4b5563', lineHeight: 1.5, marginTop: '0.75rem' },
  photosSection: {
    background: '#fff',
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  photosHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  photosHeading: { margin: 0, fontSize: '1.15rem' },
  addPhotoButton: {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  uploadError: { color: '#dc2626', fontSize: '0.9rem', marginBottom: '0.75rem' },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '0.75rem',
  },
  photoThumb: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  emptyPhotos: { color: '#6b7280', textAlign: 'center', padding: '1.5rem 0' },
};

export default TripDetail;
