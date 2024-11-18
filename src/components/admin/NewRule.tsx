import React from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, ChevronRight, Mail } from 'lucide-react';

const NewRule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/admin/settings" className="text-gray-500 hover:text-gray-700">Settings</Link>
            </li>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <li className="text-gray-900 font-medium">New Rule</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">New Business Rule</h1>
        </div>

        <div className="text-center py-12">
          <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Contact Development Team</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            To add a new business rule to the system, please contact our development team. They will help implement your custom rule requirements.
          </p>
          <a
            href="mailto:dev@servicescale.ai"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Development Team</span>
          </a>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to="/admin/settings"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewRule;