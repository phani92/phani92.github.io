const { test } = require('node:test');
const assert = require('node:assert/strict');
const B = require('../js/blog-utils.js');

test('parseBlogFile', () => {
  const d = B.parseBlogFile('Bots_diary_2026_10_06.md');
  assert.equal(d.kind, 'diary');
  assert.equal(d.date.getFullYear(), 2026);
  assert.equal(d.date.getMonth(), 9);
  assert.equal(d.date.getDate(), 6);
  const s = B.parseBlogFile('stock_NVIDIA_2025_04_14.md');
  assert.equal(s.kind, 'stock');
  assert.equal(s.ticker, 'NVIDIA');
  const o = B.parseBlogFile('notes.md');
  assert.equal(o.kind, 'other');
  assert.equal(o.date, null);
});

test('blogLabel', () => {
  assert.equal(B.blogLabel('Bots_diary_2026_10_06.md'), "Bot's diary · 6 Oct 2026");
  assert.equal(B.blogLabel('stock_NVIDIA_2025_04_14.md'), 'NVIDIA stock · 14 Apr 2025');
  assert.equal(B.blogLabel('weekly_recap_v2.md'), 'weekly_recap_v2');
});

test('latestDiary', () => {
  assert.equal(B.latestDiary(['stock_NVIDIA_2025_04_14.md', 'Bots_diary_2026_10_06.md', 'Bots_diary_2026_10_03.md']), 'Bots_diary_2026_10_06.md');
  assert.equal(B.latestDiary(['x.md']), null);
  assert.equal(B.latestDiary(null), null);
  assert.equal(B.latestDiary({}), null);
});

test('countPosts', () => {
  assert.equal(B.countPosts(['a.md', 'b.md']), 2);
  assert.equal(B.countPosts(undefined), null);
  assert.equal(B.countPosts('oops'), null);
});

test('extractTitle', () => {
  assert.equal(B.extractTitle('intro\n# The Binary Soul: An AI’s Late-Night Debate\nbody'), 'The Binary Soul: An AI’s Late-Night Debate');
  assert.equal(B.extractTitle('# **Bold** [link](http://x) <b>x</b> `code`'), 'Bold link x code');
  assert.equal(B.extractTitle('## only h2\ntext'), null);
});

test('isLive', () => {
  const post = new Date(2026, 9, 6);
  assert.equal(B.isLive(post, new Date(2026, 9, 9, 23, 0)), true);
  assert.equal(B.isLive(post, new Date(2026, 9, 10, 0, 30)), false);
  assert.equal(B.isLive(post, new Date(2026, 9, 18)), false);
  assert.equal(B.isLive(new Date(2026, 9, 20), new Date(2026, 9, 18)), false);
});

test('resolvePostFromHash', () => {
  const files = ['Bots_diary_2026_10_06.md', 'Bots_diary_2026_10_03.md'];
  assert.equal(B.resolvePostFromHash('#Bots_diary_2026_10_03.md', files), 'Bots_diary_2026_10_03.md');
  for (const h of ['#nope.md', '#../index.html', '#%E0%A4%A', '']) {
    assert.equal(B.resolvePostFromHash(h, files), 'Bots_diary_2026_10_06.md');
  }
  assert.equal(B.resolvePostFromHash('#a', []), null);
});
