import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Calendar, Edit3, Save, Share2, Home, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuoteStore } from '../store/quoteStore';
import { useTemplateStore } from '../store/templateStore';

const QuoteTemplate: React.FC = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplateSelect, setShowTemplateSelect] = useState(false);
  const { companyInfo, updateCompanyInfo, quotes, trackQuoteView, updateQuote } = useQuoteStore();
  const { templates } = useTemplateStore();
  
  React.useEffect(() => {
    if (id) {
      trackQuoteView(id);
    }
  }, [id, trackQuoteView]);

  const quote = quotes.find(q => q.id === id);
  const template = quote?.templateId ? templates.find(t => t.id === quote.templateId) : templates.find(t => t.isDefault);

  const handleSave = () => {
    setIsEditing(false);
    updateCompanyInfo(companyInfo);
    toast.success('Company information updated successfully');
  };

  const handleShare = () => {
    const shareLink = `${window.location.origin}/quote/${id}`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard!');
  };

  const handleTemplateChange = (templateId: string) => {
    if (quote) {
      updateQuote(quote.id, { ...quote, templateId });
      toast.success('Template updated successfully');
    }
    setShowTemplateSelect(false);
  };

  if (!quote) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Quote not found</h2>
        <Link to="/quotes" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="p-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="w-16 h-16 rounded-full border-2 border-white"
                />
                {isEditing ? (
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => updateCompanyInfo({ name: e.target.value })}
                    className="text-2xl font-bold bg-transparent border-b border-white"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                {isEditing ? (
                  <input
                    type="text"
                    value={companyInfo.phone}
                    onChange={(e) => updateCompanyInfo({ phone: e.target.value })}
                    className="bg-transparent border-b border-white"
                  />
                ) : (
                  <span>{companyInfo.phone}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                {isEditing ? (
                  <input
                    type="text"
                    value={companyInfo.email}
                    onChange={(e) => updateCompanyInfo({ email: e.target.value })}
                    className="bg-transparent border-b border-white"
                  />
                ) : (
                  <span>{companyInfo.email}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                {isEditing ? (
                  <input
                    type="text"
                    value={companyInfo.address}
                    onChange={(e) => updateCompanyInfo({ address: e.target.value })}
                    className="bg-transparent border-b border-white"
                  />
                ) : (
                  <span>{companyInfo.address}</span>
                )}
              </div>
            </div>
          </div>

          {/* Template Selection - Only visible in edit mode */}
          {isEditing && (
            <div className="border-t border-white/10 p-4">
              <div className="relative">
                <button
                  onClick={() => setShowTemplateSelect(!showTemplateSelect)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  <span>Template: {template?.name || 'Select Template'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showTemplateSelect && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleTemplateChange(t.id)}
                        className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 flex items-center justify-between"
                      >
                        <span>{t.name}</span>
                        {t.id === template?.id && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Details */}
      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Quote Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Quote Number:</span>
                <span className="font-medium">#{quote.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{quote.service}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium text-lg">${quote.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{new Date(quote.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            {quote.propertyDetails && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">
                    {quote.propertyDetails.address.streetAddress}, {quote.propertyDetails.address.city}, {quote.propertyDetails.address.state}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Property Type:</span>
                    <p className="font-medium">{quote.propertyDetails.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <p className="font-medium">{quote.propertyDetails.size}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Year Built:</span>
                    <p className="font-medium">{quote.propertyDetails.yearBuilt}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Bedrooms/Bathrooms:</span>
                    <p className="font-medium">{quote.propertyDetails.bedrooms}/{quote.propertyDetails.bathrooms}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Content */}
      {template && (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {template.sections.map((section) => (
            <div
              key={section.id}
              style={{
                backgroundColor: section.settings.backgroundColor,
                color: section.settings.textColor
              }}
              className="p-8"
            >
              <div
                className={`max-w-4xl mx-auto ${
                  section.settings.layout === 'center'
                    ? 'text-center'
                    : section.settings.layout === 'right'
                    ? 'ml-auto'
                    : ''
                }`}
              >
                <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteTemplate;