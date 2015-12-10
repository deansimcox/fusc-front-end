# Precedent Front End Foundation
The front end of this project is set up with node, bower and gulp.

## Project setup
To be able to run the front end on your pc, you will need to follow these steps.

Pre-requisites include Node.js, Ruby, Python and Visual Studio. This seems like overkill but some of the node packages need to compile languages specific to your environment.
 1. Install [node.js](https://nodejs.org/en/download/). Add to PATH if prompted.
 2. Install [Ruby](http://rubyinstaller.org/). Add to PATH if prompted.
 3. Install [Python](https://www.python.org/downloads/). Add to PATH if prompted.
 4. If you don't not have visual studio installed, [download the free community version from here](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx).

Now that you have all of the above:
 1. Open up a command prompt and type 'npm install -g bower'.
 2. In the same command prompt, type 'npm install -g gulp'.

Now open up a command prompt in the root of the front end (This should be the folder that has the 'gulpfile.babel.js' file).
 1. In the command propmt run 'npm install'. This will install the npm modules dependencies for the project.
 2. Then run 'bower install'. This will install the bower dependencies.

If all of the above ran succesfully, you can now start the project usig the commands below.
If you encountered errors, don't worry. Googling usually helps. If you're stuck, contact your nearest front end developer for help.

## Project commands
Once the project is setup on your computer, the following commands are available from the command line. To run these commands, open up a command prompt at the root for the front end (This should be the folder that has the 'gulpfile.babel.js' file).
### gulp serve
In your command prompt, type 'gulp serve' and hit enter. This will open your project in you browser with browsersync and live compiling enabled. This means that any changes made to the source files in the 'app' folder will be automatically pushed to the browser.
### gulp serve:dist
In your command prompt, type 'gulp serve:dist' and hit enter. This is similar to the command above, except it will serve the files from 'dist' folder.
### gulp build
In your command prompt, type 'gulp build' and hit enter. This will compile all of your files in the 'app' folder, then move the compiled files into the 'dist' folder. The files in the dist file are production ready and will be used by the project.
