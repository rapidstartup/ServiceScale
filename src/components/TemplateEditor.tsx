import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useTemplateStore, Template, TemplateSection } from '../store/templateStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const DEFAULT_NEW_TEMPLATE: Template = {
  id: '',
  user_id: '',
  name: 'New Template',
  description: 'A new quote template',
  is_default: false,
  preview_image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop',
  sections: [],
  created_at: '',
  updated_at: ''
};

const DEFAULT_SECTION: Omit<TemplateSection, 'id'> = {
  title: 'New Section',
  content: '<p>Add your content here...</p>',
  type: 'header',
  images: [],
  order: 0,
  settings: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    layout: 'left'
  }
};

const TemplateEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { templates, addTemplate, updateTemplate } = useTemplateStore();
  const [template, setTemplate] = useState<Template | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/templates');
      return;
    }

    if (id === 'new') {
      setTemplate({
        ...DEFAULT_NEW_TEMPLATE,
        id: `template-${Date.now()}`,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } else {
      const existingTemplate = templates.find(t => t.id === id);
      if (existingTemplate) {
        setTemplate(existingTemplate);
      }
    }
  }, [id, templates, isAdmin, navigate]);

  const handleSave = async () => {
    if (!template) return;

    try {
      if (id === 'new') {
        await addTemplate({
          ...template,
          sections: template.sections || [],
          preview_image: template.preview_image || DEFAULT_NEW_TEMPLATE.preview_image
        });
        toast.success('Template created successfully');
      } else {
        await updateTemplate(template.id, {
          ...template,
          sections: template.sections || []
        });
        toast.success('Template updated successfully');
      }
      navigate('/templates');
    } catch (error) {
      console.error('Template save error:', error);
      toast.error('Failed to save template');
    }
  };

  const addSection = () => {
    if (!template) return;

    const newSection: TemplateSection = {
      ...DEFAULT_SECTION,
      id: `section-${Date.now()}`,
      order: template.sections.length
    };

    setTemplate({
      ...template,
      sections: [...template.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    if (!template) return;

    setTemplate({
      ...template,
      sections: template.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    });
  };

  const deleteSection = (sectionId: string) => {
    if (!template) return;

    setTemplate({
      ...template,
      sections: template.sections.filter(section => section.id !== sectionId)
    });
  };

  if (!template || !isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Template not found or access denied</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/templates')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <Layout className="h-8 w-8 text-blue-600" />
          <div>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="text-3xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
              placeholder="Template Name"
            />
            <input
              type="text"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              className="block mt-1 text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
              placeholder="Template Description"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
          <span>Save Template</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Template Sections</h2>
          <button
            onClick={addSection}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Section</span>
          </button>
        </div>

        <div className="space-y-4">
          {template.sections.map((section) => (
            <div
              key={section.id}
              className="border rounded-lg p-4"
              style={{
                backgroundColor: section.settings.backgroundColor,
                color: section.settings.textColor
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Section Title"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-1 text-gray-500 hover:text-red-500"
                    title="Delete Section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                className="w-full min-h-[100px] bg-transparent border rounded-lg p-2 focus:outline-none focus:border-blue-500"
                placeholder="Section Content (HTML supported)"
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Background Color</label>
                  <input
                    type="color"
                    value={section.settings.backgroundColor}
                    onChange={(e) => updateSection(section.id, {
                      settings: { ...section.settings, backgroundColor: e.target.value }
                    })}
                    className="w-full h-8 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Text Color</label>
                  <input
                    type="color"
                    value={section.settings.textColor}
                    onChange={(e) => updateSection(section.id, {
                      settings: { ...section.settings, textColor: e.target.value }
                    })}
                    className="w-full h-8 rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;