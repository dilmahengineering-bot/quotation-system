import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Customers from './pages/Customers';
import AuxiliaryCosts from './pages/AuxiliaryCosts';
import Quotations from './pages/Quotations';
import QuotationForm from './pages/QuotationForm';
import QuotationView from './pages/QuotationView';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/auxiliary-costs" element={<AuxiliaryCosts />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/quotations/new" element={<QuotationForm />} />
            <Route path="/quotations/:id" element={<QuotationView />} />
            <Route path="/quotations/:id/edit" element={<QuotationForm />} />
          </Routes>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Router>
  );
}

export default App;
