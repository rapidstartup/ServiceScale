import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuoteStore } from '../store/quoteStore';
import { useTemplateStore } from '../store/templateStore';
import { ChevronDown, ChevronRight } from 'lucide-react';
import RichTextEditor from './editor/RichTextEditor';

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quotes, fetchQuotes, updateQuote } = useQuoteStore();
  const { templates } = useTemplateStore();
  const [quote, setQuote] = useState(quotes.find(q => q.id === id));
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(quote?.template_id);
  const [editedContent, setEditedContent] = useState(quote?.content || '');

  useEffect(() => {
    if (!quote) {
      fetchQuotes().then(() => {
        const foundQuote = quotes.find(q => q.id === id);
        setQuote(foundQuote);
        setSelectedTemplateId(foundQuote?.template_id);
        setEditedContent(foundQuote?.content || '');
      });
    }
  }, [id, quotes, fetchQuotes]);

  const handleTemplateChange = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template || !quote) return;

    setSelectedTemplateId(templateId);
    setEditedContent(template.content);

    await updateQuote(quote.id, {
      template_id: templateId,
      content: template.content
    });
  };

  const handleSaveContent = async () => {
    if (!quote) return;

    await updateQuote(quote.id, {
      content: editedContent
    });
    setIsEditing(false);
  };

  if (!quote) {
    return <div className="p-6">Loading...</div>;
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/quotes" className="hover:text-blue-600">
          Quotes
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">Quote #{quote?.id.slice(0, 7)}</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quote #{quote?.id.slice(0, 7)}</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Content
            </button>
          ) : (
            <button
              onClick={handleSaveContent}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {isEditing ? (
          <div className="p-6">
            <RichTextEditor
              initialValue={editedContent}
              onSave={(content) => setEditedContent(content)}
            />
          </div>
        ) : (
          <div className="p-6">
            {selectedTemplate && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: editedContent || selectedTemplate.content }}
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Service Details</h2>
          <p><span className="font-medium">Service:</span> {quote.service}</p>
          <p><span className="font-medium">Total:</span> ${quote.total}</p>
          <p><span className="font-medium">Status:</span> {quote.status}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Property Details</h2>
          <p><span className="font-medium">Address:</span> {quote.property_details.address.streetAddress}</p>
          <p><span className="font-medium">City:</span> {quote.property_details.address.city}</p>
          <p><span className="font-medium">State:</span> {quote.property_details.address.state}</p>
          <p><span className="font-medium">Type:</span> {quote.property_details.type}</p>
          <p><span className="font-medium">Size:</span> {quote.property_details.size}</p>
          <p><span className="font-medium">Year Built:</span> {quote.property_details.yearBuilt}</p>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail; 