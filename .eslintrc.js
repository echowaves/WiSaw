module.exports = {
  env: {
    es6: true,
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base", "prettier"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    // 'comma-dangle': ['error', 'always'],
    "no-unused-vars": "off",
  },
  plugins: ["prettier"],
}
