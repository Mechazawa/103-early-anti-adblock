import * as http2 from "node:http2";

import {Http2ServerRequest, Http2ServerResponse} from "http2";
import * as fs from "fs";
import * as path from "node:path";

const HOST_PORT_REGEX = /^(?<host>\d+[a-z.-]+[a-z0-9.-]*|[a-z][a-z0-9.-]*)?(?::?(?<port>\d+))?$/i;

export function start(
    onRequestHandler: (request: Http2ServerRequest, response: Http2ServerResponse) => void,
    hostPort?: string,
): http2.Http2SecureServer {
    const {
        host = '127.0.0.1',
        port = '3000',
    } = HOST_PORT_REGEX.exec(hostPort ?? '')?.groups ?? {};

    const server = http2.createSecureServer({
        key: fs.readFileSync(path.join(__dirname, '../certs/localhost-privkey.pem')),
        cert: fs.readFileSync(path.join(__dirname, '../certs/localhost-cert.pem')),
    }, onRequestHandler).listen(+port, host);

    console.log(`Server started on https://${host}:${port}/`);

    return server;
}