"use strict";

//TODO
let platformCollisionGroup = 0x0001;
let creatureCollisionGroup = 0x0002;
let obstacleCollisionGroup = 0x0003;

class PlatformFactory {
  static create(type, x = 0, y = 0) {
    switch (type) {
      case 1:
        return new Platform(x, y, 194, 25, "img/platform.png");
      case 2:
        return new Platform(x, y, 97, 25, "img/platform_m.png");
      case 3:
        return new Platform(x, y, 48, 25, "img/platform_s.png");
    }
  }
}

class CloudFactory {
  static create(type, x = 0, y = 0) {
    switch (type) {
      case 1:
        return new CloudSprite(x, y, 466, 189, "img/cloud_fg1.png");
      case 2:
        return new CloudSprite(x, y, 500, 200, "img/cloud_fg2.png");
      case 3:
        return new CloudSprite(x, y, 451, 158, "img/cloud_fg3.png");
      case 4:
        return new CloudSprite(x, y, 290, 200, "img/cloud_fg4.png");
      case 5:
        return new CloudSprite(x, y, 414, 200, "img/cloud_fg5.png");
    }
  }
}

class CreatureFactory {
  static create(type, x = 0, y = 0) {
    let c;
    switch (type) {
      case 1:
        return new Fruit(x, y, 50, "img/bird.png");
      case 2:
        let rand = getRandomFloat(0.66, 1.33);
        c = new Rock(x, y, 60 * rand, "img/rock.png");
        c.body.mass = c.body.mass * rand;
        return c;
      case 3:
        c = new Spikes(x, y, 79 - 10, 60 - 10, "img/spikes.png");
        c.w = 79;
        c.h = 60;
        c.sprite.width = 79;
        c.sprite.height = 60;
        c.sprite.pivot.y = c.sprite.pivot.y - 4;
        return c;
      case 4:
        c = new Spikes(x, y, 40 - 5, 40 - 5, "img/spikes_small.png");
        c.w = 40;
        c.h = 40;
        c.sprite.width = 40;
        c.sprite.height = 40;
        c.sprite.pivot.y = c.sprite.pivot.y - 4;
        return c;
      case 5:
        c = new Monster(x, y, 60 - 5, 82 - 5, "img/mon2.png", 5); //hitpoints
        c.w = 60;
        c.h = 82;
        c.sprite.width = 60;
        c.sprite.height = 82;
        c.sprite.pivot.y = c.sprite.pivot.y - 2;
        return c;
      case 6:
        c = new Monster(x, y, 50, 42 / 2, "img/mon1.png", 1);
        c.sprite.h = 42;
        c.sprite.height = 42;
        c.sprite.pivot.y = c.sprite.pivot.y + 6;
        return c;
    }
  }
}

//MUST BE EXTENDED AND CALL AWAKE
class PhysicsBodySpriteRect {
  constructor(x, y, w, h, options, spriteImg) {
    this.active = true;
    this.w = w;
    this.h = h;
    this.body;
    this.sprite;
  }

  awake() {
    World.add(game.world, this.body);
    this.sprite.anchor.set(0.5);
    this.sprite.width = this.w;
    this.sprite.height = this.h;
    this.sprite.position = this.body.position;
    game.containerCam.addChild(this.sprite);
  }

  enable() {
    World.add(game.world, this.body);
    Body.setVelocity(this.body, { x: 0, y: 0 });
    this.active = true;
    this.sprite.visible = true;
  }

  disable() {
    Composite.remove(game.world, this.body);
    this.active = false;
    this.sprite.visible = false;
  }

  update() {
    this.sprite.position = this.body.position;
  }

  isOffScreen(pos) {
    return this.body.position.x < pos.x || this.body.position.y > pos.y;
  }
}

class CloudSprite {
  constructor(x, y, w, h, spriteImg) {
    this.active = true;
    this.sprite = new Sprite.fromImage(spriteImg);
    this.sprite.anchor.set(0.5, 0);
    this.sprite.width = w;
    this.sprite.height = h;
    game.containerCam.addChild(this.sprite);
  }

  enable() {
    this.active = true;
    this.sprite.visible = true;
  }

  disable() {
    this.active = false;
    this.sprite.visible = false;
  }

  update() {
    this.sprite.position = this.body.position;
  }

