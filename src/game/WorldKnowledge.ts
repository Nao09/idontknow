import {HumanRepository} from "./repositories/HumanRepository";
import {Wall} from "./objects/Wall";
import {Sofa} from "./objects/Sofa";
import {InteractiveObjectInterface} from "./objects/InteractiveObjectInterface";
import {ObjectInterface} from "./objects/ObjectInterface";
import {Human} from "./human_stuff/Human";
import {Desk} from "./objects/Desk";
import {Dispenser} from "./objects/Dispenser";
import {WallRepository} from "./repositories/WallRepository";
import {Cell} from "./Cell";
import {PositionTransformer} from "./PositionTransformer";

const GRID_WIDTH = 12;
const GRID_HEIGHT = 12;
export const DEBUG_WORLD = false;

export class WorldKnowledge {
    private humanRepository: HumanRepository;
    private cells: Cell[];
    private objects: ObjectInterface[];
    private wallRepository: WallRepository;

    constructor() {
        this.cells = [];
        this.objects = [];
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                this.cells.push(new Cell(new PIXI.Point(x, y)));
            }
        }

        this.wallRepository = new WallRepository();

        if (DEBUG_WORLD) {
            this.wallRepository.addWall(new PIXI.Point(5, 5));
            this.wallRepository.addWall(new PIXI.Point(6, 5));
            this.objects.push(new Desk(new PIXI.Point(4, 5), this));
            this.objects.push(new Desk(new PIXI.Point(4, 6), this));
            this.objects.push(new Dispenser(new PIXI.Point(5, 4), this));
        } else {
            for (let x = 0; x < GRID_WIDTH; x++) {
                this.wallRepository.addWall(new PIXI.Point(x, 0));
                this.wallRepository.addWall(new PIXI.Point(x, GRID_HEIGHT - 1));
            }
            for (let y = 1; y < (GRID_HEIGHT - 1); y++) {
                this.wallRepository.addWall(new PIXI.Point(0, y));
                this.wallRepository.addWall(new PIXI.Point(GRID_WIDTH - 1, y));
            }
            for (let x = 1; x < 3 - 1; x++) {
                this.wallRepository.addWall(new PIXI.Point(x, GRID_WIDTH / 2 + 1));
            }
            for (let x = 5; x < GRID_WIDTH - 1; x++) {
                this.wallRepository.addWall(new PIXI.Point(x, GRID_WIDTH / 2 + 1));
            }
            [
                new PIXI.Point(4, 3),
                new PIXI.Point(4, 4),
                new PIXI.Point(3, 4),
                new PIXI.Point(3, 3),
            ].forEach((cell) => {
                this.wallRepository.addWall(cell);
            });

            for (let i = 0; i < 3; i++) {
                this.objects.push(new Desk(this.getRandomCell(), this));
            }

            for (let i = 0; i < 3; i++) {
                this.objects.push(new Sofa(this.getRandomCell(), this));
            }

            this.objects.push(new Dispenser(this.getRandomCell(), this));
            this.objects.push(new Dispenser(this.getRandomCell(), this));
            this.objects.push(new Dispenser(this.getRandomCell(), this));
        }

        this.humanRepository = new HumanRepository(this);
    }

    create(game: Phaser.Game, groups: {[index: string] : Phaser.Group}) {
        const floor = groups['floor'];
        const noname = groups['noname'];

        this.cells.forEach((cell: Cell) => {
            cell.create(game, floor);
        });

        this.objects.forEach((desk: Desk) => {
            desk.create(game, noname);
        });

        this.wallRepository.create(game, noname);
        this.humanRepository.create(game, groups, this);
    }

    update() {
        this.humanRepository.update();
    }

    humanMoved(positions: PIXI.Point[]) {
        const walls = this.wallRepository.getWalls();

        walls.forEach((wall: Wall) => {
            let visible = true;
            positions.forEach((position: PIXI.Point) => {
                if (this.anyHumanIsAboveWall(wall)) {
                    visible = false;
                }
            });
            wall.setVisibility(visible);
        })
    }

    private anyHumanIsAboveWall(wall: Wall) {
        const humans = this.humanRepository.humans;
        for (let i = 0; i < humans.length; i++) {
            if (WorldKnowledge.humanIsAboveWall(humans[i].getPosition(), wall)) {
                return true;
            }
        }

        return false;
    }

    private static humanIsAboveWall(humanPosition, wall: Wall) {
        const wallPosition = wall.getPosition();

        return (humanPosition.x == wallPosition.x + 1 && humanPosition.y == wallPosition.y + 1) ||
            (humanPosition.x == wallPosition.x && humanPosition.y == wallPosition.y + 1) ||
            (humanPosition.x == wallPosition.x + 1 && humanPosition.y == wallPosition.y);
    }

    getSelectedHumanSprite() {
        return this.humanRepository.getSelectedHumanSprite();
    }

    resetAStar(startPosition: PIXI.Point, endPosition: PIXI.Point) {
        this.humanRepository.humans.forEach((human) => {
            human.resetAStar(startPosition, endPosition);
        });
    }

    getAnotherFreeHuman(human: Human): Human {
        const availableHumans = this.humanRepository.humans.filter((anotherHuman: Human) => {
            return anotherHuman !== human && anotherHuman.isFree()
        });

        if (availableHumans.length === 0) {
            return null;
        }

        return availableHumans[Math.floor(Math.random() * availableHumans.length)];
    }

    getRandomCell(): PIXI.Point {
        const acceptableIndexes = this.getAcceptables();
        const random = Math.floor(Math.random() * acceptableIndexes.length);

        return this.cells[acceptableIndexes[random]].getPosition();
    }

    getAcceptables(): number[] {
        let acceptables = [];
        for (let i = 0; i < this.cells.length; i++) {
            if (this.isFree(this.cells[i].getPosition())) {
                acceptables.push(i);
            }
        }

        return acceptables;
    }

    getMeetingCells(cells: PIXI.Point[]) {
        const acceptableIndexes = this.getAcceptables();
        let result = null;
        let dist = null;
        for (let i = 0; i < acceptableIndexes.length; i++) {
            const position1 = this.cells[acceptableIndexes[i]].getPosition();
            for (let j = i + 1; j < acceptableIndexes.length; j++) {
                const position2 = this.cells[acceptableIndexes[j]].getPosition();
                if (PositionTransformer.isNeighbor(position1, position2)) {
                    const newDist = WorldKnowledge.getDist(cells, position1);
                    if (result === null || newDist < dist) {
                        dist = newDist;
                        result = [position1, position2];
                    }
                }
            }
        }

        return result;
    }

    getGrid(): {index: number}[][] {
        let grid = [];
        for (let i = 0; i < this.cells.length; i++) {
            if (undefined === grid[this.cells[i].getPosition().y]) {
                grid[this.cells[i].getPosition().y] = [];
            }
            grid[this.cells[i].getPosition().y][this.cells[i].getPosition().x] = {
                index: i
            };
        }

        return grid;
    }

    isFree(point: PIXI.Point, object: ObjectInterface = null): boolean {
        if (point.x < 0 || point.y < 0 || point.x >= GRID_WIDTH || point.y >= GRID_HEIGHT) {
            return false;
        }

        for (let j = 0; j < this.objects.length; j++) {
            if (this.objects[j].getPosition().x === point.x && this.objects[j].getPosition().y === point.y && this.objects[j] !== object) {
                return false;
            }
        }

        if (this.wallRepository.hasWall(point.x, point.y)) {
            return false;
        }

        return true;
    }

    getRandomFreeSofa(): Sofa {
        const freeSofas = this.objects.filter((object) => {
            return object.constructor.name === 'Sofa' && !this.isObjectUsed(<Sofa> object);
        });

        if (freeSofas.length === 0) {
            return null;
        }

        return <Sofa> freeSofas[Math.floor(Math.random() * freeSofas.length)];
    }

    isObjectUsed(interactiveObject: InteractiveObjectInterface) {
        for (let i = 0; i < this.humanRepository.humans.length; i++) {
            const human = this.humanRepository.humans[i];
            if (interactiveObject.getPosition().x === human.getPosition().x && interactiveObject.getPosition().y === human.getPosition().y) {
                return true;
            }
        }

        return false;
    }

    getRandomFreeDesk(): Desk {
        const freeDesks = this.objects.filter((object) => {
            return object.constructor.name === 'Desk' && !this.isObjectUsed(<Desk> object);
        });

        if (freeDesks.length === 0) {
            return null;
        }

        return <Desk> freeDesks[Math.floor(Math.random() * freeDesks.length)];
    }

    getRandomFreeDispenser(): Dispenser {
        const freeDispensers = this.objects.filter((object) => {
            return object.constructor.name === 'Dispenser' && !this.isObjectUsed(<Dispenser> object);
        });

        if (freeDispensers.length === 0) {
            return null;
        }

        return <Dispenser> freeDispensers[Math.floor(Math.random() * freeDispensers.length)];
    }

    private static getDist(sources: PIXI.Point[], point: PIXI.Point): number {
        let dist = 0;
        sources.forEach((source) => {
            dist += PositionTransformer.dist(source, point);
        });

        return dist;
    }
}
