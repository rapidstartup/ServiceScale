import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Save, ArrowLeft, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTemplateStore } from '../store/templateStore';
import { QuoteTemplate, TemplateSection } from '../types';
import toast from 'react-hot-toast';
import SortableSection from './editor/SortableSection';

const DEFAULT_NEW_TEMPLATE: QuoteTemplate = {
  id: '',
  name: 'New Template',
  description: 'A new quote template',
  isDefault: false,
  createdAt: '',
  updatedAt: '',
  previewImage: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop',
  sections: []
};

const getDefaultContent = (type: TemplateSection['type']): string => {
  switch (type) {
    case 'header':
      return '<h1>Welcome to Our Professional Service</h1><p>We are committed to providing top-quality solutions for your needs.</p>';
    case 'team':
      return '<h2>Meet Our Expert Team</h2><p>Our experienced professionals are here to serve you.</p>';
    case 'services':
      return '<h2>Our Services</h2><ul><li>Professional Installation</li><li>Maintenance</li><li>Repairs</li></ul>';
    case 'certifications':
      return '<h2>Our Certifications</h2><p>We maintain the highest industry standards with our certifications.</p>';
    case 'insurance':
      return '<h2>Insurance Coverage</h2><p>We are fully insured for your peace of mind.</p>';
    case 'warranty':
      return '<h2>Our Warranty</h2><p>We stand behind our work with comprehensive warranty coverage.</p>';
    case 'reviews':
      return '<h2>Customer Reviews</h2><p>See what our satisfied customers have to say about our work.</p>';
    case 'financing':
      return '<h2>Financing Options</h2><p>Flexible financing solutions to fit your budget.</p>';
    default:
      return '<p>Add your content here...</p>';
  }
};

const TemplateEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, addTemplate, updateTemplate } = useTemplateStore();
  const [template, setTemplate] = useState<QuoteTemplate | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id === 'new') {
      setTemplate({
        ...DEFAULT_NEW_TEMPLATE,
        id: `template-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      const existingTemplate = templates.find(t => t.id === id);
      if (existingTemplate) {
        setTemplate(existingTemplate);
      }
    }
  }, [id, templates]);

  const handleSave = () => {
    if (!template) return;

    if (id === 'new') {
      addTemplate(template);
      toast.success('Template created successfully');
    } else {
      updateTemplate(template.id, template);
      toast.success('Template updated successfully');
    }
    navigate('/templates');
  };

  const addSection = (type: TemplateSection['type']) => {
    if (!template) return;

    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: getDefaultContent(type),
      images: [],
      order: template.sections.length + 1,
      settings: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        layout: 'left'
      }
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTemplate((template) => {
        if (!template) return null;

        const oldIndex = template.sections.findIndex((section) => section.id === active.id);
        const newIndex = template.sections.findIndex((section) => section.id === over.id);

        return {
          ...template,
          sections: arrayMove(template.sections, oldIndex, newIndex),
        };
      });
    }
  };

  if (!template) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Template not found</h2>
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
            />
            <input
              type="text"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              className="block mt-1 text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
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
          <div className="flex space-x-2">
            {['header', 'team', 'services', 'certifications', 'insurance', 'warranty', 'reviews', 'financing'].map((type) => (
              <button
                key={type}
                onClick={() => addSection(type as TemplateSection['type'])}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md capitalize"
              >
                <Plus className="h-4 w-4 inline-block mr-1" />
                {type}
              </button>
            ))}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={template.sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {template.sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onUpdate={updateSection}
                  onDelete={deleteSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default TemplateEditor;