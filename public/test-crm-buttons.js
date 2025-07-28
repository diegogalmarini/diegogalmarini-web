// Script de diagnóstico para probar botones de CRM
console.log('🔧 Script de diagnóstico de botones CRM cargado');

// Función para simular click en botón de editar
window.testEditButton = function() {
  console.log('🖊️ Probando botón de editar...');
  
  // Buscar botones de editar
  const editButtons = document.querySelectorAll('[title="Editar cliente"]');
  console.log(`📊 Botones de editar encontrados: ${editButtons.length}`);
  
  if (editButtons.length > 0) {
    console.log('🎯 Haciendo click en el primer botón de editar...');
    editButtons[0].click();
    return true;
  } else {
    console.log('❌ No se encontraron botones de editar');
    return false;
  }
};

// Función para simular click en botón de eliminar
window.testDeleteButton = function() {
  console.log('🗑️ Probando botón de eliminar...');
  
  // Buscar botones de eliminar
  const deleteButtons = document.querySelectorAll('[title="Eliminar cliente"]');
  console.log(`📊 Botones de eliminar encontrados: ${deleteButtons.length}`);
  
  if (deleteButtons.length > 0) {
    console.log('🎯 Haciendo click en el primer botón de eliminar...');
    deleteButtons[0].click();
    return true;
  } else {
    console.log('❌ No se encontraron botones de eliminar');
    return false;
  }
};

// Función para verificar eventos de click
window.checkButtonEvents = function() {
  console.log('🔍 Verificando eventos de botones...');
  
  const editButtons = document.querySelectorAll('[title="Editar cliente"]');
  const deleteButtons = document.querySelectorAll('[title="Eliminar cliente"]');
  
  console.log('📋 Información de botones:');
  console.log(`- Botones de editar: ${editButtons.length}`);
  console.log(`- Botones de eliminar: ${deleteButtons.length}`);
  
  // Verificar si tienen event listeners
  editButtons.forEach((btn, index) => {
    console.log(`🖊️ Botón editar ${index + 1}:`, {
      disabled: btn.disabled,
      className: btn.className,
      hasOnClick: btn.onclick !== null,
      eventListeners: getEventListeners ? getEventListeners(btn) : 'No disponible'
    });
  });
  
  deleteButtons.forEach((btn, index) => {
    console.log(`🗑️ Botón eliminar ${index + 1}:`, {
      disabled: btn.disabled,
      className: btn.className,
      hasOnClick: btn.onclick !== null,
      eventListeners: getEventListeners ? getEventListeners(btn) : 'No disponible'
    });
  });
};

// Función para verificar el estado del componente ClientList
window.checkClientListState = function() {
  console.log('📋 Verificando estado de ClientList...');
  
  // Buscar el contenedor de la lista de clientes
  const clientList = document.querySelector('[data-testid="client-list"]') || 
                    document.querySelector('.client-list') ||
                    document.querySelector('table');
  
  if (clientList) {
    console.log('✅ Lista de clientes encontrada');
    
    // Contar filas de clientes
    const clientRows = clientList.querySelectorAll('tbody tr');
    console.log(`📊 Filas de clientes: ${clientRows.length}`);
    
    // Verificar botones en cada fila
    clientRows.forEach((row, index) => {
      const editBtn = row.querySelector('[title="Editar cliente"]');
      const deleteBtn = row.querySelector('[title="Eliminar cliente"]');
      
      console.log(`👤 Cliente ${index + 1}:`, {
        hasEditButton: !!editBtn,
        hasDeleteButton: !!deleteBtn,
        editDisabled: editBtn?.disabled,
        deleteDisabled: deleteBtn?.disabled
      });
    });
  } else {
    console.log('❌ No se encontró la lista de clientes');
  }
};

// Función para crear un cliente de prueba y verificar botones
window.testFullWorkflow = async function() {
  console.log('🚀 Iniciando prueba completa del workflow...');
  
  try {
    // 1. Crear cliente de prueba
    console.log('1️⃣ Creando cliente de prueba...');
    const client = await window.createTestClient();
    
    if (!client) {
      console.log('❌ No se pudo crear el cliente de prueba');
      return false;
    }
    
    // 2. Esperar un momento para que se actualice la UI
    console.log('2️⃣ Esperando actualización de UI...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Verificar estado de la lista
    console.log('3️⃣ Verificando lista de clientes...');
    window.checkClientListState();
    
    // 4. Probar botones
    console.log('4️⃣ Probando botones...');
    window.checkButtonEvents();
    
    // 5. Intentar editar
    console.log('5️⃣ Probando edición...');
    const editWorked = window.testEditButton();
    
    // 6. Intentar eliminar
    console.log('6️⃣ Probando eliminación...');
    const deleteWorked = window.testDeleteButton();
    
    console.log('✅ Prueba completa finalizada:', {
      clientCreated: !!client,
      editButtonWorked: editWorked,
      deleteButtonWorked: deleteWorked
    });
    
    return { client, editWorked, deleteWorked };
    
  } catch (error) {
    console.error('❌ Error en la prueba completa:', error);
    return false;
  }
};

// Auto-ejecutar verificación inicial
console.log('🔄 Ejecutando verificación inicial...');
setTimeout(() => {
  window.checkClientListState();
  window.checkButtonEvents();
}, 1000);