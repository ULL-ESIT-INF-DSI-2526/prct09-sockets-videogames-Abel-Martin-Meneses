import net from 'net';
import { RequestType, ResponseType } from './types.js';
import { addVideogame, updateVideogame, removeVideogame, listVideogames, readVideogame } from './videogameManager.js';

const PORT = 60300;

net.createServer((connection) => {
  console.log('Un cliente se ha conectado.');
  let wholeData = '';

  connection.on('data', (chunk) => {
    wholeData += chunk.toString();

    if (wholeData.includes('\n')) {
      const request: RequestType = JSON.parse(wholeData.trim());
      console.log(`Petición recibida: ${request.type} del usuario ${request.user}`);

      const sendResponse = (response: ResponseType) => {
        connection.write(JSON.stringify(response) + '\n');
        connection.end();
      };

      switch (request.type) {
        case 'add':
          addVideogame(request.user, request.videogame!, (err, msg) => {
            sendResponse({ type: 'add', success: !err, message: err || msg });
          });
          break;

        case 'update':
          updateVideogame(request.user, request.videogame!, (err, msg) => {
            sendResponse({ type: 'update', success: !err, message: err || msg });
          });
          break;

        case 'remove':
          removeVideogame(request.user, request.id!, (err, msg) => {
            sendResponse({ type: 'remove', success: !err, message: err || msg });
          });
          break;

        case 'list':
          listVideogames(request.user, (err, games) => {
            sendResponse({ type: 'list', success: !err, message: err, videogames: games });
          });
          break;

        case 'read':
          readVideogame(request.user, request.id!, (err, game) => {
            sendResponse({ type: 'read', success: !err, message: err, videogame: game });
          });
          break;

        default:
          sendResponse({ type: request.type, success: false, message: 'Comando no reconocido' });
      }
    }
  });

  connection.on('close', () => {
    console.log('Un cliente se ha desconectado.\n');
  });

}).listen(PORT, () => {
  console.log(`Servidor de videojuegos escuchando en el puerto ${PORT}...`);
});