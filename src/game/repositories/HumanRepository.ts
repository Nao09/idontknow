import {Human} from "../human_stuff/Human";
import {World} from "../World";

export class HumanRepository {
    humans: Human[];

    constructor(world: World) {
        this.humans = [
            new Human(world.getGround().getRandomCell()),
            new Human(world.getGround().getRandomCell())
        ];
    }

    create(game: Phaser.Game, groups: {[index: string]: Phaser.Group }, world: World) {
        this.humans.forEach((human) => {
            human.create(game, groups['noname'], world);
        })
    }

    update() {
        this.humans.forEach((human: Human) => {
            human.update();
        })
    }

    getSelectedHumanSprite() {
        for (let i = 0; i < this.humans.length; i++) {
            if (this.humans[i].isSelected()) {
                return this.humans[i].getSprite();
            }
        }

        return null;
    }
}
