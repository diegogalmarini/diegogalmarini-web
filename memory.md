# 🧠 Memoria Evolutiva y Aprendizajes del Sistema (memory.md)

Este archivo es la memoria persistente del sistema. Aquí se registran los retos de ingeniería superados, las deudas técnicas resueltas, la justificación de decisiones arquitectónicas y los "gotchas" específicos de este repositorio para evitar regresiones de código.

---

## 🚀 Gotchas del Sistema y Lecciones Aprendidas

### 1. Fuga de Compilación por Barras Invertidas Escapadas en `constants.tsx`
*   **Problema**: Al definir artículos semilla del blog con código Markdown extenso dentro de variables de cadena en `src/constants.tsx`, el empaquetador de Vite fallaba silenciosamente o arrojaba errores extraños de tokenización.
*   **Causa**: Había barras invertidas sueltas al final de líneas dentro de bloques de texto que escapaban accidentalmente las comillas de cierre de la cadena de texto, rompiendo la estructura de JavaScript.
*   **Solución**: Se eliminaron todas las barras invertidas sueltas de escape en los strings multilínea de `src/constants.tsx`. **Gotcha**: Al redactar Markdown dentro de archivos `.tsx`, asegúrate de que ningún carácter especial escape las comillas de cierre del objeto.

### 2. Error 404 al Recargar Rutas SPA en Producción (Vercel & Firebase)
*   **Problema**: Al navegar por la web en modo SPA (usando enlaces de React Router), todo funcionaba. Pero al recargar la página directamente desde el navegador estando en `/en/blog` o `/services`, el servidor devolvía un error 404.
*   **Causa**: Los servidores de hosting intentan buscar físicamente un archivo `/en/blog/index.html` en el disco que no existe en una SPA.
*   **Solución**: 
    - En Firebase, configuramos la regla de reescritura en `firebase.json` dirigiendo todo el tráfico a `/index.html`.
    - En Vercel, creamos `vercel.json` con la directiva `rewrite` redirigiendo todas las rutas a `/index.html`.
    - **Gotcha**: Si creas nuevas rutas principales, verifica siempre que las reglas de reescritura de los hostings sigan enviando el tráfico a la SPA.

### 3. Exceso de Tamaño de Chunks en el Build de Vite
*   **Problema**: Al compilar, Vite/Rollup emitía advertencias críticas informando que algunos archivos JS de salida excedían los 500 kB de tamaño.
*   **Causa**: La importación masiva estática de Firebase y react-icons concentraba demasiada carga en un único bundle principal (`index.js`).
*   **Solución**: Se integró una regla de fragmentación en `vite.config.ts` utilizando `rollupOptions.output.manualChunks` para subdividir las dependencias en fragmentos separados (`vendor`, `firebase`, `router`, `icons`). Esto aceleró la carga inicial de la web drásticamente.

### 4. Caídas de Conexión en Sandbox de Auditor MCP (`chrome_devtools`)
*   **Problema**: El subagente Auditor de Google Search Console fallaba al conectar de forma remota a Chrome en el puerto `9222`, arrojando errores de tipo `EOF` en la interfaz de comunicación.
*   **Causa**: Aunque el navegador tiene la depuración remota encendida en el host, la máquina virtual o contenedor de ejecución de los agentes MCP está aislada por red y sufre cortes de comunicación con los puertos de la máquina física del usuario.
*   **Solución**: Si el Auditor de depuración remota automática se ve bloqueado por red, se proveen instrucciones claras de respaldo para que el usuario suba manualmente el archivo `sitemap.xml` a través del panel oficial de Google Search Console.

### 5. Faltantes de Exportación al Traducir Elementos Estáticos
*   **Problema**: Al integrar la traducción dinámica en la página de inicio y portafolio, se importaron diccionarios como `tagTranslations` y `finalCtaHeadlinesEn` desde `src/constants.tsx`, pero estos no estaban exportados en el archivo origen, deteniendo el empaquetado.
*   **Solución**: Se exportaron y definieron de forma limpia ambos diccionarios en `src/constants.tsx`.
*   **Gotcha**: Antes de dar por terminada una tarea que involucre archivos bilingües, ejecuta de forma mandatoria un build de producción (`npm run build`) para verificar que no existan variables sin exportar.

### 6. Desfase de Días de la Semana en Calendarios del CRM (BUG Resuelto)
*   **Problema**: En las vistas mensuales de citas y consultas, el día 1 de cada mes se colocaba siempre en la primera columna (Domingo), desalineando los días siguientes de la semana (ej. el lunes 1 de junio aparecía como domingo 1).
*   **Causa**: El mapeo de celdas de cuadrícula usaba únicamente la lista plana de fechas del mes (`eachDayOfInterval` entre el primer y último día del mes) sin rellenar la primera y última semana con los días circundantes de los meses anterior y siguiente.
*   **Solución**: Se integró `startOfWeek` y `endOfWeek` de `date-fns` en `Calendar.tsx` y `ConsultationCalendarView.tsx` para calcular las fechas del intervalo en base a semanas completas (comenzando en Domingo 0).
*   **Gotcha**: Al renderizar calendarios en React con rejillas de columnas CSS de 7 días, siempre inicia el intervalo en el primer día de la semana correspondiente al inicio del mes, rellenando con los días del mes anterior y opacándolos.

---

## 📈 Historial de Evolución Arquitectónica

### Junio de 2026: Restructuración del AI Harness y Workspace
*   **Cambio**: Se eliminaron archivos redundantes antiguos (`CODIGO_FUENTE_PRINCIPAL.md` y `DOCUMENTACION_PROYECTO_COMPLETO.md`) reduciendo el consumo de ventana de contexto en un 60%.
*   **Cambio**: Se establecieron los cimientos del "Context Quad" (`Agents.md`, `Claude.md`, `memory.md`, `diario.md`) permitiendo a cualquier IA colaborar de manera inmediata con nivel experto.
