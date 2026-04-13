import fs from 'fs';
import path from 'path';
import { Videogame } from './types.js';
import net from 'net';

const DB_DIR = './collections';

export const addVideogame = (
  user: string, 
  game: Videogame, 
  callback: (err: string | undefined, successMsg: string | undefined) => void
) => {
  const userDir = path.join(DB_DIR, user);
  const filePath = path.join(userDir, `${game.id}.json`);

  // Asegurar que el directorio del usuario existe
  fs.mkdir(userDir, { recursive: true }, (err) => {
    if (err) {
      return callback("Internal error accessing the database.", undefined);
    }
    // Comprobar si el fichero ya existe
    fs.access(filePath, (err) => {
      if (!err) {
        callback(`Videogame already exists at ${user} collection!`, undefined);
      } else {
        fs.writeFile(filePath, JSON.stringify(game, null, 2), (err) => {
          if (err) {
            callback('Error saving the videogame.', undefined);
          } else {
            callback(undefined, `New videogame added to ${user}'s collection!`);
          }
        });
      }
    });
  });
};

export const updateVideogame = (
  user: string, 
  game: Videogame, 
  callback: (err: string | undefined, successMsg: string | undefined) => void
) => {
  const userDir = path.join(DB_DIR, user);
  const filePath = path.join(userDir, `${game.id}.json`);

  fs.readdir(userDir, (err, files) => {
    if (err || files.length === 0) {
      return callback(`${user}'s collection could not be found or is empty.`, undefined);
    }

    fs.access(filePath, (err) => {
      if (err) {
        return callback(`Videogame not found at ${user}'s collection!`, undefined);
      }

      fs.writeFile(filePath, JSON.stringify(game, null, 2), (err) => {
        if (err) {
          callback('Error updating the videogame.', undefined);
        } else {
          callback(undefined, `Videogame updated at ${user}'s collection!`);
        }
      });
    });
  });
};

export const removeVideogame = (
  user: string, 
  id: number, 
  callback: (err: string | undefined, successMsg: string | undefined) => void
) => {
  const userDir = path.join(DB_DIR, user);
  const filePath = path.join(userDir, `${id}.json`);

  fs.readdir(userDir, (err, files) => {
    if (err || files.length === 0) {
      return callback(`${user}'s collection could not be found or is empty.`, undefined);
    }
    fs.access(filePath, (err) => {
      if (err) {
        callback(`Videogame not found at ${user} collection!`, undefined);
      } else {
        fs.rm(filePath, (err) => {
          if (err) {
            callback(`Error removing the videogame from ${user} collection!`, undefined);
          } else {
            callback(undefined, `Videogame removed correctly from ${user} collection!`);
          }
        });
      }
    });
  });
};

export const listVideogames = (
  user: string, 
  callback: (err: string | undefined, userGames: Videogame[] | undefined) => void
) => {
  const userDir = path.join(DB_DIR, user);

  fs.readdir(userDir, (err, files) => {
    if (err || files.length === 0) {
      return callback(`${user}'s collection could not be found or is empty.`, undefined);
    }

    let gamesRead: number = 0;
    const games: Videogame[] = [];

    files.forEach(file => {
      const filePath = path.join(userDir, file);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return callback(`Error reading a videogame at ${user}'s collection.`, undefined);
        }

        games.push(JSON.parse(data.toString()));
        gamesRead++;

        if (gamesRead === files.length) {
          games.sort((a, b) => a.id - b.id);
          callback(undefined, games);
        }
      });
    });
  });
};

export const readVideogame = (
  user: string, 
  id: number, 
  callback: (err: string | undefined, game: Videogame | undefined) => void
) => {
  const userDir = path.join(DB_DIR, user);
  const filePath = path.join(userDir, `${id}.json`);

  fs.readdir(userDir, (err, files) => {
    if (err || files.length === 0) {
      return callback(`${user}'s collection could not be found or is empty.`, undefined);
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        return callback(`Videogame not found at ${user}'s collection!`, undefined);
      }
      
      const game: Videogame = JSON.parse(data.toString());
      callback(undefined, game);
    });
  });
};