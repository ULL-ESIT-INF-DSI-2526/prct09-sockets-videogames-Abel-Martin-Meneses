import net from 'net';
import { RequestType, ResponseType } from './types.js';
import { addVideogame, updateVideogame, removeVideogame, listVideogames, readVideogame } from './videogameManager.js';

const PORT = 60300;

/**
 * Servidor de videojuegos que escucha en el puerto especificado y maneja las peticiones de los clientes para gestionar colecciones de videojuegos.
 * El servidor soporta las operaciones de agregar, actualizar, eliminar, listar y leer videojuegos en la colección de cada usuario.
 * Cada petición se procesa y se envía una respuesta al cliente indicando el resultado de la operación.
 */
net.createServer((connection) => {
  console.log('Un cliente se ha conectado.');
  let wholeData = '';

  connection.on('data', (chunk) => {
    wholeData += chunk.toString();

    if (wholeData.includes('\n')) {
      const request: RequestType = JSON.parse(wholeData.trim());
      console.log(`Petición recibida: ${request.type} del usuario ${request.user}`);

      /**
       * Envía una respuesta al cliente con el resultado de la operación solicitada
       * @param response - El objeto de respuesta que contiene el tipo de operación, el éxito, un mensaje opcional y los datos relevantes (videogames o videogame)
       * La respuesta se convierte a JSON y se envía al cliente, luego se cierra la conexión.
       */
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