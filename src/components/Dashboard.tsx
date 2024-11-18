import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Users, FileSpreadsheet, Scale, Plus } from 'lucide-react';
import { useQuoteStore } from '../store/quoteStore';

const Dashboard = () => {
  const { quotes } = useQuoteStore();
  const navigate = useNavigate();

  const activeQuotes = quotes.filter(q => q.status === 'active').length;
  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const stats = [
    { 
      title: 'Active Quotes', 
      value: activeQuotes.toString(), 
      icon: Scale, 
      color: 'bg-blue-500',
      link: '/quotes'
    },
    { 
      title: 'Customers', 
      value: '156', 
      icon: Users, 
      color: 'bg-green-500',
      link: '/customers'
    },
    { 
      title: 'Products', 
      value: '89', 
      icon: FileSpreadsheet, 
      color: 'bg-purple-500',
      link: '/pricebook'
    },
    { 
      title: 'Conversion Rate', 
      value: '32%', 
      icon: BarChart3, 
      color: 'bg-orange-500'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md ${
              stat.link ? 'cursor-pointer hover:scale-105' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Quotes</h2>
            <Link
              to="/quotes/new"
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Quote</span>
            </Link>
          </div>
          <div className="space-y-4">
            {recentQuotes.map((quote) => (
              <Link
                key={quote.id}
                to={`/quote/${quote.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium">Quote #{quote.id}</p>
                  <p className="text-sm text-gray-600">
                    {quote.customerName} - {quote.service}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(quote.status)}`}>
                  {quote.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'New customer data uploaded', time: '2 hours ago' },
              { action: 'Pricebook updated', time: '5 hours ago' },
              { action: 'Quote #2024003 generated', time: '1 day ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{activity.action}</p>
                <span className="text-sm text-gray-600">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;