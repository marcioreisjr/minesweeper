# Minesweeper - The classical computer game to find mines hidden across a grid.

Minesweeper is a puzzle video game where the player uncovers hidden tiles on a
grid while avoiding mines, using numerical clues to determine the location of
safe cells. This implementation allows multi-players to compete for the best
scores.

This app is a full-stack application to showcase the technologies listed below.
It is a personal project for the Galvanize Software Engineering Immersive
program.
- Django / REST Framework / Templates
- SQLite3
- Bootstrap
- HTML / CSS / JavaScript
- Git

## Installation
This system requires Python 3.10+ to be installed on your host system before
proceeding with the app’s installation. Here are the steps to follow:
- Download the source code from <a href="https://github.com/marcioreisjr/minesweeper/releases"
target="_blank">GitHub</a>.
- Decompress the image and navigate to the uncompressed directory.
- Create a virtual environment by running `python -m venv .venv`.
- Activate the virtual environment by running `source .venv/bin/activate`.
- Install the required packages by running `pip install -r requirements.txt`.
- Initialize the database with `python manage.py migrate`.
- Start the system by running `python manage.py runserver`.
- Finally, open your browser and navigate to <a href="http://localhost:8000/"
target="_blank">localhost:8000</a> to access the application.

## Design
The architecture of this system is composed of three subsystems:
- `Django-based back-end:` Responsible for fulfilling the RESTful requests from
the front end.
- `The Database:` This subsystem is the Django Object-Relational Mapping (ORM)
system that abstracts the database (SQLite3) access.
- `The App:` This is the front-end app that is delivered to the browser when
you access the host on port 8000. It serves as the user interface, interacts
with the remaining subsystems, and uses `vanilla JavaScript` to implement the
functionality and `bootstrap` for styling and responsiveness.

## Sample
This <a href="https://marciorj.pythonanywhere.com/accounts/signup/"
target="_blank">Minesweeper</a> app might be running on a free server. Please,
be patient if it takes a few seconds to load the page.
