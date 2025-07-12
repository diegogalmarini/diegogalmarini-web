
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");

initializeApp();

// API Key de SendGrid.
const SENDGRID_API_KEY = "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";
sgMail.setApiKey(SENDGRID_API_KEY);

exports.onConsultationCreated = onDocumentCreated("consultations/{consultationId}", async (event) => {
  const snap = event.data;
  if (!snap) {
    logger.log("No data associated with the event, skipping email send.");
    return;
  }
  const data = snap.data();

  // Correo de confirmación para el cliente.
  const msgClient = {
    to: data.userEmail,
    from: {
        name: "Diego Galmarini",
        email: "hola@diegogalmarini.com", // Dirección de envío verificada en SendGrid
    },
    subject: "🚀 ¡Hemos recibido tu solicitud de consulta!",
    html: `
      <h1>Hola ${data.userName},</h1>
      <p>Gracias por tu interés. He recibido tu solicitud para los siguientes servicios:</p>
      <ul>
        ${data.services.map((s) => `<li><strong>${s}</strong></li>`).join("")}
      </ul>
      <p>Revisaré tu caso y me pondré en contacto contigo muy pronto para agendar nuestra sesión.</p>
      <br>
      <p>Saludos,</p>
      <p><strong>Diego Galmarini</strong></p>
    `,
  };

  // Correo de notificación para el administrador.
  const msgAdmin = {
    to: "diegogalmarini@gmail.com",
    from: {
        name: "Notificaciones Web",
        email: "noreply@diegogalmarini.com", // Puede ser la misma o una diferente verificada.
    },
    subject: `🔥 Nueva Consulta Agendada: ${data.userName}`,
    html: `
      <h1>¡Nueva consulta para revisar!</h1>
      <p>Se ha agendado una nueva consulta con los siguientes detalles:</p>
      <ul>
        <li><strong>Cliente:</strong> ${data.userName}</li>
        <li><strong>Email:</strong> ${data.userEmail}</li>
        <li><strong>Servicios:</strong> ${data.services.join(", ")}</li>
        <li><strong>Fecha de solicitud:</strong> ${data.createdAt.toDate().toLocaleDateString()}</li>
      </ul>
      <p>Puedes gestionarla desde tu panel de administrador.</p>
    `,
  };

  try {
    await sgMail.send(msgClient);
    logger.info(`Correo de confirmación enviado a ${data.userEmail} via SendGrid.`);
    await sgMail.send(msgAdmin);
    logger.info("Correo de notificación enviado al admin via SendGrid.");
    return {success: true};
  } catch (error) {
    logger.error("Error al enviar correos con SendGrid:", error);
    if (error.response) {
      logger.error(error.response.body);
    }
    return {success: false, error: error.message};
  }
});
