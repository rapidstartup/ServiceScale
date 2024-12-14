import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Plus, Star, Pencil, Trash2, Copy } from 'lucide-react';
import { useTemplateStore, Template } from '../store/templateStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Templates: React.FC = () => {
  const { templates, setDefaultTemplate, deleteTemplate } = useTemplateStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  const handleSetDefault = (id: string) => {
    setDefaultTemplate(id);
    toast.success('Default template updated');
  };

  const handleDelete = (id: string) => {
    if (templates.length === 1) {
      toast.error('Cannot delete the last template');
      return;
    }
    if (templates.find(t => t.id === id)?.is_default) {
      toast.error('Cannot delete the default template');
      return;
    }
    deleteTemplate(id);
    toast.success('Template deleted');
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preview_image: template.preview_image
    };
    useTemplateStore.getState().addTemplate(newTemplate);
    toast.success('Template duplicated');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Layout className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quote Templates</h1>
        </div>
        {isAdmin && (
          <Link
            to="/templates/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden transition-all"
          >
            <div className="relative">
              <img
                src={template.preview_image}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              {template.is_default && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-sm font-medium flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Default</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Updated {template.updated_at ? new Date(template.updated_at).toLocaleDateString() : 'Never'}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {isAdmin ? (
                    <>
                      <Link
                        to={`/templates/${template.id}`}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {!template.is_default && (
                        <>
                          <button
                            onClick={() => handleSetDefault(template.id)}
                            className="p-1 text-gray-500 hover:text-yellow-500"
                            title="Set as Default"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="p-1 text-gray-500 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <Link
                      to={`/templates/${template.id}`}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="View"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;