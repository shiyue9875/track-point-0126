const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    console.log('Proxy is being applied...'); // ✅ 添加日志
    app.use(
        createProxyMiddleware('/reportData', {
            target: 'http://localhost:8084/',
            changeOrigin: false,
            secure: false,
        })
    );
    app.use(
        createProxyMiddleware('/getmap', {
            target: 'http://localhost:8084/',
            changeOrigin: false,
            secure: false,
        })
    );
    app.use(
        createProxyMiddleware('/getRecordScreenId', {
            target: 'http://localhost:8084/',
            changeOrigin: false,
            secure: false,
        })
    );
};
