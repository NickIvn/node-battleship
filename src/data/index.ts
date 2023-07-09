class Player {
    name: string;
    password: string;
    index: string;
    wins: number;

    constructor(name: string, password: string, index: string) {
      this.name = name;
      this.password = password;
      this.index = index;
      this.wins = 0;
    }
  }

  export const players: Player[] = [];

export function playerExists(name: string): boolean {
    return players.some((player) => player.name === name);
  }

export function registerPlayer(name: string, password: string, index: string) {
    if (playerExists(name)) {
      return { index: -1, error: true, errorText: 'Player already exists' };
    }

    const newPlayer = new Player(name, password, index);
    players.push(newPlayer);
    console.log(players[0].index);

    return {
      index,
      error: false,
      errorText: '',
    };
  }
