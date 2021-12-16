module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        loaders: {
          '.yml': 'text',
          '.yaml': 'text'
        }
      }
    ]
  }
};
