var ProjectUtils = (function () {
  var CATEGORY_LABELS = { embedded: 'EMBEDDED', ai: 'AI' };
  var DEFAULT_ICONS = { embedded: 'chip', ai: 'wave' };

  // Inline stroke icons (24x24) for tiles without an image.
  var ICONS = {
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>' +
      '<path d="M9 2.5V6M12 2.5V6M15 2.5V6M9 18v3.5M12 18v3.5M15 18v3.5M2.5 9H6M2.5 12H6M2.5 15H6M18 9h3.5M18 12h3.5M18 15h3.5"/>',
    wave: '<path d="M2 12c1.5 0 1.5-6 3-6s1.5 12 3 12 1.5-12 3-12 1.5 12 3 12 1.5-12 3-12 1.5 6 3 6"/>',
    flask: '<path d="M9 2.5h6M10 2.5v6.2L4.6 18.4A2 2 0 0 0 6.3 21.5h11.4a2 2 0 0 0 1.7-3.1L14 8.7V2.5"/><path d="M7.2 14.5h9.6"/>'
  };

  var ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESCAPES[c]; });
  }

  function filterProjects(projects, category) {
    if (category !== 'embedded' && category !== 'ai') return projects.slice();
    return projects.filter(function (p) { return p.category === category; });
  }

  function tileIconHTML(icon, category) {
    var name = ICONS[icon] ? icon : (DEFAULT_ICONS[category] || 'chip');
    return '<div class="tile-icon" data-icon="' + escapeHTML(name) + '">' +
      '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + '</svg></div>';
  }

  function statHTML(stat) {
    var source = stat.source ? ' data-stat-source="' + escapeHTML(stat.source) + '"' : '';
    var value = stat.value != null && stat.value !== '' ? stat.value : '—';
    return '<div class="stat"><span class="stat-value"' + source + '>' + escapeHTML(value) + '</span>' +
      '<span class="stat-label">' + escapeHTML(stat.label) + '</span></div>';
  }

  function projectTileHTML(p) {
    var category = p.category === 'ai' ? 'ai' : 'embedded';
    var classes = 'tile tile--' + category + (p.featured ? ' tile--featured' : '');
    var tag = (p.featured ? 'FEATURED · ' : '') + CATEGORY_LABELS[category] + ' · ' + p.tech;
    var media = '';

    if (!p.featured) {
      media = p.image
        ? '<img class="tile-img" src="' + escapeHTML(p.image) + '" alt="' + escapeHTML(p.imageAlt || '') + '" loading="lazy">'
        : tileIconHTML(p.icon, category);
    }

    var stats = p.featured && p.stats && p.stats.length
      ? '<div class="tile-stats">' + p.stats.map(statHTML).join('') + '</div>'
      : '';

    return '<a class="' + classes + '" href="' + escapeHTML(p.repo) + '" target="_blank" rel="noopener noreferrer">' +
      media +
      '<div class="tile-body">' +
      '<p class="tile-tag">' + escapeHTML(tag) + '</p>' +
      '<h3 class="tile-title">' + escapeHTML(p.title) + '</h3>' +
      '<p class="tile-summary">' + escapeHTML(p.summary) + '</p>' +
      '</div>' +
      stats +
      '</a>';
  }

  return {
    filterProjects: filterProjects,
    escapeHTML: escapeHTML,
    tileIconHTML: tileIconHTML,
    projectTileHTML: projectTileHTML
  };
})();

if (typeof module !== 'undefined') module.exports = ProjectUtils;
