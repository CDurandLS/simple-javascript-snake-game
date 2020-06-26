var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var radius = 20;
var left = false;
var right = false;
var snake;
var food;
var turningSpeed = ((Math.PI*2)/30)/1.5;
window.addEventListener( "keydown", doKeyDown, true);
window.addEventListener( "keyup", doKeyUp, true);
let Snake = function(startx, starty) {
  this.speed = 6;
  this.bodyLength = 1;
  this.body = [new BodyPart(startx, starty, 0, 0)];
  this.dead = false;
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
  console.log("drawing the snake");
  this.body.forEach(part => part.draw());
}
Snake.prototype.turn = function(amount) {
  this.body[0].heading += amount;
}
Snake.prototype.eat = function() {
  let tail = this.body[this.body.length-1];
  this.body.push(
    new BodyPart(
      tail.behindx(),
      tail.behindy(),
      tail.heading,
      tail
    )
  );
}

let BodyPart = function(bx, by, direction, leader) {
  this.x = bx;
  this.y = by;
  this.heading = direction;
  this.leader = leader;
  this.towardsx = leader.x;
  this.towardsy = leader.y;
  this.color = "#77CC77";
};
BodyPart.prototype.isCollidingWith = function(obj) {
    let dx = (this.x - obj.x);
    let dy = (this.y - obj.y);
    if (Math.sqrt(dx*dx + dy*dy) < radius * 1.9) {
      return true;
    } else {
      return false;
    }
}
BodyPart.prototype.moveAlone = function(amount) {
  this.x += amount * Math.cos(this.heading);
  this.y += amount * Math.sin(this.heading);

}
BodyPart.prototype.moveToLeader = function() {
  let dx = (this.x - this.leader.x);
  let dy = (this.y - this.leader.y);
  let dist = Math.sqrt(dx*dx + dy*dy);
  this.x += (dist - 2 * radius) * Math.cos(this.heading);
  this.y += (dist - 2 * radius) * Math.sin(this.heading);
  this.heading = Math.atan2(-dy,-dx);
}
BodyPart.prototype.draw = function() {
  drawCircle(this.x, this.y, radius, this.color);
}
BodyPart.prototype.behindx = function() {
  return this.x - 2 * radius * Math.cos(this.heading)
}
BodyPart.prototype.behindy = function() {
  return this.y - 2 * radius * Math.sin(this.heading)
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
  snake.draw();
  food.draw();
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
  ctx.fillText("Use the left and right arrow keys to move the snake.", 400, 50);
}
setUpGame();
function gameUpdate() {
  if (left)  { snake.turn(-turningSpeed); }
  if (right) { snake.turn(+turningSpeed); }
  snake.move();
  snake.checkIfDead();
  snake.checkIfAte();
  if (snake.dead) {
    gameScore = snake.body.length - 1;
    alert(`You died! your score is ${gameScore}`);
    setUpGame();
  }
  draw();
}
setInterval(gameUpdate, 33);
// setInterval(snake.eat, 1000);
