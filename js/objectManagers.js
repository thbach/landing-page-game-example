"use strict";

class Spawner {
  constructor () {       
    //platforms
    this.pBotY = game.height;
    this.pMidY = game.height-124;
    this.pTopY = game.height-241;    
    this.pBotStartX = 0;
    this.pMidStartX = game.width;
    this.pTopStartX = game.width*2;      
    this.pBotLastX = this.pBotStartX;
    this.pMidLastX = this.pMidStartX; 
    this.pTopLastX = this.pTopStartX;
      
    this.platformArrays = {
      platformsBot: this.createPlatforms(1, 0, this.pBotY, 24),
      platformsMid: this.createPlatforms(2, 0, this.pMidY, 16),    
      platformsTop: this.createPlatforms(3, 0, this.pTopY, 14),    
    };
    this.platforms = [...this.platformArrays.platformsBot, ...this.platformArrays.platformsMid, ...this.platformArrays.platformsTop]     

    //creatures              
    this.creatureArrays = {
      fruits: this.createCreatures(1, 50),
      rocks: this.createCreatures(2, 10),
      spikes: this.createCreatures(3, 5),
      spikesSmall: this.createCreatures(4, 10),
      monsters: this.createCreatures(5, 5),
      monstersSmall: this.createCreatures(6, 10),    
    };

    this.creatureSpawnChance = 0.4; // chance to spawn on platform    
    this.spawnableRange = this.getWeights([30, 3, 1, 3, 1, 3]); // must match spawnables     
    this.spawnables = [this.creatureArrays.fruits, this.creatureArrays.rocks, this.creatureArrays.spikes, this.creatureArrays.spikesSmall, this.creatureArrays.monsters, this.creatureArrays.monstersSmall];   // need to set weights    

    //hero
    this.positionHero();
    this.place();      

    //clouds
    this.clouds = this.createClouds(20);
    this.placeClouds();

  }
    
  getWeights(weights) {    
    let range = [];  
    let count = 0;
    for (let i = 0; i < weights.length; i++) {     
      for (let j = 0; j < weights[i]; j++) {
        range[count] = i;      
        count++;
      }    
    }
    return range;     
  }

  //returns a function to get creature pool by wieght  
  creaturesToSpawn() {
    const _this = this;
    return function(){
      return _this.spawnables[_this.spawnableRange[getRandomInt(0, _this.spawnableRange.length)]];       
    }  
  }  

  createPlatforms (type, x, y, amount=1) {
    let count = 0;
    let objs = [];     
    while (count < amount) {
      let obj = PlatformFactory.create(type, x, y);
      obj.disable();
      objs.push(obj);
      count++;
    }
    return objs;
  }
  
  createCreatures (type, amount=1) {
    let count = 0;
    let objs = [];     
    while (count < amount) {
      let obj = CreatureFactory.create(type);
      obj.disable();
      objs.push(obj);
      count++;
    }
    return objs;
  }  

  createClouds (amount=1) {
    let type = getRandomInt(1,5);
    let count = 0;
    let objs = [];     
    while (count < amount) {
      let obj = CloudFactory.create(type);
      //obj.disable();      
      objs.push(obj);
      count++;
    }
    return objs;
  }    
 
  positionHero() {
    this.hero = this.creatureArrays.fruits[this.creatureArrays.fruits.length-1];
    Body.setPosition(this.hero.body, {x: cam.camOffsetX, y: game.height-150});
    this.hero.enable();
    this.hero.setHero();
    this.hero.interactive = true;   
  }
  
