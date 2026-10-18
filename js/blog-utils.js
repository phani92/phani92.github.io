var BlogUtils = (function () {
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DIARY_RE = /^Bots_diary_(\d{4})_(\d{2})_(\d{2})\.md$/;
  var STOCK_RE = /^stock_([A-Za-z]+)_(\d{4})_(\d{2})_(\d{2})\.md$/;

  function parseBlogFile(name) {
    var m = DIARY_RE.exec(name);
    if (m) {
      return { name: name, kind: 'diary', date: new Date(+m[1], +m[2] - 1, +m[3]), ticker: null };
    }
    m = STOCK_RE.exec(name);
    if (m) {
      return { name: name, kind: 'stock', date: new Date(+m[2], +m[3] - 1, +m[4]), ticker: m[1] };
    }
    return { name: name, kind: 'other', date: null, ticker: null };
  }

  function formatDate(date) {
    return date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear();
  }

  function blogLabel(name) {
    var p = parseBlogFile(name);
    if (p.kind === 'diary') return "Bot's diary · " + formatDate(p.date);
    if (p.kind === 'stock') return p.ticker + ' stock · ' + formatDate(p.date);
    return name.replace(/\.md$/, '');
  }

  function latestDiary(files) {
    if (!Array.isArray(files)) return null;
    for (var i = 0; i < files.length; i++) {
      if (parseBlogFile(files[i]).kind === 'diary') return files[i];
    }
    return null;
  }

  function countPosts(files) {
    return Array.isArray(files) ? files.length : null;
  }

  function extractTitle(markdown) {
    var lines = String(markdown).split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('# ') === 0) {
        return lines[i].slice(2)
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
          .replace(/<[^>]*>/g, '')
          .replace(/\*\*|\*|_|`/g, '')
          .trim();
      }
    }
    return null;
  }

  function isLive(postDate, now, maxAgeDays) {
    if (maxAgeDays === undefined) maxAgeDays = 3;
    var a = Date.UTC(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
    var b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((b - a) / 86400000);
    return days >= 0 && days <= maxAgeDays;
  }

  function resolvePostFromHash(hash, files) {
    var raw = String(hash || '').replace(/^#/, '');
    try {
      raw = decodeURIComponent(raw);
    } catch (e) {
      raw = '';
    }
    if (files.indexOf(raw) !== -1) return raw;
    return files.length ? files[0] : null;
  }

  var api = {
    parseBlogFile: parseBlogFile,
    formatDate: formatDate,
    blogLabel: blogLabel,
    latestDiary: latestDiary,
    countPosts: countPosts,
    extractTitle: extractTitle,
    isLive: isLive,
    resolvePostFromHash: resolvePostFromHash
  };
  if (typeof window !== 'undefined') window.BlogUtils = api;
  return api;
})();

if (typeof module !== 'undefined') module.exports = BlogUtils;
