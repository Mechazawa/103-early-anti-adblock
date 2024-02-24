import {Http2ServerRequest, Http2ServerResponse} from 'node:http2';

import DeferredInvoker from "./DeferredInvoker";
import {start as startServer} from './server';

const FAKE_RESOURCE = '/adv.css';

async function onRequest(
    request: Http2ServerRequest,
    response: Http2ServerResponse,
): Promise<any> {
    console.log(`[HTTP/${request.httpVersion}][${request.method}] ${request.url}`);

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
    } else if (request.url.startsWith(FAKE_RESOURCE)) {
        const token = request.url.split('?')[1] ?? '';

        DeferredInvoker.resolve(token);

        // Cache headers are not required but nice to have
        response.writeHead(204, {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }).end();
    } else {
        const token = DeferredInvoker.build(
            (adblock: boolean) => doIndexResponse(response, adblock),
            500,
        );

        response.writeEarlyHints({
            'link': `<${FAKE_RESOURCE}?${token}>; rel=preload; as=style`,
        });
    }
}

function doIndexResponse(response: Http2ServerResponse, adblock: boolean) {
    response.writeHead(200, {
        'Content-Type': 'text/html',
    });

    if (adblock) {
        response.end(`
            <h1 style="color: red; text-transform: uppercase;">
                adblock detected
            </h1>
            <p>Please disable adblock so we can show you kittens</p>
        `);
    } else {
        response.end(`
            <h1>Advertisement resource was loaded</h1>
            <img src="http://placekitten.com/g/400/300" alt="Fake ad">
        `);
    }
}

// Start the server;
startServer(onRequest, process.argv[2]);