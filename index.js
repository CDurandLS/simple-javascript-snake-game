const CONFIG = {
  snakeRadius: 20,
  foodRadius: 20,
  snakeSpeed: 5,
  framerate: 60.0,
  turningSpeed: (Math.PI)/22,
  left: 37,
  right: 39,
}

function Point(sx, sy) {
  this.x = sx;
  this.y = sy;
}

function Snake(startx, starty, radius) {
  this.speed = 0;
  this.bodyLength = 1;
  this.body = [new BodyPart(startx, starty, 0, 0, radius)];
  this.dead = false;
  this.turningSpeed = CONFIG.turningSpeed;
};
// Moves the head, and then the rest of the body
Snake.prototype.move = function(left, right) {
  if(left) {
    this.turn(-CONFIG.turningSpeed);
    this.speed = CONFIG.snakeSpeed;
  }
  if (right) {
    this.turn(CONFIG.turningSpeed);
    this.speed = CONFIG.snakeSpeed;
  }
  this.body.forEach(part => part.move(this.speed));
  this.body[0].heading = (this.body[0].heading) % (Math.PI * 2);
  this.checkIfDead();
}

Snake.prototype.checkIfDead = function() {
  let head = this.body[0];
  for (let i=1; i < this.body.length; i++) {
    if (head.isCollidingWith(this.body[i])){
      this.dead = true;
    }
  }
  if (head.x < head.radius || head.y < head.radius || head.x > 800-head.radius || head.y > 800-head.radius){
    this.dead = true;
  }
}
Snake.prototype.checkIfAte = function(food) {
  return (this.body[0].isCollidingWith(food))
}
// Draws each body part as a cicle, and then each
// segment between two body parts as a rectangle
Snake.prototype.draw = function() {
  this.body.forEach(part => part.draw());
  for (let i = 1; i < this.body.length; i++){
    let points = this.body[i].pointsToLeader();
    CTX.beginPath();
    CTX.moveTo(points[0].x, points[0].y);
    for(let j = 1; j < 4; j++){
      CTX.lineTo(points[j].x, points[j].y);
    }
    CTX.closePath();
    CTX.fill();
  }
}
Snake.prototype.turn = function(amount) {
    this.body[0].heading = (this.body[0].heading + amount) % (Math.PI * 2);
}
Snake.prototype.eat = function() {
  let tail = this.body[this.body.length-1];
  this.body.push(
    new BodyPart(
      tail.behindx(2.0),
      tail.behindy(2.0),
      tail.heading,
      tail,
      tail.radius
    )
  );
}

function BodyPart(x, y, heading, leader, radius) {
  this.x = x;
  this.y = y;
  this.heading = heading;
  this.leader = leader;
  this.radius = radius;
  this.color = "#77CC77";
};
BodyPart.prototype.move = function(amount) {
  if(!this.leader) {
    this.moveAlone(amount);
  } else {
    this.moveToLeader();
  }
}
BodyPart.prototype.isCollidingWith = function(obj) {
    let dx = (this.x - obj.x);
    let dy = (this.y - obj.y);
    return Math.sqrt(dx*dx + dy*dy) < (this.radius + obj.radius)*0.95;
}
// Movement function for the lead of the snake
BodyPart.prototype.moveAlone = function(amount) {
  this.x += amount * Math.cos(this.heading);
  this.y += amount * Math.sin(this.heading);
}
BodyPart.prototype.behindx = function(n, a) {
  return this.x - n * this.radius * Math.cos(this.heading)
}
BodyPart.prototype.behindy = function(n, a) {
  return this.y - n * this.radius * Math.sin(this.heading)
}
BodyPart.prototype.behind = function() {
  return new Point(this.behindx(1),this.behindy(1));
}

// This moves the body part up to the boundry of its leader
// in the direction of the point 1 radius behind it
BodyPart.prototype.moveToLeader = function() {
  let p = this.leader.behind();
  let dx = (this.x - this.leader.x);
  let dy = (this.y - this.leader.y);
  let dist = Math.sqrt(dx*dx + dy*dy);
  this.x += (dist - this.radius - this.leader.radius) * Math.cos(this.heading);
  this.y += (dist - this.radius - this.leader.radius) * Math.sin(this.heading);
  this.heading = Math.atan2(p.y-this.y,p.x-this.x);
}

