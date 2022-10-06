module.exports = {
  ...require('@pooky-labs/prettier-config'),
  plugins: ['node_modules/@trivago/prettier-plugin-sort-imports', 'node_modules/prettier-plugin-solidity'],
  explicitTypes: 'always',
  overrides: [
    {
      files: '*.sol',
      options: {
        tabWidth: 4,
        singleQuote: false,
      },
    },
  ],
};
