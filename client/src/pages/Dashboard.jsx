import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../api/trips';
import TripCard from '../components/TripCard';
import TripForm from '../components/TripForm';
import ConfirmDialog from '../components/ConfirmDialog';

function Dashboard() {
  const navigate = useNavigate();

  // Current user
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Trips list
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState('');

  // Create / edit form modal
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingTrip, setEditingTrip] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [tripToDelete, setTripToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch current user (used to greet them + validate the token)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch trips for the logged-in user
  const fetchTrips = async () => {
    setTripsLoading(true);
    setTripsError('');
    try {
      const res = await getTrips();
      setTrips(res.data.trips);
    } catch (err) {
      setTripsError(err.response?.data?.message || 'Failed to load trips. Please try again.');
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- Create / Edit form handlers ---

  const openCreateForm = () => {
    setFormMode('create');
    setEditingTrip(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (trip) => {
    setFormMode('edit');
    setEditingTrip(trip);
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setFormOpen(false);
    setEditingTrip(null);
    setFormError('');
  };

  const handleFormSubmit = async (payload) => {
    setFormSubmitting(true);
    setFormError('');
    try {
      if (formMode === 'edit' && editingTrip) {
        await updateTrip(editingTrip._id, payload);
      } else {
        await createTrip(payload);
      }
      setFormOpen(false);
      setEditingTrip(null);
      await fetchTrips(); // refresh list after CRUD action
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // --- Delete handlers ---

  const requestDelete = (trip) => {
    setDeleteError('');
    setTripToDelete(trip);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setTripToDelete(null);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteTrip(tripToDelete._id);
      setTripToDelete(null);
      await fetchTrips(); // refresh list after CRUD action
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete trip. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (userLoading) {
    return <p style={styles.centeredText}>Loading...</p>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.welcome}>Welcome, {user?.name} 👋</h2>
          <p style={styles.emailText}>{user?.email}</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={openCreateForm} style={styles.newTripButton}>
            + New Trip
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {tripsLoading && <p style={styles.centeredText}>Loading your trips...</p>}

        {!tripsLoading && tripsError && (
          <div style={styles.errorBox}>
            <p>{tripsError}</p>
            <button onClick={fetchTrips} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {!tripsLoading && !tripsError && trips.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyEmoji}>🧳</p>
            <h3>No trips yet</h3>
            <p style={styles.emptyText}>Your travel memories will show up here once you add your first trip.</p>
            <button onClick={openCreateForm} style={styles.newTripButton}>
              + Add Your First Trip
            </button>
          </div>
        )}

        {!tripsLoading && !tripsError && trips.length > 0 && (
          <div style={styles.grid}>
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} onEdit={openEditForm} onDelete={requestDelete} />
            ))}
          </div>
        )}
      </main>

      {formOpen && (
        <TripForm
          mode={formMode}
          initialData={editingTrip}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          submitting={formSubmitting}
          error={formError}
        />
      )}

      {tripToDelete && (
        <ConfirmDialog
          title="Delete this trip?"
          message={`"${tripToDelete.title}" will be permanently removed. This can't be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirming={deleting}
        />
      )}

      {deleteError && !tripToDelete && (
        <p style={{ ...styles.errorBox, textAlign: 'center' }}>{deleteError}</p>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1.5rem 2rem',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  welcome: { margin: 0 },
  emailText: { color: '#666', margin: '0.15rem 0 0' },
  headerActions: { display: 'flex', gap: '0.5rem' },
  newTripButton: {
    padding: '0.6rem 1.1rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  logoutButton: {
    padding: '0.6rem 1.1rem',
    background: '#fff',
    color: '#dc2626',
    border: '1px solid #dc2626',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  main: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  centeredText: { textAlign: 'center', marginTop: '3rem', color: '#6b7280' },
  errorBox: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '2rem auto',
  },
  retryButton: {
    marginTop: '0.5rem',
    padding: '0.4rem 1rem',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    background: '#fff',
    borderRadius: '10px',
    padding: '3rem 1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    maxWidth: '420px',
    margin: '2rem auto',
  },
  emptyEmoji: { fontSize: '2.5rem', margin: 0 },
  emptyText: { color: '#6b7280', marginBottom: '1.25rem' },
};

export default Dashboard;
