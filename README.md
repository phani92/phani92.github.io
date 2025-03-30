# Portfolio Builder
* This project builds a website for personal portfolio using html, css and javascript.
* Currently this project is hosted on [github pages](https://pages.github.com/).

## Project Structure

- `index.html`: Main entry point of the website.
- `css/`: Contains stylesheets for the website.
  - `style.css`: Main styles for layout and design.
  - `responsive.css`: Styles for responsive design.
- `js/`: Contains JavaScript files for interactivity.
  - `main.js`: Main JavaScript file for dynamic content.
  - `env.js`: Add all the hard coded values like api keys etc..
  - `contact.js`: Javascript file to handle contact section.
  - `projects.js`: Javascript file to handle projects section.
- `assets/`: Directory for images and fonts.
  - `images/`: Contains image files used in the website.
  - `fonts/`: Contains custom font files.

## Setup Instructions

1. Clone the repository:
  ```
  git clone <repository-url>
  ```
2. To launch the project, run `python -m http.server` and open `localhost:8000` in a browser.
3. Replace your name and description in html/profile.html.
4. Replace `profile-placeholder.jpg` with your own image but with the same file name.
5. In `js/projects.js` file, replace the github weblink `https://api.github.com/users/<your_user_name>/repos` to fetch your own projects.

### Sending the contact form via email
- This project uses [emailjs](https://www.emailjs.com) to send the contact form information as an email to a designated address.

## License

This project is licensed under the MIT License.
