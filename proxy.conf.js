const PROXY_CONFIG = [
  {
    context: [
      "/api"
    ],
    target: "http://localhost:8080",
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "^/api": ""
    },
    onProxyReq: (proxyReq, req, res) => {
      // Override Origin header to fool the backend into thinking it's a same-origin request
      proxyReq.setHeader('Origin', 'http://localhost:8080');
    }
  }
];

module.exports = PROXY_CONFIG;
