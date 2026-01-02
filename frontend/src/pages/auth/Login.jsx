import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../utils/helpers';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      showAlert('Login successful!', 'success');
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      showAlert(result.message, 'error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <i className="fas fa-shield-alt"></i>
            <h1>Session Management</h1>
            <p>Secure Device Management System</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Email</label>
              <input 
                type="email" 
                required 
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-lock"></i> Password</label>
              <input 
                type="password" 
                required 
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
          </form>
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;