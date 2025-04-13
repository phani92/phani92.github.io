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
            contentEl.innerHTML = marked.parse(md);
            contentEl.style.display = 'block';
        })
        .catch(err => {
            console.error('Error loading markdown:', err);
            document.getElementById('blog-content').innerHTML = 'Error loading blog post.';
        });
}

