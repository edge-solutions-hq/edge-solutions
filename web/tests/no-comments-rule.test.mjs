import {test} from 'node:test';
import {RuleTester} from 'eslint';
import edgeComments from '../eslint-rules/no-comments.mjs';

RuleTester.describe = (_name, run) => run();
RuleTester.it = (name, run) => test(name, run);
RuleTester.itOnly = RuleTester.it;

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

const filename = `${process.cwd()}/src/example.jsx`;
const baseline = {'src/example.jsx': 1};

tester.run('no-comments', edgeComments.rules['no-comments'], {
  valid: [
    {code: 'const a = 1;', filename},
    {code: '#!/usr/bin/env node\nconst a = 1;', filename},
    {code: '// eslint-disable-next-line no-console\nconsole.log(1);', filename},
    {code: '// @ts-expect-error legacy\nconst a = b;', filename},
    {code: '/// <reference types="node" />\nconst a = 1;', filename},
    {code: '// kept\nconst a = 1;', filename, options: [{baseline}]},
    {code: '/* global window, document: readonly */\nconst a = 1;', filename},
    {code: '/* exported init */\nfunction init() {}', filename},
    {code: '/* eslint no-console: "off" */\nconst a = 1;', filename},
    {code: 'const a = /* @__PURE__ */ make();', filename},
  ],
  invalid: [
    ...[
      '// global state lives in the store',
      '/* global state lives in the store */',
      '// eslint is configured elsewhere',
      '/* eslint, then oxlint */',
      '// exported because the tests need it',
      '/* exported for tests: init */',
      '// @ts-strict would be nicer',
      '// globals are bad',
    ].map((comment) => ({
      code: `${comment}\nconst a = 1;`,
      filename,
      errors: [{messageId: 'banned'}],
    })),
    {code: '// says what\nconst a = 1;', filename, errors: [{messageId: 'banned'}]},
    {code: 'const a = <div>{/* label */}</div>;', filename, errors: [{messageId: 'banned'}]},
    {
      code: '// one\n/* two */\nconst a = 1;',
      filename,
      options: [{baseline}],
      errors: [{messageId: 'banned'}, {messageId: 'banned'}],
    },
  ],
});

tester.run('comment-baseline', edgeComments.rules['comment-baseline'], {
  valid: [
    {code: '// kept\nconst a = 1;', filename, options: [{baseline}]},
    {code: 'const a = 1;', filename},
  ],
  invalid: [
    {code: 'const a = 1;', filename, options: [{baseline}], errors: [{messageId: 'lower'}]},
  ],
});
