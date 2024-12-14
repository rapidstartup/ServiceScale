import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Users, FileSpreadsheet, Scale, Plus } from 'lucide-react';
import { useQuoteStore } from '../store/quoteStore';
import { useCustomerStore } from '../store/customerStore';
import { usePricebookStore } from '../store/pricebookStore';
import { supabase } from '../lib/supabase';

interface Activity {
  action: string;
  time: Date;
  timestamp: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { quotes } = useQuoteStore();
  const { customers } = useCustomerStore();
  const { entries: products } = usePricebookStore();

  useEffect(() => {
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        console.log('Checking Supabase connection...');
        console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
        
        const { data, error } = await supabase.from('customers').select('count');
        if (error) {
          console.error('Supabase connection error:', error.message);
          console.error('Error details:', error);
        } else {
          console.log('Supabase connection successful, count:', data);
        }
      } catch (err) {
        console.error('Failed to check Supabase connection:', err);
      }
    };
    
    checkConnection();
  }, []);

  const activeQuotes = quotes.filter(q => q.status === 'active').length;
  const convertedQuotes = quotes.filter(q => q.status === 'converted').length;
  const conversionRate = quotes.length > 0 
    ? Math.round((convertedQuotes / quotes.length) * 100)
    : 0;

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
      value: customers.filter(c => !c.deleted).length.toString(), 
      icon: Users, 
      color: 'bg-green-500',
      link: '/customers'
    },
    { 
      title: 'Products', 
      value: products.filter(p => !p.deleted).length.toString(), 
      icon: FileSpreadsheet, 
      color: 'bg-purple-500',
      link: '/pricebook'
    },
    { 
      title: 'Conversion Rate', 
      value: `${conversionRate}%`, 
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

  // Get recent quotes
  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 3);

  // Get recent activity
  const getRecentActivity = () => {
    const activity: Activity[] = [];
    
    // Add quote activity
    quotes.forEach(quote => {
      if (quote.created_at) {
        activity.push({
          action: `Quote #${quote.id.slice(0, 7)} ${quote.status}`,
          time: new Date(quote.created_at),
          timestamp: new Date(quote.created_at).getTime()
        });
      }
    });

    // Add customer activity
    customers.forEach(customer => {
      if (customer.created_at && customer.Names) {
        activity.push({
          action: `Customer ${customer.Names} added`,
          time: new Date(customer.created_at),
          timestamp: new Date(customer.created_at).getTime()
        });
      }
    });

    // Add product activity
    products.forEach(product => {
      if (product.created_at && product.name) {
        activity.push({
          action: `Product ${product.name} added`,
          time: new Date(product.created_at),
          timestamp: new Date(product.created_at).getTime()
        });
      }
    });

    return activity
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
      .map(item => ({
        action: item.action,
        time: getTimeAgo(item.time)
      }));
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
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
            {recentQuotes.length > 0 ? (
              recentQuotes.map((quote) => (
                <Link
                  key={quote.id}
                  to={`/quotes/${quote.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium">Quote #{quote.id.slice(0, 7)}</p>
                    <p className="text-sm text-gray-600">
                      {quote.service}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No quotes yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {getRecentActivity().length > 0 ? (
              getRecentActivity().map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{activity.action}</p>
                  <span className="text-sm text-gray-600">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;