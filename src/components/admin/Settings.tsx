import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Plus, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { rules } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <button
          onClick={() => navigate('/admin/settings/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Rule</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        <div className="p-6">
          <h2 className="text-xl font-semibold">Business Rules</h2>
          <p className="text-gray-600 mt-1">Configure calculation rules and business logic</p>
        </div>

        <div className="divide-y">
          <Link
            to="/admin/settings/hvac-zones"
            className="flex items-center justify-between p-6 hover:bg-gray-50"
          >
            <div>
              <h3 className="text-lg font-medium">HVAC Zone Calculator Rules</h3>
              <p className="text-gray-600 mt-1">Configure zone calculation thresholds and limits</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
          
          {/* Placeholder for future rules */}
          <div className="p-6 text-gray-500 text-center">
            More rules coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;