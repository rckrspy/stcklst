/**
 * Simple Main Web App Entry Point - Testing Version
 * Provides navigation between different tools
 */
function doGet(e) {
  try {
    const page = e.parameter.page || 'home';
    
    Logger.log('Main App doGet triggered. Page: ' + page);
    
    switch(page) {
      case 'ingredient':
        Logger.log('Routing to ingredient app');
        return getIngredientApp();
      case 'beverage':
        Logger.log('Routing to beverage app');
        return getBeverageApp();
      case 'home':
      default:
        Logger.log('Routing to main landing page');
        return getMainLandingPage();
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error: ' + error.toString() + '</h2>');
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