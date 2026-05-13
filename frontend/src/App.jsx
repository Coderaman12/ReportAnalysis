import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import XRayPage from './pages/XRayPage.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<ReportsPage />} />
          <Route path="/xray" element={<XRayPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
