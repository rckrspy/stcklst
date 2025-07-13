/**
 * Get database IDs from script properties with fallbacks
 * @return {object} Database configuration object
 */
function getDatabaseConfig() {
  try {
    const properties = PropertiesService.getScriptProperties().getProperties();
    
    // Try to get from script properties first
    const config = {
      ingredients: properties.ingredients || properties.systemDbId || "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c",
      recipes: properties.recipes || properties.beveragesDbId || "1x1ZWaDh90mNV6uey5idKPHeltvA5Xy7tvYgyzWJxKb4",
      system: properties.system || properties.systemDbId || properties.ingredients || "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c"
    };
    
    Logger.log('Database config resolved:', JSON.stringify(config));
    return config;
    
  } catch (error) {
    Logger.log('Error getting database config, using fallbacks: ' + error.toString());
    
    // Fallback to hardcoded values if properties service fails
    return {
      ingredients: "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c",
      recipes: "1x1ZWaDh90mNV6uey5idKPHeltvA5Xy7tvYgyzWJxKb4",
      system: "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c"
    };
  }
}

/**
 * Serves the HTML for the Beverage Data Entry form.
 * Fetches ingredient names and base spirits for dropdowns.
 */
function doGetBeverage(e) {
  try {
    const template = HtmlService.createTemplateFromFile('addBeverage/beverageForm');
    const formData = getDataForBeverageForm(); // Fetch both ingredient names and spirits
    
    // Add detailed debugging
    Logger.log(`Data fetched - Ingredients: ${JSON.stringify(formData.ingredientNames?.slice(0, 3))}... (${formData.ingredientNames?.length} total)`);
    Logger.log(`Data fetched - Base Spirits: ${JSON.stringify(formData.baseSpirits?.slice(0, 3))}... (${formData.baseSpirits?.length} total)`);
    
    template.ingredientNames = formData.ingredientNames;
    template.baseSpirits = formData.baseSpirits; // Pass spirits to template
    
    // Verify template variables are set
    Logger.log(`Template variables set - ingredientNames: ${Array.isArray(template.ingredientNames)}, length: ${template.ingredientNames?.length}`);
    Logger.log(`Template variables set - baseSpirits: ${Array.isArray(template.baseSpirits)}, length: ${template.baseSpirits?.length}`);
    
    Logger.log(`Passing ${formData.ingredientNames.length} ingredients and ${formData.baseSpirits.length} base spirits to template.`);
    return template.evaluate()
             .setTitle('Add Beverage')
             .addMetaTag('viewport', 'width=device-width, initial-scale=1')
             .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Allow iframe embedding if needed
  } catch (error) {
    Logger.log(`Error in doGet: ${error.message} \n Stack: ${error.stack}`);
    return HtmlService.createHtmlOutput(`Error loading page: ${error.message}`);
  }
}

/**
 * Fetches data needed for the beverage form dropdowns from the Ingredient sheet.
 * @returns {object} An object containing { ingredientNames: string[], baseSpirits: string[] }
 */
