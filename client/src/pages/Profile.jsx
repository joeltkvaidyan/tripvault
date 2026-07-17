import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfile } from '../api/users';
import TripCard from '../components/TripCard';

function Profile() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      setNotFound(false);
      try {
        const res = await getPublicProfile(username);
        setProfile(res.data.user);
        setTrips(res.data.trips);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.response?.data?.message || 'Failed to load this profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return <p style={styles.centeredText}>Loading profile...</p>;
  }

  if (notFound) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyState}>
          <p style={styles.emptyEmoji}>🔍</p>
          <h3>No traveller found at @{username}</h3>
          <p style={styles.emptyText}>Double check the username, or they may not have a TripVault account.</p>
          <Link to="/login" style={styles.link}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <p style={styles.errorBox}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.name}>{profile.name}</h1>
        <p style={styles.username}>@{profile.username}</p>
        {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
      </header>

      <main style={styles.main}>
        {trips.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyEmoji}>🧳</p>
            <h3>No trips shared yet</h3>
            <p style={styles.emptyText}>{profile.name} hasn't added any travel memories yet.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} readOnly />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  header: {
    textAlign: 'center',
    padding: '2.5rem 1.5rem 2rem',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  name: { margin: 0, fontSize: '1.8rem' },
  username: { color: '#6b7280', margin: '0.25rem 0 0' },
  bio: { color: '#374151', maxWidth: '480px', margin: '0.75rem auto 0', lineHeight: 1.5 },
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
  emptyText: { color: '#6b7280', marginBottom: '0.5rem' },
  link: { color: '#2563eb' },
};

export default Profile;
