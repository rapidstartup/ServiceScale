import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, Eye, Share2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useQuoteStore } from '../store/quoteStore';
import { toast } from 'react-hot-toast';

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

const statusIcons = {
  active: Clock,
  converted: CheckCircle,
  lost: XCircle,
};

const Quotes: React.FC = () => {
  const navigate = useNavigate();
  const { quotes, deleteQuote } = useQuoteStore();
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteQuote(id);
    setShowDeleteModal(null);
    toast.success('Quote deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        </div>
        <Link
          to="/quotes/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Quote</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(statusColors).map(([status]) => {
          const count = quotes.filter(q => q.status === status).length;
          const StatusIcon = statusIcons[status as keyof typeof statusIcons];
          
          return (
            <div key={status} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-5 w-5 ${status === 'active' ? 'text-blue-500' : status === 'converted' ? 'text-green-500' : 'text-red-500'}`} />
                  <h3 className="text-lg font-semibold capitalize">{status}</h3>
                </div>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/quote/${quote.id}`} className="text-blue-600 hover:underline">
                      #{quote.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{quote.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{quote.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${quote.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[quote.status]}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-gray-500">
                      {quote.sentAt && <Share2 className="h-4 w-4" />}
                      {quote.openedAt && <Eye className="h-4 w-4" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/quote/${quote.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(quote.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Delete Quote</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this quote? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;