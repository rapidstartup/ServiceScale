import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Trash2, Edit2 } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { templates, deleteTemplate } = useTemplateStore();
  const user = useAuthStore(state => state.user);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleDelete = (templateId: string) => {
    setShowDeleteModal(templateId);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteModal) return;

    try {
      await deleteTemplate(showDeleteModal);
      setShowDeleteModal(null);
      toast.success('Template deleted successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete template');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quote Templates</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/templates/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <img
              src={template.preview_image}
              alt={template.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  {template.is_default && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                      Default Template
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/templates/${template.id}`)}
                      className="p-2 text-blue-600 hover:text-blue-900 rounded-lg"
                      title="Edit Template"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-600 hover:text-red-900 rounded-lg"
                      title="Delete Template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {template.sections.length} sections
              </p>
            </div>
          </div>
        ))}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Delete Template</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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

export default Templates;