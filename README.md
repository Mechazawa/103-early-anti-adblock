# 103 Early Anti Adblock
Proof of concept that detects adblockers without Javascript by abusing `103 Early Hints`

## Running
The application can be run either through a Docker container or directly on your machine using Node.js.
Here's how:

### Docker
Using Docker simplifies the setup and ensures consistency across different environments. 
To launch the application in a Docker container, execute the following command:
```shell
npm run docker
```
This command wraps the process of building the Docker image and running the container. 
It ensures that you don't need to manually set up the environment on your local machine.

### Node
If you prefer running the application directly on your local environment, follow these steps:

Install the project dependencies using npm. 
```shell
npm install
```

The application requires SSL certificates for HTTP2.
```shell
npm run certs
```

Start the application
```shell
npm run serve
```

## How
The core idea behind this proof of concept is the use of 103 Early Hints response. 
By sending early hints prior to the actual response, the server can determine whether an adblocker is present based on the client's handling of these hints. 
If adblock is detected, the server can then serve an alternative page. 
This method is particularly effective because it doesn't depend on JavaScript, which can be disabled or manipulated by users.


## Why
![For evil](img/patrick-star-evil-laugh.gif)
