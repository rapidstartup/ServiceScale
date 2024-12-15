import React, { useState } from 'react';
import { FileText, Check, Upload } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { useSettingsStore } from '../store/settingsStore';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const Templates: React.FC = () => {
  const { templates, updateTemplate } = useTemplateStore();
  const { settings, updateSettings } = useSettingsStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSetDefault = async (templateId: string) => {
    try {
      // Update all templates to not be default
      for (const template of templates) {
        await updateTemplate(template.id, { is_default: false });
      }
      // Set the selected template as default
      await updateTemplate(templateId, { is_default: true });
      toast.success('Default template updated');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update default template';
      toast.error(errorMessage);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      await updateSettings({ ...settings, logoUrl: publicUrl });
      toast.success('Logo updated successfully');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleColorChange = async (color: string) => {
    try {
      await updateSettings({ ...settings, primaryColor: color });
      toast.success('Brand color updated');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update brand color';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quote Templates</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
            <input
              type="color"
              value={settings.primaryColor || '#3B82F6'}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 w-20 rounded border cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
            <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="h-4 w-4 mr-2" />
              <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all
              ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}
              ${template.is_default ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{template.name}</h2>
                {template.is_default ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Check className="h-4 w-4 mr-1" />
                    Default
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(template.id);
                    }}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <div 
                className="prose max-w-none"
                style={{
                  '--tw-prose-headings': settings.primaryColor,
                  '--tw-prose-links': settings.primaryColor,
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ 
                  __html: template.content.replace(
                    '{logo}', 
                    settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Company Logo" class="h-12" />` : ''
                  )
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;