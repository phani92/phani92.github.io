const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/site.js');

test('mailtoHref', () => {
  assert.equal(
    S.mailtoHref('phanindra.yellapu', 'gmail.com', 'Hello from your portfolio'),
    'mailto:phanindra.yellapu@gmail.com?subject=Hello%20from%20your%20portfolio'
  );
});

test('initEmailLinks fills every email link and email text node', () => {
  const links = [{ href: 'https://www.linkedin.com/in/phanindra-kumar-yellapu' }, { href: '' }];
  const texts = [{ textContent: '' }];
  const doc = {
    querySelectorAll(selector) {
      if (selector === '[data-email-link]') return links;
      if (selector === '[data-email-text]') return texts;
      return [];
    }
  };

  S.initEmailLinks(doc);

  const expected = 'mailto:phanindra.yellapu@gmail.com?subject=Hello%20from%20your%20portfolio';
  assert.equal(links[0].href, expected);
  assert.equal(links[1].href, expected);
  assert.equal(texts[0].textContent, 'phanindra.yellapu@gmail.com');
});

test('initNav toggles the menu and closes it when a link is clicked', () => {
  function fakeElement() {
    const handlers = {};
    const classes = new Set();
    const attrs = {};
    return {
      classList: {
        toggle(c) { if (classes.has(c)) { classes.delete(c); return false; } classes.add(c); return true; },
        remove(c) { classes.delete(c); },
        contains(c) { return classes.has(c); }
      },
      setAttribute(k, v) { attrs[k] = String(v); },
      getAttribute(k) { return k in attrs ? attrs[k] : null; },
      addEventListener(type, fn) { handlers[type] = fn; },
      fire(type, target) { handlers[type]({ target: target }); }
    };
  }
  const toggle = fakeElement();
  toggle.setAttribute('aria-expanded', 'false');
  const links = fakeElement();
  const anchor = { closest: (sel) => (sel === 'a' ? anchor : null) };
  const doc = { getElementById: (id) => ({ 'nav-toggle': toggle, 'nav-links': links })[id] || null };

  S.initNav(doc);

  toggle.fire('click');
  assert.equal(links.classList.contains('is-open'), true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');

  toggle.fire('click');
  assert.equal(links.classList.contains('is-open'), false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');

  toggle.fire('click');
  links.fire('click', anchor);
  assert.equal(links.classList.contains('is-open'), false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
});

test('initNav does nothing when the nav is missing', () => {
  assert.doesNotThrow(() => S.initNav({ getElementById: () => null }));
});