  isOffScreen(pos) {
    return this.body.position.x < pos.x || this.body.position.y > pos.y;
  }
}

class Platform extends PhysicsBodySpriteRect {
  constructor(x, y, w, h, spriteImg) {
    let options = {
      isStatic: true,
      friction: 0,
      collisionFilter: {
        category: platformCollisionGroup,
        mask: creatureCollisionGroup
      }
    };
    super(x, y, w, h, options, spriteImg);
    this.body = Bodies.rectangle(x, y, w + 10, h, options);
    this.sprite = new Sprite.fromImage(spriteImg);

    this.awake();
  }
}

class Rock extends PhysicsBodySpriteRect {
  constructor(x, y, d, spriteImg) {
    let options = {
      friction: 0.1,
      mass: 5,
      collisionFilter: {
        category: obstacleCollisionGroup
      }
    };
    super(x, y, d, d, options, spriteImg);
    this.body = Bodies.circle(x, y, d / 2, options);
    this.sprite = new Sprite.fromImage(spriteImg);

    this.awake();
  }

  update() {
    this.sprite.position = this.body.position;
    this.sprite.rotation = this.body.angle;
  }
}

class Spikes extends PhysicsBodySpriteRect {
  constructor(x, y, w, h, spriteImg) {
    let options = {
      isStatic: true,
      collisionFilter: {
        category: platformCollisionGroup,
        mask: creatureCollisionGroup
      }
    };
    super(x, y, w, h, options, spriteImg);
    this.body = Bodies.rectangle(x, y, w * 0.8, h * 0.6, options);
    this.sprite = new Sprite.fromImage(spriteImg);

    this.awake();
  }

  onContact() {
    this.disable();
  }
}

class Monster extends PhysicsBodySpriteRect {
  constructor(x, y, w, h, spriteImg, hitpoints) {
    let options = {
      isStatic: true,
      collisionFilter: {
        category: platformCollisionGroup,
        mask: creatureCollisionGroup
      }
    };
    super(x, y, w, h, options, spriteImg);
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.sprite = new Sprite.fromImage(spriteImg);
    this.hitpoints = hitpoints;
    this.startingHitpoints = hitpoints;
    this.awake();
  }

  onContact() {
    if (this.hitpoints <= 0) {
      this.disable();
    } else {
      this.hitpoints--;
    }
  }

  disable() {
    Composite.remove(game.world, this.body);
    this.active = false;
    this.sprite.visible = false;
    this.hitpoints = this.startingHitpoints;
  }
}

class Fruit extends PhysicsBodySpriteRect {
  constructor(x, y, d, spriteImg) {
    let options = {
      friction: 0,
      restitution: getRandomFloat(0.0, 0.3),
      mass: getRandomFloat(1.85, 2.15),
      inertia: Infinity,
      collisionFilter: {
        category: creatureCollisionGroup,
        mask: platformCollisionGroup
      }
    };
    super(x, y, d, d, options, spriteImg);
    this.startingRestitution = options.restitution;
    this.startingMass = options.mass;
    this.body = Bodies.rectangle(x, y, d - 20, d, options);
    this.sprite = new Sprite.fromImage(spriteImg);
    this.isGrounded = true;
    this.doubleJump = true;
    this.interactive = false;
    this.jumpSpeed = -0.1;
    this.moveSpeed = 4;
    this.speedUpRate = this.moveSpeed / getRandomInt(20, 30);
    this.jumpList = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // set size?

    this.resetJumpList();
    this.awake();
  }

  disable() {
    Composite.remove(game.world, this.body);
    this.active = false;
    this.interactive = false;
    this.sprite.visible = false;
    this.resetJumpList();
  }

  resetJumpList() {
    for (let i = 0; i < this.jumpList.length; i++) {
      this.jumpList[i] = -1;
    }
  }

  appendJumpPos(xpos) {
    this.jumpList[this.jumpList.indexOf(-1)] = xpos;
  }

  removeJumpPos(i) {
    this.jumpList[i] = -1;
  }

  setHero() {
    this.body.mass = 2;
    this.body.restitution = 0;
    this.resetJumpList();
  }

  unsetHero() {
    this.body.mass = this.startingMass;
    this.body.restitution = this.startingRestitution;
    this.resetJumpList();
  }
}
