import * as http2 from "node:http2";

import {Http2ServerRequest, Http2ServerResponse} from "http2";
import * as fs from "fs";
import * as path from "node:path";
import {Http2Server} from "node:http2";

const HOST_PORT_REGEX = /^(?<host>\d+[a-z.-]+[a-z0-9.-]*|[a-z][a-z0-9.-]*)?(?::?(?<port>\d+))?$/i;
const PATHS = {
    key: path.join(__dirname, '../certs/privkey.pem'),
    cert: path.join(__dirname, '../certs/cert.pem'),
}

export function start(
    onRequestHandler: (request: Http2ServerRequest, response: Http2ServerResponse) => void,
    hostPort?: string,
): Http2Server {
    const ssl = fs.existsSync(PATHS.cert) && fs.existsSync(PATHS.key);
    const {
        host = '127.0.0.1',
        port = '3000',
    } = HOST_PORT_REGEX.exec(hostPort ?? '')?.groups ?? {};

    const protocol = ssl ? 'https' : 'http';
    const server = ssl ? http2.createSecureServer({
        key: fs.readFileSync(PATHS.key),
        cert: fs.readFileSync(PATHS.cert),
    }, onRequestHandler) : http2.createServer(onRequestHandler);

    console.log(`Server started on ${protocol}://${host}:${port}/`);

    return server.listen(+port, host);
}