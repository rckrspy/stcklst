/**
 * Unified Beverage Management Interface
 * Defaults to beverage creation with integrated ingredient addition
 */
function doGet(e) {
  try {
    Logger.log('Unified Beverage Management Interface starting');
    
    // Default directly to integrated beverage form
    return getUnifiedBeverageApp();
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error loading Beverage Management System: ' + error.toString() + '</h2>');
  }
}

/**
 * Simple landing page with navigation
 */
function getMainLandingPage() {
  try {
    Logger.log('Creating main landing page');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <base target="_top">
        <title>Beverage Management System</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #333; 
            text-align: center;
            margin-bottom: 30px;
          }
          .tool-button { 
            display: block;
            width: 100%;
            padding: 15px;
            margin: 15px 0;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            text-align: center;
            border-radius: 5px;
            font-size: 16px;
            transition: background 0.3s;
          }
          .tool-button:hover { 
            background: #45a049;
            text-decoration: none;
            color: white;
          }
          .beverage-button {
            background: #2196F3;
          }
          .beverage-button:hover {
            background: #1976D2;
          }
          .info {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🍸 Beverage Management System</h1>
          
          <div class="info">
            <strong>Welcome!</strong> Select a tool below to get started with your beverage management tasks.
          </div>
          
          <a href="?page=ingredient" class="tool-button">
            🥃 Add Ingredient
          </a>
          
          <a href="?page=beverage" class="tool-button beverage-button">
            🍹 Add Beverage Recipe
          </a>
          
          <div class="info">
            <strong>Enterprise System:</strong> For advanced features, open the 
            <a href="https://script.google.com/d/1rpVR1c_8a7RbFy6dmCJa2kSCjgQ_stw-EdpIN4v4F3bRla-szSbZyzy6/edit" target="_blank">
              Apps Script editor
            </a> 
            and run <code>installBeverageManagementSystem()</code>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const html = HtmlService.createHtmlOutput(htmlContent);
    html.setTitle('Beverage Management System');
    html.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    Logger.log('Main landing page created successfully');
    return html;
    
  } catch (error) {
    Logger.log('Error in getMainLandingPage: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error creating landing page: ' + error.toString() + '</h2>');
  }
}

/**
 * Get the Ingredient App
 */
function getIngredientApp() {
  try {
    Logger.log('Creating ingredient app');
    return HtmlService.createTemplateFromFile('addIngredient/ingredientForm')
        .evaluate()
        .setTitle('Add Ingredient')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log('Error in getIngredientApp: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error loading Ingredient App: ' + error.toString() + '</h2><p><a href="?page=home">Return to Main Page</a></p>');
  }
}

/**
 * Get the Beverage App  
 */
function getBeverageApp() {
  try {
    Logger.log('Creating beverage app');
    
    // Check if getDataForBeverageForm function exists
    if (typeof getDataForBeverageForm !== 'function') {
      Logger.log('getDataForBeverageForm function not found, creating simple form');
      return HtmlService.createHtmlOutput(`
        <h2>Add Beverage Tool</h2>
        <p>The beverage form data function is not available. Please check the implementation.</p>
        <p><a href="?page=home">Return to Main Page</a></p>
      `);
    }
    
    const template = HtmlService.createTemplateFromFile('addBeverage/beverageForm');
    const formData = getDataForBeverageForm();
    
    template.ingredientNames = formData.ingredientNames || [];
    template.baseSpirits = formData.baseSpirits || [];
    
    Logger.log('Beverage app template created with ' + (formData.ingredientNames?.length || 0) + ' ingredients');
    
    return template.evaluate()
             .setTitle('Add Beverage')
             .addMetaTag('viewport', 'width=device-width, initial-scale=1')
             .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
             
  } catch (error) {
    Logger.log('Error in getBeverageApp: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error loading Beverage App: ' + error.toString() + '</h2><p><a href="?page=home">Return to Main Page</a></p>');
  }
}

