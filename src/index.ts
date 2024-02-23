import * as http2 from 'node:http2';
import * as path from 'node:path';
import * as fs from 'node:fs';

const TOKEN_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const FAKE_RESOURCE = 'adv.css';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const tokens = new Set<string>();

function generateToken() {
    let token = '';

    for (let i = 0; i < 8; i++) {
        token += TOKEN_CHARSET.charAt(Math.floor(Math.random() * TOKEN_CHARSET.length));
    }

    tokens.add(token);

    return token;
}

http2.createSecureServer({
    key: fs.readFileSync(path.join(__dirname, '../certs/localhost-privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/localhost-cert.pem')),
}, onRequest).listen(3000);

async function onRequest(request: http2.Http2ServerRequest, response: http2.Http2ServerResponse) {
    console.log(`[HTTP/${request.httpVersion}][${request.method}] ${request.url}`);

    if (request.url.includes(FAKE_RESOURCE)) {
        const token = request.url.split('?')[1] ?? '';

        tokens.delete(token);

        response.writeHead(204).end();
        return;
    }

    const token = generateToken();

    response.writeEarlyHints({
        'link': `</${FAKE_RESOURCE}?${token}>; rel=preload; as=style`,
    });

    // In a real application you probably want to listen for
    // an event, so you can respond instantly.
    await sleep(100);

    response.writeHead(200, {
        'content-type': 'text/html',
    });

    if (tokens.has(token)) {
        response.end("<h1>adblock detected</h1>");
    } else {
        response.end(`
            <h1>Advertisement resource was loaded</h1>
            <img src="http://placekitten.com/g/400/300" alt="Fake ad">
        `);
    }
}