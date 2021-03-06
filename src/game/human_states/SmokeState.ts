import {Human} from "../human_stuff/Human";
import {HumanState} from "./HumanState";
import {ANIMATION, HumanAnimationManager} from "../human_stuff/HumanAnimationManager";
import {STATE} from "../human_stuff/HumanStateManager";

export class SmokeState implements HumanState {
    private human: Human;
    private active: boolean;

    constructor(human: Human) {
        this.human = human;
    }

    isActive(): boolean {
        return this.active;
    }

    start(game: Phaser.Game): boolean {
        game.time.events.add(Phaser.Math.random(1, 3) * HumanAnimationManager.getAnimationTime(ANIMATION.SMOKE), this.end, this);
        this.active = true;
        this.human.loadAnimation(ANIMATION.SMOKE);
        this.human.updateHumorFromState();

        return true;
    }

    end(): void {
        this.active = false;
    }

    stop(game: Phaser.Game): void {
        this.active = false;
    }

    getState(): STATE {
        return STATE.SMOKE;
    }
}