  place() {
    let spawnChance = this.creatureSpawnChance;
    let creature = this.creaturesToSpawn();
    let doSpawn = false;

    //SPAWN PLATFORMS
    this.pBotLastX = this.pBotStartX
    this.pBotLastX = placeRow(this.platformArrays.platformsBot, this.pBotLastX, 5);
    doSpawn = true;
    this.pBotLastX = placeRow(this.platformArrays.platformsBot, this.pBotLastX, 14, 0, 200, 5);    
    this.pMidLastX = this.pMidStartX
    this.pMidLastX = placeRow(this.platformArrays.platformsMid, this.pMidLastX, 9, 100, 500);    
    this.pTopLastX = this.pTopStartX
    this.pTopLastX = placeRow(this.platformArrays.platformsTop, this.pTopLastX, 8, 0, 600);    
    
    function placeRow(platforms, lastX, amount=1, minGap=0, maxGap=0, nextIndex=0) {
      let randGap;
      let x;
      amount = Math.min(amount, platforms.length);
      for (let i = nextIndex; i < amount; i++) {
        const p = platforms[i];
        randGap = getRandomInt(minGap, maxGap);
        x = randGap + lastX;
        Body.setPosition(p.body, {x: x, y: p.body.position.y});        
        lastX = x + p.w;  
        p.enable();
        p.update();
        
        if(doSpawn && spawnChance > getRandomFloat(0,1)) {
          let c = creature().find(function(c) {
            return !c.active ? c : undefined;
          });    
          if (c !== undefined) {
            let cX = getRandomInt(x + c.w/2, (x + p.w) - c.w/2 ) - p.w / 2;            
            Body.setPosition(c.body, {x: cX, y: (p.body.position.y - p.h/2) - c.h/2 - 2});
            c.enable();
            c.update();
          }              
        }
      }
      return lastX;       
    }
    
  } 
  
  placeClouds() {
    let randGap;
    let x;
    let lastX = 0;
    let randY = this.pBotY;
    for (let i = 0; i < this.clouds.length; i++) {
      randGap = getRandomInt(50, 200);
      x = randGap + lastX;
      let y = getRandomInt(randY-10, randY+60);
      this.clouds[i].sprite.y = y;
      this.clouds[i].sprite.x = x;
      this.clouds[i].sprite.tint = 0xf2fbfb;
      lastX = x;
    }


  }

  recycle (platforms, lastX, minGap, maxGap, creaturesToSpawn, spawn=false) {
    let creature = creaturesToSpawn();
    let p = platforms.find(function(p) {
      return !p.active ? p : undefined;
    });    
    if (p !== undefined) {
      let x = lastX + getRandomInt(minGap, maxGap);
      Body.setPosition(p.body, {x: x, y: p.body.position.y});
      p.enable();
      p.update();  

      if (spawn && creature) {
        let c = creature.find(function(c) {
          return !c.active ? c : undefined;
        });    
        if (c !== undefined) {
          let cX = getRandomInt(x + c.w/2, (x + p.w) - c.w/2 ) - p.w / 2;             
          Body.setPosition(c.body, {x: cX, y: (p.body.position.y - p.h/2) - c.h/2 - 2});
          c.enable();
          c.update();
        }
      }      
      return x + p.w;
    } else {
      return lastX;
    }   
  }
      
  restart() {    
    disableEach(this.platforms);
    
    for (let i=0; i < this.spawnables.length; i++) {
      disableEach(this.spawnables[i]);
    }    
    
    function disableEach(objects) {
      for (let i=0; i < objects.length; i++) {
        objects[i].disable();
      }
    }
    this.positionHero();
    this.place();
  }

  updatePlay(cycle) {

    if (cycle % 60 === 0) {
      this.checkOffScreen(this.platformArrays.platformsBot); 
      this.pBotLastX = this.recycle(this.platformArrays.platformsBot, this.pBotLastX, 0, 200, this.creaturesToSpawn(), this.creatureSpawnChance > getRandomFloat(0,1));      
    }
  
    if ((cycle + 20) % 60 === 0) {
      this.checkOffScreen(this.platformArrays.platformsMid); 
      this.pMidLastX = this.recycle(this.platformArrays.platformsMid, this.pMidLastX, 100, 500, this.creaturesToSpawn(), this.creatureSpawnChance > getRandomFloat(0,1));        
    }
    if ((cycle + 40) % 60 === 0) {
      this.checkOffScreen(this.platformArrays.platformsTop); 
      this.pTopLastX = this.recycle(this.platformArrays.platformsTop, this.pTopLastX, 0, 600, this.creaturesToSpawn(), this.creatureSpawnChance > getRandomFloat(0,1));          
    }

  
    
  }  


