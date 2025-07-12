module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  // Añadimos la configuración del parser para que entienda el código moderno.
  parserOptions: {
    "ecmaVersion": 2020,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double"],
    "max-len": "off", // Mantenemos desactivada la regla de longitud máxima.
    "indent": "off", // Desactivamos la regla de indentación para evitar conflictos.
    "arrow-parens": "off", // Desactivamos para más flexibilidad.
  },
};
