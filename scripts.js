// ===============================
// Constants & Utility Functions
// ===============================

// API base URL
// The base URL for all API requests
const API_BASE = 'http://127.0.0.1:5000';


// clearTableRows: Removes all rows from the tbody of a table by its ID
function clearTableRows(tableId) {
  // Get the table element by its ID
  const table = document.getElementById(tableId);
  // Check if the table and its tbody exist
  if (table && table.tBodies && table.tBodies[0]) {
    // Clear the tbody content (removes all rows)
    table.tBodies[0].innerHTML = '';
  }
}

// extractErrorMessage: Extracts a user-friendly error message from an API response
const extractErrorMessage = (data, fallback) => {
  // If the response has a 'message' property, return it
  if (data.message) return data.message;
  // If 'detail' is an array, join all messages
  if (Array.isArray(data.detail)) {
    return data.detail.map(e => e.msg || JSON.stringify(e)).join('\n');
  }
  // If 'detail' is a string, return it
  if (typeof data.detail === 'string') return data.detail;
  // If 'validation_error' exists, extract all error messages from possible locations
  if (data.validation_error) {
    const validation = data.validation_error; // Get the validation_error object
    const items = [
      ...(Array.isArray(validation.body) ? validation.body : []), // Errors in body
      ...(Array.isArray(validation.form) ? validation.form : []), // Errors in form
      ...(Array.isArray(validation.body_params) ? validation.body_params : []), // Errors in body_params
      ...(Array.isArray(validation.query) ? validation.query : []), // Errors in query
      ...(Array.isArray(validation.path) ? validation.path : []), // Errors in path
    ];
    // If there are any error items, join their messages
    if (items.length) {
      return items.map(e => e.msg || JSON.stringify(e)).join('\n');
    }
  }
  // If nothing found, return the fallback message
  return fallback;
}

// extractRawDetail: Extracts raw field-level validation errors from an API response
// Used to highlight specific form fields that failed validation
const extractRawDetail = (data) => {
  // If 'detail' is an array, return it directly (common error format)
  if (Array.isArray(data.detail)) return data.detail;
  // If 'validation_error' exists, collect all possible error arrays
  if (data.validation_error) {
    const validation = data.validation_error; // Get the validation_error object
    const items = [
      ...(Array.isArray(validation.body) ? validation.body : []), // Errors in body
      ...(Array.isArray(validation.form) ? validation.form : []), // Errors in form
      ...(Array.isArray(validation.body_params) ? validation.body_params : []), // Errors in body_params
      ...(Array.isArray(validation.query) ? validation.query : []), // Errors in query
      ...(Array.isArray(validation.path) ? validation.path : []), // Errors in path
    ];
    // If there are any error items, return them
    if (items.length) return items;
  }
  // If no errors found, return null
  return null;
}


// searchCustomerRecord: Searches and displays a customer by ID (used by the Buscar button)
function searchCustomerRecord() {
  // Get the input element for customer ID
  const idInput = document.getElementById('searchCustomerId');
  // Parse the input value as an integer, or null if not present
  const customerId = idInput && idInput.value ? parseInt(idInput.value, 10) : null;
  // Clear the customer table before displaying results
  clearTableRows('customerTable');
  // If the ID is invalid, show an alert and stop
  if (!customerId || customerId <= 0) {
    alert('Informe um ID de cliente válido para buscar.');
    return;
  }
  // Fetch the customer by ID from the backend
  getCustomerById(customerId).then(data => {
    // If a customer is found, insert it into the table
    if (data && data.customer_id) {
      insertCustomer(data.customer_id, data.name, data.email, data.tx_id);
    } else {
      // If not found, show an alert
      alert('Cliente não encontrado.');
    }
  }).catch(() => {
    // If an error occurs, show an alert
    alert('Erro ao buscar cliente.');
  });
}

