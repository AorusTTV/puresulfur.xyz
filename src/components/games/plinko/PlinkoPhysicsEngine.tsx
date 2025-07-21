
interface PhysicsObject {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  targetSlot: number | null;
}

interface Peg {
  x: number;
  y: number;
  radius: number;
}

export class PlinkoPhysicsEngine {
  private objects: PhysicsObject[] = [];
  private pegs: Peg[] = [];
  private boardWidth: number;
  private boardHeight: number;
  private objectPool: PhysicsObject[] = [];
  private nextId = 0;
  
  // Physics constants
  private readonly GRAVITY = 0.35;
  private readonly FRICTION = 0.99;
  private readonly BOUNCE_FORCE = 0.6;
  private readonly RANDOMNESS = 0.3;
  private readonly MAX_VELOCITY_X = 4;
  private readonly MAX_VELOCITY_Y = 6;
  private readonly BIAS_STRENGTH = 0.15;

  constructor(boardWidth: number, boardHeight: number, pegs: Array<{x: number, y: number}>) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.pegs = pegs.map(peg => ({ x: peg.x, y: peg.y, radius: 4 }));
    
    // Pre-allocate object pool
    for (let i = 0; i < 50; i++) {
      this.objectPool.push(this.createPhysicsObject());
    }
  }

  private createPhysicsObject(): PhysicsObject {
    return {
      id: this.nextId++,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 6,
      active: false,
      targetSlot: null
    };
  }

  private getTargetSlot(slotsCount: number): number {
    const random = Math.random();
    
    // Center slots (6-10): 75% probability
    if (random < 0.75) {
      const centerSlots = [6, 7, 8, 9, 10];
      return centerSlots[Math.floor(Math.random() * centerSlots.length)];
    }
    
    // Medium slots (3-5, 11-13): 23% probability
    if (random < 0.98) {
      const mediumSlots = [3, 4, 5, 11, 12, 13];
      return mediumSlots[Math.floor(Math.random() * mediumSlots.length)];
    }
    
    // Edge slots (0-2, 14-16): 2% probability
    const edgeSlots = [0, 1, 2, 14, 15, 16];
    return edgeSlots[Math.floor(Math.random() * edgeSlots.length)];
  }

  addBall(slotsCount: number): number {
    let obj = this.objectPool.pop();
    
    if (!obj) {
      obj = this.createPhysicsObject();
    }
    
    // Initialize ball at center top
    obj.x = this.boardWidth / 2;
    obj.y = 50;
    obj.vx = (Math.random() - 0.5) * 0.3;
    obj.vy = 0;
    obj.active = true;
    obj.targetSlot = this.getTargetSlot(slotsCount);
    
    this.objects.push(obj);
    return obj.id;
  }

  removeBall(id: number): PhysicsObject | null {
    const index = this.objects.findIndex(obj => obj.id === id);
    if (index === -1) return null;
    
    const obj = this.objects.splice(index, 1)[0];
    obj.active = false;
    
    // Return to pool
    this.objectPool.push(obj);
    return obj;
  }

  // Batch update all physics objects
  update(slotsCount: number): Array<{id: number, x: number, y: number, landed?: {slotIndex: number}}> {
    const results: Array<{id: number, x: number, y: number, landed?: {slotIndex: number}}> = [];
    const toRemove: number[] = [];
    
    for (const obj of this.objects) {
      if (!obj.active) continue;
      
      // Apply gravity and friction
      obj.vx *= this.FRICTION;
      obj.vy += this.GRAVITY;
      
      // Apply bias toward target slot
      if (obj.targetSlot !== null && obj.y > 200) {
        const targetX = (obj.targetSlot + 0.5) * (this.boardWidth / slotsCount);
        const distanceToTarget = targetX - obj.x;
        const biasStrength = Math.min(this.BIAS_STRENGTH, Math.abs(distanceToTarget) / this.boardWidth);
        
        if (Math.abs(distanceToTarget) > 10) {
          const bias = distanceToTarget > 0 ? biasStrength : -biasStrength;
          obj.vx += bias;
        }
      }
      
      // Update position
      obj.x += obj.vx;
      obj.y += obj.vy;
      
      // Bounce off walls
      if (obj.x <= obj.radius || obj.x >= this.boardWidth - obj.radius) {
        obj.vx = -obj.vx * this.BOUNCE_FORCE;
        obj.x = Math.max(obj.radius, Math.min(this.boardWidth - obj.radius, obj.x));
      }
      
      // Check peg collisions (optimized with early exit)
      this.checkPegCollisions(obj, slotsCount);
      
      // Limit velocities
      obj.vx = Math.max(-this.MAX_VELOCITY_X, Math.min(this.MAX_VELOCITY_X, obj.vx));
      obj.vy = Math.min(obj.vy, this.MAX_VELOCITY_Y);
      
      // Check if ball reached bottom
      if (obj.y >= this.boardHeight - 60) {
        let finalSlotIndex = obj.targetSlot;
        
        if (obj.targetSlot !== null) {
          const targetX = (obj.targetSlot + 0.5) * (this.boardWidth / slotsCount);
          const distanceToTarget = Math.abs(obj.x - targetX);
          
          if (distanceToTarget > this.boardWidth / slotsCount) {
            const slotWidth = this.boardWidth / slotsCount;
            finalSlotIndex = Math.floor(Math.max(0, Math.min(obj.x / slotWidth, slotsCount - 1)));
          }
        } else {
          const slotWidth = this.boardWidth / slotsCount;
          finalSlotIndex = Math.floor(Math.max(0, Math.min(obj.x / slotWidth, slotsCount - 1)));
        }
        
        results.push({
          id: obj.id,
          x: obj.x,
          y: obj.y,
          landed: { slotIndex: finalSlotIndex! }
        });
        
        toRemove.push(obj.id);
      } else {
        results.push({
          id: obj.id,
          x: obj.x,
          y: obj.y
        });
      }
    }
    
    // Remove landed balls
    for (const id of toRemove) {
      this.removeBall(id);
    }
    
    return results;
  }

  private checkPegCollisions(obj: PhysicsObject, slotsCount: number) {
    for (const peg of this.pegs) {
      const dx = obj.x - peg.x;
      const dy = obj.y - peg.y;
      const distance = dx * dx + dy * dy; // Use squared distance to avoid sqrt
      const minDistance = (obj.radius + peg.radius) * (obj.radius + peg.radius);
      
      if (distance < minDistance) {
        const actualDistance = Math.sqrt(distance);
        const angle = Math.atan2(dy, dx);
        let force = 1.4 + Math.random() * 0.8;
        
        // Apply directional bias toward target
        let bounceAngle = angle;
        if (obj.targetSlot !== null) {
          const targetX = (obj.targetSlot + 0.5) * (this.boardWidth / slotsCount);
          const biasTowardTarget = (targetX - obj.x) / this.boardWidth;
          bounceAngle += biasTowardTarget * 0.4;
        }
        
        bounceAngle += (Math.random() - 0.5) * this.RANDOMNESS;
        
        obj.vx = Math.cos(bounceAngle) * force;
        obj.vy = Math.abs(Math.sin(bounceAngle)) * force + 0.3;
        
        // Move ball away from peg
        obj.x = peg.x + Math.cos(angle) * (obj.radius + peg.radius + 2);
        obj.y = peg.y + Math.sin(angle) * (obj.radius + peg.radius + 2);
        
        break; // Only handle one collision per frame
      }
    }
  }

  getActiveObjects(): PhysicsObject[] {
    return this.objects.filter(obj => obj.active);
  }

  updateBoardDimensions(width: number, height: number) {
    this.boardWidth = width;
    this.boardHeight = height;
  }

  updatePegs(pegs: Array<{x: number, y: number}>) {
    this.pegs = pegs.map(peg => ({ x: peg.x, y: peg.y, radius: 4 }));
  }
}
