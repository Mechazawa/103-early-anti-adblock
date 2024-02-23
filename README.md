103 Early Anti Adblock
----------------------

Proof of concept that detects adblockers without Javascript by abusing `103 Early Hints`

# Running

Install dependencies using npm
```shell
npm install
```

Generate required CA certificates
```shell
npm run ca
```

Start the application
```shell
npm run serve
```

# How
By sending an early hints response before sending the real response we can gauge if the user has adblock installed. 
This way we can send the user an alternative page if they have adblock installed.
The beauty of this approach is that it does not rely on Javascript.

# Why
![For evil](img/patrick-star-evil-laugh.gif)