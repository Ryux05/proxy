const http = require('http');
const net = require('net');
const url = require('url');

// Membuat server HTTP yang bertindak sebagai proxy
const server = http.createServer((req, res) => {
    const targetUrl = req.url.slice(1); // Menghapus karakter '/' di depan URL

    const options = {
        hostname: url.parse(targetUrl).hostname,
        port: url.parse(targetUrl).port || 80,
        path: url.parse(targetUrl).path,
        method: req.method,
        headers: req.headers,
    };

    // Mengirim permintaan ke server tujuan melalui proxy
    const proxyRequest = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyRequest, { end: true });

    proxyRequest.on('error', (err) => {
        console.error('Proxy error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy error occurred.');
    });
});

// Menangani koneksi HTTPS untuk permintaan CONNECT
server.on('connect', (req, clientSocket, head) => {
    const { port, hostname } = url.parse(`//${req.url}`, false, true);

    const serverSocket = net.connect(port || 443, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (err) => {
        console.error('Tunnel error:', err);
        clientSocket.end('HTTP/1.1 500 Internal Server Error\r\n');
    });
});

// Menjalankan proxy server pada port 8080
server.listen(8080, () => {
    console.log('Proxy server berjalan di http://localhost:8080');
});
