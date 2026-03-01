import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import UploadProducts from './pages/UploadProducts';
import Dashboard from './pages/Dashboard';
import Chatbot from './components/Chatbot';

function Login() {
  const { t } = useTranslation();
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('login')}</h1></div>;
}

function Register() {
  const { t } = useTranslation();
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('register')}</h1></div>;
}

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-extrabold text-blue-600 tracking-tight">VyapaarAI</span>
            <div className="flex gap-4">
              <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">{t('dashboard')}</Link>
              <Link to="/upload" className="text-gray-600 hover:text-blue-600 font-medium">{t('uploadProducts')}</Link>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">{t('login')}</Link>
              <Link to="/register" className="text-gray-600 hover:text-blue-600 font-medium">{t('register')}</Link>
            </div>
          </div>
          <LanguageSwitcher />
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadProducts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
