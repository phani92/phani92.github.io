// Homepage wiring: loads data/projects.json, renders the bento grid and the filter chips.
// Home.ready resolves once the first render is done. To fill a featured-tile stat, set
// Home.stats[source] = value and call Home.applyStats(); renders keep applying it.
(function () {
  var FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'embedded', label: 'Embedded' },
    { key: 'ai', label: 'AI' }
  ];

  var Home = window.Home = {
    projects: [],
    stats: {},
    ready: null,
    renderProjects: renderProjects,
    applyStats: applyStats
  };

  function renderProjects(category) {
    var grid = document.getElementById('project-grid');
    if (!grid) return;
    var list = ProjectUtils.filterProjects(Home.projects, category);
    grid.innerHTML = list.map(ProjectUtils.projectTileHTML).join('');

    // A broken image falls back to the same icon block that image-less tiles use.
    grid.querySelectorAll('.tile').forEach(function (tile, i) {
      var img = tile.querySelector('.tile-img');
      if (!img) return;
      img.addEventListener('error', function () {
        img.outerHTML = ProjectUtils.tileIconHTML(list[i].icon, list[i].category);
      }, { once: true });
    });

    applyStats();
  }

  // Changing the filter rebuilds the tiles, so known stat values are re-applied each render.
  function applyStats() {
    document.querySelectorAll('#project-grid [data-stat-source]').forEach(function (el) {
      var value = Home.stats[el.getAttribute('data-stat-source')];
      if (value != null) el.textContent = value;
    });
  }

  function renderFilters(container) {
    container.innerHTML = FILTERS.map(function (f, i) {
      return '<button type="button" class="chip" data-filter="' + f.key + '" aria-pressed="' + (i === 0) + '">' +
        f.label + '</button>';
    }).join('');

    container.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip || chip.getAttribute('aria-pressed') === 'true') return;
      container.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      renderProjects(chip.getAttribute('data-filter'));
    });
  }

  function showProjectsError() {
    var grid = document.getElementById('project-grid');
    if (!grid) return;
    grid.innerHTML = '<p class="grid-error">Projects couldn\'t load. ' +
      '<a href="https://github.com/phani92" target="_blank" rel="noopener noreferrer">See them on GitHub.</a></p>';
  }

  function loadProjects() {
    return fetch('data/projects.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (projects) {
        if (!Array.isArray(projects)) throw new Error('projects.json is not an array');
        Home.projects = projects;
        var filters = document.querySelector('#work .filters');
        if (filters) renderFilters(filters);
        renderProjects('all');
        return projects;
      })
      .catch(function (err) {
        console.warn('Could not load projects:', err);
        showProjectsError();
        return [];
      });
  }

  Home.ready = new Promise(function (resolve) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { resolve(loadProjects()); });
    } else {
      resolve(loadProjects());
    }
  });
})();
