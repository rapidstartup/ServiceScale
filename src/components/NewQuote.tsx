import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuoteStore } from '../store/quoteStore';
import { useTemplateStore } from '../store/templateStore';
import { toast } from 'react-hot-toast';

const NewQuote: React.FC = () => {
  const navigate = useNavigate();
  const { templates } = useTemplateStore();
  const { addQuote } = useQuoteStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates.find(t => t.is_default)?.id || templates[0]?.id
  );
  const [formData, setFormData] = useState({
    customerName: '',
    service: '',
    total: 0,
    propertyDetails: {
      address: {
        streetAddress: '',
        city: '',
        state: ''
      },
      type: '',
      size: '',
      yearBuilt: '',
      bedrooms: '',
      bathrooms: ''
    }
  });

  const selectedTemplateData = templates.find(t => t.id === selectedTemplateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplateData) {
      toast.error('Please select a template');
      return;
    }

    const newQuote = {
      status: 'active' as const,
      customer_id: '',
      service: formData.service,
      total: formData.total,
      template_id: selectedTemplateId,
      content: selectedTemplateData.content,
      property_details: formData.propertyDetails,
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString()
    };

    const quote = await addQuote(newQuote);
    toast.success('Quote created successfully');
    navigate(`/quote/${quote.id}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className={`transition-all duration-300 ${isPreviewOpen ? 'mr-[50%]' : ''}`}>
        {/* Form Section */}
        <div className="max-w-4xl space-y-6 p-6">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">New Quote</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select Template</h2>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  {isPreviewOpen ? (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      <span>Hide Preview</span>
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <span>Show Preview</span>
                    </>
                  )}
                </button>
              </div>
              
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quote Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Quote Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service</label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total</label>
                  <input
                    type="number"
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    value={formData.propertyDetails.address.streetAddress}
                    onChange={(e) => setFormData({
                      ...formData,
                      propertyDetails: {
                        ...formData.propertyDetails,
                        address: {
                          ...formData.propertyDetails.address,
                          streetAddress: e.target.value
                        }
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        propertyDetails: {
                          ...formData.propertyDetails,
                          address: {
                            ...formData.propertyDetails.address,
                            city: e.target.value
                          }
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        propertyDetails: {
                          ...formData.propertyDetails,
                          address: {
                            ...formData.propertyDetails.address,
                            state: e.target.value
                          }
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/quotes')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Quote
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Template Preview Drawer */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-1/2 bg-white shadow-lg transform transition-transform duration-300 overflow-y-auto
          ${isPreviewOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedTemplateData && (
          <div className="relative">
            <div className="sticky top-0 bg-white z-10 p-6 border-b">
              <h2 className="text-2xl font-bold">Template Preview</h2>
              <p className="text-gray-600">{selectedTemplateData.name}</p>
            </div>

            <div className="p-6">
              {/* Template Sections Preview */}
              {selectedTemplateData.sections.map((section) => (
                <div
                  key={section.id}
                  style={{
                    backgroundColor: section.settings.backgroundColor,
                    color: section.settings.textColor
                  }}
                  className="rounded-xl overflow-hidden mb-6 p-6"
                >
                  <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                  {section.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.images.map((image) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt={image.alt}
                          className="rounded-lg shadow-md"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewQuote;