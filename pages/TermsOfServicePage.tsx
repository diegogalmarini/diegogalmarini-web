
import React from 'react';
import { Card } from '../components/common.tsx';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-[var(--text-muted)]">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-color)] tracking-tight text-center mb-4">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-center mb-10">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-6 leading-relaxed">
            <h2 className="text-xl font-bold text-[var(--text-color)]">1. Aceptación de los Términos</h2>
            <p>Al solicitar, acceder o utilizar los servicios de consultoría, desarrollo o estrategia (en adelante, los "Servicios") proporcionados por Diego Galmarini (en adelante, "el Proveedor"), usted (en adelante, "el Cliente") acepta y se compromete a cumplir los siguientes Términos y Condiciones. Si no está de acuerdo con estos términos, no debe utilizar los Servicios.</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">2. Descripción de los Servicios</h2>
            <p>El Proveedor ofrece servicios de consultoría estratégica, CTIO fraccional, desarrollo de productos y MVPs, y aceleración de crecimiento digital. El alcance específico de los servicios para cada Cliente se definirá en una propuesta o acuerdo de servicio individual.</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">3. Agendamiento, Pagos y Cancelaciones</h2>
            <p>
              <strong>Agendamiento:</strong> Las sesiones de consultoría se deben agendar a través de la plataforma proporcionada en este sitio web. La disponibilidad está sujeta a la agenda del Proveedor.
            </p>
            <p>
              <strong>Pagos:</strong> Los servicios de pago deben ser abonados en su totalidad antes del inicio de la sesión, a través de los métodos de pago proporcionados (e.g., Stripe). Todas las tarifas se indican en Euros (EUR) y no incluyen los impuestos aplicables, que serán añadidos si corresponde.
            </p>
            <p>
              <strong>Política de No Reembolso y Cancelación:</strong> Las sesiones de pago agendadas y confirmadas son vinculantes. <strong>En caso de que el Cliente no se presente (inasistencia) a una sesión agendada, la tarifa pagada no será reembolsable y el slot se considerará utilizado.</strong> No se ofrecen reembolsos por sesiones pagadas. Si necesita reagendar, debe hacerlo con un mínimo de 48 horas de antelación, sujeto a la disponibilidad del Proveedor.
            </p>
            <p>
              <strong>Realización de las Sesiones:</strong> Todas las sesiones de consultoría de pago se realizarán a través de Google Meet. El enlace para la reunión será proporcionado al Cliente tras la confirmación del pago y agendamiento.
            </p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">4. Confidencialidad</h2>
            <p>El Proveedor se compromete a mantener la confidencialidad de toda la información propietaria o sensible compartida por el Cliente en el transcurso de los Servicios. De igual manera, el Cliente se compromete a no divulgar metodologías, herramientas o materiales propietarios del Proveedor.</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">5. Propiedad Intelectual</h2>
            <p>Salvo acuerdo en contrario por escrito, la propiedad intelectual de los entregables desarrollados específicamente para el Cliente durante la prestación de los Servicios (e.g., código fuente, diseños específicos) será transferida al Cliente una vez completado el pago total de los servicios correspondientes. El Proveedor retiene el derecho a utilizar los conocimientos generales, metodologías y herramientas desarrolladas en el curso de su actividad profesional.</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">6. Limitación de Responsabilidad</h2>
            <p>El Proveedor se compromete a prestar los Servicios con la máxima profesionalidad y diligencia. Sin embargo, los resultados dependen de múltiples factores, incluyendo la implicación y las decisiones del Cliente. El Proveedor no garantiza resultados específicos y su responsabilidad total por cualquier reclamación derivada de los Servicios se limitará al importe total pagado por el Cliente por los Servicios que dieron lugar a dicha reclamación.</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">7. Modificación de los Términos</h2>
            <p>El Proveedor se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán efectivas desde su publicación en este sitio web. Se recomienda al Cliente revisar los términos periódicamente.</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">8. Ley Aplicable</h2>
            <p>Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de España, sin dar efecto a ningún principio de conflictos de ley.</p>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage;