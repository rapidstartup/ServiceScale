import { AttomResponse, PropertyData } from '../types/attom';

export async function getPropertyData(address: string, city: string, state: string): Promise<PropertyData> {
  console.log('Starting ATTOM API call with:', { address, city, state });
  
  if (!address || !city || !state) {
    throw new Error('Missing required address information');
  }

  const attomApiBase = 'https://api.gateway.attomdata.com';
  const attomApiKey = import.meta.env.VITE_ATTOM_API_KEY;

  if (!attomApiKey) {
    throw new Error('Missing ATTOM API configuration');
  }

  try {
    // Extract street address only by removing extra parts like city, state, and zip
    const cleanAddress = address.split(',')[0].trim(); // Removes everything after the first comma
    const address1 = encodeURIComponent(cleanAddress); // Street address only
    const address2 = encodeURIComponent(`${city.trim()}, ${state.trim()}`); // City and state only

    const url = `${attomApiBase}/propertyapi/v1.0.0/property/basicprofile?address1=${address1}&address2=${address2}`;
    console.log('ATTOM API URL:', url);
    console.log('ATTOM API Key present:', !!attomApiKey);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'apikey': attomApiKey,
      },
    });

    console.log('ATTOM API Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ATTOM API error response:', errorText);
      throw new Error(`ATTOM API error: ${response.status} ${response.statusText}`);
    }

    const data: AttomResponse = await response.json();
    console.log('ATTOM API Response data:', data);

    if (data.status.code !== 0 || !data.property?.[0]) {
      throw new Error('Property not found');
    }

    const property = data.property[0];
    const building = property.building;
    const summary = property.summary;

    const result = {
      propertyType: summary?.propClass || 'Unknown',
      propertySize: building?.size?.universalSize 
        ? `${building.size.universalSize.toLocaleString()} sqft`
        : 'Not available',
      lotSize: property.lot?.lotSize1
        ? `${Math.round(property.lot.lotSize1 * 43560).toLocaleString()} sqft` // Convert acres to sqft
        : 'Not available',
      yearBuilt: summary?.yearBuilt?.toString() || 'Unknown',
      bedrooms: building?.rooms?.beds?.toString() || '0',
      bathrooms: building?.rooms?.bathsTotal?.toString() || '0',
      recentPermits: [] // Since basicprofile endpoint doesn't include permit data
    };

    console.log('ATTOM API Processed result:', result);
    return result;
  } catch (error) {
    console.error('ATTOM API Error:', error);
    throw error;
  }
}
