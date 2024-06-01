class LevelSelect extends Phaser.Scene {
    constructor() {
        super("levelScene");


        this.levelXPositions = [];
        this.levelXPositions[0] = game.config.width / 6;   // 1/6
        this.levelXPositions[1] = game.config.width / 3;   // 2/6
        this.levelXPositions[2] = game.config.width / 2;   // 3/6
        this.levelXPositions[3] = 2 * game.config.width / 3; // 4/6
        this.levelXPositions[4] = 5 * game.config.width / 6; // 5/6
        this.levelCircleY = game.config.height / 2;   //height is halfway

        this.isMoving = false;
        this.isMovingRight = false;
        this.isMovingLeft = false;
        this.unlockedLevels;
        this.position = 0;
        this.data = [];
        this.cursorOffset = 75;
        this.cursorPos = 0;
        this.checkpointsUnlocked = 0;
        this.justMoved = false;
    }

    preload() {

    }

    create(data1) {
        this.data = data1;

        this.position = this.data[0];
        this.checkpointsUnlocked = 0;
        this.justMoved = false;

        this.unlockedLevels = this.data[1];
        if (this.unlockedLevels > 0) {
            this.path = this.add.rectangle(3 * game.config.width / 12, game.config.height / 2, game.config.width / 6, 30, 0xFFFFFF);
            for (let i = 0; i < this.unlockedLevels - 1; i++) {
                this.path.width += game.config.width / 6;

            }
        }

        for (let i = 0; i < 5; i++) {
            let color = 0xFF0000; // red
            if (i < this.unlockedLevels) {
                color = 0x00FF00; // green
            }
            this.levelCircle = this.add.arc(this.levelXPositions[i], this.levelCircleY, 50, 270, -270, true, color, 1);
        }


        my.sprite.player = this.physics.add.sprite(this.levelXPositions[this.data[0]], this.levelCircleY, "platformer_characters", "tile_0000.png");
        my.sprite.player.setScale(3);
        my.sprite.player.setFlip(true, false);
        my.sprite.player.x = this.levelXPositions[this.position];

        this.dKey = this.input.keyboard.addKey('D');
        this.aKey = this.input.keyboard.addKey('A');
        this.wKey = this.input.keyboard.addKey('W');
        this.sKey = this.input.keyboard.addKey('S');
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.cursors = this.input.keyboard.createCursorKeys();

        let infoStr = "This game supports both WASD and arrow key movements.\nSpacebar also supports jumping.\n\nUse movement to maneuver level and checkpoint selection.\nUse space key to enter the level at the chosen checkpoint.";
        this.infoText = this.add.text(game.config.width / 2, game.config.height / 6, infoStr, {
            fontSize: '20px'
        });
        this.infoText.setColor("#ffffff");
        this.infoText.setOrigin(0.5);


        this.levelSelectionBox = this.add.rectangle(this.game.config.width / 2, 5 * game.config.height / 6, this.game.config.width / 2, 200, 0xFFFFFF);
        this.checkpoint0text = this.add.text(game.config.width / 2, 5 * game.config.height / 6 - 75, "Start of Level", {
            fontSize: '50px'
        });
        this.checkpoint0text.setColor("#000000");
        this.checkpoint0text.setOrigin(0.5);

        this.checkpoint1text = this.add.text(game.config.width / 2, 5 * game.config.height / 6, "Checkpoint 1", {
            fontSize: '50px'
        });
        this.checkpoint1text.setColor("#000000");
        this.checkpoint1text.setOrigin(0.5);
        this.checkpoint1text.visible = false;
        this.checkpoint2text = this.add.text(game.config.width / 2, 5 * game.config.height / 6 + 75, "Checkpoint 2", {
            fontSize: '50px'
        });
        this.checkpoint2text.setColor("#000000");
        this.checkpoint2text.setOrigin(0.5);
        this.checkpoint2text.visible = false;

        this.cursorPos = 0;
        this.levelPointerInitialY = (5 * game.config.height / 6) - 75;
        this.levelPointer = this.add.triangle(game.config.width / 3, this.levelPointerInitialY, 0, 32, 0, 0, 32, 16, 0x000000);
    }

    update() {
        //code to check when player character is stationary on a level circle
        if (!this.isMovingRight && !this.isMovingLeft) {
            my.sprite.player.anims.play('idle');
            this.updateLevelText();
            if (this.justMoved) {
                this.levelPointer.y = this.levelPointerInitialY;
                this.cursorPos = 0;
                this.justMoved = false;
            }
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.loadLevel();
            }
        }

        //code to move player to the right
        if ((Phaser.Input.Keyboard.JustDown(this.dKey) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) && !this.isMoving && my.sprite.player.x < this.levelXPositions[4] && this.position < this.unlockedLevels) {
            this.isMovingRight = true;
            this.isMoving = true;
            my.sprite.player.x += 5;
            this.position++;
            this.justMoved = true;
        }

        //code to move player to the left
        if ((Phaser.Input.Keyboard.JustDown(this.aKey) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) && !this.isMoving && my.sprite.player.x > this.levelXPositions[0]) {
            this.isMovingLeft = true;
            this.isMoving = true;
            my.sprite.player.x -= 5;
            this.position--;
            this.justMoved = true;
        }

        //code for walking the player to the right
        if (this.isMovingRight) {
            this.moveRight();
            my.sprite.player.x += 2;
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
        }
        //code for walking the player to the left
        if (this.isMovingLeft) {
            this.moveLeft();
            my.sprite.player.x -= 2;
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
        }

        if ((Phaser.Input.Keyboard.JustDown(this.wKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) && this.cursorPos != 0) {
            this.cursorPos--;
            this.levelPointer.y -= this.cursorOffset;
            this.data[7]--;
        }

        if ((Phaser.Input.Keyboard.JustDown(this.sKey) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) && this.cursorPos != 2 && this.cursorPos < this.checkpointsUnlocked) {
            this.cursorPos++;
            this.levelPointer.y += this.cursorOffset;
            this.data[7]++;
        }
    }

    //checks every valid position for the character to stop, updates variables and stops the movement when true
    moveLeft() {
        if (my.sprite.player.x == this.levelXPositions[0] || my.sprite.player.x == this.levelXPositions[0] - 1 || my.sprite.player.x == this.levelXPositions[0] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[1] || my.sprite.player.x == this.levelXPositions[1] - 1 || my.sprite.player.x == this.levelXPositions[1] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[2] || my.sprite.player.x == this.levelXPositions[2] - 1 || my.sprite.player.x == this.levelXPositions[2] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[3] || my.sprite.player.x == this.levelXPositions[3] - 1 || my.sprite.player.x == this.levelXPositions[3] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[4] || my.sprite.player.x == this.levelXPositions[4] - 1 || my.sprite.player.x == this.levelXPositions[4] + 1) {
            this.isMoving = false;
            this.isMovingLeft = false;
            return;
        }
    }

    //same deal as moveLeft but for moving the player to the right
    moveRight() {
        if (my.sprite.player.x == this.levelXPositions[0] || my.sprite.player.x == this.levelXPositions[0] - 1 || my.sprite.player.x == this.levelXPositions[0] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[1] || my.sprite.player.x == this.levelXPositions[1] - 1 || my.sprite.player.x == this.levelXPositions[1] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[2] || my.sprite.player.x == this.levelXPositions[2] - 1 || my.sprite.player.x == this.levelXPositions[2] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[3] || my.sprite.player.x == this.levelXPositions[3] - 1 || my.sprite.player.x == this.levelXPositions[3] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
        if (my.sprite.player.x == this.levelXPositions[4] || my.sprite.player.x == this.levelXPositions[4] - 1 || my.sprite.player.x == this.levelXPositions[4] + 1) {
            this.isMoving = false;
            this.isMovingRight = false;
            return;
        }
    }

    loadLevel() {
        if (this.position == 0) {
            this.scene.start("platformer0Scene", this.data);
        }
        if (this.position == 1) {
            this.scene.start("platformer1Scene", this.data);
        }
        /*
        if(this.position == 2){
            this.scene.start("platformer2Scene", this.data);
        }
        if(this.position == 3){
            this.scene.start("platformer3Scene", this.data);
        }
        if(this.position == 4){
            this.scene.start("platformer4Scene", this.data);
        }
        */
    }

    updateLevelText() {
        if (this.data[this.position + 2] == 2) {
            this.checkpoint2text.visible = true;
            this.checkpoint1text.visible = true;
            this.checkpointsUnlocked = 2;
        }
        else if (this.data[this.position + 2] == 1) {
            this.checkpoint1text.visible = true;
            this.checkpoint2text.visible = false;
            this.checkpointsUnlocked = 1;
        }
        else {
            this.checkpoint2text.visible = false;
            this.checkpoint1text.visible = false;
            this.checkpointsUnlocked = 0;
        }
    }

}