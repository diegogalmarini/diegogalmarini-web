import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoSend, IoCalendarOutline } from 'react-icons/io5';
import { BsChatDots } from 'react-icons/bs';

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Inicializar chat con el mensaje de bienvenida de Diego
  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: 'welcome',
        sender: 'diego',
        text: 'Hola. Soy el Clon Digital de Diego. Ayudo a fundadores y directores de tecnología a diseñar arquitectura de software escalable, integrar modelos de lenguaje (LLMs) y estructurar equipos de ingeniería. ¿Qué desafío técnico estás enfrentando hoy?',
        time: timeString
      }
    ]);
  }, []);

  // Scroll automático
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleOpenChat = () => {
    setIsOpen(true);
  };

  const getSystemResponse = (userInput: string): string => {
    const text = userInput.toLowerCase();
    
    if (text.includes('ia') || text.includes('agente') || text.includes('llm') || text.includes('clon') || text.includes('inteligencia')) {
      return 'La integración de LLMs y agentes autónomos (como RAG para bases de conocimiento o flujos en VPS con Hermes) permite optimizar costos operativos. Diego diseña estas soluciones a medida para alinearse con tus objetivos de negocio. ¿Te gustaría agendar una llamada breve para trazar un mapa de ruta?';
    }
    
    if (text.includes('arquitectura') || text.includes('software') || text.includes('escalar') || text.includes('serverless') || text.includes('desarrollo') || text.includes('código')) {
      return 'Una arquitectura limpia (Serverless o microservicios optimizados) reduce costos de nube hasta en un 40% y previene refactorizaciones dolorosas. Diego tiene amplia experiencia auditando monolitos y diseñando MVPs robustos. ¿Te interesa que coordinemos una sesión para evaluar tu infraestructura?';
    }
    
    if (text.includes('cto') || text.includes('fraccional') || text.includes('asesoría') || text.includes('consultoría') || text.includes('mentor')) {
      return 'El servicio de CTIO Fraccional proporciona liderazgo tecnológico de alto nivel (DevOps, contratación, estrategia de IA) sin el costo de un rol a tiempo completo. Si te interesa, te sugiero coordinar una llamada estratégica de 30 minutos. ¿Quieres ver su disponibilidad de agenda?';
    }
    
    if (text.includes('ads') || text.includes('analytics') || text.includes('console') || text.includes('marketing') || text.includes('lead')) {
      return 'Configurar correctamente Google Ads, Analytics 4 y Search Console es clave para medir tu ROI técnico. Diego no solo hace la integración técnica, sino que automatiza el flujo de leads en tu CRM. ¿Agendamos una breve sesión de consultoría técnica para estructurarlo?';
    }
    
    return 'Entiendo la inquietud. Son justamente los retos de arquitectura, integraciones y analítica que Diego resuelve en sus consultorías bajo demanda. Para darte una respuesta precisa sobre tu caso de negocio, te sugiero agendar una sesión Meet de 30 minutos directamente con él. ¿Te muestro su calendario disponible?';
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
    }, 1200);
  };

  const handleQuickReply = (optionText: string) => {
    handleSendUserMessage(optionText);
  };

  const handleInitiateBooking = () => {
    const chatLog = messages
      .map(m => `${m.sender === 'user' ? 'Cliente' : 'Clon Diego'} [${m.time}]: ${m.text}`)
      .join('\n\n');

    const prefilledNotes = `--- CONSULTA DESDE CLON DIGITAL ---\n${chatLog}\n----------------------------------`;
    
    setIsOpen(false);
    onBookCall('express', prefilledNotes);
  };

  return (
    <>
      {/* Botón flotante minimalista (Monocromo) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenChat}
          className="relative w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-gray-800"
          aria-label="Abrir chat del asistente"
        >
          <BsChatDots className="text-xl" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {/* Ventana de Chat Minimalista */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[340px] sm:w-[380px] h-[500px] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 flex flex-col overflow-hidden font-sans transition-all duration-300">
          
          {/* Header Minimalista (Pristine White) */}
          <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-xs">
                DG
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              
              <div>
                <h4 className="font-semibold text-xs text-gray-900 leading-tight">Diego Galmarini</h4>
                <p className="text-[10px] text-gray-400 font-light flex items-center gap-1">
                  Clon Digital (En línea)
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <IoClose className="text-xl" />
            </button>
          </div>

          {/* Cuerpo del Chat (Limpio, Sin patrones) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col bg-[#fafafa]">
            {messages.map((msg) => {
              const isDiego = msg.sender === 'diego';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    isDiego
                      ? 'bg-white text-gray-800 self-start border border-gray-100'
                      : 'bg-gray-900 text-white self-end'
                  }`}
                >
                  <p className="font-light whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[8px] mt-1 self-end font-light ${isDiego ? 'text-gray-400' : 'text-gray-300'}`}>
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="bg-white text-gray-400 self-start rounded-xl p-3 border border-gray-100 text-[10px] flex items-center gap-2">
                <span>Escribiendo</span>
                <span className="flex gap-0.5 items-center">
                  <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Píldoras de Respuestas Rápidas (Bordes finos, grises y blanco) */}
          {messages.length > 0 && !isTyping && (
            <div className="p-3 bg-white border-t border-gray-50 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              <button
                onClick={() => handleQuickReply('Quiero integrar Agentes de IA')}
                className="px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-[10px] font-medium transition-colors cursor-pointer"
              >
                Integrar Agentes de IA
              </button>
              <button
                onClick={() => handleQuickReply('Necesito auditar mi arquitectura')}
                className="px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-[10px] font-medium transition-colors cursor-pointer"
              >
                Auditar Mi Arquitectura
              </button>
              <button
                onClick={() => handleQuickReply('Busco un CTIO Fraccional')}
                className="px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-[10px] font-medium transition-colors cursor-pointer"
              >
                CTIO Fraccional
              </button>
              <button
                onClick={handleInitiateBooking}
                className="px-2.5 py-1 bg-gray-900 hover:bg-black text-white rounded-full text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <IoCalendarOutline />
                Agendar Sesión
              </button>
            </div>
          )}

          {/* Formulario de Entrada */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Hazme una pregunta técnica..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendUserMessage(inputText)}
              className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none placeholder-gray-400 focus:border-gray-300"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendUserMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
              className={`p-2 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer ${
                inputText.trim() && !isTyping 
                  ? 'bg-gray-900 hover:bg-black hover:scale-105' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <IoSend className="text-xs" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default WhatsAppClone;
