import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, StatusBadge, LoadingState, Button } from '../common/FormElements';
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Plus,
  ArrowRight,
  DollarSign,
} from 'lucide-react';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, quotationsRes] = await Promise.all([
        quotationsAPI.getStatistics(),
        quotationsAPI.getAll({ limit: 5 }),
      ]);
      setStats(statsRes.data);
      setRecentQuotations(quotationsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const statCards = [
    {
      label: 'Total Quotations',
      value: stats?.total || 0,
      icon: FileText,
      color: 'primary',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      label: 'Pending Approval',
      value: (parseInt(stats?.submitted || 0) + parseInt(stats?.engineer_approved || 0)),
      icon: Clock,
      color: 'amber',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Issued',
      value: stats?.issued || 0,
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Total Value (Issued)',
      value: `$${parseFloat(stats?.total_issued_value || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const workflowStats = [
    { label: 'Draft', value: stats?.draft || 0, color: 'bg-industrial-200' },
    { label: 'Submitted', value: stats?.submitted || 0, color: 'bg-blue-400' },
    { label: 'Engineer Approved', value: stats?.engineer_approved || 0, color: 'bg-amber-400' },
    { label: 'Management Approved', value: stats?.management_approved || 0, color: 'bg-emerald-400' },
    { label: 'Issued', value: stats?.issued || 0, color: 'bg-purple-400' },
    { label: 'Rejected', value: stats?.rejected || 0, color: 'bg-red-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Dashboard</h1>
          <p className="text-industrial-500">Welcome back, {user?.fullName}</p>
        </div>
        {hasPermission('quotations:create') && (
          <Link to="/quotations/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Quotation
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardBody className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-industrial-500">{stat.label}</p>
                <p className="text-2xl font-bold text-industrial-900">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-industrial-200 flex items-center justify-between">
              <h2 className="font-semibold text-industrial-900">Recent Quotations</h2>
              <Link 
                to="/quotations" 
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-industrial-100">
              {recentQuotations.length === 0 ? (
                <div className="p-8 text-center text-industrial-500">
                  No quotations yet. Create your first one!
                </div>
              ) : (
                recentQuotations.map((quotation) => (
                  <Link
                    key={quotation.quotation_id}
                    to={`/quotations/${quotation.quotation_id}`}
                    className="flex items-center justify-between p-4 hover:bg-industrial-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-industrial-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-industrial-500" />
                      </div>
                      <div>
                        <p className="font-medium text-industrial-900">{quotation.quote_number}</p>
                        <p className="text-sm text-industrial-500">{quotation.customer_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={quotation.status} />
                      <p className="text-sm text-industrial-500 mt-1">
                        {quotation.currency} {parseFloat(quotation.total_quote_value).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Workflow Status */}
        <div>
          <Card>
            <div className="px-6 py-4 border-b border-industrial-200">
              <h2 className="font-semibold text-industrial-900">Quotation Pipeline</h2>
            </div>
            <CardBody className="space-y-4">
              {workflowStats.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-industrial-600">{item.label}</span>
                    <span className="font-semibold text-industrial-900">{item.value}</span>
                  </div>
                  <div className="h-2 bg-industrial-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{
                        width: `${stats?.total > 0 ? (item.value / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <div className="px-6 py-4 border-b border-industrial-200">
              <h2 className="font-semibold text-industrial-900">Quick Actions</h2>
            </div>
            <CardBody className="space-y-2">
              {hasPermission('quotations:create') && (
                <Link
                  to="/quotations/new"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-industrial-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-industrial-700">Create Quotation</span>
                </Link>
              )}
              {hasPermission('customers:create') && (
                <Link
                  to="/customers/new"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-industrial-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-industrial-700">Add Customer</span>
                </Link>
              )}
              {hasPermission('machines:create') && (
                <Link
                  to="/machines/new"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-industrial-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-industrial-700">Add Machine</span>
                </Link>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
