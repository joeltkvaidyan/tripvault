function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function StarRating({ rating }) {
  if (!rating) return null;
  const full = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return (
    <span style={styles.stars} title={`${rating} / 5`}>
      {full}
      {empty}
    </span>
  );
}

function TripCard({ trip, onEdit, onDelete }) {
  const start = formatDate(trip.startDate);
  const end = formatDate(trip.endDate);

  let dateRange = null;
  if (start && end) dateRange = `${start} → ${end}`;
  else if (start) dateRange = `From ${start}`;
  else if (end) dateRange = `Until ${end}`;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.title}>{trip.title}</h3>
        <StarRating rating={trip.rating} />
      </div>

      <p style={styles.destination}>📍 {trip.destination}</p>

      {dateRange && <p style={styles.dates}>🗓️ {dateRange}</p>}

      {trip.description && <p style={styles.description}>{trip.description}</p>}

      <div style={styles.actions}>
        <button onClick={() => onEdit(trip)} style={styles.editButton}>
          Edit
        </button>
        <button onClick={() => onDelete(trip)} style={styles.deleteButton}>
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '10px',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  title: { margin: 0, fontSize: '1.1rem' },
  stars: { color: '#f59e0b', whiteSpace: 'nowrap', fontSize: '0.95rem' },
  destination: { margin: 0, color: '#374151', fontWeight: 500 },
  dates: { margin: 0, color: '#6b7280', fontSize: '0.9rem' },
  description: { margin: '0.25rem 0 0', color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.4 },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem' },
  editButton: {
    flex: 1,
    padding: '0.5rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteButton: {
    flex: 1,
    padding: '0.5rem',
    background: '#fff',
    color: '#dc2626',
    border: '1px solid #dc2626',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default TripCard;
