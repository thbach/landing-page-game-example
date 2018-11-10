"use strict";
const game = new Game();
//game.debugMode = true;
const cam = new Camera(game);
const ui = new UI(game);
const spawner = new Spawner();
const fruitManager = new FruitManager(); //needs a spawner
const obstaclesManager = new ObstaclesManager(); //needs a spawner
const cloudsManager = new CloudsManager(); //needs a spawner
const bgManager = new BGManager(game);

let hero;
let boundsLimitX = game.width;
let boundsPosX = 0;
let boundsPosY = game.height + 35;

document.body.appendChild(game.render.view);  

function run() {
  console.log("hello");
  hero = spawner.hero;  
  bgManager.makeBG();

  cam.setScaleFactor(game.width > 800 ? 0.6 : 1);     
  
  if (game.debugMode) {
    game.makeDebug();
    game.showDebug();
  }

  game.setState(awake);  
  game.render.ticker.add(delta => gameLoop(delta));
}


function gameLoop(delta) {
  game.state(delta);
}



//GAME STATES
function awake(delta) {
  cam.setPosition(hero.body);   
  game.setState(start);
}

function start(delta) {
  bgManager.update(delta);
  fruitManager.updateStart(game.cycle);
  obstaclesManager.update(game.cycle);  
  cloudsManager.update(game.cycle);  
  Engine.update(game.engine);  
  

  cam.trackLerpBody(hero.body);  
  //cam.trackBody(hero.body); 
  if (game.debugMode) {
    game.showDebug();
  }  
}


function pause(delta) {
  game.cycle = 0;
  cam.trackLerpBody(hero.body);  
}


function resume(delta) {
  cam.setTargetWidthMod(1);
  game.setState(play);
}


function play(delta) {
  game.timing();
  bgManager.update(delta);  
  boundsPosX = hero.body.position.x - boundsLimitX;  
  
  spawner.updatePlay(game.cycle);
  fruitManager.updatePlay(game.cycle);
  obstaclesManager.update(game.cycle);
  cloudsManager.update(game.cycle);    

  Engine.update(game.engine);

  cam.trackLerpBody(hero.body); 
  //cam.trackBody(hero.body);      

  if (game.debugMode) {
    game.showDebug();
  }
}


function gameOver(delta) {
  ui.hideInteractButton();
  ui.hidePauseButton();  
  ui.showRestartButton();  
  fruitManager.minX = 0;
  fruitManager.maxX = 0;
  game.setState(gameOverLoop);  
}

function gameOverLoop(delta){
  bgManager.update(delta);   
  cam.trackLerpBody(hero.body);  
  cloudsManager.update(game.cycle);    
  Engine.update(game.engine);       
}


function restart(delta) {
  cam.setTargetWidthMod(1);  
  spawner.restart();
  hero = spawner.hero;
  Engine.update(game.engine);    
  game.setState(play);
}



function onClicked() {
  fruitManager.handleClick();
}

//GAME FUNCTIONS






//MATTER EVENTS *************************************************
function groundCheck(pairs) {
  for (let i = 0; i < fruitManager.interactive.length; i++) {
    if (pairs.some(function(p){
      return fruitManager.interactive[i].body === p.bodyA || fruitManager.interactive[i].body === p.bodyB;
    })) { 
      fruitManager.interactive[i].isGrounded = true;
      fruitManager.interactive[i].doubleJump = true;
    } else {
      fruitManager.interactive[i].isGrounded = false;
    }
  }
}

Events.on(game.engine, 'collisionActive', function(event) {
  groundCheck(event.pairs);     
});





//HELPERS ********************************************************
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}


function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
