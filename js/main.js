// Author: Phani!
// Purpose: JavaScript file for the main page

document.addEventListener('DOMContentLoaded', function () {
    function loadSection(id, filePath, callback) {
        const section = document.getElementById(id);
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                section.innerHTML = data;
                if (callback) callback();
            })
            .catch(error => console.error(`Error loading ${filePath}:`, error));
    }

    // Home
    loadSection('profile-section', 'html/profile.html');
    document.getElementById('home-link').addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Projects
    loadSection('projects-section', 'html/projects.html', () => {
        loadGitHubProjects();
    });
    document.getElementById('projects-link').addEventListener('click', function (e) {
        e.preventDefault();
        const section = document.getElementById('projects-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    });

    // Blogs
    document.getElementById('blogs-link').addEventListener('click', function (e) {
        e.preventDefault();
        alert('Blogs section coming soon!');
    });

    // Contact
    loadSection('contact-section', 'html/contact.html', () => {
        ContactForm.init();
    });
    document.getElementById('contact-link').addEventListener('click', function (e) {
        e.preventDefault();
        const section = document.getElementById('contact-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
});