function getDataForBeverageForm() {
  const dbConfig = getDatabaseConfig();
  const ingredientSsId = dbConfig.ingredients;
  const ingredientSheetName = "database";
  let ingredientNames = [];
  let baseSpirits = [];

  try {
    const ss = SpreadsheetApp.openById(ingredientSsId);
    const sheet = ss.getSheetByName(ingredientSheetName);

    if (!sheet) {
      Logger.log(`Ingredient sheet "${ingredientSheetName}" not found.`);
      return { ingredientNames, baseSpirits }; // Return empty arrays
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log("No data rows in ingredient sheet.");
      return { ingredientNames, baseSpirits }; // No data
    }

    const dataRange = sheet.getRange(1, 1, lastRow, sheet.getLastColumn());
    const data = dataRange.getValues();
    const headers = data[0].map(h => h.toString().trim().toLowerCase()); // Normalize headers

    const nameColIdx = headers.indexOf("ingredientname");
    const categoryColIdx = headers.indexOf("category");

    if (nameColIdx === -1) {
      Logger.log("Header 'ingredientName' not found in ingredient sheet.");
      // Return empty but maybe log error more prominently
      return { ingredientNames, baseSpirits };
    }
     if (categoryColIdx === -1) {
      Logger.log("Header 'category' not found in ingredient sheet. Cannot filter for base spirits.");
      // Proceed without filtering spirits if category column is missing
    }

    // Start from row 1 to skip header
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = row[nameColIdx] ? row[nameColIdx].toString().trim() : null;
      if (name) { // Only add if name is not empty
         ingredientNames.push(name);
         // Check category if column exists
         if (categoryColIdx !== -1) {
             const category = row[categoryColIdx] ? row[categoryColIdx].toString().trim().toLowerCase() : '';
             if (category === 'spirit') {
                 baseSpirits.push(name);
             }
         }
      }
    }

    // Deduplicate and sort
    ingredientNames = [...new Set(ingredientNames)].sort();
    baseSpirits = [...new Set(baseSpirits)].sort();

    Logger.log(`Fetched ${ingredientNames.length} unique ingredient names.`);
    Logger.log(`Fetched ${baseSpirits.length} unique base spirits.`);

  } catch (error) {
    Logger.log(`Error fetching ingredient data: ${error.message} \n Stack: ${error.stack}`);
    // Return empty arrays on error to avoid breaking the form load
  }

  return { ingredientNames, baseSpirits };
}


// getIngredientNames function is now incorporated into getDataForBeverageForm,
// but keep it if other scripts rely on it separately.
function getIngredientNames() {
   // You could call the new function here for compatibility if needed:
   // return getDataForBeverageForm().ingredientNames;
   // Or keep the old implementation if preferred for separation:
  const dbConfig = getDatabaseConfig();
  const ingredientSs = SpreadsheetApp.openById(dbConfig.ingredients);
  const ingredientSheet = ingredientSs.getSheetByName("database");
  if (!ingredientSheet) { Logger.log("Ingredient sheet not found."); return []; }
  const ingredientData = ingredientSheet.getDataRange().getValues();
  if (ingredientData.length < 1) return [];
  const ingredientNameColumnIndex = ingredientData[0].findIndex(h => h.toString().toLowerCase() === 'ingredientname');
  if (ingredientNameColumnIndex === -1) { Logger.log("Header 'ingredientName' not found."); return []; }
  const lastRow = ingredientSheet.getLastRow();
  if (lastRow < 2) { Logger.log("No ingredient data rows."); return []; }
  const range = ingredientSheet.getRange(2, ingredientNameColumnIndex + 1, lastRow - 1);
  let ingredientNames = range.getValues().flat().map(n => n.toString().trim()).filter(n => n);
  return [...new Set(ingredientNames)].sort();
}


/**
 * Saves beverage data to the spreadsheet.
 * @param {object} formData The data submitted from the HTML form.
 * @param {string} [action='add'] Action to perform: 'add', 'replace', 'add_new'.
 * @param {number} [rowIndexToReplace=null] The row number to replace (if action is 'replace').
 * @return {string} A success message or a JSON string of existing data if duplicate found.
 */
