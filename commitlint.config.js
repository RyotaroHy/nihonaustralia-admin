module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'wip',
        'merge',
        'setup',
      ],
    ],
    'subject-case': [0], // Allow any case for subject
    'header-max-length': [2, 'always', 100],
  },
};
