const https = require('https');
const req = https.get('https://crm.makprojetosmake.com.br/api/health', (res) => {
  console.log('Remote Address:', res.socket.remoteAddress);
});