function saveBeverageData(formData, action = 'add', rowIndexToReplace = null) {
  const dbConfig = getDatabaseConfig();
  const beverageSsId = dbConfig.recipes;
  const beverageSheetName = "database";

  try {
    const ss = SpreadsheetApp.openById(beverageSsId);
    const sheet = ss.getSheetByName(beverageSheetName);

    if (!sheet) {
      throw new Error(`Sheet "${beverageSheetName}" not found in spreadsheet ID "${beverageSsId}".`);
    }

    // *** UPDATE HEADERS ARRAY - ADD menuIngredientString ***
    // *** IMPORTANT: Ensure this order matches your spreadsheet columns EXACTLY ***
    const headers = [
        "timestamp", "userEmail", "beverageName",
        "beverageType",
        "buildMethod", "baseSpirit",
        "ingredients", // The JSON string of detailed ingredients
        "menuIngredientString", // <-- ADDED The comma-separated string for menu display
        "buildInstructions",
        "glasswareType", "iceType", "popularityRating", "costPerServing"
    ];

    // --- Server-Side Validation ---
    const beverageName = formData.beverageName ? formData.beverageName.trim() : '';
    if (!beverageName) throw new Error("Beverage Name is required.");
    if (!formData.beverageType) throw new Error("Beverage Type is required."); // Make beverageType required
    if (!formData.buildMethod) throw new Error("Build Method is required.");
    if (!formData.buildInstructions || formData.buildInstructions.trim() === '') throw new Error("Build Instructions are required.");
    if (!formData.glasswareType) throw new Error("Glassware Type is required.");
    if (!formData.iceType) throw new Error("Ice Type is required.");
    if (!formData.popularityRating) throw new Error("Popularity Rating is required.");
    // Basic check for the menu string - ensure it's a string, allow empty
    if (formData.menuIngredientString !== undefined && typeof formData.menuIngredientString !== 'string') {
        throw new Error("Invalid format for Menu Ingredient String.");
    }

    const costPerServing = formData.costPerServing ? String(formData.costPerServing).trim() : null;
    if (costPerServing && !/^\d*(\.\d{1,2})?$/.test(costPerServing)) {
         throw new Error("Invalid format for Cost per Serving. Use numbers and up to two decimal places (e.g., 3.50).");
    }
    // --- End Validation ---

    // Check if beverage already exists (only if action is 'add')
    let existingBeverageData = null;
    if (action === 'add') {
       existingBeverageData = checkBeverageExists(beverageName, sheet);
    }

    if (existingBeverageData && action === 'add') { // Duplicate found on initial 'add' attempt
      Logger.log(`Duplicate Beverage Found for "${beverageName}". Returning existingData object.`);
      // Ensure the existing data includes the menuIngredientString field if the column exists
      const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const menuStringIndex = actualHeaders.findIndex(h => h.toString().trim().toLowerCase() === 'menuingredientstring');
      if (menuStringIndex !== -1 && !existingBeverageData.hasOwnProperty('menuIngredientString')) {
          const rowValues = sheet.getRange(existingBeverageData.rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
          existingBeverageData.menuIngredientString = rowValues[menuStringIndex] || '';
      }
      return JSON.stringify(existingBeverageData);

    } else if (action === 'replace' && rowIndexToReplace !== null) { // Explicit 'replace' action
      Logger.log(`Replacing beverage "${beverageName}" at row index: ${rowIndexToReplace}`);

      if (rowIndexToReplace < 2 || rowIndexToReplace > sheet.getLastRow()) {
           throw new Error(`Invalid row index (${rowIndexToReplace}) provided for replacement.`);
      }

      const ingredientsJson = constructIngredientsString(formData);
      const menuString = formData.menuIngredientString || ''; // Get the menu string

      // Construct rowData array based on the UPDATED headers order
      const rowData = [
          new Date(),                             // timestamp
          Session.getActiveUser().getEmail(),     // userEmail
          beverageName,                           // beverageName
          formData.beverageType,                  // beverageType
          formData.buildMethod,                   // buildMethod
          formData.baseSpirit || null,            // baseSpirit
          ingredientsJson,                        // ingredients (JSON string)
          menuString,                             // menuIngredientString <-- ADDED
          formData.buildInstructions.trim(),      // buildInstructions
          formData.glasswareType,                 // glasswareType
          formData.iceType,                       // iceType
          formData.popularityRating,              // popularityRating
          costPerServing ? parseFloat(costPerServing) : null // costPerServing
        ];

       if (rowData.length !== headers.length) {
            Logger.log(`ERROR: Mismatch between rowData length (${rowData.length}) and expected headers length (${headers.length}) during replacement.`);
            Logger.log(`Headers: ${JSON.stringify(headers)}`);
            Logger.log(`RowData: ${JSON.stringify(rowData)}`);
            throw new Error("Internal Server Error: Data structure mismatch during replacement.");
       }

      sheet.getRange(rowIndexToReplace, 1, 1, rowData.length).setValues([rowData]);
      Logger.log(`Beverage at row ${rowIndexToReplace} replaced successfully!`);
      return `Beverage "${beverageName}" replaced successfully!`;

    } else { // Add new beverage (action is 'add' and no duplicate found, or action is 'add_new')
      let finalBeverageName = beverageName;
      if (action === 'add_new') {
        finalBeverageName = getNextVersionedBeverageName(beverageName, sheet);
        Logger.log(`Adding beverage "${beverageName}" as new version: "${finalBeverageName}"`);
      } else {
         Logger.log(`Adding new beverage: "${finalBeverageName}"`);
      }

      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        Logger.log("Headers added to empty beverage sheet.");
      } else {
          // Optional header verification
          const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          if (actualHeaders.length < headers.length || JSON.stringify(actualHeaders.slice(0, headers.length)) !== JSON.stringify(headers)) {
              Logger.log("WARNING: Beverage Spreadsheet headers may not exactly match expected order/content or length.");
              Logger.log(`Expected: ${JSON.stringify(headers)}`);
              Logger.log(`Actual (first ${headers.length}): ${JSON.stringify(actualHeaders.slice(0, headers.length))}`);
          }
      }

      const ingredientsJson = constructIngredientsString(formData);
      const menuString = formData.menuIngredientString || ''; // Get the menu string

      // Construct rowData array based on the UPDATED headers order
      const rowData = [
          new Date(),                             // timestamp
          Session.getActiveUser().getEmail(),     // userEmail
          finalBeverageName,                      // finalBeverageName
          formData.beverageType,                  // beverageType
          formData.buildMethod,                   // buildMethod
          formData.baseSpirit || null,            // baseSpirit
          ingredientsJson,                        // ingredients (JSON string)
          menuString,                             // menuIngredientString <-- ADDED
          formData.buildInstructions.trim(),      // buildInstructions
          formData.glasswareType,                 // glasswareType
          formData.iceType,                       // iceType
          formData.popularityRating,              // popularityRating
          costPerServing ? parseFloat(costPerServing) : null // costPerServing
        ];

      if (rowData.length !== headers.length) {
           Logger.log(`ERROR: Mismatch between rowData length (${rowData.length}) and expected headers length (${headers.length}) during append.`);
           Logger.log(`Headers: ${JSON.stringify(headers)}`);
           Logger.log(`RowData: ${JSON.stringify(rowData)}`);
           throw new Error("Internal Server Error: Data structure mismatch during append.");
      }

      sheet.appendRow(rowData);
      Logger.log(`Beverage "${finalBeverageName}" added successfully!`);
      const successMessage = action === 'add_new'
         ? `Beverage "${beverageName}" added successfully as version "${finalBeverageName}"!`
         : `Beverage "${finalBeverageName}" added successfully!`;
      return successMessage;
    }

  } catch (error) {
    Logger.log(`Error in saveBeverageData: ${error.message} \n Stack: ${error.stack}`);
    // Try to provide a more specific error message if possible
    if (error.message.includes("Data structure mismatch")) {
        throw new Error("Failed to save: Internal data structure error. Please check server logs.");
    } else if (error.message.includes("sheet")) {
         throw new Error("Failed to save: Could not access the spreadsheet or required sheet.");
    }
    throw new Error("Failed to save beverage data: " + error.message);
  }
}