  checkOffScreen (platforms) {
    for (let p of platforms) {
      if(p.active && p.isOffScreen({x: boundsPosX, y: boundsPosY})) {
        p.disable();
      }
    }
  } 


  

}


class FruitManager {
  constructor() {
    this.interactive = [];
    this.idle = [];
    this.minX = 0;
    this.maxX = 0;
    this.heroMass = 2;
    this.heroResti = 0;    
    this.heroLength = 1;    
  }

  handleClick() {
    if(hero.isGrounded) {
      this.jump(hero.body, 0, hero.jumpSpeed);     
      hero.doubleJump = true;  
      this.updateJumpLists(hero.body.position.x);        
    }
    if(!hero.isGrounded && hero.doubleJump) {
      this.jump(hero.body, 0, hero.jumpSpeed);
      hero.doubleJump = false;
      this.updateJumpLists(hero.body.position.x);        
    }
  }

  updatePlay(cycle) {
    this.heroAlive = false;
    this.interactive = [];
    this.idle = [];
    this.maxX = hero.active ? hero.body.position.x : 0;
    this.minX = hero.body.position.x;
    
    for (let f of spawner.creatureArrays.fruits) {
      if (f.isOffScreen({x: boundsPosX, y: boundsPosY})){
        this.delayDisable(f);
      } else if (f.active) {
        if (f.interactive) {    
          //CHECK WHICH HERO CHECK JUMP POS
          if (f !== hero) {
            this.checkJumpPos(f);        
            if (f.body.position.x > this.maxX) {
              this.changeHero(f);
            } else if (f.body.position.x < this.minX) {
              this.minX = f.body.position.x;
            }       
          }       
               
          //SPEED UP
          if (f.body.velocity.x < f.moveSpeed) {
            Body.setVelocity(f.body, {x: f.body.velocity.x + f.speedUpRate, y: f.body.velocity.y});               
          } else {
            Body.setVelocity(f.body, {x: f.moveSpeed, y: f.body.velocity.y});            
          }                            

          this.interactive.push(f);
          this.heroAlive = true;
          f.update();    
        } else {
          this.idle.push(f);
          f.update();
        }
      }
    }    

    //CHECK FRUIT CONTACT
    if (cycle % 3 === 0) {
      for (let i = 0; i < this.interactive.length; i++) {
        for (let j = 0; j < this.idle.length; j++) {
          if (Bounds.overlaps(this.interactive[i].body.bounds, this.idle[j].body.bounds)) {
              this.handleContact(this.interactive[i], this.idle[j], 1);
              break;
          }               
        }
      }
    }
    if ((cycle + 2) % 3 === 0) {
      for (let i = 0; i < this.interactive.length; i++) {
        for (let j = 0; j < spawner.creatureArrays.monsters.length; j++) {
          if (spawner.creatureArrays.monsters[j].active && Bounds.overlaps(this.interactive[i].body.bounds, spawner.creatureArrays.monsters[j].body.bounds)) {
              this.handleContact(this.interactive[i], spawner.creatureArrays.monsters[j], 5);                            
              break;
          }               
        }        
      }
    }
    if ((cycle + 4) % 3 === 0) {
      for (let i = 0; i < this.interactive.length; i++) {
        for (let j = 0; j < spawner.creatureArrays.monstersSmall.length; j++) {
          if (spawner.creatureArrays.monstersSmall[j].active && Bounds.overlaps(this.interactive[i].body.bounds, spawner.creatureArrays.monstersSmall[j].body.bounds)) {
              this.handleContact(this.interactive[i], spawner.creatureArrays.monstersSmall[j], 6);
              break;
          }               
        }        
      }
    }
    if ((cycle + 6) % 3 === 0) {
      for (let i = 0; i < this.interactive.length; i++) {
        for (let j = 0; j < spawner.creatureArrays.spikes.length; j++) {
          if (spawner.creatureArrays.spikes[j].active && Bounds.overlaps(this.interactive[i].body.bounds, spawner.creatureArrays.spikes[j].body.bounds)) {
              this.handleContact(this.interactive[i], spawner.creatureArrays.spikes[j], 3);
              break;
          }               
        }        
      }
    }    
    if ((cycle + 8) % 3 === 0) {
      for (let i = 0; i < this.interactive.length; i++) {
        for (let j = 0; j < spawner.creatureArrays.spikesSmall.length; j++) {
          if (spawner.creatureArrays.spikesSmall[j].active && Bounds.overlaps(this.interactive[i].body.bounds, spawner.creatureArrays.spikesSmall[j].body.bounds)) {
              this.handleContact(this.interactive[i], spawner.creatureArrays.spikesSmall[j], 4);
              break;
          }               
        }        
      }
    }    


    if (!this.heroAlive) {
      this.handleGameOver();
    }
    
  }

