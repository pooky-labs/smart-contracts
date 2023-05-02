module.exports = {
  ...require('@pooky-labs/prettier-config'),
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports'), require.resolve('prettier-plugin-solidity')],
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
