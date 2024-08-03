import { createServer } from 'http';

const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');

});

const PORT = 5173;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}/`);
});
