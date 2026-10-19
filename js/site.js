var SiteUtils = (function () {
  // The address is assembled from parts so it never appears as one literal in the HTML.
  var EMAIL_USER = 'phanindra.yellapu';
  var EMAIL_DOMAIN = 'gmail.com';
  var EMAIL_SUBJECT = 'Hello from your portfolio';

  function mailtoHref(user, domain, subject) {
    return 'mailto:' + user + '@' + domain + '?subject=' + encodeURIComponent(subject);
  }

  function initEmailLinks(doc) {
    var href = mailtoHref(EMAIL_USER, EMAIL_DOMAIN, EMAIL_SUBJECT);
    var address = EMAIL_USER + '@' + EMAIL_DOMAIN;
    var links = doc.querySelectorAll('[data-email-link]');
    for (var i = 0; i < links.length; i++) links[i].href = href;
    var texts = doc.querySelectorAll('[data-email-text]');
    for (var j = 0; j < texts.length; j++) texts[j].textContent = address;
  }

  function initNav(doc) {
    var toggle = doc.getElementById('nav-toggle');
    var links = doc.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // The footer keeps "2026" as its no-JS text; with JS it follows the clock.
  function initYear(doc, now) {
    var year = String((now || new Date()).getFullYear());
    var slots = doc.querySelectorAll('[data-year]');
    for (var i = 0; i < slots.length; i++) slots[i].textContent = year;
  }

  // With JS the skip link moves focus without touching the URL hash, so the blog page keeps
  // its deep link. Without JS the plain href="#main" still works.
  function initSkipLinks(doc) {
    var links = doc.querySelectorAll('.skip-link');
    for (var i = 0; i < links.length; i++) wireSkipLink(links[i]);

    function wireSkipLink(link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href') || '';
        var target = href.charAt(0) === '#' ? doc.getElementById(href.slice(1)) : null;
        if (!target) return;
        e.preventDefault();
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus();
      });
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      initEmailLinks(document);
      initNav(document);
      initYear(document);
      initSkipLinks(document);
    });
  }

  return {
    mailtoHref: mailtoHref,
    initEmailLinks: initEmailLinks,
    initNav: initNav,
    initYear: initYear,
    initSkipLinks: initSkipLinks
  };
})();

if (typeof module !== 'undefined') module.exports = SiteUtils;
