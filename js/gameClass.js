"use strict";

// require matter.js pixi,js viewport.js
//----ALIASES-PIXI
const Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,    
    Graphics = PIXI.Graphics,
    Texture = PIXI.Texture.fromImage,
    TilingSprite = PIXI.extras.TilingSprite;

//----ALIASES-Matter
const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events,
    Bounds = Matter.Bounds,
    Sleeping = Matter.Sleeping,
    Composite = Matter.Composite;
    
//----------------CLASSES--------------
class Game {
  constructor() {
    this.debugMode = false;
    this.debugText;
    this.debugBox;
    this.cycle = 0;
    this.delta;
    this.state;

    //objects
    this.engine;
    this.render;
    this.width;
    this.height;
    this.containerBG;
    this.containerCam;
    this.containerUI;

    this.init();
    this.load();  
  }
  
  init() {
    this.state = start;
    // MATTER
    this.engine = new Engine.create();
    this.world = this.engine.world;    
    this.world.gravity.y = 2;    

    // PIXI
    //let w = window.innerWidth > 1024 ? 1024 : window.innerWidth;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.render = new Application({
      width: this.width, 
      height: this.height,   
      backgroundColor : 0x2998c2,      
      antialias: true, 
      transparent: false, 
      resolution: 1
    });    

    this.render.renderer.plugins.interaction.autoPreventDefault = false;
    this.render.renderer.view.style['touch-action'] = 'auto';
    
    // PIXI CONTAINERS
    this.containerBG = new Container();
    this.containerBG.x = this.width /2;
    this.containerBG.y = this.height /2;
    this.containerBG.pivot.x = this.containerBG.width /2;
    this.containerBG.pivot.y = this.containerBG.height /2; 
    this.render.stage.addChild(this.containerBG);      
    this.containerCam = new Container();
    this.render.stage.addChild(this.containerCam);          
    this.containerUI = new Container();
    this.render.stage.addChild(this.containerUI);          
  }

  load() {
    loader
      .add([
        "img/background.jpg",
      ])
      .load(run);
  }
  
  setState(state) {
    this.state = state;  
  }
  
  
  timing() {
    this.cycle++;
    this.delta = this.render.ticker.deltaTime;
  }
    
  resize() {
  
  }
  
  makeDebug() {
    this.debugBox = new Graphics();
    this.debugBox.lineStyle(1, 0xffff00, 1);
    this.debugBox.beginFill(0xffff00, 0);
    this.debugBox.drawRoundedRect(0, 0, 50, 50, 3);
    this.debugBox.lineStyle(1, 0xff1900, 1);    
    this.debugBox.drawCircle(25,25,25);
    this.debugBox.endFill();
    this.debugBox.pivot.y = 25;
    this.debugBox.pivot.x = 25;
    this.containerCam.addChild(this.debugBox);  

    let style = new TextStyle({
      fontFamily: "Helvetica",
      fontSize: 14,
      fill: '#ffffff'
    })

    this.debugText = new Text("DEBUG:", style);
    this.debugText.position.set(this.width/3,this.height/10);
    this.containerUI.addChild(this.debugText); 

    const zoomOutButton = new Graphics();
    zoomOutButton.lineStyle(2, 0xFFFFFF, 1);
    zoomOutButton.beginFill(0xFFFFFF, 0);
    zoomOutButton.drawRoundedRect(100, game.height/4, 100, 100, 15);
    zoomOutButton.endFill();    
    this.containerUI.addChild(zoomOutButton);   

    const zoomInButton = new Graphics();
    zoomInButton.lineStyle(2, 0xFFFFFF, 1);
    zoomInButton.beginFill(0xFFFFFF, 0);
    zoomInButton.drawRoundedRect(200, game.height/4, 100, 100, 15);
    zoomInButton.endFill();    
    this.containerUI.addChild(zoomInButton);  
    
    zoomOutButton.interactive = true;
    zoomOutButton.buttonMode = true;
    zoomOutButton.addListener("pointerdown", function(){
      const n = 2
      cam.startingWidth*=n;
      cam.maxWidth*=n;
      cam.targetWidth*=n;     
      cam.zoom*=n;   
      cam.camOffsetX*=n;        
    });    
    
    zoomInButton.interactive = true;
    zoomInButton.buttonMode = true;
    zoomInButton.addListener("pointerdown", function(){
      const n = 0.5
      cam.startingWidth*=n;
      cam.maxWidth*=n;
      cam.targetWidth*=n;     
      cam.zoom*=n; 
      cam.camOffsetX*=n;
    });   
         
  }

  showDebug() {
    let deadPlatformCount = 0;
    let activePlatformCount = 0;
    spawner.platforms.forEach(function(p){
        if(p.active) {
            activePlatformCount++;
        } else {
            deadPlatformCount++;
        }
    });

    let deadFruitCount = 0;
    let activeFruitCount = 0;
    spawner.creatureArrays.fruits.forEach(function(p){
        if(p.active) {
            activeFruitCount++;
        } else {
            deadFruitCount++;
        }
    });  
    
    let deadObstacles = 0;
    let activeObstacles = 0;
    let totalObstacles = 0;
    
    countObstacles(spawner.creatureArrays.rocks);
    countObstacles(spawner.creatureArrays.spikes);    
    countObstacles(spawner.creatureArrays.spikesSmall);       
    countObstacles(spawner.creatureArrays.monsters);       
    countObstacles(spawner.creatureArrays.monstersSmall);       
       
    function countObstacles(creature) {
      creature.forEach(function(c){
          if(c.active) {
              activeObstacles++;
          } else {
              deadObstacles++;
          }
          totalObstacles++;
      });             
    }

    let difference = fruitManager.maxX - fruitManager.minX;
    let fps = this.render.ticker.FPS.toFixed(2);
    let debugString = `debug: FPS = ${fps}
platforms = ${spawner.platforms.length} active ${activePlatformCount} / ${deadPlatformCount}
fruits = ${spawner.creatureArrays.fruits.length} active ${activeFruitCount} / ${deadFruitCount}
obstacles = ${totalObstacles} active ${deadObstacles} / ${activeObstacles}
followers = ${fruitManager.interactive.length - 1}
maxX = ${fruitManager.maxX.toFixed(0)} / ${difference.toFixed(0)}
    `;
    this.debugText.text = debugString;    
    this.debugBox.position = hero.sprite.position;  
  }  
}



