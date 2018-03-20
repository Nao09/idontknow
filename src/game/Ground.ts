import {Cell} from "./Cell";
import {Desk} from "./Desk";
import {Wall} from "./Wall";

export class Ground {
    private desks: Desk[];
    private cells: Cell[];
    private walls: Wall[];

    constructor(game: Phaser.Game, floor: Phaser.Group, group: Phaser.Group) {
        this.cells = [];
        this.desks = [];
        this.walls = [];

        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 6; y++) {
                this.cells.push(new Cell(game, floor, new PIXI.Point(x, y)));
            }
        }

        const wallCells = [
            new PIXI.Point(3,3),
            new PIXI.Point(3,4),
            new PIXI.Point(2,4),
            new PIXI.Point(2,3),
        ];

        for (let i = 0; i < 3; i++) {
            this.desks.push(new Desk(game, group, new PIXI.Point(Math.floor(Phaser.Math.random(0, 6)), Math.floor(Phaser.Math.random(0, 6)))))
        }

        wallCells.forEach((wallCell) => {
            this.walls.push(new Wall(
                game,
                group,
                new PIXI.Point(wallCell.x, wallCell.y),
                Ground.hasWall(wallCells, wallCell.x + 1, wallCell.y),
                Ground.hasWall(wallCells, wallCell.x, wallCell.y + 1),
                Ground.hasWall(wallCells, wallCell.x - 1, wallCell.y),
                Ground.hasWall(wallCells, wallCell.x, wallCell.y - 1),
            ));
        });
    }

    getGrid(): {index: number}[][] {
        let grid = [];
        for (let y = 0; y < 6; y++) {
            grid[y] = [];
            for (let x = 0; x < 6; x++) {
                grid[y][x] = {
                    index: y * 6 + x
                };
            }
        }

        return grid;
    }

    getAcceptables(): number[] {
        let acceptables = [];
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                let found = false;
                for (let i = 0; i < this.desks.length; i++) {
                    if (this.desks[i].getPosition().x === x && this.desks[i].getPosition().y === y) {
                        found = true;
                    }
                }
                for (let i = 0; i < this.walls.length; i++) {
                    if (this.walls[i].getPosition().x === x && this.walls[i].getPosition().y === y) {
                        found = true;
                    }
                }
                if (!found) {
                    acceptables.push(y * 6 + x);
                }
            }
        }

        return acceptables;
    }

    private static hasWall(wallCells: PIXI.Point[], x: number, y: number): boolean {
        for (let i = 0; i < wallCells.length; i++) {
            if (wallCells[i].x === x && wallCells[i].y === y) {
                return true;
            }
        }

        return false;
    }
}