/**
 * Constructs the JSON string for the ingredients based on form data.
 * @param {object} formData The form data containing ingredient fields.
 * @returns {string} A JSON string representing the array of ingredient objects.
 */
function constructIngredientsString(formData) {
  const ingredientsArray = [];
  let ingredientIndex = 1;
  // Loop through ingredients as long as an ingredient name exists for that index
  while (formData[`ingredient${ingredientIndex}Name`]) {
    const name = formData[`ingredient${ingredientIndex}Name`];
    const measurementSize = formData[`ingredient${ingredientIndex}MeasurementSize`];
    const measurementUnit = formData[`ingredient${ingredientIndex}MeasurementUnit`];
    // Only add if essential parts (name, size, unit) are present
    if (name && measurementSize && measurementUnit) {
       ingredientsArray.push({
         name: name,
         measurementSize: measurementSize, // Keep as submitted (string/number mix possible from dropdown)
         measurementUnit: measurementUnit,
         preferredLabel: formData[`ingredient${ingredientIndex}PreferredLabel`] || ''
       });
    } else {
      // Log if an incomplete ingredient row was found but not added
      Logger.log(`Skipping incomplete ingredient data at index ${ingredientIndex}. Name: ${name}, Size: ${measurementSize}, Unit: ${measurementUnit}`);
    }
    ingredientIndex++;
  }
  return JSON.stringify(ingredientsArray);
}

