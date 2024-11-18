export async function getPropertyData(address: string, city: string, state: string) {
  if (!address || !city || !state) {
    throw new Error('Missing required address information');
  }

  // Ensure the environment variables are available
  const attomApiBase = import.meta.env.VITE_ATTOM_API_BASE;
  const attomApiKey = import.meta.env.VITE_ATTOM_API_KEY;
  
  if (!attomApiBase || !attomApiKey) {
    throw new Error('Missing ATTOM API configuration in environment variables');
  }

  try {
    const address1 = encodeURIComponent(address.trim());
    const address2 = encodeURIComponent(`${city.trim()}, ${state.trim()}`);

    const response = await fetch(
      `${attomApiBase}/propertyapi/v1.0.0/property/buildingpermits?address1=${address1}&address2=${address2}`,
      {
        headers: {
          'Accept': 'application/json',
          'apikey': attomApiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ATTOM API error: ${response.status}`);
    }

    const data: AttomResponse = await response.json();

    if (data.status.code !== 0 || !data.property?.[0]) {
      throw new Error('Property not found');
    }

    const property = data.property[0];

    return {
      propertyType: property.summary?.propClass || 'Unknown',
      propertySize: property.building?.size?.universalSize
        ? `${property.building.size.universalSize.toLocaleString()} sqft`
        : 'Not available',
      lotSize: property.lot?.lotSize1
        ? `${Math.round(property.lot.lotSize1 * 43560).toLocaleString()} sqft`
        : 'Not available',
      yearBuilt: property.summary?.yearBuilt?.toString() || 'Unknown',
      bedrooms: property.building?.rooms?.beds?.toString() || '0',
      bathrooms: property.building?.rooms?.bathsTotal?.toString() || '0',
      recentPermits: (property.buildingPermits || [])
        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
        .slice(0, 3)
        .map((permit) => ({
          date: new Date(permit.effectiveDate).toLocaleDateString(),
          type: permit.type,
          description: permit.description || permit.type,
          value: permit.jobValue || 0,
        })),
    };
  } catch (error) {
    console.error('ATTOM API Error:', error);
    throw error;
  }
}
