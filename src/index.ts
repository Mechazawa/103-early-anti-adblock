import * as http2 from 'node:http2';
import * as path from 'node:path';
import * as fs from 'node:fs';

import DeferredInvoker from "./DeferredInvoker";

const FAKE_RESOURCE = '/adv.css';

http2.createSecureServer({
    key: fs.readFileSync(path.join(__dirname, '../certs/localhost-privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/localhost-cert.pem')),
}, onRequest).listen(3000);

async function onRequest(request: http2.Http2ServerRequest, response: http2.Http2ServerResponse) {
    console.log(`[HTTP/${request.httpVersion}][${request.method}] ${request.url}`);

    // This trick only works on HTTP/2 or newer
    if (Number(request.httpVersion) < 2) {
        response.writeHead(505, {
            'Content-Type': 'text/html'
        }).end(`
            <h1>HTTP Version Not Supported</h1>
            <p>
                HTTP/2.0 or later required. <br>
                Please make sure that you're connecting using HTTPS
            </p>
        `);

        return;
    }

    if (request.url.startsWith(FAKE_RESOURCE)) {
        const token = request.url.split('?')[1] ?? '';

        DeferredInvoker.resolve(token);

        response.writeHead(204).end();
        return;
    }

    const token = DeferredInvoker.build(
        (adblock: boolean) => doResponse(response, adblock),
        1000,
    );

    response.writeEarlyHints({
        'link': `<${FAKE_RESOURCE}?${token}>; rel=preload; as=style`,
    });
}

function doResponse(response: http2.Http2ServerResponse, adblock: boolean) {
    response.writeHead(200, {
        'Content-Type': 'text/html',
    });

    if (adblock) {
        response.end(`
            <h1 style="color: red;">adblock detected</h1>
            <p>Please disable adblock so we can show you kittens</p>
        `);
    } else {
        response.end(`
            <h1>Advertisement resource was loaded</h1>
            <img src="http://placekitten.com/g/400/300" alt="Fake ad">
        `);
    }
}