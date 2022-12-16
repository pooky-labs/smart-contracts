module.exports = {
  ...require('@pooky-labs/prettier-config'),
  plugins: ['node_modules/@trivago/prettier-plugin-sort-imports', 'node_modules/prettier-plugin-solidity'],
  explicitTypes: 'always',
  importOrder: ['^@(.*)$', '<THIRD_PARTY_MODULES>', '^[./]'],
  overrides: [
    {
      files: '*.sol',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};
