import { AttomResponse, PropertyData } from '../types/attom';

export async function getPropertyData(address: string, city: string, state: string): Promise<PropertyData> {
  if (!address || !city || !state) {
    throw new Error('Missing required address information');
  }

  // Ensure the environment variables are available
  const attomApiBase = import.meta.env.VITE_ATTOM_API_BASE;
  const attomApiKey = import.meta.env.VITE_ATTOM_API_KEY;

  if (!attomApiBase || !attomApiKey) {
    throw new Error('Missing ATTOM API configuration');
  }

  try {
    // Extract street address only by removing extra parts like city, state, and zip
    const cleanAddress = address.split(',')[0].trim(); // Removes everything after the first comma
    const address1 = encodeURIComponent(cleanAddress); // Street address only
    const address2 = encodeURIComponent(`${city.trim()}, ${state.trim()}`); // City and state only

    const response = await fetch(
      `${attomApiBase}/propertyapi/v1.0.0/property/basicprofile?address1=${address1}&address2=${address2}`,
      {
        headers: {
          'Accept': 'application/json',
          'apikey': attomApiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ATTOM API error: ${response.status} ${response.statusText}`);
    }

    const data: AttomResponse = await response.json();

    if (data.status.code !== 0 || !data.property?.[0]) {
      throw new Error('Property not found');
    }

    const property = data.property[0];
    const building = property.building;
    const summary = property.summary;

    return {
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
  } catch (error) {
    console.error('ATTOM API Error:', error);
    throw error;
  }
}
