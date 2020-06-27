var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var snakeradius = 20;
var foodradius = 20;
var left = false;
var right = false;
var snake;
var food;
var framerate = 60;
var gp = 0;
window.addEventListener( "keydown", doKeyDown, true);
window.addEventListener( "keyup", doKeyUp, true);
window.addEventListener("gamepadconnected", function(e) {
  gp = navigator.getGamepads()[e.gamepad.index];
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    gp.index, gp.id,
    gp.buttons.length, gp.axes.length);
});
let Point = function(sx, sy){
  this.x = sx;
  this.y = sy;
}

let Snake = function(startx, starty, radius) {
  this.speed = 0;
  this.bodyLength = 1;
  this.body = [new BodyPart(startx, starty, 0, 0, radius)];
  this.dead = false;
  this.turningSpeed = ((Math.PI*2)/30)/(framerate/40);
};
// Moves the head, and then the rest of the body
Snake.prototype.move = function() {
  this.body[0].moveAlone(this.speed);
  for (let i = 1; i < this.body.length; i++){
    this.body[i].moveToLeader();
  }
  this.body[0].heading = (this.body[0].heading) % (Math.PI * 2);
  this.checkIfDead();
}
Snake.prototype.checkIfDead = function() {
  let head = this.body[0];
  for (let i=1; i<this.body.length; i++) {
    if (head.isCollidingWith(this.body[i])){
      this.dead = true;
    }
  }
  if (head.x < head.radius || head.y < head.radius || head.x > 800-head.radius || head.y > 800-head.radius){
    this.dead = true;
  }
}
Snake.prototype.checkIfAte = function() {
  if (this.body[0].isCollidingWith(food)){
    this.eat();
    food.newLocation();
  }
}
// Draws each body part as a cicle, and then each
// segment between two body parts as a rectangle
Snake.prototype.draw = function() {
  this.body.forEach(part => part.draw());
  for (let i = 1; i < this.body.length; i++){
    let points = this.body[i].pointsToLeader();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let j = 1; j < 4; j++){
      ctx.lineTo(points[j].x, points[j].y);
    }
    ctx.closePath();
    ctx.fill();
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

let BodyPart = function(x, y, heading, leader, radius) {
  this.x = x;
  this.y = y;
  this.heading = heading;
  this.leader = leader;
  this.radius = radius;
  this.color = "#77CC77";
};
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

let Food = function(radius) {
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

function doKeyDown(e) {
  if (e.keyCode == 37) {
    left = true;
  }
  if (e.keyCode == 39) {
    right = true;
  }
}
function doKeyUp(e) {
  if (e.keyCode == 37) {
    left = false;
  }
  if (e.keyCode == 39) {
    right = false;
  }
}
function drawCircle(ballx, bally, radius, color) {
  ctx.beginPath();
  ctx.arc(ballx, bally, radius, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

// Draws the game
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  writeInstructions();
  food.draw();
  snake.draw();
}

// Resets the game
function resetGame() {
  snake = new Snake(400,400, snakeradius);
  left = false;
  right = false;
  food = new Food(foodradius);
  snake.speed = 0;
}

// Gives the instructions and draws the border around the game
function writeInstructions() {
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 800, 3);
  ctx.fillRect(797, 0, 800, 800);
  ctx.fillRect(0, 797, 800, 800);
  ctx.fillRect(0, 0, 3, 800);
  if (snake.body.length < 4) {
    ctx.fillText("Use the left and right arrow keys to turn the snake.", 400, 50);
  }
}

function getAxis() {
  let speed = gp.axes[0]*gp.axes[0] + gp.axes[1]*gp.axes[1]
  if (speed > 1) {
    speed = 1;
  }
  let heading = 0;
  if (speed > 0.2) {
    heading = Math.atan2(gp.axes[1], gp.axes[0])
  }
  let a = {
    mag: speed,
    dir: heading
  };
  return a;
}
resetGame();
// Main Game Loop
function gameUpdate() {
  snake.move();
  snake.checkIfDead();
  snake.checkIfAte();
  draw();
  if (gp != 0) {
    let axis = getAxis();
    if (axis.mag > 0.2) {
      snake.body[0].heading = axis.dir;
      snake.speed = axis.mag * 5;
    } else {
      snake.speed = snake.speed * 0.99;
    }
  } else {
    if (left)  { 
      snake.turn(-snake.turningSpeed);
      snake.speed = 5; 
    }
    if (right) { 
      snake.turn(snake.turningSpeed); 
      snake.speed = 5;
    }
  }
  if (snake.dead) {
    gameScore = snake.body.length - 1;
    alert(`You died! your score is ${gameScore}`);
    resetGame();
  }
}
setInterval(gameUpdate, 1000/framerate);
// setInterval(snake.eat, 1000);
