class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
        this.data = [];
    }

    preload() {

    }

    create(data1) {
        this.data = data1;
        
        this.titleText = this.add.text(game.config.width / 2, game.config.height, "Poarida", {
            fontSize: '50px'
        });
        this.titleText.setColor("#ffffff");
        this.titleText.setOrigin(0.5);

        let credits = "    Game by\n  Connor Lowe\n\nArt & Sounds by\n   kenneyNL";

        this.creditsText = this.add.text(game.config.width / 2, game.config.height + 300, credits, {
            fontSize: '40px'
        });
        this.creditsText.setColor("#ffffff");
        this.creditsText.setOrigin(0.5);

        this.frameCounter = 0;
    }

    update() {
        this.frameCounter++;

        //if 12 seconds have passed, go back to the level selection screen
        if (this.frameCounter / 60 >= 12) {
            this.scene.start("levelScene", this.data);
        }

        this.titleText.y -= 2;
        this.creditsText.y -= 2;
    }
}