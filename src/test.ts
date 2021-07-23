import WebSocket from 'ws'
const clientID = '1318540031871639554.87a71173d8ae6af0d1d0a9565e0940de4004ec61f763ce0973604220ddd38b53'
const clientSecret = '106c2af8fdab7d2fa551f9b3e28eab4b79ccf8b0bac7ac2367f6e3c763fc393c'
const livesSocket = new WebSocket('wss://' + clientID + ':' + clientSecret + '@realtime.twitcasting.tv/lives');
livesSocket.on('message', function incoming(data: any, flags: any) {
    console.log(data);
});
