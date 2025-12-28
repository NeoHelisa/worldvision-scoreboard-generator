// .eslintrc.js
module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    extends: [
      'eslint:recommended', // Uses the recommended rules from ESLint
      'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
      'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
      'plugin:react-hooks/recommended', // Uses the recommended rules for React Hooks
      'plugin:jsx-a11y/recommended', // Accessibility rules
      'plugin:prettier/recommended' // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors
    ],
    plugins: [
      'react',
      '@typescript-eslint',
      'react-hooks',
      'jsx-a11y',
      'prettier'
    ],
    parserOptions: {
      ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      ecmaFeatures: {
        jsx: true // Allows for the parsing of JSX
      }
    },
    settings: {
      react: {
        version: 'detect' // Automatically detect the React version
      }
    },
    rules: {
      'prettier/prettier': 'error', // Shows prettier errors as ESLint errors
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Allows functions to have implicit return types
      // Add or customize rules as needed
    },
    ignorePatterns: ['node_modules/', 'dist/'],
    overrides: [
      {
        files: ['scripts/**/*.ts', 'scripts/**/*.js'], // Apply to all JS/TS files in scripts/
        env: {
          node: true, // Enables Node.js global variables
          es2021: true // Enables ES2021 globals and syntax
        },
        rules: {
          // You can add or override rules specifically for scripts here
        }
      }
    ]
  };
  