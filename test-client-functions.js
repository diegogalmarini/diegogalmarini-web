// Script de prueba para verificar las funciones de cliente
// Ejecutar con: node test-client-functions.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

// Configuración de Firebase (usar las mismas credenciales del proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyBrJ_xfZeEVRXe0Fcw2XdDKVdCSRYHqaGA",
  authDomain: "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.appspot.com",
  messagingSenderId: "668819276616",
  appId: "1:668819276616:web:5ca12fddfa9fd5fcc2697d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para crear un cliente de prueba
async function createTestClient() {
  try {
    console.log('Creando cliente de prueba...');
    
    const clientData = {
      name: 'Cliente de Prueba',
      email: 'prueba@test.com',
      phone: '+34 123 456 789',
      status: 'active',
      preferredContactMethod: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'clients'), clientData);
    console.log('Cliente creado con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creando cliente:', error);
    throw error;
  }
}

// Función para actualizar un cliente
async function updateTestClient(clientId) {
  try {
    console.log('Actualizando cliente:', clientId);
    
    const updateData = {
      name: 'Cliente de Prueba Actualizado',
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(doc(db, 'clients', clientId), updateData);
    console.log('Cliente actualizado exitosamente');
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    throw error;
  }
}

// Función para eliminar un cliente
async function deleteTestClient(clientId) {
  try {
    console.log('Eliminando cliente:', clientId);
    
    await deleteDoc(doc(db, 'clients', clientId));
    console.log('Cliente eliminado exitosamente');
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    throw error;
  }
}

// Función para listar todos los clientes
async function listClients() {
  try {
    console.log('Listando clientes...');
    
    const querySnapshot = await getDocs(collection(db, 'clients'));
    const clients = [];
    
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('Clientes encontrados:', clients.length);
    clients.forEach(client => {
      console.log(`- ${client.name} (${client.email}) - ${client.status}`);
    });
    
    return clients;
  } catch (error) {
    console.error('Error listando clientes:', error);
    throw error;
  }
}

// Función principal de prueba
async function runTests() {
  try {
    console.log('=== Iniciando pruebas de funciones de cliente ===\n');
    
    // Listar clientes existentes
    await listClients();
    console.log();
    
    // Crear cliente de prueba
    const clientId = await createTestClient();
    console.log();
    
    // Actualizar cliente
    await updateTestClient(clientId);
    console.log();
    
    // Listar clientes después de la actualización
    await listClients();
    console.log();
    
    // Eliminar cliente de prueba
    await deleteTestClient(clientId);
    console.log();
    
    // Listar clientes después de la eliminación
    await listClients();
    
    console.log('\n=== Todas las pruebas completadas exitosamente ===');
  } catch (error) {
    console.error('\n=== Error en las pruebas ===');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar las pruebas
runTests();

export {
  createTestClient,
  updateTestClient,
  deleteTestClient,
  listClients
};