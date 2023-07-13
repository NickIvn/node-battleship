import { gameSession } from '../data/index';
import { attackPlayer } from '../sender/index';
import { Ship } from '../types';

function attackNeighboringCells(x: number, y: number, gameBoard: Ship[], index: string) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (x + i >= 0 && x + i < gameBoard[y].length && y + j >= 0 && y + j < gameBoard.length) {
                attackPlayer(x + i, y + j, index, 'miss');
            }
        }
    }
}

export const getValueByXY = (gameId: number, index: string, x: number, y: number): string | undefined => {
    const data = gameSession.find((data) => data.gameId === gameId && data.indexPlayer === index);
    if (data) {
        const gameBoard = data.gameBoard;
        if (gameBoard[y] && gameBoard[y][x]) {
            if (gameBoard[y][x] !== 'empty') {
                switch (gameBoard[y][x]) {
                    case 'miss':
                        return 'miss';
                    case 'shot':
                        return 'shot';
                    case 'killed':
                        return 'killed';
                    case 'small':
                        gameBoard[y][x] = 'killed';
                        attackNeighboringCells(x, y, gameBoard, index);
                        return 'killed';
                    case 'medium':
                        if (x + 1 < gameBoard[y].length && gameBoard[y][x + 1] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x+1] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x+1, y, gameBoard, index);
                            attackPlayer(x + 1, y, index, 'killed');
                            attackPlayer(x, y, index, 'killed');
                            return 'killed';
                        }
                        if (x - 1 >= 0 && gameBoard[y][x - 1] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x-1] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x-1, y, gameBoard, index);
                            attackPlayer(x - 1, y, index, 'killed');
                            attackPlayer(x, y, index, 'killed');
                            return 'killed';
                        }
                        if (y + 1 < gameBoard.length && gameBoard[y + 1][x] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y+1][x] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x, y+1, gameBoard, index);
                            attackPlayer(x, y + 1, index, 'killed');
                            attackPlayer(x, y, index, 'killed');
                            return 'killed';
                        }
                        if (y - 1 >= 0 && gameBoard[y - 1][x] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y-1][x] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x, y-1, gameBoard, index);
                            attackPlayer(x, y - 1, index, 'killed');
                            attackPlayer(x, y, index, 'killed');
                            return 'killed';
                        }              
                        break;                            
                    case 'large':
                        if (x + 2 < gameBoard[y].length && gameBoard[y][x + 1] === 'shot' && gameBoard[y][x + 2] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x+1] = 'killed';
                            gameBoard[y][x+2] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x+1, y, gameBoard, index);
                            attackNeighboringCells(x+2, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x+1, y, index, 'killed');
                            attackPlayer(x+2, y, index, 'killed');
                            return 'killed';
                        }
                        else if (x - 2 >= 0 && gameBoard[y][x - 1] === 'shot' && gameBoard[y][x - 2] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x-1] = 'killed';
                            gameBoard[y][x-2] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x-2, y, gameBoard, index);
                            attackNeighboringCells(x-1, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x-1, y, index, 'killed');
                            attackPlayer(x-2, y, index, 'killed');
                            return 'killed';
                        }
                        else if (x + 1 < gameBoard[y].length && x - 1 >= 0 && gameBoard[y][x + 1] === 'shot' && gameBoard[y][x - 1] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x+1] = 'killed';
                            gameBoard[y][x-1] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x-1, y, gameBoard, index);
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x+1, y, index, 'killed');
                            attackPlayer(x-1, y, index, 'killed');
                            return 'killed';
                        }
                        else if (y + 2 < gameBoard.length && gameBoard[y + 1][x] === 'shot' && gameBoard[y + 2][x] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y+1][x] = 'killed';
                            gameBoard[y+2][x] = 'killed';
                            attackNeighboringCells(x, y+1, gameBoard, index);
                            attackNeighboringCells(x, y+2, gameBoard, index);
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x, y+2, index, 'killed');
                            attackPlayer(x, y+1, index, 'killed');
                            return 'killed';
                        }
                        else if (y - 2 >= 0 && gameBoard[y - 1][x] === 'shot' && gameBoard[y - 2][x] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y-1][x] = 'killed';
                            gameBoard[y-2][x] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x, y-1, gameBoard, index);
                            attackNeighboringCells(x, y-2, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x, y-2, index, 'killed');
                            attackPlayer(x, y-1, index, 'killed');
                            return 'killed';
                        }
                        else if (y + 1 < gameBoard.length && y - 1 >= 0 && gameBoard[y - 1][x] === 'shot' && gameBoard[y + 1][x] === 'shot') {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y+1][x] = 'killed';
                            gameBoard[y-1][x] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x, y-1, gameBoard, index);
                            attackNeighboringCells(x, y+1, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x, y+1, index, 'killed');
                            attackPlayer(x, y-1, index, 'killed');
                            return 'killed';
                        }
                        break;
                    case 'huge':
                        if (
                            x + 3 < gameBoard[y].length &&
                            gameBoard[y][x + 1] === 'shot' &&
                            gameBoard[y][x + 2] === 'shot' &&
                            gameBoard[y][x + 3] === 'shot'
                          ) {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x + 1] = 'killed';
                            gameBoard[y][x + 2] = 'killed';
                            gameBoard[y][x + 3] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x + 1, y, gameBoard, index);
                            attackNeighboringCells(x + 2, y, gameBoard, index);
                            attackNeighboringCells(x + 3, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x + 1, y, index, 'killed');
                            attackPlayer(x + 2, y, index, 'killed');
                            attackPlayer(x + 3, y, index, 'killed');
                            return 'killed';
                          } else if (
                            x - 3 >= 0 &&
                            gameBoard[y][x - 1] === 'shot' &&
                            gameBoard[y][x - 2] === 'shot' &&
                            gameBoard[y][x - 3] === 'shot'
                          ) {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x - 1] = 'killed';
                            gameBoard[y][x - 2] = 'killed';
                            gameBoard[y][x - 3] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x - 1, y, gameBoard, index);
                            attackNeighboringCells(x - 2, y, gameBoard, index);
                            attackNeighboringCells(x - 3, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x - 1, y, index, 'killed');
                            attackPlayer(x - 2, y, index, 'killed');
                            attackPlayer(x - 3, y, index, 'killed');
                            return 'killed';
                          } else if (
                            x + 2 < gameBoard[y].length &&
                            x - 1 >= 0 &&
                            gameBoard[y][x + 1] === 'shot' &&
                            gameBoard[y][x + 2] === 'shot' &&
                            gameBoard[y][x - 1] === 'shot'
                          ) {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x + 1] = 'killed';
                            gameBoard[y][x + 2] = 'killed';
                            gameBoard[y][x - 1] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x - 1, y, gameBoard, index);
                            attackNeighboringCells(x + 2, y, gameBoard, index);
                            attackNeighboringCells(x + 1, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x + 1, y, index, 'killed');
                            attackPlayer(x + 2, y, index, 'killed');
                            attackPlayer(x - 1, y, index, 'killed');
                            return 'killed';
                        } else if (
                            x + 2 < gameBoard[y].length &&
                            x - 1 >= 0 &&
                            gameBoard[y][x + 1] === 'shot' &&
                            gameBoard[y][x - 2] === 'shot' &&
                            gameBoard[y][x - 1] === 'shot'
                          ) {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y][x + 1] = 'killed';
                            gameBoard[y][x - 2] = 'killed';
                            gameBoard[y][x - 1] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x - 1, y, gameBoard, index);
                            attackNeighboringCells(x - 2, y, gameBoard, index);
                            attackNeighboringCells(x + 1, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x + 1, y, index, 'killed');
                            attackPlayer(x - 2, y, index, 'killed');
                            attackPlayer(x - 1, y, index, 'killed');
                            return 'killed';
                          } else if (
                            y + 3 < gameBoard.length &&
                            gameBoard[y + 1][x] === 'shot' &&
                            gameBoard[y + 2][x] === 'shot' &&
                            gameBoard[y + 3][x] === 'shot'
                          ) {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y + 1][x] = 'killed';
                            gameBoard[y + 2][x] = 'killed';
                            gameBoard[y + 3][x] = 'killed';
                            attackNeighboringCells(x, y + 1, gameBoard, index);
                            attackNeighboringCells(x, y + 2, gameBoard, index);
                            attackNeighboringCells(x, y + 3, gameBoard, index);
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x, y + 1, index, 'killed');
                            attackPlayer(x, y + 2, index, 'killed');
                            attackPlayer(x, y + 3, index, 'killed');
                            return 'killed';
                          } else if (
                            y - 3 >= 0 &&
                            gameBoard[y - 1][x] === 'shot' &&
                            gameBoard[y - 2][x] === 'shot' &&
                            gameBoard[y - 3][x] === 'shot'
                          ) {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y - 1][x] = 'killed';
                            gameBoard[y - 2][x] = 'killed';
                            gameBoard[y - 3][x] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x, y - 1, gameBoard, index);
                            attackNeighboringCells(x, y - 2, gameBoard, index);
                            attackNeighboringCells(x, y - 3, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x, y - 1, index, 'killed');
                            attackPlayer(x, y - 2, index, 'killed');
                            attackPlayer(x, y - 3, index, 'killed');
                            return 'killed';
                          } else if (
                            y + 2 < gameBoard.length &&
                            y - 1 >= 0 &&
                            gameBoard[y + 1][x] === 'shot' &&
                            gameBoard[y + 2][x] === 'shot' &&
                            gameBoard[y - 1][x] === 'shot'
                          ) {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y + 1][x] = 'killed';
                            gameBoard[y + 2][x] = 'killed';
                            gameBoard[y - 1][x] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x, y - 1, gameBoard, index);
                            attackNeighboringCells(x, y + 1, gameBoard, index);
                            attackNeighboringCells(x, y + 2, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x, y + 1, index, 'killed');
                            attackPlayer(x, y + 2, index, 'killed');
                            attackPlayer(x, y - 1, index, 'killed');
                            return 'killed';
                          } else if (
                            y + 2 < gameBoard.length &&
                            y - 1 >= 0 &&
                            gameBoard[y + 1][x] === 'shot' &&
                            gameBoard[y - 2][x] === 'shot' &&
                            gameBoard[y - 1][x] === 'shot'
                          ) {
                            gameBoard[y][x] = 'killed';
                            gameBoard[y + 1][x] = 'killed';
                            gameBoard[y - 2][x] = 'killed';
                            gameBoard[y - 1][x] = 'killed';
                            attackNeighboringCells(x, y, gameBoard, index);
                            attackNeighboringCells(x, y - 1, gameBoard, index);
                            attackNeighboringCells(x, y + 1, gameBoard, index);
                            attackNeighboringCells(x, y - 2, gameBoard, index);
                            attackPlayer(x, y, index, 'killed');
                            attackPlayer(x, y + 1, index, 'killed');
                            attackPlayer(x, y - 2, index, 'killed');
                            attackPlayer(x, y - 1, index, 'killed');
                            return 'killed';
                          }          
                        break;
                    default:
                        throw new Error(`${gameBoard[y][x]}`);
                }
                gameBoard[y][x]='shot';
                return 'shot';
            }
            else {
                gameBoard[y][x]='miss';
                return 'miss';
            }
        }
    }
    return undefined;
};