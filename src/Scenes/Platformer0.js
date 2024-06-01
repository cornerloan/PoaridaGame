class Platformer0 extends Phaser.Scene {
    constructor() {
        super("platformer0Scene");

        this.data = [];
    }

    init() {
        this.ACCELERATION = 400;
        this.DRAG = 1800;
        this.physics.world.gravity.y = 1400;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 1.0;
    }

    preload() {
        this.load.setPath("./assets/");
    }

    create(data1) {

    }

    update() {

    }
}