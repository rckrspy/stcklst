/**
 * Core API Functions for Beverage Management System
 * Phase 2: Data Management Layer
 */

/**
 * Ingredient Management Functions
 */

/**
 * Get ingredients by category with optional filtering
 */
function getIngredientsByCategory(category, filters = {}) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enhanced_Ingredients');
    if (!sheet) {
      throw new Error('Enhanced_Ingredients sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Find category column index
    const categoryIndex = headers.indexOf('Category');
    if (categoryIndex === -1) {
      throw new Error('Category column not found');
    }
    
    let results = rows.filter(row => {
      if (category && row[categoryIndex] !== category) {
        return false;
      }
      
      // Apply additional filters
      if (filters.abvMin && parseFloat(row[headers.indexOf('ABV')]) < filters.abvMin) {
        return false;
      }
      if (filters.abvMax && parseFloat(row[headers.indexOf('ABV')]) > filters.abvMax) {
        return false;
      }
      if (filters.country && row[headers.indexOf('Country_of_Origin')] !== filters.country) {
        return false;
      }
      
      return true;
    });
    
    // Convert to objects
    return results.map(row => mapRowToIngredientObject(row, headers));
    
  } catch (error) {
    console.error('Error getting ingredients by category:', error);
    throw error;
  }
}

/**
 * Search ingredients with advanced text search
 */
function searchIngredients(searchTerm, filters = {}) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enhanced_Ingredients');
    if (!sheet) {
      throw new Error('Enhanced_Ingredients sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const searchLower = searchTerm.toLowerCase();
    
    let results = rows.filter(row => {
      const ingredient = mapRowToIngredientObject(row, headers);
      
      // Text search across multiple fields
      const searchFields = [
        ingredient.name,
        ingredient.brand,
        ingredient.tasteProfile,
        ingredient.description,
        ingredient.category,
        ingredient.subcategory
      ];
      
      const matchesSearch = searchFields.some(field => 
        field && field.toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
      
      // Apply filters
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(ingredient.category)) return false;
      }
      
      if (filters.abvRange) {
        const abv = parseFloat(ingredient.abv);
        if (abv < filters.abvRange.min || abv > filters.abvRange.max) return false;
      }
      
      if (filters.suppliers && filters.suppliers.length > 0) {
        if (!filters.suppliers.includes(ingredient.supplierId)) return false;
      }
      
      return true;
    });
    
    return results.map(row => mapRowToIngredientObject(row, headers));
    
  } catch (error) {
    console.error('Error searching ingredients:', error);
    throw error;
  }
}

/**
 * Add new ingredient with validation
 */
function addIngredient(ingredientData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enhanced_Ingredients');
    if (!sheet) {
      throw new Error('Enhanced_Ingredients sheet not found');
    }
    
    // Validate required fields
    if (!ingredientData.name || !ingredientData.category) {
      throw new Error('Name and category are required fields');
    }
    
    // Generate ID and timestamps
    const ingredientId = generateIngredientId();
    const now = new Date();
    
    // Prepare row data
    const rowData = [
      ingredientId,
      ingredientData.name,
      ingredientData.category,
      ingredientData.subcategory || '',
      ingredientData.brand || '',
      ingredientData.countryOfOrigin || '',
      ingredientData.spiritsType || '',
      ingredientData.spiritsStyle || '',
      ingredientData.abv || 0,
      ingredientData.tasteProfile || '',
      ingredientData.bodyStyle || '',
      ingredientData.sku || '',
      ingredientData.sizeVolume || '',
      ingredientData.description || '',
      ingredientData.storageRequirements || '',
      ingredientData.shelfLifeDays || '',
      ingredientData.costPerUnit || 0,
      ingredientData.supplierId || '',
      now,
      now
    ];
    
    // Add to sheet
    sheet.appendRow(rowData);
    
    console.log(`Ingredient ${ingredientData.name} added successfully with ID: ${ingredientId}`);
    return ingredientId;
    
  } catch (error) {
    console.error('Error adding ingredient:', error);
    throw error;
  }
}

/**
 * Update existing ingredient
 */
