/*
  =====================================================================================
  API Base URL
  =====================================================================================
*/
const API_BASE = 'http://127.0.0.1:5000';


/*
  Extracts the error message from the API response.
  Handles { message: '...' }, { detail: [...] }, and { validation_error: { body: [...] } } (flask_openapi3 422).
*/
const extractErrorMessage = (data, fallback) => {
  if (data.message) return data.message;
  if (Array.isArray(data.detail)) {
    return data.detail.map(e => e.msg || JSON.stringify(e)).join('\n');
  }
  if (typeof data.detail === 'string') return data.detail;
  if (data.validation_error) {
    const validation = data.validation_error;
    const items = [
      ...(Array.isArray(validation.body) ? validation.body : []),
      ...(Array.isArray(validation.form) ? validation.form : []),
      ...(Array.isArray(validation.body_params) ? validation.body_params : []),
      ...(Array.isArray(validation.query) ? validation.query : []),
      ...(Array.isArray(validation.path) ? validation.path : []),
    ];
    if (items.length) {
      return items.map(e => e.msg || JSON.stringify(e)).join('\n');
    }
  }
  return fallback;
}

/*
  Extracts raw field-level errors from the API response (for field highlighting).
*/
const extractRawDetail = (data) => {
  if (Array.isArray(data.detail)) return data.detail;
  if (data.validation_error) {
    const validation = data.validation_error;
    const items = [
      ...(Array.isArray(validation.body) ? validation.body : []),
      ...(Array.isArray(validation.form) ? validation.form : []),
      ...(Array.isArray(validation.body_params) ? validation.body_params : []),
      ...(Array.isArray(validation.query) ? validation.query : []),
      ...(Array.isArray(validation.path) ? validation.path : []),
    ];
    if (items.length) return items;
  }
  return null;
}


/*
  =====================================================================================
  Initialization — load all data when the page opens
  =====================================================================================
*/
window.addEventListener('load', () => {
  getCustomers();
  getGenerators();
  getAssets();
});


