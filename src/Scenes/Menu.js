class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }
    
    preload() {

    }

    create() {
        this.titleText = this.add.text(game.config.width/2, game.config.height/3, "Poarida", {
            fontSize: '100px'
        });
        this.titleText.setColor("#ffffff");
        this.titleText.setOrigin(0.5);


        this.button = this.add.rectangle(game.config.width/2, game.config.height/1.75, game.config.width/4, game.config.height/8, 0x6666ff);
        this.button.setInteractive();
        this.button.on('pointerup', function() {
            this.scene.start("platformer1Scene");
        }, this);


        this.buttonText = this.add.text(game.config.width/2, game.config.height/1.75, "Start Game", {
            fontSize: '50px'
        });
        this.buttonText.setColor("#ffffff");
        this.buttonText.setOrigin(0.5);



    }

    update() {

    }

}