// searchGeneratorRecord: Searches and displays a generator by serial number (used by the Buscar button)
function searchGeneratorRecord() {
  // Get the input element for generator serial number
  const serialInput = document.getElementById('searchGeneratorSerial');
  // Get the serial value, trim and convert to uppercase
  const serial = serialInput && serialInput.value ? serialInput.value.trim().toUpperCase() : null;
  // Clear the generator table before displaying results
  clearTableRows('generatorTable');
  // If the serial is invalid, show an alert and stop
  if (!serial) {
    alert('Informe um nº de série válido para buscar.');
    return;
  }
  // Fetch the generator by serial from the backend
  getGeneratorBySerial(serial).then(data => {
    // If a generator is found, insert it into the table
    if (data && data.generator_id) {
      insertGenerator(
        data.generator_id,
        data.serial_number,
        data.acquisition_type,
        data.stack_type,
        data.number_of_cells,
        data.stack_voltage,
        data.current_density,
        (data.stack_voltage / data.number_of_cells).toFixed(2)
      );
    } else {
      // If not found, show an alert
      alert('Gerador não encontrado.');
    }
  }).catch(() => {
    // If an error occurs, show an alert
    alert('Erro ao buscar gerador.');
  });
}

// searchAssetRecord: Searches and displays a customer-generator link (vínculo) by asset ID (used by the Buscar button)
function searchAssetRecord() {
  // Get the input element for asset ID
  const assetInput = document.getElementById('searchAssetId');
  // Parse the input value as an integer, or null if not present
  const assetId = assetInput && assetInput.value ? parseInt(assetInput.value, 10) : null;
  // Clear the asset table before displaying results
  clearTableRows('customerGeneratorTable');
  // If the asset ID is invalid, show an alert and stop
  if (!assetId || assetId <= 0) {
    alert('Informe um ID de vínculo válido para buscar.');
    return;
  }
  // Fetch the asset by ID from the backend
  getAssetById(assetId).then(data => {
    // If an asset is found, insert it into the table
    if (data && data.asset_id) {
      insertAsset(
        data.asset_id,
        data.customer_id,
        data.generator_id,
        data.generator_qtd,
        data.installation_date
      );
    } else {
      // If not found, show an alert
      alert('Vínculo não encontrado.');
    }
  }).catch(() => {
    // If an error occurs, show an alert
    alert('Erro ao buscar vínculo.');
  });
}

// ===============================
// Initialization (Page Load)
// ===============================

// When the page loads, fetch and display all customers, generators, and assets
window.addEventListener('load', () => {
  // Fetch and display all customers
  getCustomers();
  // Fetch and display all generators
  getGenerators();
  // Fetch and display all assets (customer-generator links)
  getAssets();
});


