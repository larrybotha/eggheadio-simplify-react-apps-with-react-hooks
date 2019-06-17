module.exports = {
  linters: {
    '**/*.+(js|json|less|css|ts|tsx|md)': [
      'prettier',
      // 'npm run test -- --coverage --findRelatedTests',
      'git add',
    ],
    '**/*.md': ['doctoc --github', 'git add'],
  },
}
