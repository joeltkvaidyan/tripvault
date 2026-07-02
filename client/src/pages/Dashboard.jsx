import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        // Token invalid/expired -> clear it and send back to login
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <p style={styles.centeredText}>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Welcome, {user?.name} 👋</h2>
        <p style={styles.emailText}>{user?.email}</p>
        <p style={styles.description}>This is your TripVault dashboard. Your travel memories will live here.</p>
        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' },
  card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '360px', textAlign: 'center' },
  emailText: { color: '#666', marginBottom: '1rem' },
  description: { marginBottom: '1.5rem' },
  button: { padding: '0.6rem 1.2rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  centeredText: { textAlign: 'center', marginTop: '3rem' },
};

export default Dashboard;
