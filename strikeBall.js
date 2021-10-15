const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

var alertdiv = document.getElementById("main_alert");
var finalPoint = document.getElementById("final_point");
var StartGameBtn = document.getElementById("startBtn");

var scoreEl = document.getElementById("score");
var score = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bullets = [];
const enemies = [];
const particles = [];
const friction = 0.99;

//--------------------------------classes----------------------------------------

class Player {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = "#fff";
    context.fill();
  }
}

// =====
class Bullet {
  constructor(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = "#fff";
    context.fill();
    this.update();
  }
  update() {
    this.x += this.speed.x;
    this.y += this.speed.y;
  }
}

// ===
class Enemy {
  constructor(x, y, radius, speed, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.color = color;
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
    this.update();
  }
  update() {
    this.x += this.speed.x;
    this.y += this.speed.y;
  }
}

// ====
class Particle {
  constructor(x, y, radius, color, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.alpha = 1;
  }
  draw(context) {
    context.save();
    context.globalAlpha = this.alpha;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
    context.restore();
    this.update();
  }
  update() {
    this.speed.x *= friction;
    this.speed.y *= friction;
    this.x += this.speed.x;
    this.y += this.speed.y;
    this.alpha -= 0.01;
  }
}

// -----------------------------functions----------------------------------------

// player render at center
const PlayerRender = () => {
  let player = new Player(window.innerWidth / 2, window.innerHeight / 2, 15);
  player.draw(context);
};

// functoion for bullets
addEventListener("click", (e) => {

  let angle = Math.atan2(
    e.clientY - window.innerHeight / 2,
    e.clientX - window.innerWidth / 2
  );

  bullets.push(
    new Bullet(
      window.innerWidth / 2,
      window.innerHeight / 2,
      7,
      (speed = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6,
      })
    )
  );
});

// enemy respawn after every 1.5 sec
setInterval(() => {
  const radius = Math.random() * (40 - 10) + 10;
  let x, y;
  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
    y = Math.random() * window.innerHeight;
  } else {
    x = Math.random() * window.innerWidth;
    y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
  }
  let angle = Math.atan2(window.innerHeight / 2 - y, window.innerWidth / 2 - x);

  let color = `hsl(${Math.random() * 360},50%,50%)`;
  let enemy = new Enemy(
    x,
    y,
    radius,
    {
      x: Math.cos(angle) * 0.5,
      y: Math.sin(angle) * 0.5,
    },
    color
  );
  enemies.push(enemy);
}, 1500);

// --------------------------------main function---------------------------------

// main game
function fullGame() {
  const game = requestAnimationFrame(fullGame);
  context.fillStyle = "rgba(0,0,0,0.1)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  //   player function
  PlayerRender();

  // partilcle funcion
  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0) {
        setTimeout(() => {
         particles.splice(particleIndex, 1);
        }, 0);
    } else {
      particle.draw(context);
    }
  });

  // bullet function
  bullets.forEach((bullet, index) => {
    // limitation
    if (
      bullet.x < 0 ||
      bullet.x + bullet.radius > canvas.width ||
      bullet.y < 0 ||
      bullet.y + bullet.radius > canvas.height
    ) {
      bullets.splice(index, 1);
    } else {
      bullet.draw(context);
    }
  });

  // enemy function
  enemies.forEach((enemy, enemyindex) => {
    enemy.draw(context);
    
    // validation between player and enemy
    let centerdist = Math.hypot(
      enemy.x - window.innerWidth / 2,
      enemy.y - window.innerHeight / 2
    );
    if (centerdist < 15  + enemy.radius - 2) {
      finalPoint.innerHTML = scoreEl.innerHTML;
      alertdiv.style.display = "flex";
      cancelAnimationFrame(game);
    }

    // collision between player and enemy
    bullets.forEach((bullet, bulletindex) => {
      let dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

      // increse a score
      if (dist < enemy.radius + bullet.radius) {
        score += 10;
        scoreEl.innerHTML = score;

        // creating a particle when collision occurs
        for (i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(bullet.x, bullet.y, Math.random() * 2, enemy.color, {
              x: Math.random() - 0.5 * Math.random() * 6,
              y: Math.random() - 0.5 * Math.random() * 6,
            })
          );
        }

        // logic for reducing a ball
        if (enemy.radius > 20) {
          score += 20;
          scoreEl.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });


          setTimeout(() => {
            bullets.splice(bulletindex, 1);
          }, 0);

          
        } else {
          // logic for remove enemy when collision occurs here we use timeout due to prevent lag and flashing of object.
          setTimeout(() => {
            enemies.splice(enemyindex, 1);
            bullets.splice(bulletindex, 1);
          }, 0);
        }
      }
    });
  });
}
fullGame();


// reseting a game
StartGameBtn.addEventListener("click", () => {
  bullets.length = 0;
  enemies.length = 0;
  particles.length = 0;
  score = 0;
  scoreEl.innerHTML = score;
  alertdiv.style.display = "none";
  requestAnimationFrame(fullGame);
});
