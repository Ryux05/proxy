const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

export default function handler(req, res) {
  // Modify the target URL as needed
  const targetUrl = req.query.url;

  if (!targetUrl) {
    res.status(400).json({ error: 'No target URL provided' });
    return;
  }

  // Proxy the request to the target URL
  proxy.web(req, res, { target: targetUrl, changeOrigin: true }, (err) => {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  });
}