function updateIngredient(ingredientId, updates) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enhanced_Ingredients');
    if (!sheet) {
      throw new Error('Enhanced_Ingredients sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find ingredient row
    const idIndex = headers.indexOf('Ingredient_ID');
    const rowIndex = data.findIndex((row, index) => index > 0 && row[idIndex] === ingredientId);
    
    if (rowIndex === -1) {
      throw new Error(`Ingredient with ID ${ingredientId} not found`);
    }
    
    // Update fields
    Object.keys(updates).forEach(field => {
      const columnIndex = headers.indexOf(getColumnNameFromField(field));
      if (columnIndex !== -1) {
        sheet.getRange(rowIndex + 1, columnIndex + 1).setValue(updates[field]);
      }
    });
    
    // Update timestamp
    const updatedIndex = headers.indexOf('Updated_Date');
    if (updatedIndex !== -1) {
      sheet.getRange(rowIndex + 1, updatedIndex + 1).setValue(new Date());
    }
    
    console.log(`Ingredient ${ingredientId} updated successfully`);
    return true;
    
  } catch (error) {
    console.error('Error updating ingredient:', error);
    throw error;
  }
}

/**
 * Recipe Management Functions
 */

/**
 * Create new recipe with ingredients
 */
function createRecipe(recipeData) {
  try {
    const recipesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Recipes');
    const relationshipSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Recipe_Ingredients');
    
    if (!recipesSheet || !relationshipSheet) {
      throw new Error('Required sheets not found');
    }
    
    // Validate required fields
    if (!recipeData.name || !recipeData.category) {
      throw new Error('Recipe name and category are required');
    }
    
    // Generate recipe ID
    const recipeId = generateRecipeId();
    const now = new Date();
    
    // Calculate total cost
    const totalCost = calculateRecipeCostFromData(recipeData.ingredients || []);
    
    // Prepare recipe row
    const recipeRow = [
      recipeId,
      recipeData.name,
      recipeData.description || '',
      recipeData.category,
      recipeData.difficulty || 'Beginner',
      recipeData.servingSize || 1,
      recipeData.prepTime || 0,
      totalCost,
      recipeData.alcoholic || false,
      (recipeData.dietaryTags || []).join(', '),
      recipeData.instructions || '',
      now,
      now,
      '1.0',
      true
    ];
    
    // Add recipe to sheet
    recipesSheet.appendRow(recipeRow);
    
    // Add ingredient relationships
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      createIngredientRelationships(recipeId, recipeData.ingredients);
    }
    
    console.log(`Recipe ${recipeData.name} created successfully with ID: ${recipeId}`);
    return recipeId;
    
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
}

/**
 * Scale recipe by multiplier
 */
function scaleRecipe(recipeId, multiplier) {
  try {
    const recipe = getRecipe(recipeId);
    const ingredients = getRecipeIngredients(recipeId);
    
    const scaledIngredients = ingredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity * multiplier,
      costContribution: ingredient.costContribution * multiplier
    }));
    
    const scaledRecipe = {
      ...recipe,
      servingSize: recipe.servingSize * multiplier,
      ingredients: scaledIngredients,
      totalCost: scaledIngredients.reduce((sum, ing) => sum + ing.costContribution, 0)
    };
    
    return scaledRecipe;
    
  } catch (error) {
    console.error('Error scaling recipe:', error);
    throw error;
  }
}

/**
 * Calculate recipe cost from ingredient data
 */
function calculateRecipeCostFromData(ingredientsData) {
  let totalCost = 0;
  
  ingredientsData.forEach(ingredient => {
    const ingredientInfo = getIngredientById(ingredient.ingredientId);
    if (ingredientInfo && ingredientInfo.costPerUnit) {
      const costPerUnit = parseFloat(ingredientInfo.costPerUnit);
      const quantity = parseFloat(ingredient.quantity);
      totalCost += costPerUnit * quantity;
    }
  });
  
  return totalCost;
}

/**
 * Create ingredient relationships for recipe
 */
function createIngredientRelationships(recipeId, ingredients) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Recipe_Ingredients');
    
    ingredients.forEach((ingredient, index) => {
      const relationshipId = generateRelationshipId();
      const costContribution = calculateIngredientCost(ingredient.ingredientId, ingredient.quantity);
      
      const rowData = [
        relationshipId,
        recipeId,
        ingredient.ingredientId,
        ingredient.quantity,
        ingredient.unit,
        ingredient.preparationMethod || '',
        ingredient.substitutionAllowed || false,
        ingredient.garnishFlag || false,
        ingredient.criticalIngredient || false,
        costContribution,
        index + 1 // Order sequence
      ];
      
      sheet.appendRow(rowData);
    });
    
  } catch (error) {
    console.error('Error creating ingredient relationships:', error);
    throw error;
  }
}

