import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function HelloPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/hello')
      .then((response) => setMessage(response.message))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Failed to load: {error}</p>;

  return <h1>{message}</h1>;
}