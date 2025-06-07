import { useEffect } from 'react';

function Login() {
  useEffect(() => {
    // Redirect to the API endpoint
    window.location.href = '/api/login';
  }, []);

  return (
    <div className="login-page">
      <div className="loading-spinner"></div>
      <p>Redirecting to Spotify...</p>
    </div>
  );
}

export default Login; 