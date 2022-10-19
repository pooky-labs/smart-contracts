module.exports = {
  'pre-commit': "./node_modules/.bin/eslint '**/*.{js,ts}' && ./node-modules/.bin/hardhat docgen && git add ./docs",
};
