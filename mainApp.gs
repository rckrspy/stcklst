/**
 * Main Web App Entry Point
 * Provides navigation between different tools
 */
function doGet(e) {
  const page = e.parameter.page || 'home';
  
  Logger.log(`Main App doGet triggered. Page: ${page}`);
  
  switch(page) {
    case 'ingredient':
      return getIngredientApp();
    case 'beverage':
      return getBeverageApp();
    case 'home':
    default:
      return getMainLandingPage();
  }
}

/**
 * Main landing page with navigation
 */
function getMainLandingPage() {
  const html = HtmlService.createTemplate(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <title>Beverage Management System</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: white;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          text-align: center; 
          padding: 40px 20px;
        }
        h1 { 
          font-size: 2.5em; 
          margin-bottom: 10px; 
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle { 
          font-size: 1.2em; 
          margin-bottom: 40px; 
          opacity: 0.9;
        }
        .tools-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 30px; 
          margin: 40px 0;
        }
        .tool-card { 
          background: rgba(255,255,255,0.95); 
          color: #333; 
          padding: 30px; 
          border-radius: 15px; 
          box-shadow: 0 8px 32px rgba(0,0,0,0.1); 
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
          display: block;
        }
        .tool-card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
          text-decoration: none;
          color: #333;
        }
        .tool-icon { 
          font-size: 3em; 
          margin-bottom: 15px; 
        }
        .tool-title { 
          font-size: 1.4em; 
          font-weight: bold; 
          margin-bottom: 10px; 
          color: #2c3e50;
        }
        .tool-description { 
          color: #7f8c8d; 
          line-height: 1.5;
        }
        .phase2-section {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 30px;
          margin: 40px 0;
          border: 2px solid rgba(255,255,255,0.2);
        }
        .phase2-title {
          font-size: 1.8em;
          margin-bottom: 15px;
          color: #ffd700;
        }
        .phase2-description {
          font-size: 1.1em;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .phase2-button {
          background: #ffd700;
          color: #333;
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 1.1em;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        .phase2-button:hover {
          background: #ffed4e;
          transform: translateY(-2px);
          text-decoration: none;
          color: #333;
        }
        .footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.3);
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🍸 Beverage Management System</h1>
        <div class="subtitle">Professional inventory and recipe management tools</div>
        
        <div class="tools-grid">
          <a href="?page=ingredient" class="tool-card">
            <div class="tool-icon">🥃</div>
            <div class="tool-title">Add Ingredient</div>
            <div class="tool-description">
              Add new ingredients to your inventory with detailed categorization, 
              cost tracking, and supplier information.
            </div>
          </a>
          
          <a href="?page=beverage" class="tool-card">
            <div class="tool-icon">🍹</div>
            <div class="tool-title">Add Beverage</div>
            <div class="tool-description">
              Create new beverage recipes with automatic ingredient selection, 
              cost calculation, and detailed specifications.
            </div>
          </a>
        </div>

        <div class="phase2-section">
          <div class="phase2-title">🚀 Enterprise System Available</div>
          <div class="phase2-description">
            Access the complete Phase 2 Beverage Management System with 5 separate databases, 
            advanced analytics, supplier management, and enterprise-grade features.
          </div>
          <button class="phase2-button" onclick="showPhase2Instructions()">
            Access Enterprise System
          </button>
        </div>

        <div class="footer">
          <p>Select a tool above to get started, or use the enterprise system for advanced features.</p>
        </div>
      </div>

      <script>
        function showPhase2Instructions() {
          alert(\`To access the Enterprise Beverage Management System:

1. Open Google Apps Script: https://script.google.com/d/1rpVR1c_8a7RbFy6dmCJa2kSCjgQ_stw-EdpIN4v4F3bRla-szSbZyzy6/edit

2. Run function: installBeverageManagementSystem()

3. This will create 5 separate database spreadsheets with:
   • Enhanced ingredient management (20 fields)
   • Recipe cost calculation and management  
   • Supplier relationship tracking
   • Inventory automation with alerts
   • Business intelligence and analytics

The enterprise system provides professional-grade features for commercial operations.\`);
        }
      </script>
    </body>
    </html>
  `);
  
  return html.evaluate()
    .setTitle('Beverage Management System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Get the Ingredient App
 */
function getIngredientApp() {
  Logger.log("doGet triggered for Ingredient App.");
  return HtmlService.createTemplateFromFile('addIngredient/ingredientForm')
      .evaluate()
      .setTitle('Add Ingredient')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Get the Beverage App  
 */
function getBeverageApp() {
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
             .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log(`Error in getBeverageApp: ${error.toString()}`);
    // Return a simple error page
    const errorHtml = HtmlService.createHtmlOutput(`
      <h2>Error loading Beverage App</h2>
      <p>Error: ${error.toString()}</p>
      <p><a href="?page=home">Return to Main Page</a></p>
    `);
    return errorHtml.setTitle('Error - Add Beverage');
  }
}