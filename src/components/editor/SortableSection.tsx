import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { TemplateSection } from '../../types';
import RichTextEditor from './RichTextEditor';

interface SortableSectionProps {
  section: TemplateSection;
  onUpdate: (id: string, updates: Partial<TemplateSection>) => void;
  onDelete: (id: string) => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({ section, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start space-x-4 p-4 bg-gray-50 rounded-lg ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move"
      >
        <GripVertical className="h-6 w-6 text-gray-400" />
      </div>
      
      <div className="flex-grow space-y-4">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate(section.id, { title: e.target.value })}
          className="text-lg font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full"
        />
        
        <div className="grid grid-cols-3 gap-4">
          <select
            value={section.settings.layout}
            onChange={(e) => onUpdate(section.id, {
              settings: { ...section.settings, layout: e.target.value as any }
            })}
            className="px-3 py-1 border rounded-md"
          >
            <option value="left">Left Layout</option>
            <option value="right">Right Layout</option>
            <option value="center">Center Layout</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Background:</span>
            <input
              type="color"
              value={section.settings.backgroundColor}
              onChange={(e) => onUpdate(section.id, {
                settings: { ...section.settings, backgroundColor: e.target.value }
              })}
              className="px-1 py-0.5 border rounded"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Text:</span>
            <input
              type="color"
              value={section.settings.textColor}
              onChange={(e) => onUpdate(section.id, {
                settings: { ...section.settings, textColor: e.target.value }
              })}
              className="px-1 py-0.5 border rounded"
            />
          </div>
        </div>

        <RichTextEditor
          content={section.content}
          onChange={(content) => onUpdate(section.id, { content })}
        />
      </div>

      <button
        onClick={() => onDelete(section.id)}
        className="p-2 text-gray-400 hover:text-red-500"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SortableSection;