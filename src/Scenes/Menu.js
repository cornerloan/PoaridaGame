class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    preload() {

    }

    create() {
        //text for title of game
        this.titleText = this.add.text(game.config.width / 2, game.config.height / 3, "Poarida", {
            fontSize: '100px'
        });
        this.titleText.setColor("#ffffff");
        this.titleText.setOrigin(0.5);


        //button to start the game
        this.button = this.add.rectangle(game.config.width / 2, game.config.height / 1.75, game.config.width / 4, game.config.height / 8, 0x6666ff);
        this.button.setInteractive();
        this.button.on('pointerup', function () {
            //data contains all the variables needed to be kept between scenes
            let data = [];
            data[0] = 0;  //level to enter on levelScene
            data[1] = 0;  //number of levels unlocked
            data[2] = 0;  //checkpoints for level 0
            data[3] = 0;  //checkpoints for level 1
            data[4] = 0;  //checkpoints for level 2
            data[5] = 0;  //checkpoints for level 3
            data[6] = 2;  //checkpoints for level 4
            data[7] = 0;  //checkpoint to enter on
            data[8] = 0;  //high score coins for level 0
            data[9] = 0;  //high score coins for level 1
            data[10] = 0;  //high score coins for level 2
            data[11] = 0;  //high score coins for level 3
            data[12] = 0;  //high score coins for level 4
            this.scene.start("levelScene", data);
        }, this);

        //text to appear on the button
        this.buttonText = this.add.text(game.config.width / 2, game.config.height / 1.75, "Start Game", {
            fontSize: '50px'
        });
        this.buttonText.setColor("#ffffff");
        this.buttonText.setOrigin(0.5);



    }

    //nothing to update since the button interaction was created earlier
    update() {

    }

}

