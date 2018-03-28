import {HumanState} from "./HumanState";
import {Human, WALK_CELL_DURATION} from "../human_stuff/Human";
import {World} from "../World";
import {SittableInterface} from "../objects/SittableInterface";
import {ANIMATION} from "../human_stuff/HumanAnimationManager";

export class TypeState implements HumanState {
    private human: Human;
    private loopTime: number;
    private active: boolean;
    private sittable: SittableInterface;
    private game: Phaser.Game;
    private isHumanOnTheRightCell: boolean;
    private world: World;

    constructor(human: Human, loopTime: number, sittable: SittableInterface, world: World) {
        this.human = human;
        this.loopTime = loopTime;
        this.sittable = sittable;
        this.isHumanOnTheRightCell = false;
        this.world = world;
    }

    isActive(): boolean {
        if (!this.isHumanOnTheRightCell) {
            if (this.world.isSittableTaken(this.sittable)) {
                this.active = false;

                return false;
            }
        }
        if (!this.isHumanOnTheRightCell && this.isNeighborPosition()) {
            this.isHumanOnTheRightCell = true;
            this.human.goToSittable(this.sittable, this.sittable.forceOrientation());
            this.game.time.events.add(WALK_CELL_DURATION + 100, () => {
                this.human.loadAnimation(ANIMATION.SIT_DOWN, this.sittable.forceOrientation());
                this.game.time.events.add(this.loopTime, () => {
                    this.human.loadAnimation(ANIMATION.TYPE);
                    this.game.time.events.add(Phaser.Math.random(5, 10) * Phaser.Timer.SECOND, () => {
                        this.human.loadAnimation(ANIMATION.STAND_UP);
                        this.game.time.events.add(this.loopTime + 100, () => {
                            this.human.goToFreeCell(this.sittable.getEntries());
                            this.game.time.events.add(WALK_CELL_DURATION + 100, () => {
                                this.active = false;
                            }, this);
                        }, this);
                    }, this);
                })
            }, this);
        }

        return this.active;
    }

    start(game: Phaser.Game): void {
        this.active = true;
        this.game = game;
        this.human.moveToClosest(this.sittable.getPosition(), this.sittable.getEntries());
    }

    private isNeighborPosition() {
        return !this.human.isMoving() && (this.human.getPosition().x - this.sittable.getPosition().x) * (this.human.getPosition().x - this.sittable.getPosition().x) +
            (this.human.getPosition().y - this.sittable.getPosition().y) * (this.human.getPosition().y - this.sittable.getPosition().y) === 1;
    }
}