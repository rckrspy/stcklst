/**
 * @OnlyCurrentDoc
 * This script provides the backend logic for the Ingredient Data Entry web application.
 * It serves the HTML interface and handles saving/updating data to a Google Sheet.
 */

/**
 * Serves the HTML interface for the Ingredient Data Entry form.
 * Allows the web app to be embedded in an iframe.
 * @param {object} e The event parameter for a GET request.
 * @return {HtmlService.HtmlOutput} The HTML output to be rendered.
 */
function doGet(e) {
  Logger.log("doGet triggered for Ingredient App.");
  return HtmlService.createTemplateFromFile('ingredientForm')
      .evaluate()
      .setTitle('Add Ingredient')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Allows embedding in iframes (like the Beverage app)
}

/**
 * Saves new ingredient data to the spreadsheet or replaces an existing row if specified.
 * Performs server-side validation and checks for duplicates before saving.
 *
 * @param {object} formData The data submitted from the HTML form. Contains fields like ingredientName, category, costPerUnit, etc., including the new fields.
 * @param {number} [rowIndexToReplace=null] The 1-based row number in the spreadsheet to replace. If null, checks for duplicates and appends a new row if none found.
 * @return {string} A success message (string) upon successful save/replace, OR a JSON string representing the existing data if a duplicate is found and rowIndexToReplace is null. Throws an error on failure.
 */
