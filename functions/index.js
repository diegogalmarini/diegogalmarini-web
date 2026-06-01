// Cargar variables del entorno local (emulador) si existen
try { require("dotenv").config(); } catch (_) {}

const { initializeApp } = require("firebase-admin/app");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const { Resend } = require("resend");

initializeApp();

exports.onConsultationCreated = onDocumentCreated(
  {
    document: "consultations/{consultationId}",
    secrets: ["RESEND_API_KEY"],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.log("No data associated with the event, skipping email send.");
      return;
    }
    const data = snap.data();

    // --- AUTOMATIZACIÓN DE CLIENTE EN FIRESTORE ---
    const clientEmail = data.clientEmail || data.userEmail || "";
    const clientName = data.clientName || data.userName || "Sin nombre";
    const clientPhone = data.phone || "";
    const clientNotes = data.notes || data.message || "";
    const clientSource = data.source || "website";

    if (clientEmail) {
      try {
        const { getFirestore, FieldValue } = require("firebase-admin/firestore");
        const adminDb = getFirestore();
        const clientsRef = adminDb.collection("clients");

        // Buscar si ya existe un cliente con este correo electrónico
        const querySnapshot = await clientsRef.where("email", "==", clientEmail).limit(1).get();

        if (querySnapshot.empty) {
          logger.info(`El cliente con email ${clientEmail} no existe. Creando nuevo registro en 'clients'...`);
          await clientsRef.add({
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            address: "",
            company: "",
            position: "",
            status: "active",
            tags: ["website"],
            notes: "",
            preferredContactMethod: "email",
            timezone: "",
            language: "es",
            source: clientSource,
            registrationDate: FieldValue.serverTimestamp(),
            lastContactDate: FieldValue.serverTimestamp(),
            totalConsultations: 1,
            totalAppointments: 0,
          });
          logger.info(`Nuevo cliente creado exitosamente para ${clientEmail}.`);
        } else {
          logger.info(`El cliente con email ${clientEmail} ya existe. Actualizando estadísticas...`);
          const clientDoc = querySnapshot.docs[0];
          await clientDoc.ref.update({
            totalConsultations: FieldValue.increment(1),
            lastContactDate: FieldValue.serverTimestamp(),
            name: clientName || clientDoc.data().name,
            phone: clientPhone || clientDoc.data().phone,
          });
          logger.info(`Registro de cliente actualizado exitosamente para ${clientEmail}.`);
        }
      } catch (err) {
        logger.error(`Error en la automatización del cliente para ${clientEmail}:`, err);
      }
    }

    const resendKey = process.env.RESEND_API_KEY || "";
    if (!resendKey) {
      throw new Error("Falta RESEND_API_KEY en las variables de entorno");
    }

    const resend = new Resend(resendKey);

    const fromAddress = "Diego Galmarini <hola@diegogalmarini.com>"; // dominio verificado en Resend
    const subjectClient = "Confirmación de solicitud de consulta - Diego Galmarini";
    const subjectAdmin = `Nueva Consulta Recibida: ${data.userName}`;

    // Preparar datos para el calendario del cliente
    const preferredDate = data.preferredDate || "";
    const preferredTime = data.preferredTime || "";
    // Reutilizamos clientNotes ya declarado arriba en la línea 28
    // clientNotes = data.notes || "";

    // Preparar archivo ICS y enlaces de calendario
    let calendarLinks = "";
    let icsContent = null;
    let icsFilename = "";

    if (preferredDate && preferredTime) {
      const [year, month, day] = preferredDate.split("-").map(Number);
      const [hour, min] = preferredTime.split(":").map(Number);
      const startDate = new Date(year, month - 1, day, hour, min);
      const endDate = new Date(startDate.getTime() + 30 * 60000); // +30 min

      const formatGoogleDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const startStr = formatGoogleDate(startDate);
      const endStr = formatGoogleDate(endDate);

      const title = encodeURIComponent("Sesión Estratégica de Innovación");
      const details = encodeURIComponent(clientNotes || "Consulta programada");
      const location = encodeURIComponent("Virtual (enlace por confirmar)");
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

      const formatICS = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const dtstamp = formatICS(new Date());

      // Crear contenido ICS para adjuntar
      icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DG//Booking//ES\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nBEGIN:VEVENT\r\nDTSTAMP:${dtstamp}\r\nDTSTART:${startStr}\r\nDTEND:${endStr}\r\nSUMMARY:Sesión Estratégica de Innovación\r\nDESCRIPTION:${(clientNotes || "Consulta programada").replace(/\n/g, "\\n")}\r\nLOCATION:Virtual (enlace por confirmar)\r\nEND:VEVENT\r\nEND:VCALENDAR`;
      icsFilename = `sesion-estrategica-${preferredDate}.ics`;

      const formattedDate = startDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const formattedTime = preferredTime;

      calendarLinks = `
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📅 Tu sesión</p>
          <p style="margin: 0 0 4px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${formattedDate}</p>
          <p style="margin: 0 0 16px 0; color: #3b82f6; font-size: 16px; font-weight: 500;">${formattedTime} - Europa Central</p>
          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Duración: 30 minutos</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Formato: Virtual (enlace por confirmar)</p>
        </div>

        ${clientNotes ? `
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">DETALLE DE LA CONSULTA:</p>
          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${clientNotes}</p>
        </div>
        ` : ""}

        <div style="margin: 24px 0;">
          <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 500;">Agrega este evento a tu calendario:</p>
          <table cellpadding="0" cellspacing="0" style="margin: 0;">
            <tr>
              <td style="padding-right: 8px; padding-bottom: 8px;">
                <a href="${googleUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 500;">Google Calendar</a>
              </td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 13px;">📎 También hemos adjuntado un archivo .ics para Apple Calendar, Outlook y otros calendarios.</p>
        </div>
      `;
    }

    const htmlClient = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Consulta</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #dddddd; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dddddd; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <!-- Contenido principal -->
            <tr>
              <td style="padding: 40px 30px;">
                <h1 style="color: #1f2937; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">Hola ${data.userName},</h1>
                <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 15px;">Diego Galmarini • Socio Tecnológico Estratégico</p>
                
                <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                  Gracias por tu interés en mis servicios de consultoría. He recibido tu solicitud para los siguientes servicios:
                </p>
                
                <div style="background-color: #eff6ff; border-left: 3px solid #3b82f6; padding: 16px 20px; margin: 20px 0;">
                  <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 600;">Sesión Estratégica de Innovación</p>
                </div>
                
                ${calendarLinks}
                
                <p style="color: #374151; line-height: 1.6; margin: 24px 0 0 0; font-size: 15px;">
                  Revisaré tu caso y me pondré en contacto contigo muy pronto para confirmar todos los detalles de nuestra sesión.
                </p>
                
                <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 14px;">Saludos,</p>
                  <p style="color: #1f2937; margin: 0; font-size: 17px; font-weight: 600;">Diego Galmarini</p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px; line-height: 1.5; text-align: center;">
                  Este es un correo automático de confirmación. Si tienes alguna pregunta, contáctame en 
                  <a href="mailto:hola@diegogalmarini.com" style="color: #3b82f6; text-decoration: none;">hola@diegogalmarini.com</a>
                </p>
                <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center;">
                  © ${new Date().getFullYear()} Diego Galmarini
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

    const createdAt = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date();
    const htmlAdmin = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Consulta</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #dddddd; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dddddd; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <!-- Contenido principal -->
            <tr>
              <td style="padding: 40px 30px;">
                <h1 style="color: #1f2937; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Nueva consulta para revisar</h1>
                <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 14px;">
                  ${createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #6b7280; font-size: 13px; display: block; margin-bottom: 4px;">Cliente</span>
                        <span style="color: #1f2937; font-size: 16px; font-weight: 600;">${data.userName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #6b7280; font-size: 13px; display: block; margin-bottom: 4px;">Email</span>
                        <a href="mailto:${data.userEmail}" style="color: #3b82f6; font-size: 15px; text-decoration: none;">${data.userEmail}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #6b7280; font-size: 13px; display: block; margin-bottom: 4px;">Fecha preferida</span>
                        <span style="color: #1f2937; font-size: 15px; font-weight: 500;">${data.preferredDate || "No especificada"} ${data.preferredTime ? `• ${data.preferredTime}` : ""}</span>
                      </td>
                    </tr>
                  </table>
                </div>
                
                ${data.notes ? `
                <div style="margin: 20px 0;">
                  <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">Detalle de la consulta</p>
                  <div style="background-color: #eff6ff; padding: 16px; border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.notes}</p>
                  </div>
                </div>
                ` : ""}
                
                <div style="background-color: #fef3c7; padding: 14px 16px; border-radius: 6px; margin-top: 24px; border-left: 3px solid #f59e0b;">
                  <p style="color: #92400e; margin: 0; font-size: 13px;">
                    Puedes gestionar esta consulta desde tu panel de administrador.
                  </p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                  Notificación automática • © ${new Date().getFullYear()} Diego Galmarini
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

    try {
      // Preparar email del cliente con adjunto .ics si está disponible
      const clientEmailData = {
        from: fromAddress,
        to: data.userEmail,
        subject: subjectClient,
        html: htmlClient,
      };

      // Agregar adjunto ICS si existe
      if (icsContent && icsFilename) {
        clientEmailData.attachments = [
          {
            filename: icsFilename,
            content: Buffer.from(icsContent).toString("base64"),
          },
        ];
      }

      await resend.emails.send(clientEmailData);
      logger.info(`Correo de confirmación enviado a ${data.userEmail} vía Resend.`);

      await resend.emails.send({ from: fromAddress, to: "diegogalmarini@gmail.com", subject: subjectAdmin, html: htmlAdmin });
      logger.info("Correo de notificación enviado al admin vía Resend.");
      return { success: true };
    } catch (error) {
      logger.error("Error al enviar correos con Resend:", error);
      return { success: false, error: error.message };
    }
  },
);

exports.onCommunicationLogCreated = onDocumentCreated(
  {
    document: "communicationLogs/{logId}",
    secrets: ["RESEND_API_KEY"],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.log("No data associated with the event, skipping email send.");
      return;
    }
    const data = snap.data();

    // Solo enviar si es un email de salida (outbound)
    if (data.type === "email" && data.direction === "outbound") {
      const clientEmail = data.clientId; // Guardado como email en el log de comunicación
      const subject = data.subject || "Respuesta a tu consulta - Diego Galmarini";
      const content = data.content || "";

      if (!clientEmail) {
        logger.error("No se encontró email del cliente en el log de comunicación.");
        return;
      }

      const resendKey = process.env.RESEND_API_KEY || "";
      if (!resendKey) {
        throw new Error("Falta RESEND_API_KEY en las variables de entorno");
      }

      const resend = new Resend(resendKey);
      const fromAddress = "Diego Galmarini <hola@diegogalmarini.com>";

      // Estilo elegante de correo para las respuestas directas del CRM (Coherente con el tema #37383a)
      const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
          
          <!-- Cabecera -->
          <tr>
            <td style="background-color: #37383a; padding: 24px 30px; text-align: left;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">Diego Galmarini</p>
              <p style="margin: 2px 0 0 0; color: #9ca3af; font-size: 12px;">Socio Tecnológico Estratégico</p>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 40px 30px; color: #37383a; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${content}</td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 12px; text-align: center;">
                Has recibido este correo como parte del seguimiento de tu consulta técnica en diegogalmarini.com.
              </p>
              <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} Diego Galmarini • Todos los derechos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        await resend.emails.send({
          from: fromAddress,
          to: clientEmail,
          subject: subject,
          html: htmlContent,
        });
        logger.info(`Email de respuesta enviado exitosamente a ${clientEmail} vía Resend.`);
      } catch (error) {
        logger.error("Error al enviar email de respuesta desde log de comunicación:", error);
      }
    }
  },
);
