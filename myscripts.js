var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var radius = 20;
var left = false;
var right = false;
var snake;
var food;
var framerate = 60;
window.addEventListener( "keydown", doKeyDown, true);
window.addEventListener( "keyup", doKeyUp, true);
let Point = function(sx, sy){
  this.x = sx;
  this.y = sy;
}

let Snake = function(startx, starty) {
  this.speed = 5;
  this.bodyLength = 1;
  this.body = [new BodyPart(startx, starty, 0, 0)];
  this.dead = false;
  this.turningSpeed = ((Math.PI*2)/30)/(framerate/40);
};
Snake.prototype.move = function() {
  this.body[0].moveAlone(this.speed);
  for (let i = 1; i < this.body.length; i++){
    this.body[i].moveToLeader();
  }
  this.checkIfDead();
}
Snake.prototype.checkIfDead = function() {
  let head = this.body[0];
  for (let i=1; i<this.body.length; i++) {
    if (head.isCollidingWith(this.body[i])){
      this.dead = true;
    }
  }
  if (head.x < radius || head.y < radius || head.x > 800-radius || head.y > 800-radius){
    this.dead = true;
  }
}
Snake.prototype.checkIfAte = function() {
  if (this.body[0].isCollidingWith(food)){
    this.eat();
    food.newLocation();
  }
}
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
Snake.prototype.turn = function(direction) {
  if(direction == 'left'){
    this.body[0].heading -= this.turningSpeed;
  }
  if(direction == 'right'){
    this.body[0].heading += this.turningSpeed;
  }
}
Snake.prototype.eat = function() {
  let tail = this.body[this.body.length-1];
  this.body.push(
    new BodyPart(
      tail.behindx(2.0),
      tail.behindy(2.0),
      tail.heading,
      tail
    )
  );
}

let BodyPart = function(x, y, heading, leader) {
  this.x = x;
  this.y = y;
  this.heading = heading;
  this.leader = leader;
  this.color = "#77CC77";
};
BodyPart.prototype.isCollidingWith = function(obj) {
    let dx = (this.x - obj.x);
    let dy = (this.y - obj.y);
    return Math.sqrt(dx*dx + dy*dy) < radius * 1.9;
}
BodyPart.prototype.moveAlone = function(amount) {
  this.x += amount * Math.cos(this.heading);
  this.y += amount * Math.sin(this.heading);
}
BodyPart.prototype.behindx = function(n, a) {
  return this.x - n * radius * Math.cos(this.heading)
}
BodyPart.prototype.behindy = function(n, a) {
  return this.y - n * radius * Math.sin(this.heading)
}
BodyPart.prototype.behind = function() {
  return new Point(this.behindx(1),this.behindy(1));
}
BodyPart.prototype.moveToLeader = function() {
  let p = this.leader.behind();
  let dx = (this.x - this.leader.x);
  let dy = (this.y - this.leader.y);
  let dist = Math.sqrt(dx*dx + dy*dy);
  this.x += (dist - 2 * radius) * Math.cos(this.heading);
  this.y += (dist - 2 * radius) * Math.sin(this.heading);
  this.heading = Math.atan2(p.y-this.y,p.x-this.x);
}

// BodyPart.prototype.moveToLeader = function() {
//   let p = this.leader.previous[0];
//   let px = p.x; let py = p.y;
//   let dx = (this.x - this.leader.x);
//   let dy = (this.y - this.leader.y);
//   let dist = Math.sqrt(dx*dx + dy*dy);
//   this.x += (dist - 2 * radius) * Math.cos(this.heading);
//   this.y += (dist - 2 * radius) * Math.sin(this.heading);
//   this.heading = Math.atan2(-dy,-dx);
// }
BodyPart.prototype.draw = function() {
  drawCircle(this.x, this.y, radius, this.color);
}
BodyPart.prototype.pointsToLeader = function() {
  let dx = (this.x - this.leader.x);
  let dy = (this.y - this.leader.y);
  let direction = Math.atan2(-dy,-dx);
  let points = [new Point(0,0),new Point(0,0),new Point(0,0),new Point(0,0)];
  points[0].x = this.x        + Math.cos(direction + Math.PI/2) * radius;
  points[0].y = this.y        + Math.sin(direction + Math.PI/2) * radius;
  points[1].x = this.leader.x + Math.cos(direction + Math.PI/2) * radius;
  points[1].y = this.leader.y + Math.sin(direction + Math.PI/2) * radius;
  points[2].x = this.leader.x + Math.cos(direction - Math.PI/2) * radius;
  points[2].y = this.leader.y + Math.sin(direction - Math.PI/2) * radius;
  points[3].x = this.x        + Math.cos(direction - Math.PI/2) * radius;
  points[3].y = this.y        + Math.sin(direction - Math.PI/2) * radius;
  return points;
}

let Food = function() {
  this.x = Math.random() * 700 + 50;
  this.y = Math.random() * 700 + 50;
  this.color = "#DD3333";
  this.newLocation;
};
Food.prototype.draw = function() {
  drawCircle(this.x, this.y, radius, this.color);
}
Food.prototype.newLocation = function() {
  this.x = Math.random() * 700 + 50;
  this.y = Math.random() * 700 + 50;
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
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  writeInstructions();
  food.draw();
  snake.draw();
}
function setUpGame() {
  snake = new Snake(400,400);
  let randx = Math.random() * 700 + 50;
  let randy = Math.random() * 700 + 50;
  left = false;
  right = false;
  food = new Food(randx, randy);
}
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
setUpGame();
function gameUpdate() {
  if (left)  { snake.turn('left'); }
  if (right) { snake.turn('right'); }
  snake.move();
  snake.checkIfDead();
  snake.checkIfAte();
  draw();
  if (snake.dead) {
    gameScore = snake.body.length - 1;
    alert(`You died! your score is ${gameScore}`);
    setUpGame();
  }
}
setInterval(gameUpdate, 1000/framerate);
// setInterval(snake.eat, 1000);
