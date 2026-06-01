#!/bin/bash

# ==============================================================================
# 🤖 DIEGO GALMARINI - SCRIPT DE INICIALIZACIÓN DE ENTORNO & HARNESS AI (init.sh)
# ==============================================================================

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Limpiar pantalla
clear

# Banner principal
echo -e "${BLUE}"
echo "=========================================================================="
echo "      ____  _                     ____       _                           "
echo "     |  _ \(_) ___  __ _  ___    / ___| __ _| |_ __ ___   __ _ _ __ _ __ "
echo "     | | | | |/ _ \/ _\` |/ _ \  | |  _ / _\` | | '_ \` _ \ / _\` | '__| '__|"
echo "     | |_| | |  __/ (_| | (_) | | |_| | (_| | | | | | | | (_| | |  | |   "
echo "     |____/|_|\___|\__, |\___/   \____|\__,_|_|_| |_| |_|\__,_|_|  |_|   "
echo "                   |___/                                                 "
echo "                                                                         "
echo "                    SOCIOTECNOLOGICO & AI HARNESS SYSTEM                 "
echo "=========================================================================="
echo -e "${NC}"

echo -e "${BLUE}[1/4] Checking environment dependencies...${NC}"

# 1. Validar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado. Por favor, instálalo antes de continuar.${NC}"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js detectado (${NODE_VERSION})${NC}"
fi

# 2. Validar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm no está instalado. Por favor, instálalo antes de continuar.${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm detectado (v${NPM_VERSION})${NC}"
fi

# 3. Validar Firebase CLI
if ! command -v npx firebase --version &> /dev/null && ! command -v firebase --version &> /dev/null; then
    echo -e "${YELLOW}⚠ Advertencia: Firebase CLI no detectado de forma global. Usaremos npx de ser necesario.${NC}"
else
    echo -e "${GREEN}✓ Firebase CLI detectado${NC}"
fi

echo -e "\n${BLUE}[2/4] Verifying local environment variables...${NC}"

# 4. Validar archivo de entorno (.env.local)
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ Advertencia: No se encuentra el archivo .env.local en la raíz.${NC}"
    echo -e "Creando una plantilla básica de .env.local..."
    cat <<EOT > .env.local
VITE_FIREBASE_API_KEY=PLACEHOLDER_KEY
VITE_FIREBASE_AUTH_DOMAIN=PLACEHOLDER_DOMAIN
VITE_FIREBASE_PROJECT_ID=PLACEHOLDER_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=PLACEHOLDER_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=PLACEHOLDER_SENDER_ID
VITE_FIREBASE_APP_ID=PLACEHOLDER_APP_ID
EOT
    echo -e "${GREEN}✓ .env.local creado con variables plantilla. Recuerda rellenarlo con tus credenciales reales.${NC}"
else
    echo -e "${GREEN}✓ Archivo .env.local detectado y listo.${NC}"
fi

echo -e "\n${BLUE}[3/4] Preparing package dependencies...${NC}"

# 5. Instalar dependencias si falta node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Carpeta node_modules no encontrada. Instalando dependencias...${NC}"
    npm install
    echo -e "${GREEN}✓ Instalación completa de dependencias.${NC}"
else
    echo -e "${GREEN}✓ Dependencias ya instaladas (node_modules existente).${NC}"
fi

echo -e "\n${BLUE}[4/4] Verifying production build integrity...${NC}"

# 6. Compilar el proyecto para verificar que no haya regresiones
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Compilación y tipos de TypeScript verificados con éxito (0 errores).${NC}"
else
    echo -e "${RED}❌ Error: La compilación falló. Por favor revisa los logs de Vite.${NC}"
    exit 1
fi

echo -e "\n${GREEN}==========================================================================${NC}"
echo -e "${GREEN}✓ ¡ENTORNO INICIALIZADO CON ÉXITO Y 100% OPERATIVO!${NC}"
echo -e "${GREEN}==========================================================================${NC}"
echo -e "\nPara arrancar el sistema:"
echo -e "  1. Ejecuta ${BLUE}npm run dev${NC} para lanzar el servidor de desarrollo local."
echo -e "  2. Instruye a tu Copiloto / Agente de IA para que lea ${BLUE}Agents.md${NC} en la raíz."
echo -e "     Esto activará el Harness AI con el Orquestador y Auditor de Calidad."
echo -e "=========================================================================="
