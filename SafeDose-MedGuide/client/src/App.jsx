import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Medicines from './pages/Medicines';
import MedicineDetail from './pages/MedicineDetail';
import AIChat from './pages/AIChat';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import PrescriptionAnalyzer from './pages/PrescriptionAnalyzer';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar user={user} onLogout={handleLogout} />
          
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
              />
              <Route 
                path="/register" 
                element={user ? <Navigate to="/" /> : <Register onLoginSuccess={handleLoginSuccess} />} 
              />
              <Route path="/medicines" element={<Medicines user={user} />} />
              <Route path="/medicines/:id" element={<MedicineDetail user={user} />} />
              <Route path="/ai-chat" element={<AIChat user={user} />} />
              <Route path="/favorites" element={<Favorites user={user} />} />
              <Route path="/prescriptions" element={<PrescriptionAnalyzer user={user} />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