class UI {
  constructor (game) {
    let w = game.width;
    let h = game.height;
    this.interactiveButton = new Graphics();
    this.playButton = new Graphics();
    this.pauseButton = new Graphics();
    this.restartButton = new Graphics();    
    
    this.init();  
    this.show();
    
    this.hideInteractButton();
    this.hideRestartButton();
    this.hidePauseButton();
    this.showPlayButton();    
  }
  
  init() {
    const _this = this;
    
    this.interactiveButton.lineStyle(2, 0xFFFFFF, 0.2);
    this.interactiveButton.beginFill(0xFFFFFF, 0);
    this.interactiveButton.drawRoundedRect(0, game.height - game.height/1.5, game.width, game.height/1.5, 15);
    this.interactiveButton.endFill();
    game.containerUI.addChild(this.interactiveButton);    
     
    this.playButton.lineStyle(2, 0xFFFFFF, 0.2);
    this.playButton.beginFill(0xFFFFFF, 0);
    this.playButton.drawRoundedRect(game.width/4, game.height/1.5, game.width/2, game.height/4, 15);
    this.playButton.endFill();
    game.containerUI.addChild(this.playButton);     
    
    this.restartButton.lineStyle(2, 0xFF0000, 0.2);
    this.restartButton.beginFill(0xFFFFFF, 0);
    this.restartButton.drawRoundedRect(game.width/4, game.height/1.5, game.width/2, game.height/4, 15);
    this.restartButton.endFill();
    game.containerUI.addChild(this.restartButton);       

    this.pauseButton.lineStyle(2, 0xFFFFFF, 0.2);
    this.pauseButton.beginFill(0xFFFFFF, 0);
    this.pauseButton.drawRoundedRect(0, game.height/4, 100, 100, 15);
    this.pauseButton.endFill();    
    game.containerUI.addChild(this.pauseButton);       
               
    //Set the interactivity.
    this.interactiveButton.interactive = true;
    this.interactiveButton.buttonMode = true;
    this.interactiveButton.addListener("pointerdown", function(){
      onClicked();
    });
  
    this.playButton.interactive = true;
    this.playButton.buttonMode = true;
    this.playButton.addListener("pointerdown", function(){
      game.setState(resume);
      _this.hidePlayButton();    
      _this.showPauseButton();       
      _this.showInteractButton();        
    });    

    this.restartButton.interactive = true;
    this.restartButton.buttonMode = true;
    this.restartButton.addListener("pointerdown", function(){
      game.setState(restart);
      _this.hideRestartButton();    
      _this.showPauseButton();       
      _this.showInteractButton();        
    });    
        
    this.pauseButton.interactive = true;
    this.pauseButton.buttonMode = true;
    this.pauseButton.addListener("pointerdown", function(){
      game.setState(pause);    
      _this.showPlayButton();    
      _this.hidePauseButton();
      _this.hideInteractButton();
    });  

  }
  
