import { useEffect } from 'react';

function Login() {
  useEffect(() => {
    // Redirect to the login endpoint
    window.location.href = '/login';
  }, []);

  return (
    <div className="login-page">
      <div className="loading-spinner"></div>
      <p>Redirecting to Spotify...</p>
    </div>
  );
}

export default Login; 