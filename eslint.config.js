import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
    // Ignore patterns
    {
        ignores: ['build/**', 'node_modules/**', 'src/api/functions/**'],
    },

    // Base JS recommended rules
    js.configs.recommended,

    // TypeScript recommended rules
    ...tseslint.configs.recommended,

    // React Hooks rules
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },

    // Custom rules for our project
    {
        rules: {
            // Warn on any usage but don't block builds
            '@typescript-eslint/no-explicit-any': 'warn',

            // Allow unused vars with _ prefix (common pattern)
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],

            // Allow empty functions (event handlers, catch blocks)
            '@typescript-eslint/no-empty-function': 'off',

            // Allow require imports (some configs need them)
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
);
