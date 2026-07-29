import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuizQuestions, resolveProxyAffinity } from '../src/core/advisory-tools-engine.ts';
import type { ProxyDefinition } from '../src/domain/types.ts';

import proxies from '../src/data/proxies.json' with { type: 'json' };

const library = proxies as ProxyDefinition[];

test('quiz serves six questions, each with distinct options', () => {
  const questions = buildQuizQuestions();
  assert.equal(questions.length, 6);
  assert.equal(new Set(questions.map((q) => q.id)).size, 6);
  questions.forEach((question) => {
    assert.ok(question.prompt.length > 0);
    assert.equal(question.options.length, 3);
    assert.equal(new Set(question.options.map((o) => o.id)).size, 3);
  });
});

test('every quiz option points at a category that exists in the proxy library', () => {
  const categories = new Set(library.map((proxy) => proxy.category));
  for (let run = 0; run < 20; run += 1) {
    buildQuizQuestions().forEach((question) => {
      question.options.forEach((option) => {
        assert.ok(categories.has(option.categoryHint), `unknown category: ${option.categoryHint}`);
      });
    });
  }
});

test('affinity resolves to a proxy in the majority category', () => {
  const result = resolveProxyAffinity(library, [
    { id: 'a', label: '', categoryHint: 'Aquatic and Marine Life' },
    { id: 'b', label: '', categoryHint: 'Aquatic and Marine Life' },
    { id: 'c', label: '', categoryHint: 'Birds and Flying Creatures' },
  ]);
  const chosen = library.find((proxy) => proxy.id === result.proxyId);
  assert.ok(chosen, 'result must reference a real proxy');
  assert.equal(chosen.category, 'Aquatic and Marine Life');
  assert.equal(result.rate, chosen.ratePerCamel);
  assert.ok(result.snippet.includes(chosen.name.toLowerCase()));
});

test('affinity falls back to the first proxy rather than crashing on no answers', () => {
  const result = resolveProxyAffinity(library, []);
  assert.equal(result.proxyId, library[0].id);
  assert.ok(Number.isFinite(result.rate));
  assert.ok(!Number.isNaN(Date.parse(result.assessedAtISO)));
});
