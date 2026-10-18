const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../js/projects.js');

const featured = {
  id: 'blogBot',
  title: 'blogBot',
  category: 'ai',
  tech: 'Python',
  summary: 'An AI agent that writes posts.',
  repo: 'https://github.com/phani92/blogBot',
  featured: true,
  stats: [
    { label: 'posts published', source: 'blogPostCount' },
    { label: 'running since', value: 'Apr 2025' }
  ]
};

const imageProject = {
  id: 'ultrasonic-measurement-device',
  title: 'Ultrasonic test rig',
  category: 'embedded',
  tech: 'MATLAB',
  summary: 'Measurement setup using an ultrasonic sensor.',
  repo: 'https://github.com/phani92/ultrasonic-measurement-device',
  image: 'images/projects/ultrasonic.webp',
  imageAlt: 'CAD render of the ultrasonic test rig'
};

const iconProject = {
  id: 'position-detection-system',
  title: 'Position detection',
  category: 'embedded',
  tech: 'C++',
  summary: 'Detects position using a resistance strip.',
  repo: 'https://github.com/phani92/position-detection-system',
  icon: 'chip'
};

const list = [featured, imageProject, iconProject];

test('filterProjects keeps order per category', () => {
  assert.deepEqual(P.filterProjects(list, 'embedded').map(p => p.id), [
    'ultrasonic-measurement-device',
    'position-detection-system'
  ]);
  assert.equal(P.filterProjects(list, 'ai').length, 1);
  assert.deepEqual(P.filterProjects(list, 'all').map(p => p.id), list.map(p => p.id));
});

test('filterProjects treats an unknown category as all', () => {
  assert.equal(P.filterProjects(list, 'bogus').length, 3);
});

test('escapeHTML escapes markup characters', () => {
  assert.equal(P.escapeHTML('<a href="x">\'&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('projectTileHTML renders the featured tile with stats', () => {
  const html = P.projectTileHTML(featured);
  assert.ok(html.includes('tile--featured'));
  assert.ok(html.includes('tile--ai'));
  assert.ok(html.includes('href="https://github.com/phani92/blogBot"'));
  assert.ok(html.includes('target="_blank"'));
  assert.ok(html.includes('rel="noopener noreferrer"'));
  assert.ok(html.includes('FEATURED · AI · Python'));
  assert.ok(html.includes('An AI agent that writes posts.'));
  assert.ok(html.includes('data-stat-source="blogPostCount"'));
  assert.ok(html.includes('>—<'));
  assert.ok(html.includes('>Apr 2025<'));
  assert.equal((html.match(/<div class="stat">/g) || []).length, 2);
});

test('projectTileHTML renders an image tile', () => {
  const html = P.projectTileHTML(imageProject);
  assert.ok(html.startsWith('<a class="tile tile--embedded"'));
  assert.ok(!html.includes('tile--featured'));
  assert.ok(html.includes('EMBEDDED · MATLAB'));
  assert.ok(html.includes('src="images/projects/ultrasonic.webp"'));
  assert.ok(html.includes('loading="lazy"'));
  assert.ok(html.includes('alt="CAD render of the ultrasonic test rig"'));
});

test('projectTileHTML renders an icon tile when there is no image', () => {
  const html = P.projectTileHTML(iconProject);
  assert.ok(html.includes('class="tile-icon"'));
  assert.ok(html.includes('data-icon="chip"'));
  assert.ok(html.includes('<svg'));
  assert.ok(!html.includes('<img'));
});

test('projectTileHTML escapes interpolated values', () => {
  const html = P.projectTileHTML({ ...iconProject, title: '<script>x</script>' });
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;x&lt;/script&gt;'));
  const attr = P.projectTileHTML({ ...imageProject, imageAlt: '" onerror="alert(1)' });
  assert.ok(!attr.includes('" onerror="'));
});

test('tileIconHTML falls back to a category icon when the icon is missing or unknown', () => {
  assert.ok(P.tileIconHTML('flask', 'ai').includes('data-icon="flask"'));
  assert.ok(P.tileIconHTML(undefined, 'embedded').includes('data-icon="chip"'));
  assert.ok(P.tileIconHTML('bogus', 'ai').includes('data-icon="wave"'));
});