function saveIngredientData(formData, rowIndexToReplace = null) {
  const functionStartTime = new Date();
  Logger.log(`saveIngredientData called. Action: ${rowIndexToReplace ? 'Replace Row ' + rowIndexToReplace : 'Add/Check Duplicate'}. Data: ${JSON.stringify(formData)}`);

  // --- Configuration ---
  const spreadsheetId = "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c"; // *** REPLACE WITH YOUR SPREADSHEET ID ***
  const sheetName = "database"; // Ensure this matches your sheet tab name

  // *** CRITICAL: Define headers IN THE EXACT ORDER THEY APPEAR IN YOUR SPREADSHEET ***
  // Enhanced headers for Phase 1 implementation - Commercial scale categorization
   const headers = [
        "timestamp", "userEmail", "ingredientName", "category", "subcategory", 
        "labelBrand", "countryOfOrigin", "spiritsType", "spiritsStyle", 
        "abv", "tasteProfile", "bodyStyle", "sku", "sizeVolume", 
        "description", "storageRequirements", "shelfLifeDays", "minQuantity", 
        "unitSize", "unitMetric", "costPerUnit", "supplierID", "source",
        "alcoholic", "bulk", "isAvailable175L", "allergen", "substitute"
    ];
  // --- End Configuration ---

  try {
    // --- Spreadsheet Access ---
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found in spreadsheet ID "${spreadsheetId}". Please check configuration.`);
    }
    // --- End Spreadsheet Access ---


    // --- Server-Side Validation ---
    // Trim whitespace from relevant string fields
    const ingredientName = formData.ingredientName ? formData.ingredientName.trim() : '';
    const labelBrand = formData.labelBrand ? formData.labelBrand.trim() : '';
    const countryOfOrigin = formData.countryOfOrigin ? formData.countryOfOrigin.trim() : '';
    const spiritsType = formData.spiritsType ? formData.spiritsType.trim() : '';
    const spiritsStyle = formData.spiritsStyle ? formData.spiritsStyle.trim() : '';
    const tasteProfile = formData.tasteProfile ? formData.tasteProfile.trim() : '';
    const sku = formData.sku ? formData.sku.trim() : '';
    const sizeVolume = formData.sizeVolume ? formData.sizeVolume.trim() : '';
    const description = formData.description ? formData.description.trim() : '';
    const minQuantity = formData.minQuantity ? formData.minQuantity.trim() : '';
    const source = formData.source ? formData.source.trim() : '';
    const allergen = formData.allergen ? formData.allergen.trim() : '';
    const substitute = formData.substitute ? formData.substitute.trim() : '';
    const costPerUnit = formData.costPerUnit ? String(formData.costPerUnit).trim() : null;
    const unitSize = formData.unitSize ? String(formData.unitSize).trim() : null;
    const abv = formData.abv ? String(formData.abv).trim() : null;
    const shelfLifeDays = formData.shelfLifeDays ? String(formData.shelfLifeDays).trim() : null;


    // Required field checks
    if (!ingredientName) throw new Error("Ingredient Name is required.");
    if (!formData.category) throw new Error("Category is required.");
    if (!formData.unitMetric) throw new Error("Unit Metric is required.");
    // Conditionally require unitSize (allow empty for certain categories/metrics)
    if (!unitSize && !['Produce', 'Decorative'].includes(formData.category) && !['each', 'N/A', 'bunch'].includes(formData.unitMetric)) {
        throw new Error("Unit Size is required unless Category is Produce/Decorative or Metric is Each/N/A/Bunch.");
    }

    // Format/Type checks
    if (costPerUnit && !/^\d*(\.?\d{1,2})?$/.test(costPerUnit)) {
         throw new Error("Invalid format for Cost per Unit. Use numbers and up to two decimal places (e.g., 12.99 or 12).");
    }
    if (abv && (!/^\d*(\.?\d{1,2})?$/.test(abv) || parseFloat(abv) < 0 || parseFloat(abv) > 100)) {
         throw new Error("ABV must be a number between 0 and 100 with up to two decimal places.");
    }
    if (shelfLifeDays && (!/^\d+$/.test(shelfLifeDays) || parseInt(shelfLifeDays) < 0)) {
         throw new Error("Shelf Life Days must be a positive whole number.");
    }
     if (unitSize && isNaN(parseFloat(unitSize)) && !/^\d+(\.\d+)?$/.test(unitSize)) {
        Logger.log(`Warning: Non-numeric unit size detected: ${unitSize}. Proceeding.`);
     }

    // Length checks (adjust lengths as needed)
    if (ingredientName.length > 100) throw new Error("Ingredient Name exceeds maximum length (100).");
    if (labelBrand.length > 200) throw new Error("Label/Brand exceeds maximum length (200).");
    if (countryOfOrigin.length > 100) throw new Error("Country of Origin exceeds maximum length (100).");
    if (spiritsType.length > 100) throw new Error("Spirits Type exceeds maximum length (100).");
    if (spiritsStyle.length > 100) throw new Error("Spirits Style exceeds maximum length (100).");
    if (tasteProfile.length > 500) throw new Error("Taste Profile exceeds maximum length (500).");
    if (sku.length > 50) throw new Error("SKU exceeds maximum length (50).");
    if (sizeVolume.length > 50) throw new Error("Size/Volume exceeds maximum length (50).");
    if (description.length > 1000) throw new Error("Description exceeds maximum length (1000).");
    if (minQuantity.length > 50) throw new Error("Minimum Quantity exceeds maximum length (50).");
    if (source.length > 150) throw new Error("Source exceeds maximum length (150).");
    if (allergen.length > 255) throw new Error("Allergen field exceeds maximum length (255).");
    if (substitute.length > 255) throw new Error("Substitute field exceeds maximum length (255).");
    // --- End Validation ---


    // --- Check for Duplicates (only if NOT explicitly replacing) ---
    let existingIngredientData = null;
    if (rowIndexToReplace === null) {
        // Pass the sheet object to avoid reopening it
        existingIngredientData = checkIngredientExists(ingredientName, sheet);
    }
    // --- End Check for Duplicates ---


    // --- Construct Data Row ---
    // Create the array of data in the exact order defined in the 'headers' array.
    const rowData = [
        new Date(),                                    // timestamp
        Session.getActiveUser().getEmail(),           // userEmail
        ingredientName,                               // ingredientName
        formData.category || null,                    // category
        formData.subcategory || null,                 // subcategory
        labelBrand || null,                           // labelBrand
        countryOfOrigin || null,                      // countryOfOrigin
        spiritsType || null,                          // spiritsType
        spiritsStyle || null,                         // spiritsStyle
        abv ? parseFloat(abv) : null,                 // abv
        tasteProfile || null,                         // tasteProfile
        formData.bodyStyle || null,                   // bodyStyle
        sku || null,                                  // sku
        sizeVolume || null,                           // sizeVolume
        description || null,                          // description
        formData.storageRequirements || null,         // storageRequirements
        shelfLifeDays ? parseInt(shelfLifeDays) : null, // shelfLifeDays
        minQuantity || null,                          // minQuantity
        unitSize,                                     // unitSize
        formData.unitMetric || null,                  // unitMetric
        costPerUnit ? parseFloat(costPerUnit) : null, // costPerUnit
        formData.supplierID || null,                  // supplierID
        source || null,                               // source
        formData.alcoholic || false,                  // alcoholic
        formData.bulk || false,                       // bulk
        formData.isAvailable175L || false,            // isAvailable175L
        allergen || null,                             // allergen
        substitute || null                            // substitute
    ];

    // Data Structure Verification
    if (rowData.length !== headers.length) {
        Logger.log(`CRITICAL ERROR: Mismatch between rowData length (${rowData.length}) and headers length (${headers.length}). Check headers definition and rowData construction.`);
        Logger.log(`Headers (${headers.length}): ${JSON.stringify(headers)}`);
        Logger.log(`RowData (${rowData.length}): ${JSON.stringify(rowData)}`);
        throw new Error("Internal Server Error: Data structure mismatch. Cannot save data.");
    }
    // --- End Construct Data Row ---


    // --- Perform Action: Check Duplicate / Replace / Add New ---
    if (existingIngredientData && rowIndexToReplace === null) {
      // Duplicate Found (and we weren't asked to replace)
      Logger.log(`Duplicate Ingredient Found for "${ingredientName}" at row ${existingIngredientData.rowIndex}. Returning existing data.`);
      // Return existing data as JSON string for the client-side duplicate modal
      return JSON.stringify(existingIngredientData);

    } else if (rowIndexToReplace !== null) {
      // ** Replace Existing Row **
      Logger.log(`Replacing ingredient "${ingredientName}" at provided row index: ${rowIndexToReplace}`);

      // Validate rowIndexToReplace again (bounds check)
      const lastRow = sheet.getLastRow();
      if (rowIndexToReplace < 2 || rowIndexToReplace > lastRow) {
           throw new Error(`Invalid row index (${rowIndexToReplace}) provided for replacement. Must be between 2 and ${lastRow}.`);
      }

      // Write the new data to the specified row
      sheet.getRange(rowIndexToReplace, 1, 1, rowData.length).setValues([rowData]);
      Logger.log(`Ingredient at row ${rowIndexToReplace} replaced successfully!`);
      // Return success message for client display
      return `Ingredient "${ingredientName}" replaced successfully!`;

    } else {
      // ** Add New Row ** (No duplicate found or adding first entry)
      Logger.log(`Adding new ingredient: "${ingredientName}"`);

      // Check if sheet is empty and add headers if needed
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        // Freeze the header row for better usability
        sheet.setFrozenRows(1);
        Logger.log("Headers added to empty sheet.");
      } else {
          // Optional: Verify existing headers match expected headers (for debugging)
          const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].slice(0, headers.length);
          if (JSON.stringify(actualHeaders) !== JSON.stringify(headers)) {
              Logger.log(`WARNING: Spreadsheet headers may not exactly match expected order or content.`);
              Logger.log(`Expected (${headers.length}): ${JSON.stringify(headers)}`);
              Logger.log(`Actual (${actualHeaders.length}): ${JSON.stringify(actualHeaders)}`);
              // Consider throwing an error here if exact match is critical
          }
      }

      // Append the new row data
      sheet.appendRow(rowData);
      Logger.log("New Ingredient Added Successfully to the spreadsheet.");
      // Return success message for client display
      return `Ingredient "${ingredientName}" added successfully!`;
    }
    // --- End Perform Action ---

  } catch (error) {
    // Log the error details thoroughly on the server side
    Logger.log(`Error in saveIngredientData: ${error.message}`);
    Logger.log(`Error Stack: ${error.stack}`);
    Logger.log(`Failed Action: ${rowIndexToReplace ? 'Replace Row ' + rowIndexToReplace : 'Add/Check Duplicate'}`);
    Logger.log(`Failed Data: ${JSON.stringify(formData)}`);

    // Re-throw the error with a user-friendly message for the client-side failure handler
    throw new Error("Failed to save ingredient data: " + error.message);
  } finally {
      const functionEndTime = new Date();
      Logger.log(`saveIngredientData execution time: ${functionEndTime.getTime() - functionStartTime.getTime()}ms`);
  }
}


/**
 * Checks if an ingredient with the given name already exists in the specified sheet.
 * Performs a case-insensitive search on the ingredient name column.
 *
 * @param {string} ingredientName The name of the ingredient to check (will be trimmed).
 * @param {SpreadsheetApp.Sheet} sheet The sheet object to search within.
 * @return {object|null} An object containing the existing ingredient data (all columns) and its 'rowIndex' (1-based) if found, otherwise null. Returns null on error or if inputs are invalid.
 */
function checkIngredientExists(ingredientName, sheet) {
  Logger.log(`checkIngredientExists called for: "${ingredientName}"`);

  // Input validation
  if (!sheet || typeof sheet.getLastRow !== 'function') { // Basic check for valid sheet object
    Logger.log("checkIngredientExists: Invalid Sheet object provided.");
    return null;
  }
  if (!ingredientName || typeof ingredientName !== 'string' || ingredientName.trim() === '') {
       Logger.log("checkIngredientExists: Invalid ingredientName provided (empty or not a string).");
       return null;
  }

  const ingredientNameTrimmedLower = ingredientName.trim().toLowerCase(); // Trim and lower for case-insensitive search

  try {
    const lastRow = sheet.getLastRow();
    // If sheet has only header (or is empty), no data exists
    if (lastRow < 2) {
      Logger.log("checkIngredientExists: Sheet has no data rows (lastRow < 2).");
      return null;
    }

    // --- Dynamically Find the 'ingredientName' Column ---
    // Read the header row (Row 1)
    const headerRowValues = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    // Find the index of 'ingredientName' (case-insensitive)
    const ingredientNameHeaderIndex = headerRowValues.findIndex(header => String(header).trim().toLowerCase() === 'ingredientname');

    if (ingredientNameHeaderIndex === -1) {
        // Log an error if the crucial column is missing
        Logger.log("CRITICAL ERROR: 'ingredientName' column not found in sheet headers. Cannot check for duplicates.");
        // You might want to throw an error here depending on how critical this check is
        // throw new Error("Configuration Error: 'ingredientName' column header missing in the spreadsheet.");
        return null; // Return null to indicate the check couldn't be performed
    }
    // Convert 0-based index to 1-based column number for getRange
    const ingredientNameColumnNumber = ingredientNameHeaderIndex + 1;
    Logger.log(`'ingredientName' column found at index ${ingredientNameHeaderIndex} (Column ${ingredientNameColumnNumber}).`);
    // --- End Dynamic Column Finding ---

    // Get all ingredient names from the identified column (excluding header)
    const ingredientNameRange = sheet.getRange(2, ingredientNameColumnNumber, lastRow - 1, 1);
    // Get values, flatten array, convert to string, trim, and lower case for comparison
    const existingIngredientNames = ingredientNameRange.getValues().map(row => String(row[0]).trim().toLowerCase());

    // Find the 0-based index of the first match in the array of existing names
    const rowIndexInArray = existingIngredientNames.indexOf(ingredientNameTrimmedLower);

    if (rowIndexInArray !== -1) {
      // Match Found!
      // Calculate the actual spreadsheet row number (add 2: 1 for header, 1 for 0-based index)
      const rowNumber = rowIndexInArray + 2;
      Logger.log(`checkIngredientExists: Ingredient "${ingredientName}" found at row ${rowNumber}. Retrieving data.`);

      // Get all data from the matched row
      const lastColumn = sheet.getLastColumn();
      const rowRange = sheet.getRange(rowNumber, 1, 1, lastColumn);
      const rowValues = rowRange.getValues()[0];

      // Get the actual headers again to map values correctly (ensures all columns included)
      const actualHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

      // Create an object to hold the existing data, mapping header names to values
      const existingData = {};
      actualHeaders.forEach((header, index) => {
        // Use header name as key (provide fallback if header is empty)
        const key = String(header).trim() || `column_${index + 1}`;
        existingData[key] = rowValues[index]; // Assign the value from the found row
      });

      // **Crucially, add the spreadsheet row number to the object**
      existingData.rowIndex = rowNumber;

      Logger.log(`checkIngredientExists: Returning existing data: ${JSON.stringify(existingData)}`);
      return existingData; // Return the complete data object including rowIndex

    } else {
      // No Match Found
      Logger.log(`checkIngredientExists: Ingredient "${ingredientName}" not found in the sheet.`);
      return null;
    }
  } catch (error) {
      // Log errors during the check process
      Logger.log(`Error during checkIngredientExists for "${ingredientName}": ${error.message}`);
      Logger.log(`Stack Trace: ${error.stack}`);
      // Return null on error to avoid blocking submission unnecessarily if the check itself fails
      return null;
  }
}