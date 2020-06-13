# HTML5 Canvas Platformer

This is a web-based continuous platforming game written in JavaScript, with the server-side code in NodeJS and makes heavy use of the HTML5 canvas to render onscreen objects. The player is given two jumps and the game procedurally generates random sequences of platforms to navigate. As the game progresses, the difficulty will increase through the addition of spikes, larger gaps between platforms, and higher acceleration. The game is suitable for most mobile and desktop configurations, where a wide aspect ratio is recommended.

A peek of the game: 

![Game screenshot](public/images/canvas_platformer_fullsize.png?raw=true "Game screenshot")

## Getting Started

Since this game is web-based, that means getting started is simple. Clone/fork/download the code and (after having collected the dependencies from the `prerequisites` section), run the following in a terminal (git bash/equivalent):

#### To run the application 
```
cd path/to/project
[//]: # Install dependencies
npm install
[//]: # Expose server on port 8080
npm start
```
Then, navigate to `localhost:8080` or to the *public IP address*. This address is found following: https://www.avast.com/c-how-to-find-ip-address. The public IP address e.g. `192.218.222.101`, will allow any user on your local network to play the game.

#### To run the application in a container

```
cd path/to/project

[//]: # (Build image locally)
docker build -t your_image_name .

[//]: # Or pull image from docker registry (if forked & authenticated)
docker pull docker.pkg.github.com/abarkley123/canvas_platformer/master:latest

[//]: # Run the container
docker run -p 8080:8080 your_image_name 

[//]: # Stop and remove the container
docker stop CONTAINER_ID | xargs docker rm
```

> Note: SSL certificates were not generated for this project, so there is no https authentication/support.

#### To test the application
```
cd path/to/project

[//]: # (Test all files)
npm test

[//]: # (Test a given file)
npm test test/file_name_here.js

[//]: # (Access the coverage report in the browser)
file:///path/to/project/coverage/index.html
```

### Prerequisites

Some basic understanding of server operation would be helpful, in addition to the following:

* Git - https://git-scm.com/downloads
* OS-specific shell/command-line - Git bash (https://git-scm.com/downloads) or Terminal (pre-installed for MacOS, linux)
* NodeJS 12.x or higher - https://nodejs.org/en/download/
* Modern browser for ES8 support - https://caniuse.com/#feat=async-functions
#### To run the application in a container
* Docker - https://docs.docker.com/get-docker/

## Features

* Platform agnostic - built to run on any environment - natively (through NodeJS) or using containerisation.
* Device agnostic - Playable on any screen/device, supporting fullscreen & landscape mode on mobile.
* Procedurally generated - Encounter a different landscape every time you play and set of obstacles.
* Difficulty progression - The game gets harder the longer you play it - aim for a high score!
* Ready for the cloud - Set-up using configuration files to adjust logging levels, host-names, IP addresses and more based on the runtime environment. Docker image can be published to a cloud provider and run with minimal setup required. 

## Built With

* [JavaScript] - Utilising the latest ECMAScript 8 (https://en.wikipedia.org/wiki/ECMAScript#9th_Edition_-_ECMAScript_2018)
* [NodeJS] - Open-source, cross-platform, JavaScript runtime environment that executes JavaScript code outside a web browser. (https://nodejs.org/en/docs/)
* [Mocha] - "The fun, simple, flexible JavaScript test framework" https://mochajs.org/.
* [Istanbul] - Javascript test coverage tool https://istanbul.js.org/.
* [Babel] - The compiler for next generation JavaScript https://babeljs.io/.

## Author

*  **Andrew Barkley** - (https://github.com/abarkley123)

## License

This project is licensed under the MIT license - https://github.com/abarkley123/canvas_platformer/blob/master/LICENSE

## Acknowledgments

* Guidance for ES6 node support: https://hackernoon.com/import-export-default-require-commandjs-javascript-nodejs-es6-vs-cheatsheet-different-tutorial-example-5a321738b50f
* Platforming concept expanded from: https://github.com/abarkley123/Miracle-Quest/blob/master/js/main/runner.js
