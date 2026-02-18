// Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl p-8 w-full max-w-md flex flex-col gap-6 border border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
            {/* City logo placeholder */}
            <span className="text-2xl text-blue-600 font-bold">🚦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Smart Traffic Monitoring System</h1>
          <p className="text-gray-600">Admin Access</p>
        </div>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full border-gray-200 rounded-lg px-4 py-2 text-gray-800"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered w-full border-gray-200 rounded-lg px-4 py-2 text-gray-800"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
}
