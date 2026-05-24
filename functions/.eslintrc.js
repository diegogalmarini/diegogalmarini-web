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
    "max-len": "off",
    "indent": "off",
    "arrow-parens": "off",
    "linebreak-style": "off",
    "no-undef": "off",
    "object-curly-spacing": "off",
    "brace-style": "off",
    "block-spacing": "off",
    "no-empty": "off",
    "no-useless-escape": "off",
    "no-unused-vars": "off",
    "eol-last": "off",
  },
};
