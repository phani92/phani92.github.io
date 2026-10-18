// Blog page wiring: builds the post list from blogs/blogList.json, opens the post named in
// the URL hash (or the newest one) and renders it with marked, or a safe fallback renderer.
// Only names from blogList.json are ever fetched, so the hash can't point at other paths.
(function () {
    var listEl = document.getElementById('blog-list');
    var contentEl = document.getElementById('blog-content');
    var details = document.getElementById('blog-list-toggle');
    var countEl = document.getElementById('blog-count');
    var phone = window.matchMedia('(max-width: 720px)');

    var files = [];
    var links = {};
    var current = null;
    var requestId = 0;

    // Desktop: the list is always open and the summary is only a heading.
    // Phones: the list starts collapsed above the post.
    function syncListMode() {
        details.open = !phone.matches;
        details.querySelector('summary').tabIndex = phone.matches ? 0 : -1;
    }

    function statusHtml(message, isError) {
        var p = document.createElement('p');
        p.className = isError ? 'blog-status blog-error' : 'blog-status';
        p.textContent = message;
        return '<div class="blog-content-inner">' + p.outerHTML + '</div>';
    }

    function buildList(names) {
        var fragment = document.createDocumentFragment();
        names.forEach(function (name) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = '#' + encodeURIComponent(name);
            a.textContent = BlogUtils.blogLabel(name);
            li.appendChild(a);
            fragment.appendChild(li);
            links[name] = a;
        });
        listEl.innerHTML = '';
        listEl.appendChild(fragment);
        countEl.textContent = names.length.toLocaleString('en-US');
    }

    // Scrolls only the list, never the page.
    function scrollListTo(link) {
        if (!link || !link.offsetParent) return;
        var box = listEl.getBoundingClientRect();
        var r = link.getBoundingClientRect();
        if (r.top < box.top || r.bottom > box.bottom) {
            listEl.scrollTop += r.top - box.top - (box.height - r.height) / 2;
        }
    }

    function setActive(name) {
        if (current && links[current]) {
            links[current].classList.remove('active');
            links[current].removeAttribute('aria-current');
        }
        current = name;
        links[name].classList.add('active');
        links[name].setAttribute('aria-current', 'page');
        scrollListTo(links[name]);
    }

    function openPost(name) {
        setActive(name);
        loadBlog(name);
    }

    // Page load: the post named in the hash, or the newest post.
    function openInitialPost() {
        var name = BlogUtils.resolvePostFromHash(location.hash, files);
        if (!name) {
            contentEl.innerHTML = statusHtml('No posts yet.', false);
            return;
        }
        openPost(name);
    }

    // Later hash changes switch posts only for an exact post name. Any other hash (an in-post
    // footnote such as #ref1, the skip link) is left to the browser, which scrolls to it.
    function onHashChange() {
        var name = BlogUtils.postFromHashChange(location.hash, files);
        if (!name || name === current) return;
        if (phone.matches) details.open = false;
        if (contentEl.getBoundingClientRect().top < 0) contentEl.scrollIntoView();
        openPost(name);
    }

    function renderPost(md) {
        // Check if marked library is available
        if (typeof marked !== 'undefined' && marked.parse) {
            contentEl.innerHTML = '<div class="blog-content-inner">' + marked.parse(md) + '</div>';
        } else {
            // Fallback: Simple markdown rendering with HTML escaping for security
            console.warn('Marked library not available, using basic rendering');

            // First, escape HTML to prevent XSS
            const escapeHtml = (text) => {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };

            // Escape the entire markdown content first
            let html = escapeHtml(md);

            // Then apply markdown formatting on the escaped content
            html = html
                // Headers (after escaping, these are safe)
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                // Bold
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                // Italic
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                // Links (escaped, then converted to safe anchors)
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, function(match, text, url) {
                    // Additional validation for URLs
                    const isExternal = url.match(/^https?:\/\//);
                    const isRelative = url.match(/^\//);

                    if (isExternal || isRelative) {
                        // Escape URL for safe attribute usage
                        const safeUrl = url.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

                        if (isExternal) {
                            // External links open in new tab with security attributes
                            return '<a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
                        } else {
                            // Relative links open in same tab
                            return '<a href="' + safeUrl + '">' + text + '</a>';
                        }
                    }
                    return match; // Don't convert if not a valid URL
                })
                // Line breaks
                .replace(/\n\n/gim, '</p><p>')
                .replace(/\n/gim, '<br>');

            contentEl.innerHTML = '<div class="blog-content-inner"><p>' + html + '</p></div>';
        }
    }

    function loadBlog(filename) {
        var id = ++requestId;
        contentEl.setAttribute('aria-busy', 'true');
        fetch('../blogs/' + encodeURIComponent(filename))
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + filename);
                return res.text();
            })
            .then(function (md) {
                if (id !== requestId) return;
                renderPost(md);
            })
            .catch(function (err) {
                if (id !== requestId) return;
                console.error('Error loading markdown:', err);
                contentEl.innerHTML = statusHtml('Error loading blog post. Please try again later.', true);
            })
            .then(function () {
                if (id === requestId) contentEl.removeAttribute('aria-busy');
            });
    }

    syncListMode();
    phone.addEventListener('change', syncListMode);

    details.querySelector('summary').addEventListener('click', function (e) {
        if (!phone.matches) e.preventDefault();
    });

    details.addEventListener('toggle', function () {
        if (details.open && current) scrollListTo(links[current]);
    });

    // Phones: picking any post closes the list, including the one already open (its link
    // doesn't change the hash, so no hashchange follows).
    listEl.addEventListener('click', function (e) {
        if (phone.matches && e.target.closest('a')) details.open = false;
    });

    fetch('../blogs/blogList.json')
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status + ' for blogList.json');
            return res.json();
        })
        .then(function (list) {
            files = Array.isArray(list) ? list : [];
            buildList(files);
            openInitialPost();
            window.addEventListener('hashchange', onHashChange);
        })
        .catch(function (err) {
            console.error(err);
            listEl.innerHTML = '<li class="blog-list-status blog-error">Failed to load blog list.</li>';
            contentEl.innerHTML = statusHtml('Failed to load blog list.', true);
        });
})();
