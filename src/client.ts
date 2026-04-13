import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import net from 'net';
import { Platform, Genre, Videogame, Developer, RequestType, ResponseType } from './types.js';
import { getColoredValue } from './utils.js';

const PORT = 60300;

/**
 * Envía una solicitud al servidor para realizar una operación en la colección de videojuegos de un usuario
 * @param request - El objeto de solicitud que contiene el tipo de operación, el usuario, y los datos relevantes (videogame o id)
 * La función establece una conexión con el servidor, envía la solicitud en formato JSON, y maneja la respuesta del servidor para mostrar los resultados al usuario.
 */
const sendRequestToServer = (request: RequestType) => {
  const client = net.connect({ port: PORT });
  let wholeData = '';

  client.write(JSON.stringify(request) + '\n');

  client.on('data', (chunk) => {
    wholeData += chunk.toString();
  });

  client.on('end', () => {
    const response: ResponseType = JSON.parse(wholeData.trim());
    if (!response.success) {
      console.log(chalk.red(response.message));
    } else if (response.message) {
      console.log(chalk.green(response.message));
    }
    if (response.type === 'list' && response.success && response.videogames) {
      console.log(chalk.green(`${request.user}'s videogame collection`));
      response.videogames.forEach(game => printVideogame(game));
    }
    if (response.type === 'read' && response.success && response.videogame) {
      printVideogame(response.videogame);
    }
    client.end();
  })

  client.on('error', (err) => {
    console.log(chalk.red('Error de conexión: Asegúrate de que el servidor está encendido.'));
  });

}

/**
 * Imprime la información de un videojuego en la consola de forma formateada
 * @param game - El objeto de videojuego que se desea imprimir
 */
const printVideogame = (game: Videogame) => {
  console.log('--------------------------------');
  console.log(`ID: ${game.id}`);
  console.log(`Name: ${game.name}`);
  console.log(`Description: ${game.description}`);
  console.log(`Platform: ${game.platform}`);
  console.log(`Genre: ${game.genre}`);
  console.log(`Developer: ${game.developer}`);
  console.log(`Year: ${game.year}`);
  console.log(`Multiplayer: ${game.multiplayer}`);
  console.log(`Estimated hours: ${game.hours}`);
  console.log(`Market value: ${getColoredValue(game.value)}`);
  console.log('--------------------------------');
};

yargs(hideBin(process.argv))
  .command('add', 'Add new videogame', {
    user: { type: 'string', demandOption: true },
    id: { type: 'number', demandOption: true },
    name: { type: 'string', demandOption: true },
    desc: { type: 'string', demandOption: true },
    platform: { type: 'string', demandOption: true },
    genre: { type: 'string', demandOption: true },
    developer: { type: 'string', demandOption: true },
    year: { type: 'number', demandOption: true },
    multiplayer: { type: 'boolean', demandOption: true },
    hours: { type: 'number', demandOption: true },
    value: { type: 'number', demandOption: true }
  }, (argv) => {
    sendRequestToServer({
      type: 'add',
      user: argv.user,
      videogame: {
        id: argv.id, name: argv.name, description: argv.desc,
        platform: argv.platform as Platform, genre: argv.genre as Genre,
        developer: argv.developer as Developer, year: argv.year,
        multiplayer: argv.multiplayer, hours: argv.hours, value: argv.value
      }
    });
  })

  .command('update', 'Update a videogame', {
    user: { type: 'string', demandOption: true },
    id: { type: 'number', demandOption: true },
    name: { type: 'string', demandOption: true },
    desc: { type: 'string', demandOption: true },
    platform: { type: 'string', demandOption: true },
    genre: { type: 'string', demandOption: true },
    developer: { type: 'string', demandOption: true },
    year: { type: 'number', demandOption: true },
    multiplayer: { type: 'boolean', demandOption: true },
    hours: { type: 'number', demandOption: true },
    value: { type: 'number', demandOption: true }
  }, (argv) => {
    sendRequestToServer({
      type: 'update',
      user: argv.user,
      videogame: {
        id: argv.id, name: argv.name, description: argv.desc,
        platform: argv.platform as Platform, genre: argv.genre as Genre,
        developer: argv.developer as Developer, year: argv.year,
        multiplayer: argv.multiplayer, hours: argv.hours, value: argv.value
      }
    });
  })

  .command('remove', "Remove a videogame", {
    user: { type: 'string', demandOption: true },
    id: { type: 'number', demandOption: true }
  }, (argv) => {
    sendRequestToServer({ type: 'remove', user: argv.user, id: argv.id });
  })

  .command('list', "List all games", {
    user: { type: 'string', demandOption: true }
  }, (argv) => {
    sendRequestToServer({ type: 'list', user: argv.user });
  })

  .command('read', 'Read a videogame', {
    user: { type: 'string', demandOption: true },
    id: { type: 'number', demandOption: true }
  }, (argv) => {
    sendRequestToServer({ type: 'read', user: argv.user, id: argv.id });
  })

  .help()
  .parse();