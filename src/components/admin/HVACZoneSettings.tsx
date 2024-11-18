import React from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { toast } from 'react-hot-toast';

const HVACZoneSettings: React.FC = () => {
  const { hvacZoneRules, updateHVACZoneRules } = useSettingsStore();

  const handleSave = () => {
    toast.success('HVAC Zone rules updated successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/admin/settings" className="text-gray-500 hover:text-gray-700">Settings</Link>
            </li>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <li className="text-gray-900 font-medium">HVAC Zone Calculator Rules</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">HVAC Zone Calculator Rules</h1>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Zones</label>
            <input
              type="number"
              value={hvacZoneRules.baseZones}
              onChange={(e) => updateHVACZoneRules({ baseZones: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">Minimum number of zones for any property</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Medium Size Threshold (sq ft)</label>
              <input
                type="number"
                value={hvacZoneRules.sizeThresholds.medium}
                onChange={(e) => updateHVACZoneRules({
                  sizeThresholds: {
                    ...hvacZoneRules.sizeThresholds,
                    medium: Number(e.target.value)
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Add zone if property exceeds this size</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Large Size Threshold (sq ft)</label>
              <input
                type="number"
                value={hvacZoneRules.sizeThresholds.large}
                onChange={(e) => updateHVACZoneRules({
                  sizeThresholds: {
                    ...hvacZoneRules.sizeThresholds,
                    large: Number(e.target.value)
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Add another zone if property exceeds this size</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bathroom Threshold</label>
            <input
              type="number"
              step="0.5"
              value={hvacZoneRules.bathroomThreshold}
              onChange={(e) => updateHVACZoneRules({ bathroomThreshold: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">Add zone if number of bathrooms exceeds this value</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Zones</label>
            <input
              type="number"
              value={hvacZoneRules.maxZones}
              onChange={(e) => updateHVACZoneRules({ maxZones: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">Maximum number of zones allowed for any property</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Link
            to="/admin/settings"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default HVACZoneSettings;