# React-STM
A prototype STM UI built using react and the STM REST API

#Installation
In order to get things running you'll need to install a few dependencies
 * Node.js & NPM (0.10 or later). Node.js is used to run the demo server and to run all the dev toolchain related    utilities.
 * MongoDB. Required for converting STM's basic auth to a bearer token based auth scheme. This could conceivably be      any db such as postgres or mysql with a little modification, but I used mongo as I had it set up on my dev machine    at the time. When the REST API has token auth built in, no database should be required. (Update: installing mongodb    on an lxc container is a PITA - so I might switch over to one of the aforementioned db's when I get a chance!)
 * To install everything on ubuntu 14.x, run the following commands
```
# install mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install mongodb-org

# install nodejs, npm & dependancies
sudo apt-get install nodejs nodejs-legacy build-essential npm

# install gulp (the build tool) globally
sudo npm install gulp -g

# install the packages to run the demo. Run this command from the root of the react-stm folder 
# (NOTE: a lot of these packages are for the dev toolchain, the amount of packages required to 
# actually run a production build is less)
npm install
```

 
#Running 
Gulp is used to run the various build & run related tasks. The tasks themselves are defined in gulpfile.js. To run the tasks below, make sure you are cd'ed into the root of the react-stm folder.
 * Running unit tests: ```gulp tests```. If you want the test runner to listen for changes to source files and run automatically, run ```gulp testsw```.
 * Running the server in development mode: ```gulp serverw```. The server will automatically restart when changes are detected to the backend source files. NOTE: the server uses ports 3000 & 3001 by default so make sure these are unused
 * Running in production mode:
```
NODE_ENV=production gulp build
NODE_ENV=production gulp server
```
 * NOTE: When switching between dev and production builds run ```gulp clean```.
 * To view the demo once the server is running, go to http://localhost:3000 and enter your STM credentials when prompted.

#Configuration
To work, the server needs access to a SteelApp Traffic Manager to which it can make REST API requests. Before running the server, go to lib/constants.js and change STM_HOST to point to the IP address of your Traffic Manager.
NOTE: it is assumed the REST api is listening on port 9070 and the STM admin UI is listening on port 9090.