/**
 * Utility Functions
 */

/**
 * Map spreadsheet row to ingredient object
 */
function mapRowToIngredientObject(row, headers) {
  const ingredient = {};
  headers.forEach((header, index) => {
    const fieldName = convertHeaderToFieldName(header);
    ingredient[fieldName] = row[index];
  });
  return ingredient;
}

/**
 * Convert header names to camelCase field names
 */
function convertHeaderToFieldName(header) {
  return header.toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s./g, match => match.charAt(1).toUpperCase())
    .replace(/^\w/, c => c.toLowerCase());
}

/**
 * Convert camelCase field names to header names
 */
function getColumnNameFromField(fieldName) {
  const mapping = {
    'name': 'Name',
    'category': 'Category',
    'subcategory': 'Subcategory',
    'brand': 'Brand',
    'countryOfOrigin': 'Country_of_Origin',
    'spiritsType': 'Spirits_Type',
    'spiritsStyle': 'Spirits_Style',
    'abv': 'ABV',
    'tasteProfile': 'Taste_Profile',
    'bodyStyle': 'Body_Style',
    'sku': 'SKU',
    'sizeVolume': 'Size_Volume',
    'description': 'Description',
    'storageRequirements': 'Storage_Requirements',
    'shelfLifeDays': 'Shelf_Life_Days',
    'costPerUnit': 'Cost_Per_Unit',
    'supplierId': 'Supplier_ID'
  };
  
  return mapping[fieldName] || fieldName;
}

/**
 * Get ingredient by ID
 */
function getIngredientById(ingredientId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enhanced_Ingredients');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const idIndex = headers.indexOf('Ingredient_ID');
    const row = data.find((row, index) => index > 0 && row[idIndex] === ingredientId);
    
    return row ? mapRowToIngredientObject(row, headers) : null;
    
  } catch (error) {
    console.error('Error getting ingredient by ID:', error);
    return null;
  }
}

/**
 * Get recipe by ID
 */
function getRecipe(recipeId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Recipes');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const idIndex = headers.indexOf('Recipe_ID');
    const row = data.find((row, index) => index > 0 && row[idIndex] === recipeId);
    
    return row ? mapRowToRecipeObject(row, headers) : null;
    
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    return null;
  }
}

/**
 * Get recipe ingredients
 */
function getRecipeIngredients(recipeId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Recipe_Ingredients');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const recipeIdIndex = headers.indexOf('Recipe_ID');
    const ingredientRows = data.filter((row, index) => 
      index > 0 && row[recipeIdIndex] === recipeId
    );
    
    return ingredientRows.map(row => mapRowToRelationshipObject(row, headers));
    
  } catch (error) {
    console.error('Error getting recipe ingredients:', error);
    return [];
  }
}

/**
 * Calculate ingredient cost contribution
 */
function calculateIngredientCost(ingredientId, quantity) {
  const ingredient = getIngredientById(ingredientId);
  if (!ingredient || !ingredient.costPerUnit) {
    return 0;
  }
  
  return parseFloat(ingredient.costPerUnit) * parseFloat(quantity);
}

/**
 * Map row to recipe object
 */
function mapRowToRecipeObject(row, headers) {
  const recipe = {};
  headers.forEach((header, index) => {
    const fieldName = convertHeaderToFieldName(header);
    recipe[fieldName] = row[index];
  });
  return recipe;
}

/**
 * Map row to relationship object
 */
function mapRowToRelationshipObject(row, headers) {
  const relationship = {};
  headers.forEach((header, index) => {
    const fieldName = convertHeaderToFieldName(header);
    relationship[fieldName] = row[index];
  });
  return relationship;
}

/**
 * Test function to verify API functionality
 */
function testCoreAPI() {
  console.log('Testing Core API functions...');
  
  try {
    // Test ingredient search
    const vodkaIngredients = getIngredientsByCategory('Vodka');
    console.log(`Found ${vodkaIngredients.length} vodka ingredients`);
    
    // Test ingredient search
    const searchResults = searchIngredients('premium');
    console.log(`Found ${searchResults.length} ingredients matching 'premium'`);
    
    console.log('Core API tests completed successfully');
    return true;
    
  } catch (error) {
    console.error('Core API test failed:', error);
    return false;
  }
}