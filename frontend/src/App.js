import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import MachineList from './components/Machines/MachineList';
import CustomerList from './components/Customers/CustomerList';
import AuxiliaryCostList from './components/AuxiliaryCosts/AuxiliaryCostList';
import QuotationList from './components/Quotations/QuotationList';
import QuotationForm from './components/Quotations/QuotationForm';
import QuotationView from './components/Quotations/QuotationView';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            <h1>Quotation Management System</h1>
          </div>
          <ul className="navbar-menu">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/quotations">Quotations</Link></li>
            <li><Link to="/machines">Machines</Link></li>
            <li><Link to="/customers">Customers</Link></li>
            <li><Link to="/auxiliary-costs">Auxiliary Costs</Link></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/machines" element={<MachineList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/auxiliary-costs" element={<AuxiliaryCostList />} />
            <Route path="/quotations" element={<QuotationList />} />
            <Route path="/quotations/new" element={<QuotationForm />} />
            <Route path="/quotations/:id" element={<QuotationView />} />
            <Route path="/quotations/:id/edit" element={<QuotationForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
