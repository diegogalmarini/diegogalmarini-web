import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoSend, IoCalendarOutline, IoChevronDown, IoChevronForward, IoMailOutline } from 'react-icons/io5';
import { BsChatDots } from 'react-icons/bs';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEvent } from '../../utils/analytics';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'diego';
  time: string;
  isCustomUI?: 'select_date' | 'select_time' | 'collect_info' | 'checkout' | 'confirmed';
}

interface WhatsAppCloneProps {
  onBookCall: (planId?: string, notes?: string) => void;
}

const WhatsAppClone: React.FC<WhatsAppCloneProps> = ({ onBookCall }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Estados del Asistente de Reserva (Booking Wizard)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [hasClickedPayment, setHasClickedPayment] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [isFreeEmailOnly, setIsFreeEmailOnly] = useState(false);
  const [isSuggestionsCollapsed, setIsSuggestionsCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNext7Days = () => {
    const days = [];
    let added = 0;
    let offset = 1;
    // Generar 6 días disponibles excluyendo los domingos
    while (added < 6) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      if (d.getDay() !== 0) { // Excluir domingo
        days.push(d);
        added++;
      }
      offset++;
    }
    return days;
  };

  const startBookingWizard = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    
    setIsFreeEmailOnly(false);
    setClientMessage('');
    const wizardMsg: Message = {
      id: `diego-wizard-${Date.now()}`,
      sender: 'diego',
      text: language === 'en'
        ? "Sure! Let's find the best time for our 30-minute call. Please select one of the available days in my calendar:"
        : '¡Con gusto! Vamos a buscar el mejor momento para nuestra llamada de 30 minutos. Selecciona uno de los días disponibles en mi calendario:',
      time: timeString,
      isCustomUI: 'select_date'
    };
    setMessages(prev => [...prev, wizardMsg]);
  };

  const startFreeEmailWizard = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    
    setIsFreeEmailOnly(true);
    setClientMessage('');
    setSelectedDate(null);
    setSelectedDateStr(language === 'en' ? 'By email' : 'Por email');
    setSelectedTime('N/A');
    
    const wizardMsg: Message = {
      id: `diego-free-wizard-${Date.now()}`,
      sender: 'diego',
      text: language === 'en'
        ? 'Certainly! I\'d be delighted to answer your questions via email completely free of charge. Please provide your name, email, and query details below:'
        : '¡Por supuesto! Estaré encantado de responder tus consultas por correo electrónico de forma gratuita. Por favor, indícame tu nombre, email y los detalles de tu consulta:',
      time: timeString,
      isCustomUI: 'collect_info'
    };
    setMessages(prev => [...prev, wizardMsg]);
  };

  const handleSelectDate = (date: Date, dateStr: string) => {
    trackEvent('chat_select_date', { date_string: dateStr });
    setSelectedDate(date);
    setSelectedDateStr(dateStr);
    
    const now = new Date();
    const timeString = now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `user-date-${Date.now()}`,
      sender: 'user',
      text: language === 'en' ? `I prefer ${dateStr}` : `Prefiero el día ${dateStr}`,
      time: timeString
    };

    setMessages(prev => prev.map(m => m.isCustomUI === 'select_date' ? { ...m, isCustomUI: undefined } : m).concat(userMsg));
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const diegoMsg: Message = {
        id: `diego-time-${Date.now()}`,
        sender: 'diego',
        text: language === 'en'
          ? `Excellent. What time works best for you on ${dateStr}?`
          : `Excelente. ¿A qué hora te viene mejor reservar el ${dateStr}?`,
        time: new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        isCustomUI: 'select_time'
      };
      setMessages(prev => [...prev, diegoMsg]);
    }, 1000);
  };

  const handleSelectTime = (hour: string) => {
    trackEvent('chat_select_time', { hour: hour });
    setSelectedTime(hour);
    
    const now = new Date();
    const timeString = now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `user-time-${Date.now()}`,
      sender: 'user',
      text: language === 'en' ? `At ${hour} hs` : `A las ${hour} hs`,
      time: timeString
    };

    setMessages(prev => prev.map(m => m.isCustomUI === 'select_time' ? { ...m, isCustomUI: undefined } : m).concat(userMsg));
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const diegoMsg: Message = {
        id: `diego-collect-${Date.now()}`,
        sender: 'diego',
        text: language === 'en'
          ? `Perfect! We will book your session on ${selectedDateStr} at ${hour} hs. To schedule the call and send you the Google Meet link, please provide your name, email, and query details:`
          : `¡Perfecto! Reservaremos tu sesión el ${selectedDateStr} a las ${hour} hs. Para poder agendar la llamada y enviarte el enlace de Google Meet, por favor indícame tu nombre, correo electrónico y los detalles de tu consulta:`,
        time: new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        isCustomUI: 'collect_info'
      };
      setMessages(prev => [...prev, diegoMsg]);
    }, 1000);
  };

  const handleInfoSubmit = () => {
    if (!clientName.trim() || !clientEmail.trim() || !clientMessage.trim()) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `user-info-${Date.now()}`,
      sender: 'user',
      text: language === 'en'
        ? `My name is ${clientName} (${clientEmail})\n\nQuery: ${clientMessage}`
        : `Mi nombre es ${clientName} (${clientEmail})\n\nConsulta: ${clientMessage}`,
      time: timeString
    };

    setMessages(prev => prev.map(m => m.isCustomUI === 'collect_info' ? { ...m, isCustomUI: undefined } : m).concat(userMsg));
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      if (isFreeEmailOnly) {
        const diegoMsg: Message = {
          id: `diego-free-checkout-${Date.now()}`,
          sender: 'diego',
          text: language === 'en'
            ? `Excellent, ${clientName}! I have received your details. To send it to my inbox for free and get an email response in less than 24 business hours, click the button below:`
            : `¡Excelente, ${clientName}! He recibido los detalles de tu consulta. Para enviarla a mi bandeja de entrada de forma gratuita y recibir una respuesta por email en menos de 24 hs, pulsa el botón de abajo:`,
          time: new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          isCustomUI: 'checkout'
        };
        setMessages(prev => [...prev, diegoMsg]);
      } else {
        const diegoMsg: Message = {
          id: `diego-checkout-${Date.now()}`,
          sender: 'diego',
          text: language === 'en'
            ? `Excellent, ${clientName}! Your session is pre-booked for ${selectedDateStr} at ${selectedTime} hs. To confirm your appointment, please complete the payment (€150) via LemonSqueezy:`
            : `¡Excelente, ${clientName}! Tu sesión está pre-reservada para el ${selectedDateStr} a las ${selectedTime} hs. Para confirmar tu cita, realiza el pago de la consulta (€150) por LemonSqueezy:`,
          time: new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          isCustomUI: 'checkout'
        };
        setMessages(prev => [...prev, diegoMsg]);
      }
    }, 1000);
  };

  const handleConfirmBooking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    trackEvent('chat_confirm_booking', { plan_type: isFreeEmailOnly ? 'free_email' : 'express_30min' });

    try {
      const db = getFirestore(app);
      const [h, m] = isFreeEmailOnly ? [0, 0] : (selectedTime || '00:00').split(':').map(Number);
      const start = selectedDate ? new Date(selectedDate) : new Date();
      if (!isFreeEmailOnly) {
        start.setHours(h || 0, m || 0, 0, 0);
      }

      const durationMinutes = 30;
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

      await addDoc(collection(db, 'consultations'), {
        clientName: clientName,
        clientEmail: clientEmail,
        subject: isFreeEmailOnly ? `Consulta Inicial por Email (WhatsApp)` : `Consulta Estratégica: Express (WhatsApp)`,
        message: clientMessage || `Consulta enviada desde el chat.`,
        services: isFreeEmailOnly ? ['Consulta por Email Gratis'] : ['Sesión Estratégica de Innovación'],
        priority: 'medium',
        planType: isFreeEmailOnly ? 'mail' : '30min',
        paymentStatus: isFreeEmailOnly ? 'free' : 'pending',
        status: 'pending',
        source: 'website',

        userName: clientName,
        userEmail: clientEmail,
        notes: '', // Notas internas en blanco para el CRM (para evitar duplicaciones)
        preferredDate: start.toISOString().split('T')[0],
        preferredTime: isFreeEmailOnly ? 'N/A' : selectedTime || '',
        startTime: isFreeEmailOnly ? 'N/A' : `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
        endTime: isFreeEmailOnly ? 'N/A' : `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,

        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        consultationCode: `CONS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      });

      const now = new Date();
      const timeString = now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });

      const userMsg: Message = {
        id: `user-confirm-${Date.now()}`,
        sender: 'user',
        text: isFreeEmailOnly
          ? (language === 'en' ? 'Send my free email consultation' : 'Enviar mi consulta por email gratis')
          : (language === 'en' ? 'Confirm my booking now' : 'Confirmar mi reserva ahora'),
        time: timeString
      };

      setMessages(prev => prev.map(m => m.isCustomUI === 'checkout' ? { ...m, isCustomUI: undefined } : m).concat(userMsg));
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const diegoMsg: Message = {
          id: `diego-confirmed-${Date.now()}`,
          sender: 'diego',
          text: isFreeEmailOnly
            ? (language === 'en'
                ? `Your query has been sent successfully! 🎉\n\nI will analyze your case personally and reply to your email at **${clientEmail}** in less than 24 business hours. Talk soon!`
                : `¡Tu consulta ha sido enviada con éxito! 🎉\n\nAnalizaré tu caso personalmente y te responderé por correo a **${clientEmail}** en menos de 24 horas hábiles. ¡Hablamos pronto!`)
            : (language === 'en'
                ? `Your appointment has been confirmed successfully! 🎉\n\nWe are scheduled for **${selectedDateStr}** at **${selectedTime} hs** via Google Meet.\n\nWe have sent you an email with the meeting link and the LemonSqueezy payment confirmation. See you soon!`
                : `¡Tu cita ha sido confirmada con éxito! 🎉\n\nQuedamos para el día **${selectedDateStr}** a las **${selectedTime} hs** por Google Meet.\n\nTe hemos enviado un correo con el enlace de la reunión y la confirmación de pago de LemonSqueezy. ¡Nos vemos pronto!`),
          time: new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          isCustomUI: 'confirmed'
        };
        setMessages(prev => [...prev, diegoMsg]);
      }, 1500);

    } catch (err) {
      console.error('Error saving to Firestore:', err);
      alert(language === 'en' ? 'There was an error confirming your booking. Please try again.' : 'Hubo un error al confirmar tu reserva. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica de arrastre estilo Diktalo (Mouse + Touch)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartScreen = useRef({ x: 0, y: 0 });
  const totalDragDistance = useRef(0);
  const [alignment, setAlignment] = useState<'start' | 'center' | 'end'>('end');

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };
      dragStartScreen.current = { x: e.clientX, y: e.clientY };
      totalDragDistance.current = 0;
      e.preventDefault();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = { x: touch.clientX - dragPos.x, y: touch.clientY - dragPos.y };
      dragStartScreen.current = { x: touch.clientX, y: touch.clientY };
      totalDragDistance.current = 0;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      
      const dx = e.clientX - dragStartScreen.current.x;
      const dy = e.clientY - dragStartScreen.current.y;
      totalDragDistance.current = Math.sqrt(dx * dx + dy * dy);
      
      setDragPos({ x: newX, y: newY });

      // Determinar alineación según la posición horizontal del cursor
      const currentX = e.clientX;
      const screenWidth = window.innerWidth;
      const ratio = currentX / screenWidth;

      if (ratio < 0.33) {
        setAlignment('start');
      } else if (ratio < 0.66) {
        setAlignment('center');
      } else {
        setAlignment('end');
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.current.x;
      const newY = touch.clientY - dragStart.current.y;
      
      const dx = touch.clientX - dragStartScreen.current.x;
      const dy = touch.clientY - dragStartScreen.current.y;
      totalDragDistance.current = Math.sqrt(dx * dx + dy * dy);
      
      setDragPos({ x: newX, y: newY });

      // Determinar alineación según la posición horizontal del toque
      const currentX = touch.clientX;
      const screenWidth = window.innerWidth;
      const ratio = currentX / screenWidth;

      if (ratio < 0.33) {
        setAlignment('start');
      } else if (ratio < 0.66) {
        setAlignment('center');
      } else {
        setAlignment('end');
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragPos]);

  const handleToggleChat = () => {
    if (totalDragDistance.current < 10) {
      const nextOpen = !isOpen;
      setIsOpen(nextOpen);
      if (nextOpen) {
        trackEvent('open_chat', { source: 'whatsapp_clone' });
      }
    }
  };

  // Inicializar chat con el mensaje de bienvenida de Diego
  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => {
      if (prev.length <= 1) {
        return [{
          id: 'welcome',
          sender: 'diego',
          text: language === 'en'
            ? "Hi. I'm Diego's Digital Clone. I help founders and technology directors design scalable software architecture, integrate large language models (LLMs), and structure engineering teams. What technical challenge are you facing today?"
            : 'Hola. Soy el Clon Digital de Diego. Ayudo a fundadores y directores de tecnología a diseñar arquitectura de software escalable, integrar modelos de lenguaje (LLMs) y estructurar equipos de ingeniería. ¿Qué desafío técnico estás enfrentando hoy?',
          time: timeString
        }];
      }
      return prev.map(m => m.id === 'welcome' ? {
        ...m,
        text: language === 'en'
          ? "Hi. I'm Diego's Digital Clone. I help founders and technology directors design scalable software architecture, integrate large language models (LLMs), and structure engineering teams. What technical challenge are you facing today?"
          : 'Hola. Soy el Clon Digital de Diego. Ayudo a fundadores y directores de tecnología a diseñar arquitectura de software escalable, integrar modelos de lenguaje (LLMs) y estructurar equipos de ingeniería. ¿Qué desafío técnico estás enfrentando hoy?'
      } : m);
    });
  }, [language]);

  // Scroll automático
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const getSystemResponse = (userInput: string): string => {
    const text = userInput.toLowerCase();
    
    if (language === 'en') {
      if (text.includes('ai') || text.includes('agent') || text.includes('llm') || text.includes('clone') || text.includes('intelligence') || text.includes('ia') || text.includes('agente') || text.includes('inteligencia')) {
        return "Integrating LLMs and autonomous agents (like RAG for knowledge bases or workflows on VPS with Hermes) optimizes operational costs. Diego designs custom solutions to align with your business objectives.\n\nDiego will personally reply to this query via email 100% free of charge. If you would also like to schedule a short 30-minute Google Meet video call to align goals, we can do that. Would you like to schedule a call or would you prefer Diego to reply directly via email?";
      }
      if (text.includes('architecture') || text.includes('software') || text.includes('scale') || text.includes('serverless') || text.includes('develop') || text.includes('code') || text.includes('coding') || text.includes('arquitectura') || text.includes('desarrollo')) {
        return "A clean architecture (Serverless or optimized microservices) reduces cloud costs by up to 40% and prevents painful refactoring. Diego has extensive experience auditing monoliths and designing robust MVPs.\n\nDiego will personally reply to this query via email 100% free of charge. If you would also like to schedule a 30-minute call to evaluate your infrastructure in detail, we can do that. Would you like to schedule the call or prefer to receive the response directly via email?";
      }
      if (text.includes('cto') || text.includes('ctio') || text.includes('fractional') || text.includes('advisory') || text.includes('consult') || text.includes('mentor') || text.includes('leadership') || text.includes('liderazgo')) {
        return "The Fractional CTIO service provides high-level technical leadership (DevOps, stacks, hiring, AI strategy) without the financial cost of a full-time executive.\n\nDiego will personally reply to this query via email 100% free of charge. If you also want to schedule a strategic 30-minute Google Meet video call to align goals, we can arrange that. Shall we schedule a video call or would you prefer Diego to reply via email?";
      }
      if (text.includes('ads') || text.includes('analytics') || text.includes('console') || text.includes('marketing') || text.includes('lead') || text.includes('growth')) {
        return "Correctly configuring Google Ads, Analytics 4, and Search Console is key to measuring your technical ROI. Diego not only handles the technical integration, but also automates the flow of leads in your CRM.\n\nDiego will personally reply to this query via email 100% free of charge. If you would also like to schedule a brief technical consulting session to audit your case live, we can do that. Do you prefer to schedule the session or have Diego reply directly via email?";
      }
      return "I completely understand your query. Challenges such as system integrations, database flow optimization, or process automation are precisely the audits that Diego resolves in his on-demand consulting.\n\nDiego will personally reply to this query via email 100% free of charge. If you also want to schedule a strategic 30-minute Google Meet video call, we can arrange that. Would you like to schedule a call or would you prefer that he replies by email?";
    } else {
      if (text.includes('ia') || text.includes('agente') || text.includes('llm') || text.includes('clon') || text.includes('inteligencia')) {
        return 'La integración de LLMs y agentes autónomos (como RAG para bases de conocimiento o flujos en VPS con Hermes) permite optimizar costos operativos. Diego diseña estas soluciones a medida para alinearse con tus objetivos de negocio.\n\nDiego te responderá personalmente por email a esta consulta de forma 100% gratuita. Si también te gustaría agendar una videollamada corta de 30 minutos por Google Meet para alinear metas, podemos hacerlo. ¿Te gustaría agendar una llamada o prefieres que Diego te responda directamente por email?';
      }
      if (text.includes('arquitectura') || text.includes('software') || text.includes('escalar') || text.includes('serverless') || text.includes('desarrollo') || text.includes('código')) {
        return 'Una arquitectura limpia (Serverless o microservicios optimizados) reduce costos de nube hasta en un 40% y previene refactorizaciones dolorosas. Diego tiene amplia experiencia auditando monolitos y diseñando MVPs robustos.\n\nDiego te responderá personalmente por email a esta consulta de forma 100% gratuita. Si también te gustaría agendar una llamada de 30 minutos para evaluar tu infraestructura en detalle, podemos hacerlo. ¿Te gustaría agendar la llamada o prefieres recibir la respuesta directamente por email?';
      }
      if (text.includes('cto') || text.includes('ctio') || text.includes('fraccional') || text.includes('asesoría') || text.includes('consultoría') || text.includes('mentor') || text.includes('liderazgo')) {
        return 'El servicio de CTIO Fraccional proporciona liderazgo tecnológico de alto nivel (DevOps, stacks, contratación, estrategia de IA) sin el costo financiero de un ejecutivo a tiempo completo.\n\nDiego te responderá personalmente por email a esta consulta de forma 100% gratuita. Si además quieres agendar una videollamada Meet estratégica de 30 minutos para alinear metas, podemos coordinarlo. ¿Agendamos una videollamada o prefieres que Diego te responda por email?';
      }
      if (text.includes('ads') || text.includes('analytics') || text.includes('console') || text.includes('marketing') || text.includes('lead') || text.includes('growth')) {
        return 'Configurar correctamente Google Ads, Analytics 4 y Search Console es clave para medir tu ROI técnico. Diego no solo hace la integración técnica, sino que automatiza el flujo de leads en tu CRM.\n\nDiego te responderá personalmente por email a esta consulta de forma 100% gratuita. Si además te gustaría agendar una breve sesión de consultoría técnica para auditar tu caso en vivo, podemos hacerlo. ¿Prefieres agendar la sesión o que Diego te responda directamente por email?';
      }
      return 'Entiendo perfectamente tu consulta. Desafíos como integraciones de sistemas, optimización de flujos de base de datos o automatización de procesos son precisamente las auditorías que Diego resuelve en sus consultorías bajo demanda.\n\nDiego te responderá personalmente por email a esta consulta de forma 100% gratuita. Si además quieres agendar una videollamada estratégica de 30 minutos por Google Meet, podemos coordinarlo. ¿Te gustaría agendar una llamada o prefieres que te responda por email?';
    }
  };

  const handleSendUserMessage = (text: string) => {
    if (!text.trim()) return;
    trackEvent('chat_message_sent', { text_length: text.length });

    const now = new Date();
    const timeString = now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    
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
      
      const lower = text.toLowerCase();
      
      const wantsNoCall = lower.includes('no') || lower.includes('insist') || lower.includes('email') || lower.includes('correo') || lower.includes('solo') || lower.includes('sólo') || lower.includes('pasa') || lower.includes('noup') || lower.includes('nada') || lower.includes('dont') || lower.includes('don\'t') || lower.includes('not');
      const wantsCall = lower.includes('si') || lower.includes('sí') || lower.includes('agenda') || lower.includes('cita') || lower.includes('llamada') || lower.includes('meet') || lower.includes('calendario') || lower.includes('yes') || lower.includes('book') || lower.includes('schedule') || lower.includes('call');

      // Si el usuario explícitamente pide agendar
      if (wantsCall && !wantsNoCall) {
        startBookingWizard();
        return;
      }

      // Si el usuario dice que no o prefiere email ante la propuesta
      if (wantsNoCall) {
        // Encontrar la última consulta técnica del usuario o usar el texto actual
        const userQueries = messages.concat(userMsg).filter(m => m.sender === 'user' && m.text.length > 15);
        const lastQueryText = userQueries.length > 0 ? userQueries[userQueries.length - 1].text : text;
        
        let summary = lastQueryText;
        if (lastQueryText.length > 60) {
          summary = lastQueryText.slice(0, 60) + '...';
        }

        const diegoMsg: Message = {
          id: `diego-transition-${Date.now()}`,
          sender: 'diego',
          text: language === 'en'
            ? `I completely understand, don't worry. What you want to know is:\n\n"${summary}"\n\nIf this is your query, I will generate a support ticket for Diego right now so he can answer you personally by email. To do this, please tell me your name, your email, and confirm the details of your query below:`
            : `Entiendo perfectamente, no te preocupes. Lo que quieres saber es:\n\n"${summary}"\n\nSi esta es tu consulta, ya mismo le genero un ticket de soporte a Diego para que te responda personalmente por correo electrónico. Para poder hacerlo, por favor indícame tu nombre, tu email y confirma los detalles de tu consulta abajo:`,
          time: new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          isCustomUI: 'collect_info'
        };
        
        setClientMessage(lastQueryText);
        setIsFreeEmailOnly(true); // Activar flujo por correo gratuito
        setMessages(prev => [...prev, diegoMsg]);
        return;
      }

      // Respuesta normal / técnica inicial
      if (wantsCall) {
        startBookingWizard();
      } else {
        const systemReply = getSystemResponse(text);
        const diegoMsg: Message = {
          id: `diego-${Date.now()}`,
          sender: 'diego',
          text: systemReply,
          time: new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, diegoMsg]);
      }
    }, 1200);
  };

  const handleQuickReply = (optionText: string) => {
    handleSendUserMessage(optionText);
  };

  const handleInitiateBooking = () => {
    trackEvent('chat_initiate_booking_modal', { source: 'whatsapp_clone_cta' });
    const chatLog = messages
      .map(m => `${m.sender === 'user' ? 'Cliente' : 'Clon Diego'} [${m.time}]: ${m.text}`)
      .join('\n\n');

    const prefilledNotes = `--- CONSULTA DESDE CLON DIGITAL ---\n${chatLog}\n----------------------------------`;
    
    setIsOpen(false);
    onBookCall('express', prefilledNotes);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-${alignment} pointer-events-none`}
      style={{
        transform: `translate3d(${dragPos.x}px, ${dragPos.y}px, 0)`,
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Ventana de Chat Minimalista (Más Grande, Centrada sobre el globo y con Puntero de Burbuja) */}
      {isOpen && (
        <div className="relative w-[92vw] sm:w-[440px] h-[80vh] sm:h-[600px] bg-white rounded-3xl border border-gray-100 shadow-2xl flex flex-col overflow-hidden font-sans pointer-events-auto transition-all duration-300 mb-5 select-none">
          
          {/* Puntero/Triángulo de burbuja de chat alineado con el globo */}
          <div className={`absolute -bottom-2.5 transform w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white z-50 shadow-sm ${
            alignment === 'start' ? 'left-6 translate-x-0' :
            alignment === 'center' ? 'left-1/2 -translate-x-1/2' :
            'right-6 translate-x-0'
          }`}></div>
          
          {/* Header Minimalista (Drag Handle para Mover la Ventana) */}
          <div 
            className="bg-white p-5 flex items-center justify-between border-b border-gray-100 drag-handle cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img src="/DiegoG.webp" alt="Diego Galmarini" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-900 leading-tight">Diego Galmarini</h4>
                <p className="text-[10px] text-gray-400 font-light flex items-center gap-1">
                  {language === 'en' ? 'Digital Clone (Online)' : 'Clon Digital (En línea)'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <IoClose className="text-2xl" />
            </button>
          </div>

          {/* Cuerpo del Chat (Limpio, Sin patrones) */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col bg-[#fafafa]">
            {messages.map((msg) => {
              const isDiego = msg.sender === 'diego';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isDiego
                      ? 'bg-white text-gray-800 self-start border border-gray-100 shadow-sm w-full sm:max-w-[80%]'
                      : 'bg-gray-900 text-white self-end shadow-md'
                  }`}
                >
                  <p className="font-light whitespace-pre-wrap select-text">{msg.text}</p>
                  
                  {/* Selector de fecha interactivo */}
                  {msg.isCustomUI === 'select_date' && (
                    <div className="mt-3 flex flex-row gap-2 pt-2 border-t border-gray-100 w-full overflow-x-auto pb-2 scrollbar-thin select-none">
                      {getNext7Days().map((date, idx) => {
                        const dayName = date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const monthName = date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short' });
                        const dateStr = date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectDate(date, dateStr)}
                            className="flex flex-col items-center justify-center p-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex-shrink-0 min-w-[70px] text-center"
                          >
                            <span className="text-[9px] uppercase font-semibold text-gray-400">{dayName}</span>
                            <span className="text-xs font-bold text-gray-800 mt-0.5">{dayNum}</span>
                            <span className="text-[8px] font-light text-gray-500 mt-0.5">{monthName}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Selector de hora interactivo */}
                  {msg.isCustomUI === 'select_time' && (
                    <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 w-full">
                      {['09:30', '11:00', '12:30', '15:00', '16:30', '18:00'].map((hour, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectTime(hour)}
                          className="py-2 px-1 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer"
                        >
                          {hour}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Formulario de captura de Nombre y Correo */}
                  {msg.isCustomUI === 'collect_info' && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3 pt-2 w-full text-left">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                          {language === 'en' ? 'Full Name *' : 'Nombre Completo *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-blue-400 font-medium"
                          placeholder={language === 'en' ? 'e.g. John Doe' : 'Ej. Juan Pérez'}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                          {language === 'en' ? 'Email Address *' : 'Correo Electrónico *'}
                        </label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-blue-400 font-medium"
                          placeholder={language === 'en' ? 'e.g. john@email.com' : 'Ej. juan@correo.com'}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                          {language === 'en' ? 'Query details *' : 'Detalles de tu consulta *'}
                        </label>
                        <textarea
                          required
                          value={clientMessage}
                          onChange={(e) => setClientMessage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-blue-400 resize-none font-medium"
                          placeholder={language === 'en' ? 'Briefly describe your technical query...' : 'Describe brevemente tu consulta técnica...'}
                          rows={3}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleInfoSubmit}
                        disabled={!clientName.trim() || !clientEmail.trim() || !clientMessage.trim()}
                        className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-center rounded-xl text-xs transition-all cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        {language === 'en' ? 'Continue' : 'Continuar'}
                      </button>
                    </div>
                  )}

                  {/* Pasarela y botón de confirmación */}
                  {msg.isCustomUI === 'checkout' && (
                    isFreeEmailOnly ? (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-3 pt-2 w-full text-left">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-bold text-[11px] text-blue-950">
                              {language === 'en' ? 'Email Consultation' : 'Consulta por Email'}
                            </h5>
                            <p className="text-[9px] text-blue-700 font-light mt-0.5">
                              {language === 'en' ? 'Response in less than 24 hours' : 'Respuesta en menos de 24 horas'}
                            </p>
                          </div>
                          <span className="font-bold text-xs text-blue-700">
                            {language === 'en' ? 'Free' : 'Gratis'}
                          </span>
                        </div>
                        
                        <div className="pt-2 border-t border-blue-100">
                          <button
                            type="button"
                            onClick={handleConfirmBooking}
                            disabled={isSubmitting}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (language === 'en' ? 'Sending...' : 'Enviando...') : (language === 'en' ? 'Send free query' : 'Enviar consulta gratis')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-3 pt-2 w-full text-left">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-bold text-[11px] text-orange-950">
                              {language === 'en' ? 'Strategic Consultation' : 'Consulta Estratégica'}
                            </h5>
                            <p className="text-[9px] text-orange-700 font-light mt-0.5">
                              {language === 'en' ? `30 min Meet • ${selectedDateStr} at ${selectedTime} hs` : `Meet de 30 min • ${selectedDateStr} a las ${selectedTime} hs`}
                            </p>
                          </div>
                          <span className="font-bold text-xs text-green-700">€150.00</span>
                        </div>
                        
                        <div className="pt-2 border-t border-orange-100 flex flex-col gap-1.5">
                          <a
                            href="https://diego.lemonsqueezy.com/checkout/buy/consulta-30min-premium?discount=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setHasClickedPayment(true);
                              trackEvent('chat_begin_payment', { price: 150, currency: 'EUR' });
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold text-center rounded-xl text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider select-none"
                            style={{ textDecoration: 'none' }}
                          >
                            {language === 'en' ? '💳 Pay with LemonSqueezy' : '💳 Pagar con LemonSqueezy'}
                          </a>
                          
                          <button
                            type="button"
                            onClick={handleConfirmBooking}
                            disabled={isSubmitting}
                            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-center rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (language === 'en' ? 'Confirming...' : 'Confirmando...') : (language === 'en' ? 'Confirm my appointment' : 'Confirmar mi cita')}
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {/* Confirmación exitosa */}
                  {msg.isCustomUI === 'confirmed' && (
                    <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2 w-full text-left">
                      <span className="text-lg">🎉</span>
                      <div>
                        <h5 className="font-bold text-[11px] text-green-900">
                          {isFreeEmailOnly ? (language === 'en' ? 'Query Sent' : 'Consulta Enviada') : (language === 'en' ? 'Appointment Scheduled' : 'Cita Agendada')}
                        </h5>
                        <p className="text-[9px] text-green-700 font-light mt-0.5">
                          {isFreeEmailOnly
                            ? (language === 'en' ? `We will contact you at ${clientEmail}.` : `Te contactaremos en ${clientEmail}.`)
                            : (language === 'en' ? `For ${selectedDateStr} at ${selectedTime} hs via Google Meet.` : `Para el día ${selectedDateStr} a las ${selectedTime} hs por Google Meet.`)}
                        </p>
                      </div>
                    </div>
                  )}

                  <span className={`text-[8px] mt-1.5 self-end font-light ${isDiego ? 'text-gray-400' : 'text-gray-300'}`}>
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="bg-white text-gray-400 self-start rounded-2xl p-4 border border-gray-100 text-[10px] flex items-center gap-2 shadow-sm">
                <span>{language === 'en' ? 'Typing' : 'Escribiendo'}</span>
                <span className="flex gap-0.5 items-center">
                  <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Sugerencias de Respuestas Rápidas (Tipografía clara, apilada y limpia) */}
          {messages.length > 0 && !isTyping && (
            <div className="px-6 py-4 bg-white border-t border-gray-50 flex flex-col space-y-2.5">
              <div 
                onClick={() => setIsSuggestionsCollapsed(!isSuggestionsCollapsed)}
                className="flex items-center justify-between cursor-pointer select-none mb-1 text-[9px] text-gray-400 font-bold tracking-wider uppercase"
              >
                <span>{language === 'en' ? 'Suggested questions' : 'Preguntas sugeridas'}</span>
                {isSuggestionsCollapsed ? (
                  <IoChevronForward className="text-xs text-gray-400" />
                ) : (
                  <IoChevronDown className="text-xs text-gray-400" />
                )}
              </div>
              
              {!isSuggestionsCollapsed && (
                <>
                  <button
                    onClick={() => handleQuickReply(language === 'en' ? 'How can I integrate AI agents and LLMs in my company?' : '¿Cómo puedo integrar agentes de IA y LLMs en mi empresa?')}
                    className="w-full text-left text-gray-650 hover:text-gray-900 text-sm font-medium tracking-wide transition-colors cursor-pointer py-0.5 flex items-start"
                  >
                    <span className="text-gray-300 mr-2 select-none">→</span>
                    <span>{language === 'en' ? 'How can I integrate AI agents and LLMs in my company?' : '¿Cómo puedo integrar agentes de IA y LLMs en mi empresa?'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleQuickReply(language === 'en' ? 'I would like to conduct an audit of my technical architecture' : 'Me gustaría realizar una auditoría de mi arquitectura técnica')}
                    className="w-full text-left text-gray-650 hover:text-gray-900 text-sm font-medium tracking-wide transition-colors cursor-pointer py-0.5 flex items-start"
                  >
                    <span className="text-gray-300 mr-2 select-none">→</span>
                    <span>{language === 'en' ? 'I would like to conduct an audit of my technical architecture' : 'Me gustaría realizar una auditoría de mi arquitectura técnica'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleQuickReply(language === 'en' ? 'I want to ask about the Fractional CTIO service' : 'Quiero consultar sobre el servicio de CTIO Fraccional')}
                    className="w-full text-left text-gray-650 hover:text-gray-900 text-sm font-medium tracking-wide transition-colors cursor-pointer py-0.5 flex items-start"
                  >
                    <span className="text-gray-300 mr-2 select-none">→</span>
                    <span>{language === 'en' ? 'I want to ask about the Fractional CTIO service' : 'Quiero consultar sobre el servicio de CTIO Fraccional'}</span>
                  </button>
 
                  <button
                    onClick={startFreeEmailWizard}
                    className="w-full text-left text-green-600 hover:text-green-800 text-sm font-semibold tracking-wide transition-colors cursor-pointer pt-2.5 flex items-center gap-1.5 border-t border-gray-100 mt-1"
                  >
                    <IoMailOutline className="text-sm" />
                    <span>{language === 'en' ? 'Ask a free question via email' : 'Realizar una consulta gratuita por email'}</span>
                  </button>
 
                  <button
                    onClick={startBookingWizard}
                    className="w-full text-left text-blue-600 hover:text-blue-800 text-sm font-semibold tracking-wide transition-colors cursor-pointer pt-2.5 flex items-center gap-1.5 border-t border-gray-100 mt-1"
                  >
                    <IoCalendarOutline className="text-sm" />
                    <span>{language === 'en' ? 'Schedule a 30-minute Meet session directly' : 'Agendar una sesión Meet de 30 minutos directamente'}</span>
                  </button>
                </>
              )}
            </div>
          )}
 
          {/* Formulario de Entrada */}
          <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder={language === 'en' ? 'Ask me a technical question...' : 'Hazme una pregunta técnica...'}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendUserMessage(inputText)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-850 focus:outline-none placeholder-gray-400 focus:border-gray-300"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendUserMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
              className={`p-2.5 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer ${
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

      {/* Botón flotante estilo WhatsApp (Activo y Familiar - Centrado con la ventana) */}
      <div className="pointer-events-auto">
        <button
          onClick={handleToggleChat}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#20ba5a] transition-all duration-300 hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing shadow-green-500/20 drag-handle"
          aria-label={language === 'en' ? 'Open assistant chat' : 'Abrir chat del asistente'}
        >
          <BsChatDots className="text-xl" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </div>
  );
};

export default WhatsAppClone;
