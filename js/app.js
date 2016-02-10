//The Game object stores information about the game
var Game = function(){
    this.score=0;
    this.lives=3;
    this.isCollision=false;
    this.hasReachedWater=false;
    this.canvasWidth=505;
    this.canvasHeight=400;
    this.tileWidth=100;
    this.tileHeight=80;
};

//Entity object is the superclass of Enemy object, Player object,
//CollisionImage object and LivesImage object
var Entity = function (x,y) {
    this.x = x;
    this.y = y;
};

//Enemy object constructor
//Parameters: x, y
var Enemy = function(x, y) {
    Entity.call(this, x, y);
    this.speed = Math.floor(Math.random() * 300 + 1);
    this.width = 60;
    this.height = 60;
    this.sprite = 'images/enemy-bug.png';
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Any movement should be multiplied by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if(this.x < game.canvasWidth) {
    this.x += this.speed * dt;
}
else{
    this.x = 0;
}
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Player object constructor
//Parameters: x, y
var Player = function(x, y) {
    Entity.call(this, x, y);
    this.width = 60;
    this.height = 60;
    this.sprite = 'images/char-boy.png';
};

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

//Update player movements, track score, lives and collisions
//displays result
Player.prototype.update = function() {
this.detectCollision();
displayUpdatedScore();
displayLives();
displayResult();
};

//Draw the player on the canvas.
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Player and enemy collision detection.
Player.prototype.detectCollision = function() {
    game.isCollision = checkCollisions(allEnemies);
    //if collision detected, reduce a player life and reduce
    //the score by 5 points
    if(game.isCollision) {
        collisionImageDisplay(this.x, this.y);
        if(game.lives > 0) {
            game.lives--;
        }
        if(game.score > 0) {
            game.score -= 5;
        }
        resetPlayer();
    }
};

//Update player movements based on keyboard inputs
//Player can move up, down, left and right and
//limit movement within the canvas
Player.prototype.handleInput = function(key) {
    if(game.lives === 0)
    {
        resetPlayer();
    }
    switch(key) {
        case 'left':
        if(this.x - game.tileWidth < 0){
            this.x = 0;
        }
        else {
            this.x -= game.tileWidth;
        }
        break;

        case 'right':
        if(this.x + game.tileWidth +5 >= game.canvasWidth){
            this.x = 400;
        }
        else {
            this.x += game.tileWidth;
        }
        break;

        case 'up':
        if(this.y - game.tileHeight < 0){
            this.y = 400;
            game.hasReachedWater = true;
        }
        else {
            this.y -= game.tileHeight;
        }
        break;

        case 'down':
        if(this.y + game.tileHeight > game.canvasHeight){
            this.y = 400;
        }
        else {
            this.y += game.tileHeight;
        }
        break;
    }
};

//CollisionImage object constructor for displaying an image
//when collision takes place
//Parameters: x, y
var CollisionImage = function(x, y) {
    Entity.call(this, x, y);
    this.sprite = 'images/collision.png';
};

CollisionImage.prototype = Object.create(Entity.prototype);
CollisionImage.prototype.constructor = CollisionImage;

//create a new CollisionImage object and push it into the collisionAllImage array
var collisionImageDisplay = function(x, y) {
    var collisionImage = new CollisionImage(x, y);
    collisionAllImage.push(collisionImage);
};

// Draw the collision image on the screen when there is a collision.
//Remove the collisionImage object after it is displayed.
CollisionImage.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    collisionAllImage.pop();
};

//LivesImage object constructor for displaying the number of
//lives left
//Parameters: x, y
var LivesImage = function(x, y) {
    Entity.call(this, x, y);
    this.sprite = 'images/char-boy-small.png';
};

LivesImage.prototype = Object.create(Entity.prototype);
LivesImage.prototype.constructor = LivesImage;

//Display the number of lives the player has
var displayLives = function() {
    //number of lives
    var livesNum = game.lives;
    //the x coordinate of the live image based on the number of lives
    var livesPos = 400 + (2 - livesNum)*32;
    //If there is collision, clear the liveimage and remove the image
    //from the livesAllImage array.
    if(game.isCollision){
        ctx.clearRect(livesPos,0,30,50);
        livesAllImage.splice(0, 1);
   }
   game.isCollision = false;
};

// Draw the enemy on the screen, required method for game
LivesImage.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Method for Collision detection between entities
var checkCollisions = function(targetArray) {
    for(var i = 0; i < targetArray.length; i++) {
        if(player.x < targetArray[i].x + targetArray[i].width &&
            player.x + player.width > targetArray[i].x &&
            player.y < targetArray[i].y + targetArray[i].height &&
            player.y + player.height > targetArray[i].y) {
                return true;
        }
    }
    return false;
};

//update the score if the player has reached the water
//display the correct score
//display lives as 0 if there is no lives available
var displayUpdatedScore = function() {
    if(game.hasReachedWater) {
        game.score += 10;
        resetPlayer();
        game.hasReachedWater = false;
    }
    ctx.clearRect(0, 0, 120, 40);
    ctx.font = "20px Verdana";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + game.score, 8, 30);
    if(game.lives === 0)
    {
        ctx.clearRect(400, 0, 100, 40);
        ctx.fillText("Lives: " + game.lives, 400, 30);
    }
};

//display result based on the score or lives
//display game as won if the score of game is equal to or more than 100
//display game as lost if score is less than 100 and number of lives is 0
var displayResult = function() {
    if(game.score >= 100) {
        $('#game-won').show();
        $('.won').click(function() {
            $('#game-won').hide();
            document.location.reload();
        });
    }
    else if(game.lives === 0) {
        $('#game-over').show();
            $('.lost').click(function() {
                $('#game-over').hide();
                document.location.reload();
            });
    }
};

//modify the player position to that of initial position
var resetPlayer = function() {
    player.x = 200;
    player.y = 400;
};

//instantiate Enemy objects and place them in an array allEnemies
var allEnemies = [new Enemy(0,60), new Enemy(100,120), new Enemy(30,180), new Enemy(120,60)];
//instantiate Player object
var player = new Player(200, 400);
//instantiate Game object
var game = new Game();
//declare an array to store CollisionImage
var collisionAllImage = [];
//instantiate LivesImage object
var livesAllImage = [new LivesImage(400,0), new LivesImage(432,0), new LivesImage(464,0)];

// This listens for key presses and sends the keys to the
// Player.handleInput() method.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