/**
 * Checks if a beverage already exists in the sheet.
 * @param {string} beverageName The name of the beverage to check.
 * @param {SpreadsheetApp.Sheet} sheet The sheet object to search within.
 * @return {object|null} An object containing the existing beverage data (including rowIndex) if found, otherwise null.
 */
function checkBeverageExists(beverageName, sheet) {
  if (!sheet) {
    Logger.log("checkBeverageExists: Sheet object is invalid.");
    return null;
  }
  if (!beverageName || typeof beverageName !== 'string' || beverageName.trim() === '') {
       Logger.log("checkBeverageExists: Invalid beverageName provided.");
       return null;
  }

  const beverageNameTrimmed = beverageName.trim();

  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log("checkBeverageExists: Beverage sheet has no data rows.");
      return null;
    }

    // --- Dynamically find the 'beverageName' column ---
    const headerRowValues = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const beverageNameColumnIndex = headerRowValues.findIndex(header => header.toString().trim().toLowerCase() === 'beveragename');

    if (beverageNameColumnIndex === -1) {
        Logger.log("checkBeverageExists: 'beverageName' column not found in headers.");
        return null; // Cannot proceed without the column
    }
    const beverageNameColumnNumber = beverageNameColumnIndex + 1;
    // --- End dynamic column finding ---

    const range = sheet.getRange(2, beverageNameColumnNumber, lastRow - 1, 1);
    // Use case-insensitive comparison for robustness
    const beverageNames = range.getValues().map(row => row[0] ? row[0].toString().trim().toLowerCase() : '');

    const rowIndexInArray = beverageNames.indexOf(beverageNameTrimmed.toLowerCase());

    if (rowIndexInArray !== -1) {
      // Beverage found
      const rowNumber = rowIndexInArray + 2; // Adjust row index
      Logger.log(`checkBeverageExists: Beverage "${beverageNameTrimmed}" found at row ${rowNumber}.`);

      const lastColumn = sheet.getLastColumn();
      const rowRange = sheet.getRange(rowNumber, 1, 1, lastColumn);
      const rowValues = rowRange.getValues()[0];
      const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]; // Get actual headers

      const existingData = {};
      headers.forEach((header, index) => {
        // Normalize header key (e.g., "Beverage Name" -> "beverageName")
        let key = header ? header.toString().trim() : `column_${index + 1}`;
        // Convert to camelCase for consistency with form data keys (optional but good practice)
        key = key.replace(/\s+/g, ''); // Remove spaces
        key = key.charAt(0).toLowerCase() + key.slice(1); // Lowercase first letter
        existingData[key] = rowValues[index];
      });

      existingData.rowIndex = rowNumber; // Add row index

      Logger.log("checkBeverageExists: Returning existingData:", existingData);
      return existingData;

    } else {
      Logger.log(`checkBeverageExists: Beverage "${beverageNameTrimmed}" not found.`);
      return null;
    }
  } catch (error) {
      Logger.log(`Error in checkBeverageExists for "${beverageNameTrimmed}": ${error.message}`);
      Logger.log(`Stack Trace: ${error.stack}`);
      return null; // Return null on error
  }
}


/**
 * Generates the next available versioned beverage name (e.g., "Margarita 2").
 * @param {string} beverageName The base name of the beverage.
 * @param {SpreadsheetApp.Sheet} sheet The sheet object to search within.
 * @return {string} The next available versioned name.
 */
