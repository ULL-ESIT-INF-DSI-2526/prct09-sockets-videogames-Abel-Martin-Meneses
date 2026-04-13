export enum Platform {
  PC = "PC",
  PS5 = "PlayStation 5",
  XBOX = "Xbox Series X/S",
  SWITCH = "Nintendo Switch",
  STEAMDECK = "Steam Deck"
}

export enum Genre {
  ACTION = "Acción",
  ADVENTURE = "Aventura",
  RPG = "Rol",
  STRATEGY = "Estrategia",
  SPORTS = "Deportes",
  SIMULATION = "Simulación"
}

export enum Developer {
  NINTENDO = "Nintendo",
  FROMSOFTWARE = "FromSoftware",
  CDPROJEKTRED = "CD Projekt Red",
  ROCKSTAR = "Rockstar Games"
}

export interface Videogame {
  id: number;
  name: string;
  description: string;
  platform: Platform;
  genre: Genre;
  developer: Developer;
  year: number;
  multiplayer: boolean;
  hours: number;
  value: number;
}

export type RequestType = {
  type: 'add' | 'update' | 'remove' | 'read' | 'list';
  user: string;
  videogame?: Videogame;
  id?: number;
};

export type ResponseType = {
  type: 'add' | 'update' | 'remove' | 'read' | 'list';
  success: boolean;
  message?: string;
  videogames?: Videogame[]; 
  videogame?: Videogame;    
};