import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuoteStore } from '../store/quoteStore';

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quotes, fetchQuotes } = useQuoteStore();
  const [quote, setQuote] = useState(quotes.find(q => q.id === id));

  useEffect(() => {
    if (!quote) {
      fetchQuotes().then(() => {
        setQuote(quotes.find(q => q.id === id));
      });
    }
  }, [id, quotes, fetchQuotes]);

  if (!quote) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Quote #{quote.id.slice(0, 7)}</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Service Details</h2>
          <p><span className="font-medium">Service:</span> {quote.service}</p>
          <p><span className="font-medium">Total:</span> ${quote.total}</p>
          <p><span className="font-medium">Status:</span> {quote.status}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Property Details</h2>
          <p><span className="font-medium">Address:</span> {quote.property_details.address.streetAddress}</p>
          <p><span className="font-medium">City:</span> {quote.property_details.address.city}</p>
          <p><span className="font-medium">State:</span> {quote.property_details.address.state}</p>
          <p><span className="font-medium">Type:</span> {quote.property_details.type}</p>
          <p><span className="font-medium">Size:</span> {quote.property_details.size}</p>
          <p><span className="font-medium">Year Built:</span> {quote.property_details.yearBuilt}</p>
        </div>

        {quote.content && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Quote Content</h2>
            <div dangerouslySetInnerHTML={{ __html: quote.content }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteDetail; 