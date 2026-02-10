// Author: Phani!
// Purpose: JavaScript file for the blogs.

fetch('../blogs/blogList.json')
    .then(res => res.json())
    .then(files => {
        const list = document.getElementById('blog-list');
        list.innerHTML = '';

        files.forEach(file => {
            const li = document.createElement('li');
            const a = document.createElement('a');

            a.href = "#";
            a.textContent = file.replace('.md', '');
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadBlog(file);
            });

            li.appendChild(a);
            list.appendChild(li);
        });
    })
    .catch(err => {
        document.getElementById('blog-list').innerHTML = 'Failed to load blog list.';
        console.error(err);
    });

function loadBlog(filename) {
    fetch(`../blogs/${filename}`)
        .then(res => res.text())
        .then(md => {
            const contentEl = document.getElementById('blog-content');
            
            // Check if marked library is available
            if (typeof marked !== 'undefined' && marked.parse) {
                contentEl.innerHTML = marked.parse(md);
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
                        if (url.match(/^(https?:\/\/|\/)/)) {
                            return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
                        }
                        return match; // Don't convert if not a valid URL
                    })
                    // Line breaks
                    .replace(/\n\n/gim, '</p><p>')
                    .replace(/\n/gim, '<br>');
                
                contentEl.innerHTML = '<p>' + html + '</p>';
            }
            
            contentEl.style.display = 'block';
        })
        .catch(err => {
            console.error('Error loading markdown:', err);
            document.getElementById('blog-content').innerHTML = '<p style="color: #ff3860;">Error loading blog post. Please try again later.</p>';
        });
}

