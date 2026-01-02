import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Import your existing styles in specific order
import './styles/common.css';
import './styles/auth.css';
import './styles/user.css';
import './styles/admin.css';
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);