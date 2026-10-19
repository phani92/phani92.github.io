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

  function fetchOk(url, kind) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res[kind]();
    });
  }

  // Fills the blogBot post count and the latest-post strip. Failures stay silent: the
  // stat keeps its default and the strip stays hidden.
  function loadBlogData() {
    return fetchOk('blogs/blogList.json', 'json').then(function (list) {
      var count = BlogUtils.countPosts(list);
      if (count !== null) {
        Home.stats.blogPostCount = count.toLocaleString('en-US');
        Home.applyStats();
      }
      var name = BlogUtils.latestDiary(list);
      if (!name) return;
      return fetchOk('blogs/' + name, 'text').then(function (markdown) {
        var title = BlogUtils.extractTitle(markdown);
        var strip = document.getElementById('live');
        if (!title || !strip) return;
        var date = BlogUtils.parseBlogFile(name).date;
        var href = 'html/blogs.html#' + encodeURIComponent(name);
        var badge = strip.querySelector('.live-badge');
        var live = BlogUtils.isLive(date, new Date());
        badge.textContent = live ? '● Live' : 'Latest post';
        badge.classList.toggle('is-live', live);
        strip.querySelector('.live-title').textContent = title;
        strip.querySelector('.live-title').href = href;
        strip.querySelector('.live-date').textContent = 'Published automatically on ' + BlogUtils.formatDate(date);
        strip.querySelector('.live-link').href = href;
        strip.hidden = false;
      });
    }).catch(function (err) {
      console.warn('Could not load blog data:', err);
    });
  }

  Home.ready = new Promise(function (resolve) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { resolve(loadProjects()); });
    } else {
      resolve(loadProjects());
    }
  });
  Home.ready.then(loadBlogData);
})();