  show() {
    game.containerUI.visible = true;  
  }
  
  hide() {
    game.containerUI.visible = false;  
  }
  
  showInteractButton() {
    this.interactiveButton.visible = true;
  }

  hideInteractButton() {
    this.interactiveButton.visible = false;
  }  
  
  showPlayButton() {
    this.playButton.visible = true;
  }

  hidePlayButton() {
    this.playButton.visible = false;
  }  
  
  showPauseButton() {
    this.pauseButton.visible = true;
  }

  hidePauseButton() {
    this.pauseButton.visible = false;
  }    
    
  showRestartButton() {
    this.restartButton.visible = true;
  }

  hideRestartButton() {
    this.restartButton.visible = false;
  }    
 
}


class Camera {
  constructor(game) {
    this.game = game;
    this.camOffsetX = parseInt(game.width / 4);
    this.cameraTargetY = game.height;  //should be same as platform
    this.camOffsetY = 3
    this.camDtx = 0.08;
    this.camera = new Viewport(game.render.renderer, game.width, game.height, game.containerCam);
    this.startingWidth = game.width;
    this.targetWidth = game.width;
    this.targetWidthMod = 1;  //allows scaling depending on game loop
    this.zoom = game.width;
    this.maxWidth = Math.max(this.startingWidth + game.width / 3, 800);  //adjust for screen sizes
    this.zoomOutSpeed = game.width > 800 ? 0.5 : 0.3;
    this.zoomInSpeed = 0.1;
  }
  
  //should only be set once
  setScaleFactor(n) {
    this.startingWidth*=n;
    this.maxWidth*=n;
    this.targetWidth*=n;     
    this.zoom*=n;  
    this.camOffsetX*=n;   
    boundsLimitX*=n;
  }

  setTargetWidthMod(n) {
    this.targetWidthMod = n;
  }  

  trackLerpBody(body) {

    this.targetWidth = Math.min(this.startingWidth + Math.abs((fruitManager.maxX - fruitManager.minX)), this.maxWidth) * this.targetWidthMod;
      if (this.zoom < this.targetWidth) {
        this.zoom += this.zoomOutSpeed;
      } else if (this.zoom > this.targetWidth) {
        this.zoom -= this.zoomInSpeed;
      } else {
        this.zoom = this.camera.width;
      }   
    
    this.game.containerCam.pivot.x = ((body.position.x + this.camOffsetX) - this.game.containerCam.pivot.x) * this.camDtx + this.game.containerCam.pivot.x; 
    this.game.containerCam.pivot.y = this.cameraTargetY - this.camera._height / this.camOffsetY ;   
    this.zoomToFit(this.zoom, this.game.containerCam.pivot.x, this.game.containerCam.pivot.y);  
  }
  
  trackBody(body) {
    this.game.containerCam.pivot.x = body.position.x + this.camOffsetX;
    this.game.containerCam.pivot.y = this.cameraTargetY - this.camera._height / this.camOffsetY ;  
    this.camera.moveTo(this.game.containerCam.pivot.x, this.game.containerCam.pivot.y);
  }
  
  zoomToFit(width, x, y){
    this.camera._width = width;
    this.camera._height = width * this.camera.screenRatio;
    this.camera.center.x = x;
    this.camera.center.y = y;
    this.camera.recalculate();
  }  
  
  setPosition(body){
    this.game.containerCam.pivot.x = ((body.position.x + this.camOffsetX) - this.game.containerCam.pivot.x) + this.game.containerCam.pivot.x;     
    this.camera._width = this.startingWidth;
    this.camera._height = this.startingWidth * this.camera.screenRatio;
    this.camera.center.x = this.game.containerCam.pivot.x;
    this.game.containerCam.pivot.y = this.cameraTargetY - this.camera._height / this.camOffsetY ;        
    this.camera.center.y = this.game.containerCam.pivot.y;
    this.camera.recalculate();
  }    
  
}
