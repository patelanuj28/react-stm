# react-stm
A prototype STM UI built using react and the STM REST API

#Installation
In order to get things running you'll need to install a few dependencies
 * Node.js (0.10 or later)
 * MongoDB
 * Install the node packages with ```npm install```.
 
#Running 
 * To run the tests run ```gulp tests```. If you want the test runner to listen for changes to source files and run automatically, run ```gulp testsw```.
 * To run the server in development mode run ```gulp serverw```. The server will automatically restart when changes are detected to the backend source files.
 * To build and run the server in production mode run
```
NODE_ENV=production gulp build
NODE_ENV=production gulp server
```
 * When switching between dev and production builds run ```gulp clean```.

#Configuration
To work, the server needs access to a SteelApp Traffic Manager to which it can make REST API requests. Before running the server, go to lib/constants.js and change STM_HOST to point to the IP address of your Traffic Manager.
