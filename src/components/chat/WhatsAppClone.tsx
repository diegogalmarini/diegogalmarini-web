import React, { useState, useEffect, useRef } from 'react';
import { 
  IoLogoWhatsapp, 
  IoClose, 
  IoSend, 
  IoCheckmarkDone, 
  IoCalendarOutline 
} from 'react-icons/io5';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'diego';
  time: string;
}

interface WhatsAppCloneProps {
  onBookCall: (planId?: string, notes?: string) => void;
}

const WhatsAppClone: React.FC<WhatsAppCloneProps> = ({ onBookCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Inicializar chat con el mensaje de bienvenida de Diego
  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: 'welcome',
        sender: 'diego',
        text: '¡Hola! Soy el Clon Digital de Diego 🤖. Le ayudo a fundadores de startups y ejecutivos a diseñar arquitectura técnica escalable, integrar agentes autónomos de IA / LLMs y estructurar su ingeniería de software. ¿Qué desafío técnico estás enfrentando en tu negocio hoy?',
        time: timeString
      }
    ]);
  }, []);

  // Hacer scroll automático al final del chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const getSystemResponse = (userInput: string): string => {
    const text = userInput.toLowerCase();
    
    if (text.includes('ia') || text.includes('agente') || text.includes('llm') || text.includes('clon') || text.includes('inteligencia')) {
      return '¡Excelente tema! La integración de LLMs y Agentes de IA autónomos (ej: orquestadores de tareas, RAG para bases de conocimiento o agentes persistentes en VPS como Hermes) es clave para automatizar flujos cognitivos complejos. Diego diseña estas soluciones a medida para optimizar costes operativos. ¿Te gustaría agendar una llamada y que tracemos tu roadmap de IA?';
    }
    
    if (text.includes('arquitectura') || text.includes('software') || text.includes('escalar') || text.includes('serverless') || text.includes('desarrollo') || text.includes('código') || text.includes('programar')) {
      return 'El diseño de una arquitectura robusta y escalable (ej: Serverless con AWS o microservicios optimizados) evita tener que reescribir código en el futuro y reduce costes de infraestructura hasta en un 40%. Diego cuenta con amplia experiencia rescatando monolitos heredados y diseñando MVPs en tiempo récord. ¿Por qué no coordinamos una sesión y evaluamos tu stack actual?';
    }

    if (text.includes('cto') || text.includes('fraccional') || text.includes('asesoría') || text.includes('consultoría') || text.includes('mentor') || text.includes('horas')) {
      return 'El servicio de CTIO Fraccional de Diego es ideal para startups o equipos de ingeniería que necesitan liderazgo tecnológico de alto nivel (definición de arquitectura, procesos de DevOps, contrataciones, integración de IA) pero no requieren un rol a tiempo completo. Ofrece sesiones estratégicas mensuales u horas bajo demanda. ¿Te interesa ver sus horarios disponibles para coordinar una llamada inicial?';
    }

    if (text.includes('ads') || text.includes('analytics') || text.includes('console') || text.includes('marketing') || text.includes('lead') || text.includes('tráfico')) {
      return 'Conectar Google Ads, Analytics 4 y Search Console de forma correcta es vital para medir tu CAC (Costo de Adquisición de Clientes) y tu ROI. Diego te ayuda no solo con el "manos a la obra" técnico de las integraciones, sino a automatizar el seguimiento de esos leads en tu CRM. ¿Agendamos una sesión estratégica para estructurar tus analíticas?';
    }

    return 'Entiendo perfectamente tu inquietud técnica. Es justo el tipo de retos que Diego resuelve en sus consultorías (desde integración de analíticas y automatizaciones locales hasta el diseño de grandes arquitecturas). Para darte una respuesta detallada a tu caso específico, te sugiero agendar una llamada directa de 30 minutos con el Diego real. ¿Te muestro su calendario?';
  };

  const handleSendUserMessage = (text: string) => {
    if (!text.trim()) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      time: timeString
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simular escritura de Diego (1.5 segundos)
    setTimeout(() => {
      setIsTyping(false);
      const systemReply = getSystemResponse(text);
      const diegoMsg: Message = {
        id: `diego-${Date.now()}`,
        sender: 'diego',
        text: systemReply,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, diegoMsg]);
    }, 1500);
  };

  const handleQuickReply = (optionText: string) => {
    handleSendUserMessage(optionText);
  };

  const handleInitiateBooking = () => {
    // Compilar el historial del chat para inyectarlo en el modal
    const chatLog = messages
      .map(m => `${m.sender === 'user' ? 'Cliente' : 'Clon Diego'} [${m.time}]: ${m.text}`)
      .join('\n\n');

    const prefilledNotes = `--- HISTORIAL DE CONVERSACIÓN CON CLON DIGITAL WHATSAPP ---\n${chatLog}\n-----------------------------------------------------------`;
    
    // Cerrar el chat de WhatsApp y abrir el modal cargando la conversación
    setIsOpen(false);
    onBookCall('express', prefilledNotes);
  };

  return (
    <>
      {/* Botón flotante burbuja WhatsApp */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenChat}
          className="relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:bg-green-600 transition-all duration-300 hover:scale-105 group active:scale-95 cursor-pointer border border-green-400"
          aria-label="Abrir chat de WhatsApp"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md animate-pulse">
              {unreadCount}
            </span>
          )}
          <IoLogoWhatsapp className="text-white text-3xl group-hover:scale-110 transition-transform" />
          
          {/* Ola verde indicadora activa */}
          <span className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-25"></span>
        </button>
      </div>

      {/* Ventana flotante de Chat estilo WhatsApp */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] sm:w-[400px] h-[550px] bg-[#efeae2] rounded-3xl border border-[var(--border-color)] shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header de WhatsApp (Verde/Gris sleek) */}
          <div className="bg-[#005e54] p-4 flex items-center justify-between text-white border-b border-green-700 shadow-md">
            <div className="flex items-center gap-3">
              {/* Foto Diego */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0 border border-white/20">
                DG
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-green-800 rounded-full"></span>
              </div>
              
              <div>
                <h4 className="font-bold text-sm leading-tight text-white">Diego Galmarini</h4>
                <p className="text-[10px] text-green-200 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Clon Digital CTIO (En línea)
                </p>
              </div>
            </div>

            {/* Cerrar */}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-black/15 rounded-full transition-colors cursor-pointer text-white"
            >
              <IoClose className="text-2xl" />
            </button>
          </div>

          {/* Cuerpo del Chat (Mensajes scroll) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col bg-whatsapp-pattern">
            {messages.map((msg) => {
              const isDiego = msg.sender === 'diego';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm relative ${
                    isDiego
                      ? 'bg-white text-gray-900 self-start rounded-tl-none'
                      : 'bg-[#d9fdd3] text-gray-950 self-end rounded-tr-none'
                  }`}
                >
                  <p className="leading-relaxed font-light whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Hora y Double Check */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-gray-400 self-end">
                    <span>{msg.time}</span>
                    {!isDiego && <IoCheckmarkDone className="text-blue-500 text-xs" />}
                  </div>
                </div>
              );
            })}

            {/* Diego está escribiendo... */}
            {isTyping && (
              <div className="bg-white text-gray-900 self-start rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[85%] flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Diego está escribiendo</span>
                <span className="flex gap-1 items-center mt-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Píldoras de Respuestas Rápidas (Encima del input) */}
          {messages.length > 0 && !isTyping && (
            <div className="p-3 bg-white/70 backdrop-blur-sm border-t border-gray-200 flex flex-wrap gap-2 overflow-x-auto whitespace-nowrap scrollbar-none max-h-24">
              <button
                onClick={() => handleQuickReply('🤖 Quiero integrar Agentes de IA/LLMs')}
                className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors cursor-pointer"
              >
                🤖 Integrar Agentes de IA
              </button>
              <button
                onClick={() => handleQuickReply('⚡ Necesito auditar la arquitectura de mi software')}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                ⚡ Auditar Mi Arquitectura
              </button>
              <button
                onClick={() => handleQuickReply('📈 Busco un CTIO Fraccional')}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                📈 CTIO Fraccional
              </button>
              <button
                onClick={handleInitiateBooking}
                className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <IoCalendarOutline />
                Agendar Reunión Directa
              </button>
            </div>
          )}

          {/* Formulario de Input en el pie */}
          <div className="p-3 bg-[#f0f2f5] border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Escribe tu duda técnica aquí..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendUserMessage(inputText)}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendUserMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
              className={`p-2.5 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                inputText.trim() && !isTyping 
                  ? 'bg-[#00a884] hover:bg-[#008f72] hover:scale-105 active:scale-95' 
                  : 'bg-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              <IoSend className="text-base" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default WhatsAppClone;