BodyPart.prototype.draw = function() {
  drawCircle(this.x, this.y, this.radius, this.color);
}

// This gets the four points to make a solid 'body chunk'
// between a body part and the one in front of it
BodyPart.prototype.pointsToLeader = function() {
  let dx = (this.x - this.leader.x);
  let dy = (this.y - this.leader.y);
  let direction = Math.atan2(-dy,-dx);
  let points = [new Point(0,0),new Point(0,0),new Point(0,0),new Point(0,0)];
  points[0].x = this.x        + Math.cos(direction + Math.PI/2) * this.radius;
  points[0].y = this.y        + Math.sin(direction + Math.PI/2) * this.radius;
  points[1].x = this.leader.x + Math.cos(direction + Math.PI/2) * this.radius;
  points[1].y = this.leader.y + Math.sin(direction + Math.PI/2) * this.radius;
  points[2].x = this.leader.x + Math.cos(direction - Math.PI/2) * this.radius;
  points[2].y = this.leader.y + Math.sin(direction - Math.PI/2) * this.radius;
  points[3].x = this.x        + Math.cos(direction - Math.PI/2) * this.radius;
  points[3].y = this.y        + Math.sin(direction - Math.PI/2) * this.radius;
  return points;
}

function Food(radius) {
  this.x = Math.random() * (800 - 4 * radius) + 2 * radius;
  this.y = Math.random() * (800 - 4 * radius) + 2 * radius;
  this.color = "#DD3333";
  this.radius = radius;
  this.newLocation;
};
Food.prototype.draw = function() {
  drawCircle(this.x, this.y, this.radius, this.color);
}
Food.prototype.newLocation = function() {
  this.x = Math.random() * (800 - 4 * this.radius) + 2 * this.radius;
  this.y = Math.random() * (800 - 4 * this.radius) + 2 * this.radius;
}

const CANVAS = document.getElementById('game');
const CTX = CANVAS.getContext('2d');

function drawCircle(x, y, radius, color) {
  CTX.beginPath();
  CTX.arc(x, y, radius, 0, Math.PI*2);
  CTX.fillStyle = color;
  CTX.fill();
  CTX.closePath();
}

const Game = {
  init() {
    window.removeEventListener('keydown', this.keyDown.bind(this));
    window.removeEventListener('keyup', this.keyUp.bind(this));
    window.addEventListener("keydown", this.keyDown.bind(this));
    window.addEventListener("keyup", this.keyUp.bind(this));  
    this.snake = new Snake(400, 400, CONFIG.snakeRadius);
    this.left = false;
    this.right = false;
    this.food = new Food(CONFIG.foodRadius);
    this.snake.speed = 0;
  },
  keyDown(e) {
    if (e.keyCode === CONFIG.left) {
      this.left = true;
      e.preventDefault();
    } else if(e.keyCode === CONFIG.right) {
      this.right = true;
      e.preventDefault();
    }
  },
  keyUp(e) {
    if (e.keyCode === CONFIG.left) {
      this.left = false;
      e.preventDefault();
    } else if(e.keyCode === CONFIG.right) {
      this.right = false;
      e.preventDefault();
    }
  },
  draw() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    this.writeInstructions();
    this.food.draw();
    this.snake.draw();
  },
  writeInstructions() {
    CTX.font = "30px Arial";
    CTX.textAlign = "center";
    CTX.fillStyle = "#000000";
    CTX.fillRect(0, 0, 800, 3);
    CTX.fillRect(797, 0, 800, 800);
    CTX.fillRect(0, 797, 800, 800);
    CTX.fillRect(0, 0, 3, 800);
    if (this.snake.body.length < 4) {
      CTX.fillText("Use the left and right arrow keys to turn the snake.", 400, 50);
    }
  },
  gameLoop() {
    this.snake.move(this.left, this.right);
    this.snake.checkIfDead();
    if(this.snake.checkIfAte(this.food)) {
      this.food.newLocation();
      this.snake.eat();
    };
    this.draw();
    if (this.snake.dead) {
      const gameScore = this.snake.body.length - 1;
      alert(`You died! your score is ${gameScore}.`)
      this.init();
    }
  },
}
Game.init();
setInterval(Game.gameLoop.bind(Game), 1000 / CONFIG.framerate);