  updateStart(cycle) {

    for (let f of spawner.creatureArrays.fruits) {
      if (f.active) {
          f.update();  
      }
    }
      
  }  

  changeHero(f) {
    hero.unsetHero();
    f.setHero();
    hero = f;
  }

  handleGameOver() {
    game.setState(gameOver);
  }

  handleContact(c1, c2, type) {  
    switch (type) {
      case 1: // fruit
        c2.interactive = true; 
        this.jump(c2.body, getRandomFloat(0,-0.015), getRandomFloat(-0.01,-0.05));
        break;
      case 3: // spikes  
        c1.disable();        
        break;
      case 4: // spikesSmall
        c1.disable();           
        c2.onContact(); 
        break
      case 5: // mon
      case 6: // monSmall    
        this.jump(c1.body, getRandomFloat(-.05,-0.1), getRandomFloat(-0.05,-0.15));     
        c2.onContact();   
        break        
    }
  }  

  jump(body, forceX, forceY) {
    Body.applyForce(body, {x: body.position.x, y: body.position.y}, {x: forceX, y: forceY});      
  }
  
  updateJumpLists(xpos) {      
    for (let f of this.interactive) {
      f.appendJumpPos(xpos);
    }
  }
  
  checkJumpPos(f) {
    for (let i = 0; i < f.jumpList.length; i++) {
      if (f.body.position.x >= f.jumpList[i] && f.jumpList[i] !== -1) {
        if(f.isGrounded) { 
          this.jump(f.body, 0, f.jumpSpeed);          
          f.doubleJump = true; 
        }
        if(!f.isGrounded && f.doubleJump) {
          this.jump(f.body, 0, f.jumpSpeed);          
          f.doubleJump = false;     
        }    
        f.removeJumpPos(i);
        break;
      }
    }
  }
  
  delayDisable(f) {
    if (f.isOffScreen({x: boundsPosX+50, y: boundsPosY+200})) {
      f.disable();
    } else {
      this.heroAlive = true;
      f.update();
    }      
    if(f === hero) {
      this.maxX = 0; //choose another hero
    }
  }
}

class CloudsManager {
  update(cycle) {
    for (let i = 0; i < spawner.clouds.length; i++) {
      spawner.clouds[i].sprite.x -= 0.2;
    }  
  }

}


class ObstaclesManager {

  update(cycle) {
    for (let c of spawner.creatureArrays.rocks) {
      if (c.isOffScreen({x: boundsPosX, y: boundsPosY+200})){
        c.disable();              
      } else {
        c.update();
      }
    }

    if ((cycle + 6) % 9 === 0) {
      for (let c of spawner.creatureArrays.monsters) {
        if (c.isOffScreen({x: boundsPosX, y: boundsPosY})){
          c.disable();                
        } else {
          c.update();
        }
      }
    }

    if ((cycle + 12) % 9 === 0) {
      for (let c of spawner.creatureArrays.spikes) {
        if (c.isOffScreen({x: boundsPosX, y: boundsPosY})){
          c.disable();                
        } else {
          c.update();
        }
      }
    }    

    if ((cycle + 18) % 9 === 0) {
      for (let c of spawner.creatureArrays.spikesSmall) {
        if (c.isOffScreen({x: boundsPosX, y: boundsPosY})){
          c.disable();                
        } else {
          c.update();
        }
      }    
    }

    if ((cycle + 24) % 9 === 0) {
      for (let c of spawner.creatureArrays.monstersSmall) {
        if (c.isOffScreen({x: boundsPosX, y: boundsPosY})){
          c.disable();                
        } else {
          c.update();
        }
      }
    }    
  }  
}



