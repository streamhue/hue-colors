module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: [
    'standard',
    'plugin:unicorn/recommended',
    'plugin:jsdoc/recommended'
  ],
  plugins: ['unicorn', 'jsdoc'],
  overrides: [
    {
      files: ['test/**'],
      rules: {
        'no-unused-vars': 'off' 
      }
    }
  ]
}
