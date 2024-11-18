import { useSettingsStore } from '../store/settingsStore';

interface Property {
  grossSquareFootage: number;
  basementSquareFootage: number;
  livingSquareFootage: number;
  hasBasement: 'Y' | 'N';
  fullBaths: number;
  halfBaths: number;
}

export function calculateHVACZones(property: Property): number {
  const { hvacZoneRules } = useSettingsStore.getState();
  let zones = hvacZoneRules.baseZones;
  
  // Calculate total square footage
  const totalSqFt = property.grossSquareFootage + 
    (property.hasBasement === 'Y' ? property.basementSquareFootage : 0);
  
  // Size-based rules
  if (totalSqFt > hvacZoneRules.sizeThresholds.medium) {
    zones += 1;
  }
  if (totalSqFt > hvacZoneRules.sizeThresholds.large) {
    zones += 1;
  }

  // Multi-floor rules
  const hasMultipleFloors = (property.hasBasement === 'Y' || 
    property.grossSquareFootage > property.livingSquareFootage);
  
  if (hasMultipleFloors) {
    zones += 1;
  }

  // Layout complexity
  const totalBathrooms = property.fullBaths + (property.halfBaths * 0.5);
  if (totalBathrooms > hvacZoneRules.bathroomThreshold) {
    zones += 1;
  }

  // Cap maximum zones
  return Math.min(zones, hvacZoneRules.maxZones);
}