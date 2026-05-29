const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/stats',
    method: 'GET'
};

console.log('Testing /api/stats...');

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.end();
