// Author: Phani!
// Purpose: JavaScript file for the projects section of the website.

const loadGitHubProjects = () => {
    const projectsList = document.getElementById('projects-list');
    if (!projectsList) {
        console.warn('No #projects-list found in DOM');
        return;
    }

    fetch('https://api.github.com/users/phani92/repos')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch repos');
            return response.json();
        })
        .then(repos => {
            console.log('Fetched repos:', repos);

            // Filter out forks (optional)
            const filtered = repos.filter(repo => !repo.fork && repo.stargazers_count > 0);

            // Sort by stars
            filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);

            projectsList.innerHTML = '';

            if (filtered.length === 0) {
                projectsList.innerHTML = `<p>No projects with stars yet.</p>`;
                return;
            }

            filtered.forEach(repo => {
                const card = document.createElement('div');
                card.className = 'project-card';

                card.innerHTML = `
                    <a href="${repo.html_url}" target="_blank" class="project-card-link">
                        <h3>${repo.name}</h3>
                        <p>${repo.description || 'No description'}</p>
                        <p>⭐ ${repo.stargazers_count} &nbsp; | &nbsp; 🍴 ${repo.forks_count}</p>
                    </a>
                `;

                // Make entire card clickable
                card.addEventListener('click', () => {
                    window.open(repo.html_url, '_blank');
                });

                document.querySelector(".projects-list").appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading GitHub projects:', error);
            projectsList.innerHTML = `<p>Error loading projects: ${error.message}</p>`;
        });
};