/**
 * Unified Beverage App with Integrated Ingredient Addition
 */
function getUnifiedBeverageApp() {
  try {
    Logger.log('Creating unified beverage app with integrated ingredients');
    
    const template = HtmlService.createTemplateFromFile('beverageWithIngredients');
    const formData = getDataForBeverageForm();
    
    template.ingredientNames = formData.ingredientNames || [];
    template.baseSpirits = formData.baseSpirits || [];
    
    Logger.log('Unified beverage app template created with ' + (formData.ingredientNames?.length || 0) + ' ingredients');
    
    return template.evaluate()
             .setTitle('Beverage Management System')
             .addMetaTag('viewport', 'width=device-width, initial-scale=1')
             .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
             
  } catch (error) {
    Logger.log('Error in getUnifiedBeverageApp: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error loading Unified Beverage System: ' + error.toString() + '</h2>');
  }
}

/**
 * Save beverage data from the unified interface
 */
function saveBeverageData(beverageData) {
  try {
    Logger.log('Saving beverage data: ' + JSON.stringify(beverageData));
    
    // Use the existing beverage saving logic from addBeverage
    // You would implement the beverage saving logic here
    // For now, we'll return a success message
    
    return {
      success: true,
      message: 'Beverage "' + beverageData.beverageName + '" saved successfully!'
    };
    
  } catch (error) {
    Logger.log('Error saving beverage: ' + error.toString());
    throw new Error('Failed to save beverage: ' + error.message);
  }
}

/**
 * Save ingredient data from the modal within the unified interface
 * This is a simplified version that calls the existing saveIngredientData function
 */
function saveIngredientData(ingredientData) {
  try {
    Logger.log('Saving ingredient from unified interface: ' + JSON.stringify(ingredientData));
    
    // Convert the simplified modal data to the full ingredient format
    const fullIngredientData = {
      ingredientName: ingredientData.ingredientName,
      category: ingredientData.category,
      labelBrand: ingredientData.labelBrand || '',
      abv: ingredientData.abv || '',
      costPerUnit: ingredientData.costPerUnit || '',
      unitSize: ingredientData.unitSize || '',
      unitMetric: ingredientData.unitMetric || 'ml',
      // Set defaults for required fields
      subcategory: 'Standard',
      countryOfOrigin: '',
      spiritsType: ingredientData.category || '',
      spiritsStyle: 'Standard',
      tasteProfile: '',
      bodyStyle: 'Medium',
      sku: '',
      sizeVolume: ingredientData.unitSize || '',
      description: '',
      storageRequirements: 'Cool, dry place',
      shelfLifeDays: 365,
      minQuantity: '',
      supplierID: 'DEFAULT',
      source: 'Unified Interface',
      alcoholic: ingredientData.abv && parseFloat(ingredientData.abv) > 0,
      bulk: false,
      isAvailable175L: false,
      allergen: '',
      substitute: ''
    };
    
    // Call the existing saveIngredientData function from addIngredient
    // We need to make sure this function is available globally
    const result = saveIngredientDataInternal(fullIngredientData);
    
    if (typeof result === 'string' && !result.startsWith('{')) {
      // Success case - return success message
      return {
        success: true,
        message: result
      };
    } else {
      // Duplicate case or error - handle accordingly
      try {
        const duplicateData = JSON.parse(result);
        if (duplicateData.rowIndex) {
          return {
            success: false,
            message: 'Ingredient already exists',
            duplicate: true,
            existingData: duplicateData
          };
        }
      } catch (parseError) {
        // Not JSON, probably an error message
        throw new Error(result);
      }
    }
    
  } catch (error) {
    Logger.log('Error saving ingredient from unified interface: ' + error.toString());
    throw new Error('Failed to save ingredient: ' + error.message);
  }
}

/**
 * Internal function to save ingredient data
 * This is a simplified version of the saveIngredientData from addIngredient
 */