function getNextVersionedBeverageName(beverageName, sheet) {
  let version = 1;
  let versionedName = `${beverageName} ${version}`; // Initial versioned name

  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return versionedName; // No existing data, return "Name 1"

    // --- Dynamically find the 'beverageName' column ---
    const headerRowValues = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
     const beverageNameColumnIndex = headerRowValues.findIndex(header => header.toString().trim().toLowerCase() === 'beveragename');

    if (beverageNameColumnIndex === -1) {
        Logger.log("getNextVersionedBeverageName: 'beverageName' column not found. Returning initial version.");
        return versionedName; // Cannot check without the column
    }
    const beverageNameColumnNumber = beverageNameColumnIndex + 1;
    // --- End dynamic column finding ---

    const range = sheet.getRange(2, beverageNameColumnNumber, lastRow - 1, 1);
    // Get existing names, trim and convert to lower case for comparison
    const beverageNames = range.getValues().map(row => row[0] ? row[0].toString().trim().toLowerCase() : '');

    // Create a Regex to match "Base Name" followed by space and digits, case-insensitive
    const versionRegex = new RegExp(`^${beverageName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s+(\\d+)$`, 'i');
    let maxVersion = 0;

    beverageNames.forEach(name => {
        // Check for exact match "Base Name" (version 0 essentially)
        if (name === beverageName.toLowerCase()) {
             if (0 > maxVersion) maxVersion = 0; // Consider the base name as version 0 if present
        }
        // Check for "Base Name X"
        const match = name.match(versionRegex);
        if (match) {
            const currentVersion = parseInt(match[1], 10);
            if (currentVersion > maxVersion) {
                maxVersion = currentVersion;
            }
        }
    });

    // The next version is the highest found + 1
    version = maxVersion + 1;
    versionedName = `${beverageName} ${version}`;
    Logger.log(`Next version for "${beverageName}" determined as: "${versionedName}"`);

  } catch (error) {
      Logger.log(`Error in getNextVersionedBeverageName for "${beverageName}": ${error.message}. Returning initial version.`);
      // Fallback to default "Name 1" on error
      versionedName = `${beverageName} 1`;
  }

  return versionedName;
}

function processIngredients() {
  const dbConfig = getDatabaseConfig();
  const ss = SpreadsheetApp.openById(dbConfig.recipes);
  const sheet = ss.getSheetByName('database'); // Assuming your data is on the active sheet
  const ingredientsColumnName = 'ingredients';
  const menuIngredientStringColumnName = 'menuIngredientString';

  // Get the header row to find the column index
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const ingredientsColumnIndex = headerRow.indexOf(ingredientsColumnName) + 1;

  if (ingredientsColumnIndex === 0) {
    SpreadsheetApp.getUi().alert(`Column "${ingredientsColumnName}" not found.`);
    return;
  }

  // Get all values from the ingredients column
  const ingredientsData = sheet.getRange(2, ingredientsColumnIndex, sheet.getLastRow() - 1, 1).getValues();
  const output = [];

  // Process each ingredient string
  ingredientsData.forEach(row => {
    const ingredientsString = row[0];
    if (ingredientsString) {
      try {
        const ingredientsArray = JSON.parse(ingredientsString);
        const updatedIngredients = ingredientsArray
          .filter(item => item.name !== 'Ice')
          .map(item => {
            const { isFirst, ...rest } = item; // Remove the 'isFirst' property
            return rest;
          });
        output.push([JSON.stringify(updatedIngredients)]); // Convert the modified array back to a string
      } catch (e) {
        console.error(`Error parsing JSON: ${ingredientsString} - ${e}`);
        output.push([ingredientsString]); // If there's an error, keep the original string
      }
    } else {
      output.push(['']); // Handle empty ingredient strings
    }
  });

  // Write the updated ingredient arrays back to the ingredients column
  if (output.length > 0) {
    sheet.getRange(2, ingredientsColumnIndex, output.length, 1).setValues(output);
  }
}