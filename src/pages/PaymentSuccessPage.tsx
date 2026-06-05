import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { 
  IoCheckmarkCircleOutline, 
  IoCalendarOutline, 
  IoTimeOutline, 
  IoChevronForward, 
  IoAlertCircleOutline,
  IoLogoGoogle,
  IoCalendarClearOutline
} from 'react-icons/io5';

interface ConsultationData {
  clientName: string;
  clientEmail: string;
  subject: string;
  preferredDate: string;
  preferredTime: string;
  paymentStatus: string;
  status: string;
  duration?: number;
  notes?: string;
  message?: string;
}

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  // Intentar obtener el ID de consulta de la URL o de localStorage
  useEffect(() => {
    const queryId = searchParams.get('client_reference_id');
    const localId = window.localStorage.getItem('last_consultation_id');
    const finalId = queryId || localId;

    if (finalId) {
      setConsultationId(finalId);
      confirmPayment(finalId);
    } else {
      setLoading(false);
      setError(
        language === 'en'
          ? 'No consultation reference was found. If you paid, you will receive a confirmation email shortly.'
          : 'No se encontró ninguna referencia de consulta. Si has realizado el pago, recibirás un email de confirmación pronto.'
      );
    }
  }, [searchParams, language]);

  const confirmPayment = async (id: string) => {
    try {
      const db = getFirestore(app);
      const docRef = doc(db, 'consultations', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Consultation not found');
      }

      const data = docSnap.data() as ConsultationData;
      setConsultation(data);

      // Si el pago no está marcado como pagado aún, actualizarlo
      if (data.paymentStatus !== 'paid') {
        await updateDoc(docRef, {
          paymentStatus: 'paid',
          status: 'confirmed',
          updatedAt: Timestamp.fromDate(new Date())
        });
        
        // Actualizar el estado local para reflejar que ya está pagado
        setConsultation(prev => prev ? { ...prev, paymentStatus: 'paid', status: 'confirmed' } : null);
        
        // Limpiar el ID temporal de localStorage para evitar re-ejecuciones
        window.localStorage.removeItem('last_consultation_id');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(
        language === 'en'
          ? 'We could not update your booking status. Don\'t worry, our team has been notified. Contact hola@diegogalmarini.com if you have any questions.'
          : 'No pudimos actualizar el estado de tu reserva. No te preocupes, nuestro equipo ha sido notificado. Contacta con hola@diegogalmarini.com si tienes dudas.'
      );
      setLoading(false);
    }
  };

  // Generar enlaces para agregar al calendario
  const getCalendarLinks = () => {
    if (!consultation || !consultation.preferredDate || !consultation.preferredTime) return null;

    const [year, month, day] = consultation.preferredDate.split('-').map(Number);
    const [h, m] = consultation.preferredTime.split(':').map(Number);
    
    const start = new Date(year, month - 1, day, h, m);
    const durationMinutes = consultation.duration || 30;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const toGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const startStr = toGoogleDate(start);
    const endStr = toGoogleDate(end);

    const title = encodeURIComponent(
      language === 'en' ? `Session: ${consultation.subject}` : `Sesión: ${consultation.subject}`
    );
    const details = encodeURIComponent(
      consultation.notes || consultation.message || (language === 'en' ? 'Strategic consultation session' : 'Sesión de consultoría estratégica')
    );
    const location = encodeURIComponent(
      language === 'en' ? 'Virtual (Meet link in confirmation email)' : 'Virtual (Enlace de Meet en el correo de confirmación)'
    );

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

    // ICS para Apple/Outlook
    const formatICS = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const dtstamp = formatICS(new Date());
    const prodId = language === 'en' ? '-//DG//Booking//EN' : '-//DG//Booking//ES';
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:${prodId}\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nBEGIN:VEVENT\nDTSTAMP:${dtstamp}\nDTSTART:${startStr}\nDTEND:${endStr}\nSUMMARY:${consultation.subject}\nDESCRIPTION:${(consultation.notes || consultation.message || '').replace(/\n/g, '\\n')}\nLOCATION:${language === 'en' ? 'Virtual' : 'Virtual'}\nEND:VEVENT\nEND:VCALENDAR`;
    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

    return { googleUrl, icsHref, startStr };
  };

  const calendarLinks = getCalendarLinks();

  return (
    <div className="py-28 min-h-screen flex items-center justify-center relative bg-transparent">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="modal-glass-content bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-[var(--border-color)] rounded-3xl shadow-2xl p-8 flex flex-col items-center">
          
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
              <p className="text-sm text-[var(--text-muted)] font-medium">
                {language === 'en' ? 'Verifying payment status...' : 'Verificando estado del pago...'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                <IoAlertCircleOutline className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-color)] mb-4">
                {language === 'en' ? 'Payment Status' : 'Estado del Pago'}
              </h1>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mb-8">
                {error}
              </p>
              <button
                onClick={() => navigate(language === 'en' ? '/en' : '/')}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-bold text-sm shadow-sm flex items-center gap-2"
              >
                {language === 'en' ? 'Return to Home' : 'Volver al Inicio'}
                <IoChevronForward />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-inner">
                <IoCheckmarkCircleOutline className="w-12 h-12 text-emerald-500" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] mb-2 tracking-tight">
                {language === 'en' ? 'Payment Completed!' : '¡Pago Completado!'}
              </h1>
              <p className="text-sm text-emerald-600 font-semibold mb-6 flex items-center gap-1.5 justify-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                {language === 'en' ? 'Booking Confirmed' : 'Reserva Confirmada'}
              </p>

              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 max-w-sm">
                {language === 'en'
                  ? `Thank you, ${consultation?.clientName}. Your payment has been processed successfully. We have sent the meeting details to ${consultation?.clientEmail}.`
                  : `Gracias, ${consultation?.clientName}. Tu pago se ha procesado correctamente. Hemos enviado los detalles de la sesión a tu correo: ${consultation?.clientEmail}.`}
              </p>

              {/* Detalle de la sesión */}
              {consultation && consultation.preferredDate && (
                <div className="w-full bg-slate-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-[var(--border-color)]/60 text-left mb-8 space-y-3">
                  <h3 className="text-xs font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-2 border-b border-[var(--border-color)]/40 pb-2">
                    {language === 'en' ? 'Session Details' : 'Detalles de la Sesión'}
                  </h3>
                  <div className="flex items-center text-sm text-[var(--text-color)] gap-3">
                    <IoCalendarOutline className="text-blue-500 w-4.5 h-4.5 flex-shrink-0" />
                    <span>
                      {new Date(consultation.preferredDate).toLocaleDateString(
                        language === 'en' ? 'en-US' : 'es-ES',
                        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-[var(--text-color)] gap-3">
                    <IoTimeOutline className="text-blue-500 w-4.5 h-4.5 flex-shrink-0" />
                    <span>
                      {consultation.preferredTime} hs (Europa Central / CET)
                    </span>
                  </div>
                </div>
              )}

              {/* Calendarios */}
              {calendarLinks && (
                <div className="w-full flex flex-col gap-3 mb-8">
                  <a
                    href={calendarLinks.googleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl font-bold bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 shadow-sm flex items-center justify-center gap-2.5 transition-all text-sm"
                  >
                    <IoLogoGoogle className="text-red-500 text-lg" />
                    {language === 'en' ? 'Add to Google Calendar' : 'Añadir a Google Calendar'}
                  </a>
                  <a
                    href={calendarLinks.icsHref}
                    download={`consulta-diego-${calendarLinks.startStr}.ics`}
                    className="w-full py-3.5 px-4 rounded-xl font-bold bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 shadow-sm flex items-center justify-center gap-2.5 transition-all text-sm"
                  >
                    <IoCalendarClearOutline className="text-blue-500 text-lg" />
                    {language === 'en' ? 'Download Calendar File (.ics)' : 'Descargar Archivo de Calendario (.ics)'}
                  </a>
                </div>
              )}

              {/* Botón continuar */}
              <button
                onClick={() => navigate(language === 'en' ? '/en' : '/')}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md flex items-center justify-center gap-2"
              >
                {language === 'en' ? 'Return to Homepage' : 'Volver a la Página Principal'}
                <IoChevronForward />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
