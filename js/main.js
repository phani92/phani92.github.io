// Author: Phani!
// Purpose: JavaScript file for the main page

// Function to load the content of the page
document.addEventListener('DOMContentLoaded', function () {
    function loadContent(page) {
        const content = document.getElementById('content');
        fetch(page)
            .then(response => response.text())
            .then(data => {
                content.innerHTML = data;
            })
            .catch(error => console.error('Error loading content:', error));
    }

    // Event listeners for navigation links
    document.getElementById('home-link').addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('projects-link').addEventListener('click', function () {
        loadContent('index.html');
    });

    document.getElementById('blogs-link').addEventListener('click', function () {
        loadContent('index.html');
    });

    ContactForm.init();
    ContactForm.setupContactLink();

    // Load the home page by default
    loadContent('index.html');
});
