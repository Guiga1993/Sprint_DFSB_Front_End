# Sprint_DFSB_Front_End

This is a simple front-end project for the Hydrogen Generator at PUC-Rio Digital.


## Backend Repository

The backend for this project can be found at:
https://github.com/Guiga1993/Sprint_DFSB_Back_End_API.git

## Project Structure

- `index.html` — Main HTML file
- `scripts.js` — JavaScript logic
- `style.css` — Stylesheet
- `img/` — Image assets


## How to Run

**Important:** Before using the front end, you must start the backend server.

1. Execute your `app.py` on the backend side (see the backend README for details).
2. Once the backend is running, open `index.html` in your web browser.
3. Ensure all files (`scripts.js`, `style.css`, and the `img/` folder) are in the same directory as `index.html`.

## Features

- Responsive layout
- JavaScript-powered interactivity
- Custom styles

## Frontend Usage Notes

- The frontend tables (customers, generators, assets) are empty by default when the page loads.
- Data is only shown after the user clicks the **Listar Todos** (List All) button or performs a search (e.g., by ID or serial number).
- After adding a new record, the table is not updated automatically; use **Listar Todos** or search to view the new entry.
- Each section also has a **Limpar Tabela** (Clear Table) button, which clears the table in the HTML only (no data is deleted from the database).

## Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)

## Author

- Guilherme Alves Lima

---