/*
  --------------------------------------------------------------------------------------
  Fetch customer list from the server via GET
  --------------------------------------------------------------------------------------
*/
const getCustomers = async () => {
  fetch(`${API_BASE}/customers`)
    .then((response) => response.json())
    .then((data) => {
      data.customers.forEach(item =>
        insertCustomer(item.customer_id, item.name, item.email, item.tx_id)
      );
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Fetch generator list from the server via GET
  --------------------------------------------------------------------------------------
*/
const getGenerators = async () => {
  fetch(`${API_BASE}/hydrogen-generators`)
    .then((response) => response.json())
    .then((data) => {
      data.generators.forEach(item =>
        insertGenerator(
          item.generator_id,
          item.serial_number,
          item.stack_type,
          item.number_of_cells,
          item.stack_voltage,
          (item.stack_voltage / item.number_of_cells).toFixed(2)
        )
      );
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Fetch asset-link list from the server via GET
  --------------------------------------------------------------------------------------
*/
const getAssets = async () => {
  fetch(`${API_BASE}/assets`)
    .then((response) => response.json())
    .then((data) => {
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
      console.error('Error:', error);
    });
}


/*
  Fetch a single customer by ID via GET /customer.
*/
const getCustomerById = async (customerId) => {
  return fetch(`${API_BASE}/customer?customer_id=${customerId}`)
    .then(async (response) => {
      if (!response.ok) return null;
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
      return null;
    });
}


/*
  Fetch a single generator by serial via GET /hydrogen-generator.
*/
const getGeneratorBySerial = async (serialNumber) => {
  return fetch(`${API_BASE}/hydrogen-generator?serial_number=${encodeURIComponent(serialNumber)}`)
    .then(async (response) => {
      if (!response.ok) return null;
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
      return null;
    });
}


/*
  Fetch a single asset link by ID via GET /asset.
*/
const getAssetById = async (assetId) => {
  return fetch(`${API_BASE}/asset?asset_id=${assetId}`)
    .then(async (response) => {
      if (!response.ok) return null;
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
      return null;
    });
}


/*
  --------------------------------------------------------------------------------------
  Create a new customer on the server via POST
  --------------------------------------------------------------------------------------
*/
const postCustomer = async (name, email, txId) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('tx_id', txId);

  return fetch(`${API_BASE}/customer`, {
    method: 'post',
    body: formData
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return {
          error: true,
          message: extractErrorMessage(data, 'Erro ao cadastrar cliente.'),
          rawDetail: extractRawDetail(data)
        };
      }
      return data;
    })
    .catch((error) => {
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  Create a new generator on the server via POST
  --------------------------------------------------------------------------------------
*/
const postGenerator = async (serial, acquisition, stackType, cells, voltage, current) => {
  const formData = new FormData();
  formData.append('serial_number', serial);
  formData.append('acquisition_type', acquisition);
  formData.append('stack_type', stackType);
  formData.append('number_of_cells', cells);
  formData.append('stack_voltage', voltage);
  formData.append('current_density', current);

  return fetch(`${API_BASE}/hydrogen-generator`, {
    method: 'post',
    body: formData
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return {
          error: true,
          message: extractErrorMessage(data, 'Erro ao cadastrar gerador.'),
          rawDetail: extractRawDetail(data)
        };
      }
      return data;
    })
    .catch((error) => {
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  Create a new customer-generator link on the server via POST
  --------------------------------------------------------------------------------------
*/
const postAsset = async (customerId, generatorId, generatorQtd, installationDate) => {
  const formData = new FormData();
  formData.append('customer_id', customerId);
  formData.append('generator_id', generatorId);
  formData.append('generator_qtd', generatorQtd);
  if (installationDate) {
    formData.append('installation_date', installationDate);
  }

  return fetch(`${API_BASE}/asset`, {
    method: 'post',
    body: formData
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return {
          error: true,
          message: extractErrorMessage(data, 'Erro ao vincular cliente-gerador.'),
          rawDetail: extractRawDetail(data)
        };
      }
      return data;
    })
    .catch((error) => {
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  Delete a customer from the server via DELETE
  --------------------------------------------------------------------------------------
*/
const deleteCustomer = async (id) => {
  return fetch(`${API_BASE}/customer?customer_id=${id}`, { method: 'delete' })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return { error: true, message: extractErrorMessage(data, 'Erro ao excluir cliente.') };
      }
      return data;
    })
    .catch((error) => {
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  Delete a generator from the server via DELETE
  --------------------------------------------------------------------------------------
*/
const deleteGenerator = async (serialNumber) => {
  return fetch(`${API_BASE}/hydrogen-generator?serial_number=${encodeURIComponent(serialNumber)}`, {
    method: 'delete'
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return { error: true, message: extractErrorMessage(data, 'Erro ao excluir gerador.') };
      }
      return data;
    })
    .catch((error) => {
      console.error('Error:', error);
      return { error: true, message: 'Falha na comunicação com o servidor.' };
    });
}


/*
  --------------------------------------------------------------------------------------
  Delete a customer-generator link from the server via DELETE
  --------------------------------------------------------------------------------------
*/
const deleteAsset = async (assetId) => {
  return fetch(`${API_BASE}/asset?asset_id=${assetId}`, { method: 'delete' })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return { error: true, message: extractErrorMessage(data, 'Erro ao excluir v\u00ednculo.') };
      }
      return data;
    })
    .catch((error) => {
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
  Insert a row into the customer table
*/
const insertCustomer = (id, name, email, txId) => {
  const table = document.getElementById('customerTable').getElementsByTagName('tbody')[0];
  const row = table.insertRow();

  row.insertCell(0).textContent = id;
  row.insertCell(1).textContent = name;
  row.insertCell(2).textContent = email;
  row.insertCell(3).textContent = txId;

  const deleteCell = row.insertCell(4);
  deleteCell.className = 'action-column';
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = async () => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      const result = await deleteCustomer(id);
      if (result && result.error) {
        alert(result.message);
      } else {
        row.remove();
        alert('Cliente excluído com sucesso!');
      }
    }
  };
  deleteCell.appendChild(deleteBtn);
}


/*
  Insert a row into the generator table
*/
const insertGenerator = (id, serial, stackType, cells, voltage, vPerCell) => {
  const table = document.getElementById('generatorTable').getElementsByTagName('tbody')[0];
  const row = table.insertRow();

  row.insertCell(0).textContent = id;
  row.insertCell(1).textContent = serial;
  row.insertCell(2).textContent = stackType;
  row.insertCell(3).textContent = cells;
  row.insertCell(4).textContent = voltage;
  row.insertCell(5).textContent = vPerCell;

  const deleteCell = row.insertCell(6);
  deleteCell.className = 'action-column';
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = async () => {
    if (confirm('Deseja realmente excluir este gerador?')) {
      const result = await deleteGenerator(serial);
      if (result && result.error) {
        alert(result.message);
      } else {
        row.remove();
        alert('Gerador excluído com sucesso!');
      }
    }
  };
  deleteCell.appendChild(deleteBtn);
}


/*
  Insert a row into the asset-link table
*/
const insertAsset = (assetId, customerId, generatorId, generatorQtd, installationDate) => {
  const table = document.getElementById('customerGeneratorTable').getElementsByTagName('tbody')[0];
  const row = table.insertRow();

  row.insertCell(0).textContent = assetId;
  row.insertCell(1).textContent = customerId;
  row.insertCell(2).textContent = generatorId;
  row.insertCell(3).textContent = generatorQtd;
  row.insertCell(4).textContent = installationDate
    ? new Date(installationDate).toLocaleDateString('pt-BR')
    : '—';

  const deleteCell = row.insertCell(5);
  deleteCell.className = 'action-column';
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = async () => {
    if (confirm('Deseja realmente excluir este vínculo?')) {
      const result = await deleteAsset(assetId);
      if (result && result.error) {
        alert(result.message);
      } else {
        row.remove();
        alert('Vínculo excluído com sucesso!');
      }
    }
  };
  deleteCell.appendChild(deleteBtn);
}


/*
  =====================================================================================
  UI functions — Create new records (called by form buttons)
  =====================================================================================
*/

/*
  Create a new customer from form fields
*/
const CUSTOMER_FIELDS = ['custName', 'custEmail', 'custTaxId'];

const CUSTOMER_FIELD_MAP = {
  name: 'custName',
  email: 'custEmail',
  tx_id: 'custTaxId',
};

/*
  Validate customer fields one by one.
  - showAlert = false: used before submit
  - showAlert = true: used in generic API-error fallback
*/
const validateCustomerFields = (values, showAlert = false) => {
  // Name is required and must meet minimum length.
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

  // Email is required and must follow a basic valid pattern.
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

  // Tax ID is required and must match the backend format.
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

  return true;
};

const newCustomer = async () => {
  clearFieldErrors(CUSTOMER_FIELDS);

  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const txId = document.getElementById('custTaxId').value.trim();
  const customerValues = { name, email, txId };

  if (!validateCustomerFields(customerValues, false)) return;

  const result = await postCustomer(name, email, txId);
  if (result && result.error) {
    let highlighted = false;
    // 1) Prefer precise field mapping from structured validation payload.
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
    // 2) Fallback: infer field from plain error message content.
    if (!highlighted) {
      for (const [apiName, inputId] of Object.entries(CUSTOMER_FIELD_MAP)) {
        if (result.message && result.message.toLowerCase().includes(apiName.replace(/_/g, ' '))) {
          markFieldError(inputId, result.message);
          highlighted = true;
          break;
        }
      }
    }
    // 3) Last fallback: re-run local validation to point users to a field.
    if (!highlighted) {
      if (!validateCustomerFields(customerValues, true)) return;
      if (!result.message || result.message === 'Erro ao cadastrar cliente.') {
        alert('Não foi possível cadastrar o cliente. Verifique os campos informados.');
        return;
      }
    }
    alert(result.message);
  } else if (result && result.customer_id) {
    clearFieldErrors(CUSTOMER_FIELDS);
    const fetchedCustomer = await getCustomerById(result.customer_id);
    const customerData = fetchedCustomer || result;
    insertCustomer(
      customerData.customer_id,
      customerData.name,
      customerData.email,
      customerData.tx_id
    );
    document.getElementById('customerForm').reset();
    alert('Cliente cadastrado com sucesso!');
  }
}


/*
  Clears visual validation errors for a list of field IDs.
*/
const clearFieldErrors = (fieldIds) => {
  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('input-error');
    const msg = el.parentElement.querySelector('.error-message');
    if (msg) msg.remove();
  });
};

/*
  Marks a field as invalid and appends a short message below it.
*/
const markFieldError = (id, message) => {
  const el = document.getElementById(id);
  el.classList.add('input-error');
  const span = document.createElement('span');
  span.className = 'error-message';
  span.textContent = message;
  el.parentElement.appendChild(span);
};

const GENERATOR_FIELDS = ['newSerial', 'newAcquisition', 'newGenType', 'newCells', 'newVoltage', 'newCurrent'];

// Maps API field names to HTML input IDs
const GENERATOR_FIELD_MAP = {
  serial_number: 'newSerial',
  acquisition_type: 'newAcquisition',
  stack_type: 'newGenType',
  number_of_cells: 'newCells',
  stack_voltage: 'newVoltage',
  current_density: 'newCurrent',
};

const SERIAL_NUMBER_REGEX = /^GEN-\d{4}$/;

/*
  Validates generator fields one by one.
  - showAlert = false: used before submit
  - showAlert = true: used in generic API-error fallback
*/
const validateGeneratorFields = (values, showAlert = false) => {
  // Serial is required and must match GEN-0000.
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

  return true;
};

/*
  Creates a new generator from form fields.
  Sequence: clear errors -> read fields -> validate -> submit -> map API errors.
*/
const newGenerator = async () => {
  clearFieldErrors(GENERATOR_FIELDS);

  const serialInput = document.getElementById('newSerial');
  const serial = serialInput.value.trim().toUpperCase();
  serialInput.value = serial;
  const acquisition = document.getElementById('newAcquisition').value;
  const stackType = document.getElementById('newGenType').value;
  const cells = document.getElementById('newCells').value;
  const voltage = document.getElementById('newVoltage').value;
  const current = document.getElementById('newCurrent').value;
  const generatorValues = { serial, acquisition, stackType, cells, voltage, current };

  if (!validateGeneratorFields(generatorValues, false)) return;

  const result = await postGenerator(serial, acquisition, stackType, cells, voltage, current);
  if (result && result.error) {
    // Try to highlight the specific field from API validation errors
    let highlighted = false;
    // 1) Prefer precise field mapping from structured validation payload.
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
    // 2) Fallback: infer field from plain error message content.
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
    // 3) Last fallback: re-run local validation to point users to a field.
    if (!highlighted) {
      if (!validateGeneratorFields(generatorValues, true)) return;
      if (!result.message || result.message === 'Erro ao cadastrar gerador.') {
        alert('Não foi possível cadastrar o gerador. Verifique os campos informados.');
        return;
      }
    }
    alert(result.message);
  } else if (result && result.generator_id) {
    const fetchedGenerator = await getGeneratorBySerial(result.serial_number);
    const generatorData = fetchedGenerator || result;
    insertGenerator(
      generatorData.generator_id,
      generatorData.serial_number,
      generatorData.stack_type,
      generatorData.number_of_cells,
      generatorData.stack_voltage,
      (generatorData.stack_voltage / generatorData.number_of_cells).toFixed(2)
    );
    document.getElementById('generatorForm').reset();
    alert('Gerador cadastrado com sucesso!');
  }
}


/*
  Create a new customer-generator link from form fields
*/
const ASSET_FIELDS = ['cgCustomerId', 'cgGeneratorId', 'cgGeneratorQtd', 'cgInstallationDate'];

const ASSET_FIELD_MAP = {
  customer_id: 'cgCustomerId',
  generator_id: 'cgGeneratorId',
  generator_qtd: 'cgGeneratorQtd',
  installation_date: 'cgInstallationDate',
};

const newCustomerGenerator = async () => {
  clearFieldErrors(ASSET_FIELDS);

  const customerId = document.getElementById('cgCustomerId').value;
  const generatorId = document.getElementById('cgGeneratorId').value;
  const generatorQtd = document.getElementById('cgGeneratorQtd').value;
  const installationDate = document.getElementById('cgInstallationDate').value;

  let hasError = false;

  // Validate required relation IDs and quantity before submit.
  if (!customerId || Number(customerId) <= 0) { markFieldError('cgCustomerId', 'Informe o ID do cliente.'); hasError = true; }
  if (!generatorId || Number(generatorId) <= 0) { markFieldError('cgGeneratorId', 'Informe o ID do gerador.'); hasError = true; }
  if (!generatorQtd || Number(generatorQtd) <= 0) { markFieldError('cgGeneratorQtd', 'Informe uma quantidade válida.'); hasError = true; }

  if (hasError) return;

  const result = await postAsset(customerId, generatorId, generatorQtd, installationDate);
  if (result && result.error) {
    let highlighted = false;
    // 1) Prefer precise field mapping from structured validation payload.
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
    // 2) Fallback: infer field from plain error message content.
    if (!highlighted) {
      for (const [apiName, inputId] of Object.entries(ASSET_FIELD_MAP)) {
        if (result.message && result.message.toLowerCase().includes(apiName.replace(/_/g, ' '))) {
          markFieldError(inputId, result.message);
          highlighted = true;
          break;
        }
      }
    }
    alert(result.message);
  } else if (result && result.asset_id) {
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
    document.getElementById('customerGeneratorForm').reset();
    alert('Vínculo cadastrado com sucesso!');
  }
}