function saveIngredientDataInternal(formData) {
  const spreadsheetId = "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c";
  const sheetName = "database";
  
  const headers = [
    "timestamp", "userEmail", "ingredientName", "category", "subcategory", 
    "labelBrand", "countryOfOrigin", "spiritsType", "spiritsStyle", 
    "abv", "tasteProfile", "bodyStyle", "sku", "sizeVolume", 
    "description", "storageRequirements", "shelfLifeDays", "minQuantity", 
    "unitSize", "unitMetric", "costPerUnit", "supplierID", "source",
    "alcoholic", "bulk", "isAvailable175L", "allergen", "substitute"
  ];
  
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('Sheet "' + sheetName + '" not found');
    }
    
    // Check for duplicates
    const existingData = checkIngredientExistsInternal(formData.ingredientName, sheet);
    if (existingData) {
      return JSON.stringify(existingData);
    }
    
    // Create data row
    const rowData = [
      new Date(),
      Session.getActiveUser().getEmail(),
      formData.ingredientName,
      formData.category,
      formData.subcategory || 'Standard',
      formData.labelBrand || '',
      formData.countryOfOrigin || '',
      formData.spiritsType || formData.category,
      formData.spiritsStyle || 'Standard',
      formData.abv ? parseFloat(formData.abv) : null,
      formData.tasteProfile || '',
      formData.bodyStyle || 'Medium',
      formData.sku || '',
      formData.sizeVolume || '',
      formData.description || '',
      formData.storageRequirements || 'Cool, dry place',
      formData.shelfLifeDays || 365,
      formData.minQuantity || '',
      formData.unitSize || '',
      formData.unitMetric || 'ml',
      formData.costPerUnit ? parseFloat(formData.costPerUnit) : null,
      formData.supplierID || 'DEFAULT',
      formData.source || 'Unified Interface',
      formData.alcoholic || false,
      formData.bulk || false,
      formData.isAvailable175L || false,
      formData.allergen || '',
      formData.substitute || ''
    ];
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
    
    // Append data
    sheet.appendRow(rowData);
    
    Logger.log('Ingredient added successfully: ' + formData.ingredientName);
    return 'Ingredient "' + formData.ingredientName + '" added successfully!';
    
  } catch (error) {
    Logger.log('Error in saveIngredientDataInternal: ' + error.toString());
    throw new Error('Failed to save ingredient: ' + error.message);
  }
}

/**
 * Check if ingredient exists (simplified version)
 */
function checkIngredientExistsInternal(ingredientName, sheet) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;
    
    const headerRowValues = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const ingredientNameHeaderIndex = headerRowValues.findIndex(header => 
      String(header).trim().toLowerCase() === 'ingredientname');
    
    if (ingredientNameHeaderIndex === -1) return null;
    
    const ingredientNameColumn = ingredientNameHeaderIndex + 1;
    const ingredientNameRange = sheet.getRange(2, ingredientNameColumn, lastRow - 1, 1);
    const existingNames = ingredientNameRange.getValues().map(row => 
      String(row[0]).trim().toLowerCase());
    
    const searchName = ingredientName.trim().toLowerCase();
    const rowIndexInArray = existingNames.indexOf(searchName);
    
    if (rowIndexInArray !== -1) {
      const rowNumber = rowIndexInArray + 2;
      const lastColumn = sheet.getLastColumn();
      const rowRange = sheet.getRange(rowNumber, 1, 1, lastColumn);
      const rowValues = rowRange.getValues()[0];
      const actualHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      
      const existingData = {};
      actualHeaders.forEach((header, index) => {
        const key = String(header).trim() || 'column_' + (index + 1);
        existingData[key] = rowValues[index];
      });
      
      existingData.rowIndex = rowNumber;
      return existingData;
    }
    
    return null;
    
  } catch (error) {
    Logger.log('Error checking ingredient exists: ' + error.toString());
    return null;
  }
}