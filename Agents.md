# 🤖 Portal de Agentes y Control de IA (Agents.md)

¡Bienvenido! Este es el portal central de entrada y el punto de acceso único para cualquier agente de IA (como Cursor, Gemini, Claude o ChatGPT) que acceda a este repositorio. 

Antes de tomar cualquier acción, realizar cambios de código o ejecutar comandos, **ES OBLIGATORIO** que leas este documento por completo, junto con los siguientes núcleos del espacio de trabajo:
1.  [Claude.md (Directrices de Código y Estética Premium)](file:///C:/Users/diego/diegogalmarini-web-style-resend/Claude.md)
2.  [memory.md (Memoria Evolutiva y Errores Superados)](file:///C:/Users/diego/diegogalmarini-web-style-resend/memory.md)
3.  [diario.md (Bitácora de Progreso Diario y Roadmap)](file:///C:/Users/diego/diegogalmarini-web-style-resend/diario.md)

---

## 🏗️ Roles del Bucle de Agentes

Operamos en un bucle cerrado de delegación y control de calidad. Cada agente tiene un rol estrictamente demarcado:

```
                  ┌──────────────────────────────┐
                  │      Agente Orquestador      │
                  └──────────────┬───────────────┘
                                 │
                         (Delega Tareas)
                                 ▼
                  ┌──────────────────────────────┐
                  │    Agente Desarrollador      │
                  └──────────────┬───────────────┘
                                 │
                        (Genera el Código)
                                 ▼
                  ┌──────────────────────────────┐
                  │     Agente Auditor (QA)      │
                  └──────────────┬───────────────┘
                                 │
                      (Prueba build & tests)
                                 ▼
                     [ÉXITO] ───► Despliegue
                     [FALLO] ───► Corrección (vuelve al Desarrollador)
```

### 1. Agente Orquestador (Orchestrator)
*   **Rol**: Administrador general del Roadmap.
*   **Misión**: Lee `diario.md` para entender el hito diario. Define los sub-pasos y delega la ejecución de código al Desarrollador. Mantiene el contexto de negocio alineado.

### 2. Agente Desarrollador (Developer / Builder)
*   **Rol**: Programador e integrador.
*   **Misión**: Escribe código limpio, modular, bilingüe y responsive en `src/`. Sigue rigurosamente las reglas estéticas detalladas en `Claude.md`.

### 3. Agente Auditor (Auditor / QA Guard)
*   **Rol**: Protector de producción y control de calidad.
*   **Misión**: Se ejecuta automáticamente al final de cualquier implementación. Su único objetivo es **destruir o validar** los cambios:
    - Corre `npm run build` y `npm run typecheck` para asegurar 0 errores de compilación.
    - Audita de forma automatizada las vistas responsive, enlaces activos y variables de idioma.
    - **Si hay un solo error**: Revoca o frena los cambios, genera un reporte detallado del log de error y obliga al Desarrollador a corregir todo de inmediato. No permite despliegues inestables.

---

## 📢 Subagentes Especializados de Negocio
Para tareas operativas repetitivas del SaaS de Diego Galmarini, delega en los siguientes subagentes ubicados en `/agents`:
*   [Marketing Campaign Agent](file:///C:/Users/diego/diegogalmarini-web-style-resend/agents/marketing_campaign_agent.md): Diseña copias de newsletters (Resend), publicaciones de LinkedIn y actualiza el `sitemap.xml`.
*   [Client Communication Agent](file:///C:/Users/diego/diegogalmarini-web-style-resend/agents/client_communication_agent.md): Elabora respuestas de correo o WhatsApp integradas con los Leads de Firestore.
*   [Consulting Advisor Agent](file:///C:/Users/diego/diegogalmarini-web-style-resend/agents/consulting_advisor_agent.md): Genera reportes técnicos y preguntas clave de pre-análisis 15 minutos antes de reuniones con clientes.

---

## 🛠️ Catálogo de Skills Útiles
Para automatizar flujos sin escribir código desde cero, los agentes tienen acceso a los siguientes scripts en `/scripts`:
*   `npm run build`: Valida la integridad general de compilación del empaquetador de producción Vite.
*   `node scripts/sync-firestore-blog.cjs`: Sincroniza artículos bilingües semilla del archivo constants a la base de datos Firestore.
*   `node scripts/populate-communication-logs.js`: Genera logs ficticios de clientes en Firestore para testing local del CRM.
*   `node scripts/generate_favicons.py`: Genera los assets gráficos y favicon bilingües.

---

## ✍️ Protocolo de Aprendizaje Obligatorio
Al completar cualquier tarea o hito con éxito, el agente a cargo **TIENE LA OBLIGACIÓN** de:
1.  Abrir [memory.md](file:///C:/Users/diego/diegogalmarini-web-style-resend/memory.md).
2.  Añadir una sección con la fecha y el aprendizaje técnico, incluyendo "gotchas" específicos superados (ej. problemas de CORS, tokens expirados de Firebase, límites de bundle de Vite).
3.  Registrar el avance detallado en [diario.md](file:///C:/Users/diego/diegogalmarini-web-style-resend/diario.md).
