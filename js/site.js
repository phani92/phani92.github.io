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

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      initEmailLinks(document);
      initNav(document);
    });
  }

  return { mailtoHref: mailtoHref, initEmailLinks: initEmailLinks, initNav: initNav };
})();

if (typeof module !== 'undefined') module.exports = SiteUtils;
