# Sprint_DFSB_Front_End

This project is a simple front-end application consisting of HTML, CSS, and JavaScript files. It is designed for study purposes as part of the Pós-Graduação PUC-Rio Digital program.

## Project Structure

- `index.html` — Main HTML file for the application.
- `style.css` — Stylesheet for the application.
- `scripts.js` — JavaScript logic for the application.
- `img/` — Folder containing image assets.

## Getting Started

1. **Clone or Download** this repository to your local machine.
2. **Open** the `index.html` file in your preferred web browser to view the application.

## Features

- Responsive layout using CSS.
- Interactive elements powered by JavaScript.
- Organized project structure for easy navigation.

## Requirements

- A modern web browser (Chrome, Firefox, Edge, Safari, etc.)

## Customization

- You can modify `style.css` to change the appearance.
- Update `scripts.js` to add or change functionality.
- Add images to the `img/` folder as needed.

## License

This project is for educational purposes only.

## How to Integrate with the Back End

To use the front end with the back end and have the full system working, follow these steps:

1. **Set Up the Back End**
   - Make sure you have the back-end server running. Follow the instructions in the back-end project's README to install dependencies and start the server.
   - Note the URL and port where the back end is running - http://127.0.0.1:5000.

2. **Configure the Front End**
   - If the front end needs to communicate with the back end (e.g., via API calls), ensure that the URLs in `scripts.js` point to the correct back-end server address.
   - Update any API endpoint URLs in your JavaScript code if necessary.

3. **Run the System**
   - Start the back-end server first.
   - Open `index.html` in your browser. The front end will send requests to the back end as needed (for example, to fetch or send data).

4. **Test the Integration**
   - Perform actions in the front end that require back-end interaction (such as submitting forms, fetching data, etc.) and verify that the responses are correct.
   - Check the browser console and back-end logs for any errors.

## Troubleshooting

- If the front end cannot connect to the back end, check that the back-end server is running and accessible at the specified URL.
- Make sure there are no CORS (Cross-Origin Resource Sharing) issues. If there are, configure the back end to allow requests from the front end's origin.
- Ensure both front end and back end are using compatible API endpoints and data formats.
