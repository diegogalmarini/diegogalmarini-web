

import React from 'react';
import { Card } from '../components/common.tsx';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-[var(--text-muted)]">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-color)] tracking-tight text-center mb-4">
            Política de Privacidad
          </h1>
          <p className="text-center mb-10">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-6 leading-relaxed">
            <p>Su privacidad es importante para nosotros. En esta política de privacidad se explica qué datos personales recopilamos de los usuarios y cómo los utilizamos. Le animamos a leer detenidamente estos términos antes de facilitar sus datos personales en esta web.</p>
            
            <h2 className="text-xl font-bold text-[var(--text-color)]">1. Responsable del Tratamiento de sus Datos</h2>
            <p><strong>Identidad del Responsable:</strong> Diego Galmarini</p>
            <p><strong>Correo electrónico de contacto:</strong> diegogalmarini@gmail.com</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">2. ¿Qué datos recopilamos y con qué finalidad?</h2>
            <p>Dependiendo de su interacción con nuestro sitio web, podemos recopilar diferentes tipos de datos:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                    <strong>Formulario de Contacto/Reserva:</strong> Al utilizar el formulario para agendar una consulta, recopilamos su nombre, dirección de correo electrónico y la descripción de su proyecto o problema. Estos datos se utilizan para evaluar su solicitud, comunicarnos con usted y, en su caso, preparar y prestar el servicio solicitado.
                </li>
                 <li>
                    <strong>Creación de Cuenta:</strong> Si crea una cuenta para gestionar sus citas, recopilaremos su nombre, correo electrónico y una contraseña segura (almacenada de forma cifrada). Estos datos son necesarios para gestionar su perfil de usuario y sus servicios contratados.
                </li>
                <li>
                    <strong>Procesamiento de Pagos:</strong> Para las sesiones de pago, utilizamos un proveedor de servicios externo y seguro (Stripe). Nosotros no almacenamos los datos de su tarjeta de crédito o débito. Solo recibimos confirmación del pago y los datos necesarios para facturación.
                </li>
                 <li>
                    <strong>Datos de Navegación (Cookies):</strong> Utilizamos cookies y tecnologías similares (como Google Analytics 4) para analizar el uso de nuestro sitio web, entender el comportamiento de los usuarios y mejorar nuestros servicios. Esta información se recoge de forma agregada y anónima.
                </li>
            </ul>

            <h2 className="text-xl font-bold text-[var(--text-color)]">3. Base Legal para el Tratamiento de Datos</h2>
            <p>La base legal para el tratamiento de sus datos es:</p>
             <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>El consentimiento:</strong> Para procesar la información de los formularios de contacto, suscripción o para el uso de cookies no esenciales.</li>
                <li><strong>La ejecución de un contrato:</strong> Para prestar los servicios que ha contratado, procesar los pagos y gestionar su cuenta de usuario.</li>
            </ul>

            <h2 className="text-xl font-bold text-[var(--text-color)]">4. ¿Con quién compartimos sus datos?</h2>
            <p>No vendemos, alquilamos ni cedemos datos de carácter personal que puedan identificar al usuario. Sin embargo, para poder prestar nuestros servicios, compartimos datos con los siguientes proveedores bajo sus correspondientes condiciones de privacidad:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Google Analytics:</strong> Para analizar el tráfico y la usabilidad de la web.</li>
                <li><strong>Stripe:</strong> Para procesar los pagos de forma segura.</li>
                <li><strong>Proveedor de Hosting y Correo:</strong> Para el funcionamiento técnico del sitio web y las comunicaciones.</li>
            </ul>

            <h2 className="text-xl font-bold text-[var(--text-color)]">5. Conservación de los Datos</h2>
            <p>Los datos personales proporcionados se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales. Una vez finalizada la finalidad para la que fueron recabados, se procederá a su supresión con las medidas de seguridad adecuadas.</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">6. Sus Derechos de Protección de Datos</h2>
            <p>Usted tiene derecho a:</p>
             <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Solicitar el acceso a sus datos personales.</li>
                <li>Solicitar su rectificación o supresión.</li>
                <li>Solicitar la limitación de su tratamiento.</li>
                <li>Oponerse al tratamiento.</li>
                <li>Solicitar la portabilidad de los datos.</li>
            </ul>
            <p>Puede ejercer sus derechos enviando un correo electrónico a la dirección de contacto indicada anteriormente, adjuntando una copia de su DNI o documento identificativo equivalente.</p>
            
            <h2 className="text-xl font-bold text-[var(--text-color)]">7. Seguridad de los Datos</h2>
            <p>Nos comprometemos a utilizar y tratar los datos personales de los usuarios respetando su confidencialidad y a utilizarlos de acuerdo con la finalidad del mismo, así como a dar cumplimiento a nuestra obligación de guardarlos y adaptar todas las medidas para evitar la alteración, pérdida, tratamiento o acceso no autorizado, de conformidad con lo establecido en la normativa vigente de protección de datos.</p>

            <h2 className="text-xl font-bold text-[var(--text-color)]">8. Cambios en la Política de Privacidad</h2>
            <p>Nos reservamos el derecho a modificar la presente política para adaptarla a novedades legislativas o jurisprudenciales, así como a prácticas de la industria. En dichos supuestos, anunciaremos en esta página los cambios introducidos con razonable antelación a su puesta en práctica.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;