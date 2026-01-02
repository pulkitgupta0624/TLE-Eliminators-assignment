import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../utils/helpers';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return showAlert('Passwords do not match', 'error');
    }

    const result = await signup(formData.name, formData.email, formData.password);
    
    if (result.success) {
      showAlert('Account created successfully! Please login.', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      showAlert(result.message, 'error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <i className="fas fa-user-plus"></i>
            <h1>Create Account</h1>
            <p>Join Session Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name"><i className="fas fa-user"></i> Full Name</label>
              <input type="text" id="name" required placeholder="Enter your full name" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="email"><i className="fas fa-envelope"></i> Email</label>
              <input type="email" id="email" required placeholder="Enter your email" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="password"><i className="fas fa-lock"></i> Password</label>
              <input type="password" id="password" required minLength="6" placeholder="Minimum 6 characters" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword"><i className="fas fa-lock"></i> Confirm Password</label>
              <input type="password" id="confirmPassword" required placeholder="Re-enter your password" onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              <i className="fas fa-user-plus"></i> Sign Up
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;