class BGManager {
  constructor(game) {
    this.game = game;
    this.grad;
    this.logo;
    this.blurb;
    this.fadeSpeed = 0.003;
    this.clouds = [];
    this.cloudSpeed = 0.5;
  }

  makeBG() {

    const game = this.game;

    this.grad = new Sprite.fromImage('img/skygrad.png');
    this.grad.anchor.set(0.5, 0.66);
    this.grad.x = parseInt(this.grad.width/2);
    this.grad.y = parseInt((game.height - game.containerBG.height)/3);
    this.grad.width = game.width;
    if (game.height < 1000) {
      this.grad.height = parseInt(1600 * 0.6);
    }
    game.containerBG.addChild(this.grad);  


    this.logo = new Sprite.fromImage('img/logo.png');
    this.logo.anchor.set(0.5,1);
    this.logo.width = game.width/2 > 460 ? 460 : parseInt(game.width/2);
    this.logo.height = parseInt(this.logo.width * 0.3473684210526316);
    this.logo.y = parseInt(-game.height/4);
    game.containerBG.addChild(this.logo);  

    let fontSize;
    if (game.width > 800) {
      fontSize = 14;
    } else if (game.width > 1024) {
      fontSize = 16;
    } else {
      fontSize = 12;
    }
      
    let style = new TextStyle({
      fontFamily: "Helvetica",
      fontSize: fontSize,
      align: 'center',
      fill: '#ffffff'
    })
    
    this.blurb = new Text("DEBUG:", style);  
    this.blurb.anchor.set(0.5, 0);
    this.blurb.position.set(game.width/2,game.height/4);    
    game.containerUI.addChild(this.blurb);  
    this.blurb.text = `
In a world where fruits and vegetables battle for control. 
Join the adventure of a life time. Collect and train 
your fruit army. Find out how below ⇓` 
;   


    //CLOUDS
    this.clouds.push(this.makeCloud('img/cloud4.png', 414, game.height/20));    
    this.clouds.push(this.makeCloud('img/cloud3.png', 710, game.height/10, -100));
    this.clouds.push(this.makeCloud('img/cloud2.png', 540, -200, 0));        
    this.clouds.push(this.makeCloud('img/cloud2.png', 540, 0, -2000));
    this.clouds.push(this.makeCloud('img/cloud1.png', 409, -game.height/10));
    this.clouds.push(this.makeCloud('img/cloud1.png', 409, -400, -800));    
    this.clouds.push(this.makeCloud('img/cloud1.png', 409, -300, -2000));            
    this.clouds.push(this.makeCloud('img/cloud1.png', 409, -250, 500));        
  }

  fadeOn() {
    if (this.logo.alpha < 1) {
      this.logo.alpha += this.fadeSpeed;   
      this.blurb.alpha += this.fadeSpeed;          
    }
  }

  fadeOff() {
    if (this.logo.alpha > 0) {
      this.logo.alpha -= this.fadeSpeed;    
      this.blurb.alpha -= this.fadeSpeed;         
    }
  }

  update(delta) {
    switch (game.state) {
      case start:  
        this.cloudSpeed = 0.08;        
        break;
      case play:  
        this.fadeOff();
        this.cloudSpeed = 0.16;        
        break;
      case gameOverLoop:  
        this.fadeOn();
        this.cloudSpeed = 0.08;        
        break;
    }    

    for (let i = 0; i < this.clouds.length; i++){
      this.clouds[i].tilePosition.x -= this.cloudSpeed * (i+1) * delta;
    }

  }

  makeCloud(img, h, y, x=0) {
    let texture = Texture(img);
    let c = new TilingSprite(texture, game.width, h);
    if (game.width < 768) {
      c.tileScale.x = 0.6;
      c.tileScale.y = 0.6;
      c.height = parseInt(h/2);
    }    
    c.pivot.x = parseInt(game.width/2);
    c.pivot.y = parseInt(y);
    c.tilePosition.x = x;    
    game.containerBG.addChild(c);  
    return c;
  }


}



// HELPER FUNCTIONS
