# 103 Early Anti Adblock
Proof of concept that detects adblockers without Javascript by abusing `103 Early Hints`

## Running
The application can be run either through a Docker container or directly on your machine using Node.js.

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

```
            ┌───────┐                ┌──────┐                  ┌───────┐                ┌──────┐
            │Browser│                │Server│                  │Browser│                │Server│
            └───┬───┘                └──┬───┘                  └───┬───┘                └──┬───┘
               ┌┴┐   GET /index.html   ┌┴┐                        ┌┴┐   GET /index.html   ┌┴┐
               │ │ ───────────────────>│ │                        │ │ ───────────────────>│ │
               │ │                     │ │                        │ │                     │ │
               │ │   103 Early Hints   │ │                        │ │   103 Early Hints   │ │
               │ │ <───────────────────│ │                        │ │ <───────────────────│ │
  ╔═══════════╤╪═╪═════════════════════╪═╪═══╗       ╔═══════════╤╪═╪═════════════════════╪═╪═══╗
  ║ PREFETCH  ││ │                     │ │   ║       ║ PREFETCH  ││ │                     │ │   ║
  ╟───────────┘│ │ GET /adv.css?ABCDEF │┌┴┐  ║       ╟───────────┘│ │ GET /adv.css?ABCDEF │┌┴┐  ║
  ║            │ │ ────────────────────>│ │  ║       ║            │ │ ──────────────────X ││ │  ║
  ║            │ │                     ││ │  ║       ║            │ │                     ││ │  ║
  ║            │ │   204 No Content    ││ │──║───┐   ║            │ │                     ││ │──║───┐
  ║            │ │ <────────────────────│ │  ║   │   ║            │ │                     │└┬┘  ║   │
  ║            │ │                     │└┬┘  ║   │   ╚════════════╪═╪═════════════════════╪═╪═══╝   │
  ╚════════════╪═╪═════════════════════╪═╪═══╝   │                │ │                     │ │ ┌─────┴─────────────┐  
               │ │                     │ │ ┌─────┴─────────────┐  │ │                     │ │ │Prefetch timeout:  │
               │ │       200 OK        │ │ │Resource fetched:  │  │ │       200 OK        │ │ │Adblock detected   │
               │ │<────────────────────│ │ │No adblock detected│  │ │<────────────────────│ │ └───────────────────┘
               └┬┘                     └┬┘ └───────────────────┘  └┬┘                     └┬┘
            ┌───┴───┐                ┌──┴───┐                  ┌───┴───┐                ┌──┴───┐
            │Browser│                │Server│                  │Browser│                │Server│
            └───────┘                └──────┘                  └───────┘                └──────┘
                              
```

## Support
At the moment this technique is only reliable in Firefox. 
Chrome does not allow adblockers to interact with resources loaded using early hints, nor does it display resources loaded using early hints in the developer console. 
Additionally, Safari does not support preload early hints at all. 
Browsers that do not fully support early hints can be easily detected by adding a harmless dummy resource to preload that will not be blocked by adblockers. 

Currently, this unintended side-effect may not be a significant problem due to these factors. 
However, as browsers continue to expand their support for early hints, it could become a reliable method for detecting adblockers.

I have previously [demonstrated other techniques](https://github.com/Mechazawa/pixelAntiAdblock) for detecting adblockers during the server response. 
Although those require a more involved implementation, they are more effective and less likely to produce false positives.

## Further Reading
Some good resource for learning more about `103 Early Hints` can be found here:
 - [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103)
 - [Faster page loads using server think-time with Early Hints](https://developer.chrome.com/docs/web-platform/early-hints)

## Why
![For evil](img/patrick-star-evil-laugh.gif)