/*
  --------------------------------------------------------------------------------------
  getCustomers: Fetch customer list from the server via GET
  --------------------------------------------------------------------------------------
*/
const getCustomers = async () => {
  // Clear the customer table before loading new data
  document.getElementById('customerTable').getElementsByTagName('tbody')[0].innerHTML = '';
  // Fetch the list of customers from the API
  fetch(`${API_BASE}/customers`)
    .then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
      // For each customer, insert a row into the table
      data.customers.forEach(item =>
        insertCustomer(item.customer_id, item.name, item.email, item.tx_id)
      );
    })
    .catch((error) => {
      // Log any errors to the console
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  getGenerators: Fetch generator list from the server via GET
  --------------------------------------------------------------------------------------
*/
const getGenerators = async () => {
  // Clear the generator table before loading new data
  clearTableRows('generatorTable');
  // Fetch the list of generators from the API
  fetch(`${API_BASE}/hydrogen-generators`)
    .then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
      // For each generator, insert a row into the table
      data.generators.forEach(item =>
        insertGenerator(
          item.generator_id,
          item.serial_number,
          item.acquisition_type,
          item.stack_type,
          item.number_of_cells,
          item.stack_voltage,
          item.current_density,
          (item.stack_voltage / item.number_of_cells).toFixed(2)
        )
      );
    })
    .catch((error) => {
      // Log any errors to the console
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  getAssets: Fetch asset-link list from the server via GET
  --------------------------------------------------------------------------------------
*/
const getAssets = async () => {
  // Clear the asset-link table before loading new data
  clearTableRows('customerGeneratorTable');
  // Fetch the list of asset links from the API
  fetch(`${API_BASE}/assets`)
    .then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
      // For each asset, insert a row into the table
      data.assets.forEach(item =>
        insertAsset(
          item.asset_id,
          item.customer_id,
          item.generator_id,
          item.generator_qtd,
          item.installation_date
        )
      );
    })
    .catch((error) => {
      // Log any errors to the console
      console.error('Error:', error);
    });
}


/*
  getCustomerById: Fetch a single customer by ID via GET /customer.
*/
const getCustomerById = async (customerId) => {
  // Send a GET request to fetch a customer by ID
  return fetch(`${API_BASE}/customer?customer_id=${customerId}`)
    .then(async (response) => {
      // If the response is not OK, return null
      if (!response.ok) return null;
      // Parse and return the response as JSON
      return response.json();
    })
    .catch((error) => {
      // Log any errors and return null
      console.error('Error:', error);
      return null;
    });
}


/*
  getGeneratorBySerial: Fetch a single generator by serial via GET /hydrogen-generator.
*/
const getGeneratorBySerial = async (serialNumber) => {
  // Send a GET request to fetch a generator by serial number
  return fetch(`${API_BASE}/hydrogen-generator?serial_number=${encodeURIComponent(serialNumber)}`)
    .then(async (response) => {
      // If the response is not OK, return null
      if (!response.ok) return null;
      // Parse and return the response as JSON
      return response.json();
    })
    .catch((error) => {
      // Log any errors and return null
      console.error('Error:', error);
      return null;
    });
}


/*
  getAssetById: Fetch a single asset link by ID via GET /asset.
*/
const getAssetById = async (assetId) => {
  // Send a GET request to fetch an asset by ID
  return fetch(`${API_BASE}/asset?asset_id=${assetId}`)
    .then(async (response) => {
      // If the response is not OK, return null
      if (!response.ok) return null;
      // Parse and return the response as JSON
      return response.json();
    })
    .catch((error) => {
      // Log any errors and return null
      console.error('Error:', error);
      return null;
    });
}


/*
  --------------------------------------------------------------------------------------
  postCustomer: Create a new customer on the server via POST
  --------------------------------------------------------------------------------------
*/
const postCustomer = async (name, email, txId) => {
  // Create a FormData object to send form fields
  const formData = new FormData();
  // Append the name field
  formData.append('name', name);
  // Append the email field
  formData.append('email', email);
  // Append the tax ID field
  formData.append('tx_id', txId);

  // Send a POST request to create a new customer
  return fetch(`${API_BASE}/customer`, {
    method: 'post',
    body: formData
  })
    .then(async (response) => {
      // Parse the response as JSON
      const data = await response.json();
      // If the response is not OK, return an error object with details
      if (!response.ok) {
        return {
          error: true,
          message: extractErrorMessage(data, 'Erro ao cadastrar cliente.'),
          rawDetail: extractRawDetail(data)
        };
      }
      // If successful, return the data
      return data;
    })
    .catch((error) => {
      // Log any errors and return a generic error object
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  postGenerator: Create a new generator on the server via POST
  --------------------------------------------------------------------------------------
*/
const postGenerator = async (serial, acquisition, stackType, cells, voltage, current) => {
  // Create a FormData object to send form fields
  const formData = new FormData();
  // Append the serial number field
  formData.append('serial_number', serial);
  // Append the acquisition type field
  formData.append('acquisition_type', acquisition);
  // Append the stack type field
  formData.append('stack_type', stackType);
  // Append the number of cells field
  formData.append('number_of_cells', cells);
  // Append the stack voltage field
  formData.append('stack_voltage', voltage);
  // Append the current density field
  formData.append('current_density', current);

  // Send a POST request to create a new generator
  return fetch(`${API_BASE}/hydrogen-generator`, {
    method: 'post',
    body: formData
  })
    .then(async (response) => {
      // Parse the response as JSON
      const data = await response.json();
      // If the response is not OK, return an error object with details
      if (!response.ok) {
        return {
          error: true,
          message: extractErrorMessage(data, 'Erro ao cadastrar gerador.'),
          rawDetail: extractRawDetail(data)
        };
      }
      // If successful, return the data
      return data;
    })
    .catch((error) => {
      // Log any errors and return a generic error object
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  postAsset: Create a new customer-generator link on the server via POST
  --------------------------------------------------------------------------------------
*/
const postAsset = async (customerId, generatorId, generatorQtd, installationDate) => {
  // Create a FormData object to send form fields
  const formData = new FormData();
  // Append the customer ID field
  formData.append('customer_id', customerId);
  // Append the generator ID field
  formData.append('generator_id', generatorId);
  // Append the generator quantity field
  formData.append('generator_qtd', generatorQtd);
  // If installation date is provided, append it
  if (installationDate) {
    formData.append('installation_date', installationDate);
  }

  // Send a POST request to create a new asset link
  return fetch(`${API_BASE}/asset`, {
    method: 'post',
    body: formData
  })
    .then(async (response) => {
      // Parse the response as JSON
      const data = await response.json();
      // If the response is not OK, return an error object with details
      if (!response.ok) {
        return {
          error: true,
          message: extractErrorMessage(data, 'Erro ao vincular cliente-gerador.'),
          rawDetail: extractRawDetail(data)
        };
      }
      // If successful, return the data
      return data;
    })
    .catch((error) => {
      // Log any errors and return a generic error object
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  deleteCustomer: Delete a customer from the server via DELETE
  --------------------------------------------------------------------------------------
*/
const deleteCustomer = async (id) => {
  // Send a DELETE request to remove a customer by ID
  return fetch(`${API_BASE}/customer?customer_id=${id}`, { method: 'delete' })
    .then(async (response) => {
      // Parse the response as JSON
      const data = await response.json();
      // If the response is not OK, return an error object with details
      if (!response.ok) {
        return { error: true, message: extractErrorMessage(data, 'Erro ao excluir cliente.') };
      }
      // If successful, return the data
      return data;
    })
    .catch((error) => {
      // Log any errors and return a generic error object
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  deleteGenerator: Delete a generator from the server via DELETE
  --------------------------------------------------------------------------------------
*/
const deleteGenerator = async (serialNumber) => {
  // Send a DELETE request to remove a generator by serial number
  return fetch(`${API_BASE}/hydrogen-generator?serial_number=${encodeURIComponent(serialNumber)}`, {
    method: 'delete'
  })
    .then(async (response) => {
      // Parse the response as JSON
      const data = await response.json();
      // If the response is not OK, return an error object with details
      if (!response.ok) {
        return { error: true, message: extractErrorMessage(data, 'Erro ao excluir gerador.') };
      }
      // If successful, return the data
      return data;
    })
    .catch((error) => {
      // Log any errors and return a generic error object
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  deleteAsset: Delete a customer-generator link from the server via DELETE
  --------------------------------------------------------------------------------------
*/
const deleteAsset = async (assetId) => {
  // Send a DELETE request to remove an asset by ID
  return fetch(`${API_BASE}/asset?asset_id=${assetId}`, { method: 'delete' })
    .then(async (response) => {
      // Parse the response as JSON
      const data = await response.json();
      // If the response is not OK, return an error object with details
      if (!response.ok) {
        return { error: true, message: extractErrorMessage(data, 'Erro ao excluir v\u00ednculo.') };
      }
      // If successful, return the data
      return data;
    })
    .catch((error) => {
      // Log any errors and return a generic error object
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  =====================================================================================
  UI functions — Insert rows into tables
  =====================================================================================
*/

/*
  insertCustomer: Insert a row into the customer table
*/
const insertCustomer = (id, name, email, txId) => {
  // Get the tbody of the customer table
  const table = document.getElementById('customerTable').getElementsByTagName('tbody')[0];
  // Insert a new row at the end of the table
  const row = table.insertRow();

  // Insert cells for each customer field
  row.insertCell(0).textContent = id;
  row.insertCell(1).textContent = name;
  row.insertCell(2).textContent = email;
  row.insertCell(3).textContent = txId;

  // Insert the delete button cell
  const deleteCell = row.insertCell(4);
  deleteCell.className = 'action-column';
  // Create the delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'delete-btn';
  deleteBtn.title = 'Click to delete the item from database';
  // Set the click handler for the delete button
  deleteBtn.onclick = async () => {
    // Confirm before deleting
    if (confirm('Deseja realmente excluir este cliente?')) {
      // Call the deleteCustomer function
      const result = await deleteCustomer(id);
      // If there was an error, show an alert
      if (result && result.error) {
        alert(result.message);
      } else {
        // Remove the row from the table
        row.remove();
        alert('Cliente excluído com sucesso!');
      }
    }
  };
  // Add the delete button to the cell
  deleteCell.appendChild(deleteBtn);
}


/*
  insertGenerator: Insert a row into the generator table
*/
const insertGenerator = (id, serial, acquisitionType, stackType, cells, voltage, currentDensity, vPerCell) => {
  // Get the tbody of the generator table
  const table = document.getElementById('generatorTable').getElementsByTagName('tbody')[0];
  // Insert a new row at the end of the table
  const row = table.insertRow();

  // Insert cells for each generator field
  row.insertCell(0).textContent = id;
  row.insertCell(1).textContent = serial;
  row.insertCell(2).textContent = acquisitionType;
  row.insertCell(3).textContent = stackType;
  row.insertCell(4).textContent = cells;
  row.insertCell(5).textContent = voltage;
  row.insertCell(6).textContent = currentDensity;
  row.insertCell(7).textContent = vPerCell;

  // Insert the delete button cell
  const deleteCell = row.insertCell(8);
  deleteCell.className = 'action-column';
  // Create the delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'delete-btn';
  deleteBtn.title = 'Click to delete the item from database';
  // Set the click handler for the delete button
  deleteBtn.onclick = async () => {
    // Confirm before deleting
    if (confirm('Deseja realmente excluir este gerador?')) {
      // Call the deleteGenerator function
      const result = await deleteGenerator(serial);
      // If there was an error, show an alert
      if (result && result.error) {
        alert(result.message);
      } else {
        // Remove the row from the table
        row.remove();
        alert('Gerador excluído com sucesso!');
      }
    }
  };
  // Add the delete button to the cell
  deleteCell.appendChild(deleteBtn);
}


/*
  insertAsset: Insert a row into the asset-link table
*/
const insertAsset = (assetId, customerId, generatorId, generatorQtd, installationDate) => {
  // Get the tbody of the asset-link table
  const table = document.getElementById('customerGeneratorTable').getElementsByTagName('tbody')[0];
  // Insert a new row at the end of the table
  const row = table.insertRow();

  // Insert cells for each asset field
  row.insertCell(0).textContent = assetId;
  row.insertCell(1).textContent = customerId;
  row.insertCell(2).textContent = generatorId;
  row.insertCell(3).textContent = generatorQtd;
  // Format the installation date or show a dash if missing
  row.insertCell(4).textContent = installationDate
    ? new Date(installationDate).toLocaleDateString('pt-BR')
    : '—';

  // Insert the delete button cell
  const deleteCell = row.insertCell(5);
  deleteCell.className = 'action-column';
  // Create the delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'delete-btn';
  deleteBtn.title = 'Click to delete the item from database';
  // Set the click handler for the delete button
  deleteBtn.onclick = async () => {
    // Confirm before deleting
    if (confirm('Deseja realmente excluir este vínculo?')) {
      // Call the deleteAsset function
      const result = await deleteAsset(assetId);
      // If there was an error, show an alert
      if (result && result.error) {
        alert(result.message);
      } else {
        // Remove the row from the table
        row.remove();
        alert('Vínculo excluído com sucesso!');
      }
    }
  };
  // Add the delete button to the cell
  deleteCell.appendChild(deleteBtn);
}


/*
  =====================================================================================
  UI functions — Create new records (called by form buttons)
  =====================================================================================
*/

// List of input IDs for customer form
const CUSTOMER_FIELDS = ['custName', 'custEmail', 'custTaxId'];

// Map API field names to input IDs
const CUSTOMER_FIELD_MAP = {
  name: 'custName',
  email: 'custEmail',
  tx_id: 'custTaxId',
};

// Check if customer form fields are valid
// showAlert: if true, show alert for invalid fields
const validateCustomerFields = (values, showAlert = false) => {
  // Name is required and must be at least 2 characters
  if (!values.name) {
    markFieldError('custName', 'Informe o nome/empresa.');
    if (showAlert) alert('Verifique o campo Nome/Empresa.');
    return false;
  }
  if (values.name.length < 2) {
    markFieldError('custName', 'O nome deve ter pelo menos 2 caracteres.');
    if (showAlert) alert('Verifique o campo Nome/Empresa.');
    return false;
  }
  // Email is required and must look like an email
  if (!values.email) {
    markFieldError('custEmail', 'Informe o e-mail.');
    if (showAlert) alert('Verifique o campo E-mail.');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    markFieldError('custEmail', 'Formato de e-mail inválido.');
    if (showAlert) alert('Verifique o campo E-mail.');
    return false;
  }
  // Tax ID is required and must match 000-00-0000
  if (!values.txId) {
    markFieldError('custTaxId', 'Informe o Tax ID.');
    if (showAlert) alert('Verifique o campo Tax ID.');
    return false;
  }
  if (!/^\d{3}-\d{2}-\d{4}$/.test(values.txId)) {
    markFieldError('custTaxId', 'O Tax ID deve seguir o formato 000-00-0000.');
    if (showAlert) alert('Verifique o campo Tax ID. Formato esperado: 000-00-0000.');
    return false;
  }
  // All fields are valid
  return true;
};

// Create a new customer from the form
const newCustomer = async () => {
  // Clear any previous field errors
  clearFieldErrors(CUSTOMER_FIELDS);

  // Read values from form fields
  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const txId = document.getElementById('custTaxId').value.trim();
  const customerValues = { name, email, txId };
  // Validate before sending
  if (!validateCustomerFields(customerValues, false)) return;
  // Send to backend
  const result = await postCustomer(name, email, txId);
  if (result && result.error) {
    let highlighted = false;
    // Try to highlight the field with error from backend
    if (result.rawDetail && Array.isArray(result.rawDetail)) {
      result.rawDetail.forEach(err => {
        const loc = err.loc || [];
        const fieldName = loc.find(l => CUSTOMER_FIELD_MAP[l]);
        if (fieldName) {
          markFieldError(CUSTOMER_FIELD_MAP[fieldName], err.msg || 'Valor inválido.');
          highlighted = true;
        }
      });
    }
    // If not, try to guess from error message
    if (!highlighted) {
      for (const [apiName, inputId] of Object.entries(CUSTOMER_FIELD_MAP)) {
        if (result.message && result.message.toLowerCase().includes(apiName.replace(/_/g, ' '))) {
          markFieldError(inputId, result.message);
          highlighted = true;
          break;
        }
      }
    }
    // If still not, run local validation to show a field
    if (!highlighted) {
      if (!validateCustomerFields(customerValues, true)) return;
      if (!result.message || result.message === 'Erro ao cadastrar cliente.') {
        alert('Não foi possível cadastrar o cliente. Verifique os campos informados.');
        return;
      }
    }
    // Show the error message
    alert(result.message);
  } else if (result && result.customer_id) {
    // Success: add to table and reset form
    clearFieldErrors(CUSTOMER_FIELDS);
    const fetchedCustomer = await getCustomerById(result.customer_id);
    const customerData = fetchedCustomer || result;
    insertCustomer(
      customerData.customer_id,
      customerData.name,
      customerData.email,
      customerData.tx_id
    );
    // Reset the form
    document.getElementById('customerForm').reset();
    alert('Cliente cadastrado com sucesso!');
  }
}


// Remove error styles and messages from a list of fields
const clearFieldErrors = (fieldIds) => {
  // For each field ID, remove error styling and message
  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('input-error');
    const msg = el.parentElement.querySelector('.error-message');
    if (msg) msg.remove();
  });
};

// Show an error message below a field and highlight it
const markFieldError = (id, message) => {
  // Get the input element by ID
  const el = document.getElementById(id);
  // Add error styling
  el.classList.add('input-error');
  // Create a span for the error message
  const span = document.createElement('span');
  span.className = 'error-message';
  span.textContent = message;
  // Append the error message below the input
  el.parentElement.appendChild(span);
};

// List of input IDs for generator form
const GENERATOR_FIELDS = ['newSerial', 'newAcquisition', 'newGenType', 'newCells', 'newVoltage', 'newCurrent'];

// Map API field names to input IDs
const GENERATOR_FIELD_MAP = {
  serial_number: 'newSerial',
  acquisition_type: 'newAcquisition',
  stack_type: 'newGenType',
  number_of_cells: 'newCells',
  stack_voltage: 'newVoltage',
  current_density: 'newCurrent',
};

// Regex to check serial number format
const SERIAL_NUMBER_REGEX = /^GEN-\d{4}$/;

// Check if generator form fields are valid
const validateGeneratorFields = (values, showAlert = false) => {
  // Serial is required and must match GEN-0000
  if (!values.serial) {
    markFieldError('newSerial', 'Informe o nº de série.');
    if (showAlert) alert('Verifique o campo Nº de Série.');
    return false;
  }
  if (!SERIAL_NUMBER_REGEX.test(values.serial)) {
    markFieldError('newSerial', 'O nº de série deve seguir o formato GEN-0000 (ex: GEN-0001).');
    if (showAlert) alert('Verifique o campo Nº de Série. Formato esperado: GEN-0000 (ex: GEN-0001).');
    return false;
  }
  if (values.serial.length > 50) {
    markFieldError('newSerial', 'O nº de série deve ter no máximo 50 caracteres.');
    if (showAlert) alert('Verifique o campo Nº de Série.');
    return false;
  }

  // Dropdown selections are mandatory and must map to allowed enums.
  if (!values.acquisition) {
    markFieldError('newAcquisition', 'Selecione o tipo de aquisição.');
    if (showAlert) alert('Verifique o campo Tipo de Aquisição.');
    return false;
  }

  if (!values.stackType) {
    markFieldError('newGenType', 'Selecione o tipo do gerador.');
    if (showAlert) alert('Verifique o campo Tipo do Gerador.');
    return false;
  }

  // Numeric constraints mirror backend schema limits.
  if (!values.cells || Number(values.cells) <= 0) {
    markFieldError('newCells', 'A quantidade de células deve ser maior que zero.');
    if (showAlert) alert('Verifique o campo Qtd Células.');
    return false;
  }
  if (Number(values.cells) > 5000) {
    markFieldError('newCells', 'A quantidade de células não pode exceder 5.000.');
    if (showAlert) alert('Verifique o campo Qtd Células.');
    return false;
  }
  // Voltage must be > 0 and <= 2000
  if (!values.voltage || Number(values.voltage) <= 0) {
    markFieldError('newVoltage', 'A tensão deve ser maior que zero.');
    if (showAlert) alert('Verifique o campo Stack (Voltage).');
    return false;
  }
  if (Number(values.voltage) > 2000) {
    markFieldError('newVoltage', 'A tensão não pode exceder 2.000 V.');
    if (showAlert) alert('Verifique o campo Stack (Voltage).');
    return false;
  }
  // Current must be > 0 and <= 5000
  if (!values.current || Number(values.current) <= 0) {
    markFieldError('newCurrent', 'A densidade de corrente deve ser maior que zero.');
    if (showAlert) alert('Verifique o campo Densidade Corrente.');
    return false;
  }
  if (Number(values.current) > 5000) {
    markFieldError('newCurrent', 'A densidade de corrente não pode exceder 5.000 A/cm².');
    if (showAlert) alert('Verifique o campo Densidade Corrente.');
    return false;
  }
  // All fields are valid
  return true;
};

/*
  newGenerator: Creates a new generator from form fields.
  Sequence: clear errors -> read fields -> validate -> submit -> map API errors.
*/
const newGenerator = async () => {
  clearFieldErrors(GENERATOR_FIELDS);
  // Get values from form
  const serialInput = document.getElementById('newSerial');
  const serial = serialInput.value.trim().toUpperCase();
  serialInput.value = serial;
  const acquisition = document.getElementById('newAcquisition').value;
  const stackType = document.getElementById('newGenType').value;
  const cells = document.getElementById('newCells').value;
  const voltage = document.getElementById('newVoltage').value;
  const current = document.getElementById('newCurrent').value;
  const generatorValues = { serial, acquisition, stackType, cells, voltage, current };
  // Validate before sending
  if (!validateGeneratorFields(generatorValues, false)) return;
  // Send to backend
  const result = await postGenerator(serial, acquisition, stackType, cells, voltage, current);
  if (result && result.error) {
    // Try to highlight the specific field from API validation errors
    let highlighted = false;
    // Try to highlight the field with error from backend
    if (result.rawDetail && Array.isArray(result.rawDetail)) {
      result.rawDetail.forEach(err => {
        const loc = err.loc || [];
        const fieldName = loc.find(l => GENERATOR_FIELD_MAP[l]);
        if (fieldName) {
          markFieldError(GENERATOR_FIELD_MAP[fieldName], err.msg || 'Valor inválido.');
          highlighted = true;
        }
      });
    }
    // If not, try to guess from error message
    if (!highlighted) {
      // Check if message mentions a known field
      for (const [apiName, inputId] of Object.entries(GENERATOR_FIELD_MAP)) {
        if (result.message && result.message.toLowerCase().includes(apiName.replace(/_/g, ' '))) {
          markFieldError(inputId, result.message);
          highlighted = true;
          break;
        }
      }
    }
    // If still not, run local validation to show a field
    if (!highlighted) {
      if (!validateGeneratorFields(generatorValues, true)) return;
      if (!result.message || result.message === 'Erro ao cadastrar gerador.') {
        alert('Não foi possível cadastrar o gerador. Verifique os campos informados.');
        return;
      }
    }
    // Show the error message
    alert(result.message);
  } else if (result && result.generator_id) {
    // Success: add to table and reset form
    const fetchedGenerator = await getGeneratorBySerial(result.serial_number);
    const generatorData = fetchedGenerator || result;
    insertGenerator(
      generatorData.generator_id,
      generatorData.serial_number,
      generatorData.acquisition_type,
      generatorData.stack_type,
      generatorData.number_of_cells,
      generatorData.stack_voltage,
      generatorData.current_density,
      (generatorData.stack_voltage / generatorData.number_of_cells).toFixed(2)
    );
    // Reset the form
    document.getElementById('generatorForm').reset();
    alert('Gerador cadastrado com sucesso!');
  }
}


// List of input IDs for asset form
const ASSET_FIELDS = ['cgCustomerId', 'cgGeneratorId', 'cgGeneratorQtd', 'cgInstallationDate'];

// Map API field names to input IDs
const ASSET_FIELD_MAP = {
  customer_id: 'cgCustomerId',
  generator_id: 'cgGeneratorId',
  generator_qtd: 'cgGeneratorQtd',
  installation_date: 'cgInstallationDate',
};

// Create a new asset link from the form
const newCustomerGenerator = async () => {
  // Clear any previous field errors
  clearFieldErrors(ASSET_FIELDS);
  // Get values from form
  const customerId = document.getElementById('cgCustomerId').value;
  const generatorId = document.getElementById('cgGeneratorId').value;
  const generatorQtd = document.getElementById('cgGeneratorQtd').value;
  const installationDate = document.getElementById('cgInstallationDate').value;
  let hasError = false;
  // Check required fields
  if (!customerId || Number(customerId) <= 0) { markFieldError('cgCustomerId', 'Informe o ID do cliente.'); hasError = true; }
  if (!generatorId || Number(generatorId) <= 0) { markFieldError('cgGeneratorId', 'Informe o ID do gerador.'); hasError = true; }
  if (!generatorQtd || Number(generatorQtd) <= 0) { markFieldError('cgGeneratorQtd', 'Informe uma quantidade válida.'); hasError = true; }

  // If any validation failed, stop
  if (hasError) return;
  // Send to backend
  const result = await postAsset(customerId, generatorId, generatorQtd, installationDate);
  if (result && result.error) {
    let highlighted = false;
    // Try to highlight the field with error from backend
    if (result.rawDetail && Array.isArray(result.rawDetail)) {
      result.rawDetail.forEach(err => {
        const loc = err.loc || [];
        const fieldName = loc.find(l => ASSET_FIELD_MAP[l]);
        if (fieldName) {
          markFieldError(ASSET_FIELD_MAP[fieldName], err.msg || 'Valor inválido.');
          highlighted = true;
        }
      });
    }
    // If not, try to guess from error message
    if (!highlighted) {
      for (const [apiName, inputId] of Object.entries(ASSET_FIELD_MAP)) {
        if (result.message && result.message.toLowerCase().includes(apiName.replace(/_/g, ' '))) {
          markFieldError(inputId, result.message);
          highlighted = true;
          break;
        }
      }
    }
    // Show the error message
    alert(result.message);
  } else if (result && result.asset_id) {
    // Success: add to table and reset form
    clearFieldErrors(ASSET_FIELDS);
    const fetchedAsset = await getAssetById(result.asset_id);
    const assetData = fetchedAsset || result;
    insertAsset(
      assetData.asset_id,
      assetData.customer_id,
      assetData.generator_id,
      assetData.generator_qtd,
      assetData.installation_date
    );
    // Reset the form
    document.getElementById('customerGeneratorForm').reset();
    alert('Vínculo cadastrado com sucesso!');
  }
}