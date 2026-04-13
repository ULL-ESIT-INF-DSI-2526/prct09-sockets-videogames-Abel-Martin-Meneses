import { describe, expect, test, beforeAll, afterAll, vi } from "vitest";
import fs from "fs";
import path from "path";
import { addVideogame, updateVideogame, removeVideogame, listVideogames, readVideogame } from "../src/videogameManager.js";
import { Videogame, Platform, Genre, Developer } from "../src/types.js";

const TEST_USER = "testuser";
const TEST_DIR = path.join('./collections', TEST_USER);

const dummyGame: Videogame = {
  id: 999,
  name: "Test",
  description: "A test description",
  platform: Platform.SWITCH,
  genre: Genre.ADVENTURE,
  developer: Developer.NINTENDO,
  year: 2017,
  multiplayer: false,
  hours: 50,
  value: 60
};

describe("Videogame Manager Tests", () => {
  beforeAll(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  // TESTS PARA ADDVIDEOGAME
  describe("addVideogame()", () => {
    test("Debería añadir un videojuego correctamente", () =>
      new Promise<void>((done) => {
        addVideogame(TEST_USER, dummyGame, (err, msg) => {
          expect(err).toBeUndefined();
          expect(msg).toBe(`New videogame added to ${TEST_USER}'s collection!`);
          done();
        });
      }));

    test("Debería dar error si el videojuego ya existe", () =>
      new Promise<void>((done) => {
        addVideogame(TEST_USER, dummyGame, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe(`Videogame already exists at ${TEST_USER} collection!`);
          done();
        });
      }));

    test("Debería simular error del sistema al crear directorio (mkdir)", () =>
      new Promise<void>((done) => {
        const mkdirSpy = vi.spyOn(fs, 'mkdir').mockImplementation((...args: any[]) => {
          const cb = args[args.length - 1];
          cb(new Error("Permiso denegado"));
        });
        addVideogame("nuevo_usuario", dummyGame, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe("Internal error accessing the database.");
          mkdirSpy.mockRestore();
          done();
        });
      }));

    test("Debería simular error del sistema al escribir fichero (writeFile)", () =>
      new Promise<void>((done) => {
        const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation((...args: any[]) => {
          const cb = args[args.length - 1];
          cb(new Error("Disco Lleno"));
        });
        addVideogame("otro_usuario", dummyGame, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe("Error saving the videogame.");
          writeSpy.mockRestore();
          fs.rmSync('./collections/otro_usuario', { recursive: true, force: true });
          done();
        });
      }));
  });

  // TESTS PARA READVIDEOGAME
  describe("readVideogame()", () => {
    test("Debería leer un videojuego existente", () =>
      new Promise<void>((done) => {
        readVideogame(TEST_USER, 999, (err, game) => {
          expect(err).toBeUndefined();
          expect(game?.name).toBe("Test");
          done();
        });
      }));

    test("Debería dar error si el videojuego no existe", () =>
      new Promise<void>((done) => {
        readVideogame(TEST_USER, 888, (err, game) => {
          expect(game).toBeUndefined();
          expect(err).toBe(`Videogame not found at ${TEST_USER}'s collection!`);
          done();
        });
      }));
  });

  // TESTS PARA UPDATEVIDEOGAME
  describe("updateVideogame()", () => {
    test("Debería actualizar un videojuego existente", () =>
      new Promise<void>((done) => {
        const updatedGame = { ...dummyGame, name: "Test Updated" };
        updateVideogame(TEST_USER, updatedGame, (err, msg) => {
          expect(err).toBeUndefined();
          expect(msg).toBe(`Videogame updated at ${TEST_USER}'s collection!`);
          done();
        });
      }));

    test("Debería dar error al actualizar un juego que no existe", () =>
      new Promise<void>((done) => {
        const fakeGame = { ...dummyGame, id: 888 };
        updateVideogame(TEST_USER, fakeGame, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe(`Videogame not found at ${TEST_USER}'s collection!`);
          done();
        });
      }));

    test("Debería simular error del sistema al sobrescribir fichero (writeFile)", () =>
      new Promise<void>((done) => {
        const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation((...args: any[]) => {
          const cb = args[args.length - 1];
          cb(new Error("Error de I/O"));
        });
        updateVideogame(TEST_USER, dummyGame, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe("Error updating the videogame.");
          writeSpy.mockRestore();
          done();
        });
      }));

    test("Debería dar error al actualizar si el usuario no tiene colección", () =>
      new Promise<void>((done) => {
        updateVideogame("ghost_user", dummyGame, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe("ghost_user's collection could not be found or is empty.");
          done();
        });
      }));
  });

  // TESTS PARA LISTVIDEOGAMES
  describe("listVideogames()", () => {
    test("Debería listar MÚLTIPLES videojuegos y ordenarlos", () =>
      new Promise<void>((done) => {
        const dummyGame2: Videogame = {
          ...dummyGame,
          id: 1000, 
          name: "Test 2"
        };

        addVideogame(TEST_USER, dummyGame2, () => {
          listVideogames(TEST_USER, (err, games) => {
            expect(err).toBeUndefined();
            expect(games?.length).toBe(2);
            expect(games![0].id).toBe(999);
            expect(games![1].id).toBe(1000);
            done();
          });
        });
      }));

    test("Debería simular error del sistema al leer el contenido (readFile)", () =>
      new Promise<void>((done) => {
        const readSpy = vi.spyOn(fs, 'readFile').mockImplementation((...args: any[]) => {
          const cb = args[args.length - 1];
          cb(new Error("Archivo corrupto"));
        });
        listVideogames(TEST_USER, (err, games) => {
          expect(games).toBeUndefined();
          expect(err).toBe(`Error reading a videogame at ${TEST_USER}'s collection.`);
          readSpy.mockRestore();
          done();
        });
      }));
  });

  // TESTS PARA REMOVEVIDEOGAME
  describe("removeVideogame()", () => {
    test("Debería simular error del sistema al borrar el fichero (rm)", () =>
      new Promise<void>((done) => {
        const rmSpy = vi.spyOn(fs, 'rm').mockImplementation((...args: any[]) => {
          const cb = args[args.length - 1];
          cb(new Error("Archivo bloqueado"));
        });
        removeVideogame(TEST_USER, 999, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe(`Error removing the videogame from ${TEST_USER} collection!`);
          rmSpy.mockRestore();
          done();
        });
      }));

    test("Debería dar error al borrar un juego que no existe", () =>
      new Promise<void>((done) => {
        removeVideogame(TEST_USER, 888, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe(`Videogame not found at ${TEST_USER} collection!`);
          done();
        });
      }));

    test("Debería borrar un videojuego existente", () =>
      new Promise<void>((done) => {
        removeVideogame(TEST_USER, 999, (err, msg) => {
          expect(err).toBeUndefined();
          expect(msg).toBe(`Videogame removed correctly from ${TEST_USER} collection!`);
          done();
        });
      }));

    test("Debería dar error al borrar si la colección no existe", () =>
      new Promise<void>((done) => {
        removeVideogame("ghost_user", 999, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe("ghost_user's collection could not be found or is empty.");
          done();
        });
      }));
  });

  // TESTS PARA COLECCIÓN VACÍA
  describe("Comprobaciones de colección vacía", () => {
    const EMPTY_USER = "empty_user";
    const EMPTY_DIR = path.join('./collections', EMPTY_USER);

    beforeAll(() => {
      if (!fs.existsSync(EMPTY_DIR)) {
        fs.mkdirSync(EMPTY_DIR, { recursive: true });
      }
    });

    afterAll(() => {
      if (fs.existsSync(EMPTY_DIR)) {
        fs.rmSync(EMPTY_DIR, { recursive: true, force: true });
      }
    });

    test("updateVideogame: Debería dar error si la colección existe pero está vacía", () =>
      new Promise<void>((done) => {
        updateVideogame(EMPTY_USER, dummyGame, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe(`${EMPTY_USER}'s collection could not be found or is empty.`);
          done();
        });
      }));

    test("removeVideogame: Debería dar error si la colección existe pero está vacía", () =>
      new Promise<void>((done) => {
        removeVideogame(EMPTY_USER, 999, (err, msg) => {
          expect(msg).toBeUndefined();
          expect(err).toBe(`${EMPTY_USER}'s collection could not be found or is empty.`);
          done();
        });
      }));

    test("listVideogames: Debería dar error si la colección existe pero está vacía", () =>
      new Promise<void>((done) => {
        listVideogames(EMPTY_USER, (err, games) => {
          expect(games).toBeUndefined();
          expect(err).toBe(`${EMPTY_USER}'s collection could not be found or is empty.`);
          done();
        });
      }));

    test("readVideogame: Debería dar error si la colección existe pero está vacía", () =>
      new Promise<void>((done) => {
        readVideogame(EMPTY_USER, 999, (err, game) => {
          expect(game).toBeUndefined();
          expect(err).toBe(`${EMPTY_USER}'s collection could not be found or is empty.`);
          done();
        });
      }));
  });
});