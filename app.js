let config = {
  renderer: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);
let bird;
let cursors;
let hasLanded = false;
let hasBumped = false;
let isGameStarted = false;
let restartText;

function preload () {
  this.load.image('background', 'assets/background.png');
  this.load.image('road', 'assets/road.png');
  this.load.image('column', 'assets/column.png');
  this.load.spritesheet('bird', 'assets/bird.png', { frameWidth: 64, frameHeight: 96 });
}

function create () {
  const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
  
  const roads = this.physics.add.staticGroup();
  const topColumns = this.physics.add.staticGroup({
    key: 'column',
    repeat: 1,
    setXY: { x: 200, y: 0, stepX: 300 }
  });
  const bottomColumns = this.physics.add.staticGroup({
    key: 'column',
    repeat: 1,
    setXY: { x: 350, y: 400, stepX: 300 },
  });

  const road = roads.create(400, 568, 'road').setScale(2).refreshBody();

  bird = this.physics.add.sprite(0, 50, 'bird').setScale(2);
  bird.setBounce(0.2);
  bird.setCollideWorldBounds(true);

  this.physics.add.collider(bird, road, () => hasLanded = true);
  this.physics.add.collider(bird, topColumns, () => hasBumped = true);
  this.physics.add.collider(bird, bottomColumns, () => hasBumped = true);

  cursors = this.input.keyboard.createCursorKeys();

  // ✅ Instructions
  this.messageToPlayer = this.add.text(0, 0, 'Instructions: Press space bar to start', {
    fontFamily: '"Comic Sans MS", Times, serif',
    fontSize: "20px",
    color: "black",
    backgroundColor: "white",
    padding: 10
  });
  Phaser.Display.Align.In.BottomCenter(this.messageToPlayer, this.add.zone(400, 600, 800, 600), 0, -20);

  // ✅ Win/Lose message
  this.centerMessage = this.add.text(400, 250, '', {
    fontFamily: '"Comic Sans MS", Times, serif',
    fontSize: "26px",
    color: "black",
    backgroundColor: "white",
    padding: 10,
    align: "center"
  }).setOrigin(0.5);
  this.centerMessage.setVisible(false);

  // ✅ Retry button
  restartText = this.add.text(400, 570, 'Press R to Retry', {
    fontFamily: '"Comic Sans MS", Times, serif',
    fontSize: '24px',
    color: 'black',
    backgroundColor: 'white',
    padding: 10,
    align: 'center'
  }).setOrigin(0.5);
  restartText.setVisible(false);

  // ✅ Game starting message
  this.messageToPlayer.text = 'Instructions: Press space bar to start';
}

function update () {
  // ✅ Start game
  if (cursors.space.isDown && !isGameStarted) {
    isGameStarted = true;
    this.messageToPlayer.text = 'Instructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or ground';

    this.time.delayedCall(5000, () => {
      if (isGameStarted) {
        this.messageToPlayer.text = '';
      }
    });
  }

  // Float bird before start
  if (!isGameStarted) {
    bird.setVelocityY(-160);
  }

  // Flap
  if (cursors.up.isDown && !hasLanded && !hasBumped) {
    bird.setVelocityY(-160);
  }

  // Move bird forward
  if (isGameStarted && !hasLanded && !hasBumped) {
    bird.body.velocity.x = 50;
  } else {
    bird.body.velocity.x = 0;
  }

  // ✅ Crash condition
  if ((hasLanded || hasBumped) && !restartText.visible) {
    this.centerMessage.setText('💥 Oh no! You crashed!');
    this.centerMessage.setVisible(true);
    restartText.setVisible(true);
  }

  // ✅ Win condition
  if (bird.x > 750 && !restartText.visible) {
    bird.setVelocityY(40);
    this.centerMessage.setText('🎉 Congrats! You won!');
    this.centerMessage.setVisible(true);
    restartText.setVisible(true);
  }

  // ✅ Retry
  if (restartText.visible) {
    const rKey = this.input.keyboard.addKey('R');
    if (Phaser.Input.Keyboard.JustDown(rKey)) {
      hasLanded = false;
      hasBumped = false;
      isGameStarted = false;
      this.scene.restart();
    }
  }
}
