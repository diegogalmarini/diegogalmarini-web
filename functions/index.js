
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onCall} = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { Resend } = require('resend');
require('dotenv').config();

// Declarar secretos globales para que Firebase los inyecte en tiempo de ejecución
setGlobalOptions({
  secrets: ["RESEND_API_KEY"],
});

initializeApp();
const db = getFirestore();

// Remove top-level secret read to avoid errors at deploy/build time
// La API Key de Resend se establecerá dentro de cada función en tiempo de ejecución

exports.onConsultationCreated = onDocumentCreated("consultations/{consultationId}", async (event) => {
  // Configurar Resend con el secreto en tiempo de ejecución
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    logger.error("RESEND_API_KEY no está configurada en los secretos de Functions");
    return;
  }
  const resend = new Resend(RESEND_API_KEY);

  const snap = event.data;
  if (!snap) {
    logger.log("No data associated with the event, skipping email send.");
    return;
  }
  const data = snap.data();

  // Mapear el tipo de plan a descripción legible
  const planDescriptions = {
    "free": "Consulta por Email (Gratuita)",
    "30min": "Sesión Estratégica (30 minutos)",
    "60min": "Consultoría Completa (1 hora)",
  };

  const planDescription = planDescriptions[data.selectedPlan] || data.selectedPlan;

  // Correo de confirmación para el cliente.
  const clientEmailData = {
    from: {
      name: "Diego Galmarini",
      email: "hola@diegogalmarini.com", // Dirección de envío verificada en Resend
    },
    to: [data.clientEmail],
    subject: "🚀 ¡Hemos recibido tu solicitud de consulta!",
    html: `
      <h1>Hola ${data.clientName},</h1>
      <p>Gracias por tu interés. He recibido tu solicitud de consulta con los siguientes detalles:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Tipo de consulta:</strong> ${planDescription}</p>
        <p><strong>Descripción del problema:</strong> ${data.problemDescription}</p>
        ${data.selectedDate ? `<p><strong>Fecha solicitada:</strong> ${data.selectedDate}</p>` : ""}
        ${data.selectedTime ? `<p><strong>Hora solicitada:</strong> ${data.selectedTime}</p>` : ""}
      </div>
      <p>Revisaré tu caso y me pondré en contacto contigo muy pronto para confirmar los detalles y agendar nuestra sesión.</p>
      <br>
      <p>Saludos,</p>
      <p><strong>Diego Galmarini</strong></p>
    `,
  };

  // Correo de notificación para el administrador.
  const adminEmailData = {
    from: {
      name: "Notificaciones Web",
      email: "hola@diegogalmarini.com", // Dirección de envío verificada en Resend
    },
    to: ["diegogalmarini@gmail.com"],
    subject: `🔥 Nueva Consulta Recibida: ${data.clientName}`,
    html: `
      <h1>¡Nueva consulta para revisar!</h1>
      <p>Se ha recibido una nueva consulta con los siguientes detalles:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Cliente:</strong> ${data.clientName}</p>
        <p><strong>Email:</strong> ${data.clientEmail}</p>
        <p><strong>Tipo de consulta:</strong> ${planDescription}</p>
        <p><strong>Descripción del problema:</strong> ${data.problemDescription}</p>
        ${data.selectedDate ? `<p><strong>Fecha solicitada:</strong> ${data.selectedDate}</p>` : ""}
        ${data.selectedTime ? `<p><strong>Hora solicitada:</strong> ${data.selectedTime}</p>` : ""}
        <p><strong>Estado:</strong> ${data.status}</p>
      </div>
      <p>Puedes gestionarla desde tu panel de administrador.</p>
    `,
  };

  try {
    const clientResult = await resend.emails.send(clientEmailData);
    logger.log("Email de confirmación enviado al cliente:", data.clientEmail, "ID:", clientResult.data?.id);
  } catch (error) {
    logger.error("Error enviando email al cliente:", error);
  }

  try {
    const adminResult = await resend.emails.send(adminEmailData);
    logger.log("Email de notificación enviado al administrador. ID:", adminResult.data?.id);
  } catch (error) {
    logger.error("Error enviando email al administrador:", error);
  }
});

