import React from 'react';
import { BarChart, LineChart, PieChart, TrendingUp, Users, FileText, Settings } from 'lucide-react';
import { useQuoteStore } from '../../store/quoteStore';
import { useCustomerStore } from '../../store/customerStore';
import { usePricebookStore } from '../../store/pricebookStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard: React.FC = () => {
  const { quotes } = useQuoteStore();
  const { customers } = useCustomerStore();
  const { entries } = usePricebookStore();

  const stats = [
    {
      title: 'Total Quotes',
      value: quotes.length,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Active Customers',
      value: customers.length,
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Products',
      value: entries.length,
      change: '-2%',
      trend: 'down'
    },
    {
      title: 'Conversion Rate',
      value: '32%',
      change: '+8%',
      trend: 'up'
    }
  ];

  // Quote Activity Chart Data
  const quoteActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Created',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Converted',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      }
    ]
  };

  // Revenue Trends Chart Data
  const revenueTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Reports
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className={`ml-2 text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Quote Activity</h2>
          <Bar data={quoteActivityData} options={chartOptions} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
          <Line data={revenueTrendsData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'New quote created', user: 'john@example.com', time: '2 hours ago' },
            { action: 'Customer data imported', user: 'sarah@example.com', time: '4 hours ago' },
            { action: 'Template updated', user: 'mike@example.com', time: '5 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.user}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;