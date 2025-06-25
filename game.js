//*****SCRIPT****

//Control Canvas and get 2d with GetContext
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

//Global Vars
let frames = 0;
const DEGREE = Math.PI / 180;

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sadSound.mp3";

const NewBest = new Audio();
NewBest.src = "audio/sfx-victory2.mp3";

//ALL Images Of the Game
const gameImages = new Image();
gameImages.src = "img/gameImgs.png";
const gameImages2 = new Image();
gameImages.src = "img/gameImgs2.png";

// Game State : To handle Each state when We Call It
// to be drawn
const state = {
  current: 0,
  getReady: 0,
  game: 1,
  gameOver: 2,
};

// START BUTTON COORD
const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
};
// CONTROL THE States Of the GAME
cvs.addEventListener("click", function (evt) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      SWOOSHING.play();
      break;
    case state.game:
      bird.flap();
      FLAP.play();
      break;
    case state.gameOver:
      //Check That the Gamer Click only on the Start Button
      let rect = cvs.getBoundingClientRect();
      let clickX = evt.clientX - rect.left;
      let clickY = evt.clientY - rect.top;

      // CHECK IF WE CLICK ON THE START BUTTON
      //To Reset All OF Our Elements And Go To The Ready state
      if (
        clickX >= startBtn.x &&
        clickX <= startBtn.x + startBtn.w &&
        clickY >= startBtn.y &&
        clickY <= startBtn.y + startBtn.h
      ) {
        pipes.reset();
        bird.speedReset();
        score.reset();
        state.current = state.getReady;
      }
      break;
  }
});
// Background Object
const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: cvs.height - 226,

  draw: function () {
    ctx.drawImage(
      gameImages,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      gameImages,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },
};

//foreground Image:The Ground Of the Canvas
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,

  dx: 2,

  draw: function () {
    ctx.drawImage(
      gameImages,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      gameImages,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },

  update: function () {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  },
};

//Draw The Bird
const bird = {
  //the three Images of the bird To make it flipping
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 },
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,

  //this will change the bird images ( 0 to 1 to 2 to 1) [0,1,2,1]
  frame: 0,
  //Gravity And Flapping Properties of Bird

  radius: 12,

  gravity: 0.1,
  jump: 3,
  speed: 0,
  rotation: 0,

  //missing part of center the bird
  draw: function () {
    let bird = this.animation[this.frame];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      gameImages,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );

    ctx.restore();
  },
  flap: function () {
    this.speed = -this.jump;
  },
  update: function () {
    // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY (10) , faster(5)
    this.period = state.current == state.getReady ? 10 : 5;
    // WE INCREMENT THE FRAME BY 1, EACH PERIOD if modulus == 0
    this.frame += frames % this.period == 0 ? 1 : 0;
    // FRAME (4) GOES FROM 0 To 4, THEN AGAIN TO GET BACK TO 0
    this.frame = this.frame % this.animation.length;

    if (state.current == state.getReady) {
      this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
      this.rotation = 0 * DEGREE;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;

      //Check the position of the bird
      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (state.current == state.game) {
          state.current = state.gameOver;
          DIE.play();
        }
      }

      // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.frame = 1;
      } else {
        this.rotation = -25 * DEGREE;
      }
    }
  },

  speedReset: function () {
    this.speed = 0;
  },
};
//Get Ready Message
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,

  draw: function () {
    if (state.current == state.getReady) {
      ctx.drawImage(
        gameImages,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};
//gameOver message
const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 90,

  draw: function () {
    if (state.current == state.gameOver) {
      ctx.drawImage(
        gameImages,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};

// PIPES
const pipes = {
  position: [],

  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0,
  },

  w: 53,
  h: 400,
  gap: 85,
  maxYPos: -150,
  dx: 2,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      // top pipe
      ctx.drawImage(
        gameImages,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      );

      // bottom pipe
      ctx.drawImage(
        gameImages,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      );
    }
  },

  update: function () {
    if (state.current !== state.game) return;

    if (frames % 100 == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1),
      });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let bottomPipeYPos = p.y + this.h + this.gap;

      // COLLISION DETECTION
      // TOP PIPE
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.gameOver;
        HIT.play();
        DIE.play();
      }
      // BOTTOM PIPE
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeYPos &&
        bird.y - bird.radius < bottomPipeYPos + this.h
      ) {
        state.current = state.gameOver;
        HIT.play();
        DIE.play();
      }

      // MOVE THE PIPES TO THE LEFT
      p.x -= this.dx;

      // if the pipes go beyond canvas, we delete them from the array
      if (p.x + this.w <= 0) {
        this.position.shift();
        score.value += 1;
        SCORE_S.play();
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
        score.updateDOM();
      }
    }
  },

  reset: function () {
    this.position = [];
  },
};

// SCORE
const score = {
  best: parseInt(localStorage.getItem("best")) || 0,
  value: 0,

  updateDOM: function () {
    const currentScoreEl = document.getElementById("current-score");
    const bestScoreEl = document.getElementById("best-score");
    if (currentScoreEl) currentScoreEl.textContent = this.value;
    if (bestScoreEl) bestScoreEl.textContent = `Best: ${this.best}`;
  },

  draw: function () {
    // Draw main score at the top during play
    if (state.current == state.game) {
      ctx.lineWidth = 2;
      ctx.font = "60px 'Teko', Arial, sans-serif";
      ctx.fillStyle = "#0077b6";
      ctx.strokeStyle = "#fff";
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);
    } else if (state.current == state.gameOver) {
      // Draw score and best inside the Game Over box
      ctx.font = "30px 'Teko', Arial, sans-serif";
      ctx.fillStyle = "#0077b6";
      ctx.strokeStyle = "#fff";
      // Score (right side of box)
      ctx.fillText(this.value, 225, 186);
      ctx.strokeText(this.value, 225, 186);
      // Best (right side of box, lower)
      ctx.fillStyle = "#ffc107";
      ctx.strokeStyle = "#fff";
      ctx.fillText(this.best, 225, 228);
      ctx.strokeText(this.best, 225, 228);
    }
    this.updateDOM();
  },

  reset: function () {
    this.value = 0;
    this.updateDOM();
  },
};
//Draw On The Canvas
function draw() {
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}

//update function To update Images
//and The position of them inside Canvas
function update() {
  bird.update();
  fg.update();
  pipes.update();
}
//Loop To Update Every Second The Drawing and images On The Canvas,
// and count The number of Frames was drawn on the canvas
function loop() {
  update();
  draw();
  frames++;
  score.updateDOM();
  requestAnimationFrame(loop);
}
loop();
