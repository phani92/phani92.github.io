// Author: Phani!
// Purpose: JavaScript file for the main page

// Function to load the content of the page
document.addEventListener('DOMContentLoaded', function () {
    // Function to load content dynamically
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
    document.getElementById('home-link').addEventListener('click', function () {
        loadContent('index.html');
    });

    document.getElementById('portfolio-link').addEventListener('click', function () {
        loadContent('projects/index.html');
    });

    document.getElementById('photos-link').addEventListener('click', function () {
        loadContent('photos/index.html');
    });

    document.getElementById('blogs-link').addEventListener('click', function () {
        loadContent('blogs/index.html');
    });

    // Load the home page by default
    loadContent('index.html');
});
