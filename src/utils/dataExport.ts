
// Basic data export/import utility for 2getherLoop app

/**
 * Exports the current app data as a JSON file download
 */
export const exportAppData = () => {
  try {
    // Get all relevant data from localStorage
    const dataToExport = {
      users: localStorage.getItem("2getherLoop_users"),
      pacts: localStorage.getItem("2getherLoop_pacts"),
      completions: localStorage.getItem("2getherLoop_completions"),
      notes: localStorage.getItem("2getherLoop_notes"),
      settings: localStorage.getItem("2getherLoop_settings"),
      version: "1.0",
      exportDate: new Date().toISOString(),
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(dataToExport, null, 2);
    
    // Create downloadable blob
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().replace(/:/g, "-").substring(0, 19);
    link.download = `2getherLoop-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Failed to export data:", error);
    return false;
  }
};

/**
 * Imports app data from a JSON file
 * @param file The JSON file to import
 * @returns Promise that resolves to a success message or rejects with an error
 */
export const importAppData = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file");
        }
        
        const data = JSON.parse(event.target.result as string);
        
        // Validate the data format
        if (!data.version || !data.exportDate) {
          throw new Error("Invalid backup file format");
        }
        
        // Import each data type if it exists
        if (data.users) localStorage.setItem("2getherLoop_users", data.users);
        if (data.pacts) localStorage.setItem("2getherLoop_pacts", data.pacts);
        if (data.completions) localStorage.setItem("2getherLoop_completions", data.completions);
        if (data.notes) localStorage.setItem("2getherLoop_notes", data.notes);
        if (data.settings) localStorage.setItem("2getherLoop_settings", data.settings);
        
        resolve("Data imported successfully! Refresh the page to see changes.");
      } catch (error) {
        reject(error instanceof Error ? error.message : "Failed to import data");
      }
    };
    
    reader.onerror = () => {
      reject("Error reading the file");
    };
    
    reader.readAsText(file);
  });
};
