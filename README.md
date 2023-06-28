# Covid Tracker

## I. Requirements
1. Clone the repository by using the command in the CLI `git clone https://github.com/CMSC447-TEAM09/covid-tracker` OR using Github Desktop (I'd highly recommend using this over CLI).
2. Install [Node.JS](https://nodejs.org/en/). I use 14.18.1 LTS version.
## II. Setting up React Application
1. After cloning the repository, go to `/covid-tracker/client/` and type `npm install` in the Shell to install the modules and dependencies needed to run React App.
2. Test the application by `npm start`.

## III. Setting up Flask Application
1. After cloning repo, go to `/covid-tracker/server/`, initialize virtual environment by `py -3 -m venv venv` (on Windows) `python3 -m venv venv` (on Linux or Mac).
2. Activate venv by running `\venv\Scripts\activate` (Windows) or `. venv/bin/activate` (Linux or Mac).
3. Install flask with `pip install flask` to install flask into library in venv.
4. Set FLASK_APP virtual environment variable with `export FLASK_APP=AppName` (Bash) or `set FLASK_APP=AppName` (CMD) or `$env:FLASK_APP = "AppName"` (Powershell).
5. Run flask with `flask run`.

## IV. Some important notes for the team during the development of this application.
### Regarding JIRA:
1. Use Issue Key when you make new branch, new commit, new merge, new pull request, this helps with synchronizing our work between JIRA and Github.
For example: `CT9-2 Testing issue key and Jira-Github integration`, CT9-2 is the issue key, followed by the actual commit message. Issue key can be found next to the issues on JIRA.

2. Make sure you maintain and update the Backlog by updating the status and progress of issues as well as creating additional tasks.

### Regarding REST APIs:
1. Use [Postman](https://www.postman.com/) to test REST API by sending HTTP Request to the server to invoke a response.
2. If you use Vscode, I'd highly recommend using [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client), it's lightweight, easy to use, and very efficient, you don't need to swap between your browser and text editor if you use Thunder Client.
3. Let's discuss what kinda of JSON data we want to communicate between client-side and server-side.

### Regarding Flask:
1. To keep the team up-to-date with all the dependencies that Flask uses. Make sure you use `pip freeze > requirements.txt` after you installed new packages, this ensures that the name of the package and its version is saved in a text file, ready to be installed by your team member. To install dependencies from this requirements.txt, simply use `pip install -r requirements.txt`.
2. Because venv is highly dependent on PATHs of the local machine, it's difficult to transfer the entire venv folder from machine to the other. Therefore, we want to use the above commands to save `requirements.txt` instead. Make sure you don't commit venv folder to github repo, you can do this by including /venv/ in .gitignore.
3. Some of you intend to use virtual machine to host Flask, that's fine I think? But let's discuss on how we can make developmental process between those that use virtual environment and virtual machine seemless.

### Regarding React:
1. If you need a good tutorial on React, I watched this [video](https://www.youtube.com/watch?v=w7ejDZ8SWv8&t=3257s) on my research of React, it's quite good and concise.
2. I also used this [course](https://fullstackopen.com/en/#course-contents) to learn. It's quite good.

### Regarding CSS and HTML5:
1. Research on Jinja for Flask, and JSX for React.
2. For CSS, Bootstrap is insanely good to make our application pretty and fast to prototype, if you have other framework you'd like to use. Please let me know.

### Regarding database:
1. To get the database up and running locally, you will need to do a few things
2. Install postgresql, you can do this on ubuntu with `sudo apt-get install postgresql postgresql-contrib`
3. Run the postgresql server `sudo service postgresql start`
4. create your own superuser `sudo -u postgres createuser --superuser [username here]`
5. `cd server/backend/`
6. `flask db init` + `flask db migrate` + `flask db upgrade`
7. The database (and tables eventually) are now created locally! you can check this by logging into your local database with `psql -U [username here] -d covid_tracker`
8. exit the database command line with `\q`