// Función para enviar respuestas a consultas
exports.sendConsultationResponse = onCall(async (request) => {
  // Configurar Resend con el secreto en tiempo de ejecución
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    logger.error("RESEND_API_KEY no está configurada en los secretos de Functions");
    throw new Error("RESEND_API_KEY es requerida. Configúrala como secreto en Firebase Functions.");
  }
  const resend = new Resend(RESEND_API_KEY);

  const { consultationId, responseMessage, planType } = request.data;
  
  if (!consultationId || !responseMessage) {
    throw new Error('consultationId y responseMessage son requeridos');
  }
  
  try {
    // Obtener los datos de la consulta
    const consultationRef = db.collection('consultations').doc(consultationId);
    const consultationDoc = await consultationRef.get();
    
    if (!consultationDoc.exists) {
      throw new Error('Consulta no encontrada');
    }
    
    const consultationData = consultationDoc.data();
    
    // Preparar el email
    const msg = {
      from: {
        name: "Diego Galmarini",
        email: "hola@diegogalmarini.com"
      },
      to: [consultationData.clientEmail],
      subject: `Re: Tu consulta - ${consultationData.clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Respuesta a tu consulta</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tu consulta original:</strong></p>
            <p style="font-style: italic;">${consultationData.problemDescription}</p>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Mi respuesta:</strong></p>
            <div style="white-space: pre-line;">${responseMessage}</div>
          </div>
          
          ${planType ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p><strong>Próximo paso recomendado:</strong></p>
              <p>${getPlanDescription(planType)}</p>
            </div>
          ` : ''}
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p>Si tienes alguna pregunta adicional o necesitas aclarar algo, no dudes en responder a este email.</p>
          
          <p>Saludos cordiales,<br>
          <strong>Diego Galmarini</strong><br>
          Consultor en Desarrollo Web y Estrategia Digital</p>
        </div>
      `
    };
    
    // Enviar el email con Resend
    const result = await resend.emails.send(msg);
    logger.log(`Email de respuesta enviado a: ${consultationData.clientEmail}, ID: ${result.data?.id}`);
    
    // Actualizar el estado de la consulta en Firestore
    await consultationRef.update({
      status: 'responded',
      planType: planType || null,
      responseMessage: responseMessage,
      respondedAt: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true, message: 'Respuesta enviada correctamente' };
    
  } catch (error) {
    logger.error('Error al enviar respuesta:', error);
    throw new Error(`Error al enviar la respuesta: ${error.message}`);
  }
});

// Nueva función: enviar emails de plantillas de Citas
exports.sendAppointmentEmail = onCall(async (request) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    logger.error("RESEND_API_KEY no está configurada en los secretos de Functions");
    throw new Error("RESEND_API_KEY es requerida. Configúrala como secreto en Firebase Functions.");
  }
  const resend = new Resend(RESEND_API_KEY);

  const { clientEmail, clientName, subject, message, appointment } = request.data || {};
  if (!clientEmail || !subject || !message) {
    throw new Error('clientEmail, subject y message son requeridos');
  }

  const escapeHtml = (unsafe) => String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const toHtml = (text) => escapeHtml(text).replace(/\n/g, '<br/>');

  const detailsHtml = appointment ? `
    <div style="margin-top: 16px; font-size: 14px; color: #444;">
      <p style="margin: 0 0 4px 0;"><strong>Fecha:</strong> ${appointment.date || ''}</p>
      <p style="margin: 0 0 4px 0;"><strong>Hora:</strong> ${appointment.time || ''}</p>
      ${appointment.duration ? `<p style="margin: 0 0 4px 0;"><strong>Duración:</strong> ${appointment.duration} minutos</p>` : ''}
      ${appointment.planType ? `<p style="margin: 0 0 4px 0;"><strong>Tipo:</strong> ${appointment.planType}</p>` : ''}
    </div>
  ` : '';

  const msgClient = {
    from: { name: 'Diego Galmarini', email: 'hola@diegogalmarini.com' },
    to: [clientEmail],
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <p>Hola ${escapeHtml(clientName || '')},</p>
        <div style="background-color: #f7f7f7; padding: 16px; border-radius: 8px;">${toHtml(message)}</div>
        ${detailsHtml}
        <p style="margin-top: 16px;">Saludos,<br/>Diego Galmarini</p>
      </div>
    `,
  };

  try {
    const result = await resend.emails.send(msgClient);
    logger.log('Email de cita enviado a:', clientEmail, 'ID:', result.data?.id);
  } catch (error) {
    logger.error('Error enviando email de cita:', error);
    throw new Error('Error enviando email de cita');
  }

  // Notificación opcional al administrador (silenciosa)
  try {
    const msgAdmin = {
      from: { name: 'Diego Galmarini', email: 'hola@diegogalmarini.com' },
      to: ['hola@diegogalmarini.com'],
      subject: `Copia: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <p>Se envió un mensaje de cita a <strong>${escapeHtml(clientName || '')}</strong> (${escapeHtml(clientEmail)}).</p>
          <div style="background-color: #f7f7f7; padding: 16px; border-radius: 8px;">${toHtml(message)}</div>
          ${detailsHtml}
        </div>
      `,
    };
    const adminResult = await resend.emails.send(msgAdmin);
    logger.log('Copia enviada al administrador. ID:', adminResult.data?.id);
  } catch (error) {
    logger.warn('No se pudo enviar copia al administrador:', error);
  }

  return { success: true };
});

function getPlanDescription(planType) {
  switch (planType) {
    case 'free':
      return 'Te he programado una consulta gratuita de 30 minutos. Recibirás un enlace para agendar la fecha y hora que mejor te convenga.';
    case '30min':
      return 'Te recomiendo una sesión estratégica de 30 minutos. Te enviaré el enlace de pago para que puedas agendar tu sesión.';
    case '60min':
      return 'Para abordar completamente tu consulta, te recomiendo una sesión completa de 60 minutos. Te enviaré el enlace de pago para que puedas agendar tu sesión.';
    default:
      return '';
  }
}
