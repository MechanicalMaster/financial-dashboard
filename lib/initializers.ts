import { appDB, Master } from './db';

export async function refreshMastersData() {
  try {
    console.log("[Initializers] Starting hard refresh of masters data");
    
    try {
      // First completely clear the masters table
      await appDB.masters.clear();
      console.log("[Initializers] Cleared masters table before refresh");
    } catch (clearError) {
      console.error("[Initializers] Error clearing masters table:", clearError);
    }
    
    // First clean up any potential duplicates
    await cleanupDuplicateMasters();
    
    // Then perform the hard refresh with clean data
    await appDB.hardRefreshMasters();
    
    console.log("[Initializers] Masters data has been refreshed successfully");
    return true;
  } catch (error) {
    console.error("[Initializers] Error refreshing masters data:", error);
    return false;
  }
}

// Function to clean up duplicate master entries
export async function cleanupDuplicateMasters() {
  try {
    console.log("[Initializers] Starting cleanup of duplicate masters");
    
    // Get all masters from the database
    const allMasters = await appDB.masters.toArray();
    
    // Group masters by type
    const mastersByType = new Map<string, Master[]>();
    
    // First group all masters by their type
    allMasters.forEach(master => {
      if (!mastersByType.has(master.type)) {
        mastersByType.set(master.type, []);
      }
      mastersByType.get(master.type)!.push(master);
    });
    
    const duplicateIds: string[] = [];
    
    // For each type, find and mark duplicates
    mastersByType.forEach((masters, type) => {
      // Sort masters by displayOrder to keep the first ones
      masters.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      // Keep track of values we've seen (case insensitive)
      const seenValues = new Set<string>();
      
      // For each master, check if we've seen its value before
      masters.forEach(master => {
        const valueKey = master.value.toLowerCase();
        
        if (seenValues.has(valueKey)) {
          // This is a duplicate, mark for deletion
          if (master.id) {
            duplicateIds.push(master.id);
          }
        } else {
          // New value, add to seen values
          seenValues.add(valueKey);
        }
      });
    });
    
    // Delete duplicates
    if (duplicateIds.length > 0) {
      await appDB.masters.bulkDelete(duplicateIds);
      console.log(`[Initializers] Removed ${duplicateIds.length} duplicate masters`);
    } else {
      console.log("[Initializers] No duplicate masters found");
    }
    
    return true;
  } catch (error) {
    console.error("[Initializers] Error cleaning up duplicate masters:", error);
    return false;
  }
} 