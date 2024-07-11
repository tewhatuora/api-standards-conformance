module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': 'google',
  'overrides': [
    {
      'env': {
        'node': true,
      },
      'files': [
        '.eslintrc.{js,cjs}',
      ],
      'parserOptions': {
        'sourceType': 'script',
      },
    },
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'plugins': [
    'cucumber',
  ],

  'rules': {
    'cucumber/async-then': 2,
    'cucumber/expression-type': 2,
    'cucumber/no-restricted-tags': [2, 'wip', 'broken', 'foo'],
    'cucumber/no-arrow-functions': 2,
    'require-jsdoc': 'off',
    'new-cap': ['error', {'capIsNewExceptions': ['Given', 'Then', 'When']}],
    'max-len': ['error', {'code': 120}],
  },
};
