var MAX_POSS_DISTANCE = 1300;

class Particle {
    constructor() {
        this.pos = createVector(width / 2 , height / 2);
        this.rays = [];
        for(let i=0; i < 360; i += 5) {
            //this.rays.push(new Ray(this.pos.x, this.pos.y, i * 3.1415926535 / 180));
            this.rays.push(new Ray(this.pos, i * 3.1415926535 / 180));
        }
    }

    show() {
        fill(255);
        ellipse(this.pos.x,this.pos.y,3,3);
        for(let ray of this.rays) {
            ray.show();
        }
    }

    updatePos(x,y) {
        this.pos.x = x;
        this.pos.y = y;
    }

    castDot(walls) {
        for(let ray of this.rays) {
            //let pt = ray.cast(walls[0]);
            const pt = ray.totalCast(walls);
            if(pt) {
                fill(255);
                ellipse(pt.x,pt.y,4,4);
                line(pt.x,pt.y,this.pos.x,this.pos.y);
            }
        }
    }
}

class Ray {
    constructor(pos, angle ) {
        this.pos = pos;//createVector(x1,y1);
        this.dir = p5.Vector.fromAngle(angle);
    }

    lookAt(x,y) {
        this.dir.x = x - this.pos.x;
        this.dir.y = y - this.pos.y;
        this.dir.normalize();
    }

    show() {
        push();
        stroke(255);
        translate(this.pos.x,this.pos.y);
        line(0,0,this.dir.x,this.dir.y);
        pop();
    }

    totalCast(walls) {
        if( Array.isArray(walls)) {
            let min_distance = Infinity;
            let closest_pt = null;
            for( let w of walls) {
                const pt = this.cast(w);
                if(pt) {
                    const sum_squares = pow((pt.x - this.pos.x), 2) + pow((pt.y - this.pos.y), 2);
                    //console.log(sum_squares);
                    //min_distance = min(min_distance, sum_squares);
                    if( sum_squares < min_distance) {
                        closest_pt = pt;
                        min_distance = sum_squares;
                    }
                }
            }
            return closest_pt;
        } else {
            return this.cast(walls);
        }
    }

    cast(wall) {
        const x1 = wall.a.x;
        const y1 = wall.a.y;
        const x2 = wall.b.x;
        const y2 = wall.b.y;
        const x3 = this.pos.x;
        const y3 = this.pos.y;
        const x4 = this.pos.x + this.dir.x;
        const y4 = this.pos.y + this.dir.y;
        
        
        const den = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
        if(den == 0) {
            return;
        }
        const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / den;
        const u = -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / den;

        if (t > 0 && t < 1 && u > 0) {
            const pt = createVector();
            pt.x = x1 + t * (x2 - x1);
            pt.y = y1 + t * (y2 - y1);
            return pt;
        } else {
            return
        }

    }
}

function vect2d(x,y) {
    /*this.x = x;
    this.y = y;*/
    return {'x': x, 'y': y};
}

class Boundary {
    constructor(x1,y1,x2,y2, material) {
        this.a = vect2d(x1,y1);
        this.b = vect2d(x2,y2);
        this.material = material;
        this.mirror = material == null ? true : material.mirror;
    }


    direction() {
        if(this.mirror == false) {
            return null;
        }
        let direction = vect2d(0,0);
        direction.x = this.a.x - this.b.x;
        direction.y = this.a.y - this.b.y;
        return direction;
    }

    show() {
        stroke(255);
        line(this.a.x,this.a.y,this.b.x,this.b.y);
    }
    
    cast(pos,dir) {
        const x1 = this.a.x;
        const y1 = this.a.y;
        const x2 = this.b.x;
        const y2 = this.b.y;
        const x3 = pos.x;
        const y3 = pos.y;
        const x4 = pos.x + dir.x;
        const y4 = pos.y + dir.y;
        
        
        const den = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
        if(den == 0) {
            return;
        }
        const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / den;
        const u = -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / den;

        if (t > 0 && t < 1 && u > 0) {
            //return u;
            //let col_pt = vect2d( pos.x + dir.x * u, pos.y + dir.y * u);
            
            return {'dist': u, 'reflect': this.direction()}
            //return {'dist': dist, 'pt': pt, 'reflect': reflectVector(x,y)}
            //{'dist': u, 'reflectVector': this.reflectVector()}
        } else {
            return;
        }

    }

}

function distSquared(x1,y1,x2,y2) {
    return pow(x1-x2,2) + pow(y1-y2,2);
}

class Dot {
    constructor(x,y,r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    show() {
        fill(255);
        ellipse(this.x,this.y,this.r,this.r);
    }
}

class Polynomial {
    constructor(a,b,c, rotation, x,y, start,stop,mirror) {
        this.a = a;
        this.b = b - 2*a*x;//b;
        this.c = a*x*x - b*x + y + c//c;
        this.rotation = rotation;
        this.pos = {'x': x, 'y': y};
        this.start = start + x;
        this.stop = stop + x;
        this.length = stop - start;
        this.mirror = mirror == null ? true : mirror;
    }

    reflectVector(x,y) {
        if(this.mirror == false) {
            return null;
        }
        const m = this.a * 2 * x + this.b;
        return vect2d(1,m); //{'x': 1, 'y': m};
    }

    roots(pos, dir) {
        if(dir.x == 0) {
            return [pos.x];
        }
        const m = dir.y / dir.x;
        const b_intercept = pos.y - m * pos.x;
        const a = this.a;
        const b = this.b - m;
        const c = this.c - b_intercept;
        let inner = pow(b,2) - 4 * a * c;
        if(inner < 0) {
            return [null];
        }
        inner = pow(inner, 0.5);
        const x1 = (inner - b) / (2*a);
        const x2 = (-inner - b) / (2*a);
        let tem = [];
        tem.push(x1);
        tem.push(x2);
        /*if(! Array.isArray(tem)) {
            console.log([pos,dir]);
            //temp = [temp];
        }*/
        return tem;
        //return [x1, x2];
    }
    
    cast(pos, dir) {
        //Return distance as well as a pretend wall for this point
        
        let min_distance = Infinity;
        let pt = {'x': null, 'y': null};
        //let temp = this.roots(pos,dir);
        
        var x;
        for( x of this.roots(pos,dir)/*[x1,x2]*/) {
            if(this.start > x || this.stop < x) {
                continue;
            }
            let y = this.polyFun(x);
            let new_dist = distSquared(x,y,pos.x,pos.y);
            if(new_dist < min_distance && (x - pos.x) * dir.x >= 0 && (y - pos.y) * dir.y >= 0) {
                min_distance = new_dist;
                pt.x = x;
                pt.y = y;
            } 
        }
        //console.log(min_distance, pt);
        if(min_distance == Infinity) {
            return;
        }
        //dots.push(new Dot(pt.x,pt.y,5));
        const dist = pow(min_distance, 0.5);
        return {'dist': dist, 'reflect': this.reflectVector(pt.x,pt.y)};
    }

    polyFun(v) {
        return this.a * pow(v, 2) + this.b * (v) + this.c;
    }

    show() {
        stroke(255);
        noFill();
        beginShape();
        for(let i=0;i<this.length; i++){
            let x0 = i + this.start;
            let y0 = this.polyFun(x0);
            vertex(x0,y0);
        }
        endShape();
    }
}

function closestPtLine(pt, pos,dir) {
    if(dir.x == 0) {
        return vect2d(pos.x,pt.y);
    }
    if(dir.y == 0) {
        return vect2d(pt.x,pos.y);
    }
}

function distanceToLine(pt,pos,dir) {
    const x1 = pt.x;
    const y1 = pt.y;
    const x2 = pt.x - dir.y;
    const y2 = pt.y + dir.x;
    const x3 = pos.x;
    const y3 = pos.y;
    const x4 = pos.x + dir.x;
    const y4 = pos.y + dir.y;
    
    const den = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
    if(den == 0) {
        return;
    }
    const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / den;
    const u = -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / den;
    return {'dist': t, 'x': pt.x - t * dir.y, 'y': pt.y + t * dir.x, 'from_pt': u};
}


class Circle {
    constructor(x,y,r,mirror) {
        this.x=x;
        this.y=y;
        this.r=r;
        this.r2 = r*r;
        this.pt = vect2d(x,y);
        this.mirror=mirror == null ? true : mirror;
        this.wall; 
    }

    reflectVector(x,y) {
        if(this.mirror == false) {
            return null;
        }
        return vect2d(2 * (y - this.y),(-2) * (x - this.x)); //{'x': 1, 'y': m};
    }

    roots(pos, dir) {
        let calc = distanceToLine(this.pt,pos,dir);
        if(calc.dist > this.r) {
            return;
        }
        const side_length = pow(this.r2 - pow(calc.dist,2),0.5);
        let total_legth = null;
        let value = calc.from_pt - side_length;
        if(value >= 0) {
             return value;
        }
        value = calc.from_pt + side_length;
        if(value >= 0) {
             return value;
        }
        return;
    }

    cast(pos, dir) {
        let dist = this.roots(pos, dir);
        if(dist == null){
            return;
        }
        let x = pos.x + dir.x * dist;
        let y = pos.y + dir.y * dist;
        //dots.push(new Dot(pt.x,pt.y,5));
        return {'dist': dist, 'reflect': this.reflectVector(x,y)};
    }

    show() {
        stroke(255);
        noFill();
        beginShape();
        for(let i=0; i<= 6.283; i += .001) {
            let r = this.r;
            let x = cos(i)*r;
            let y = sin(i) * r;
            vertex(x + this.x,y + this.y);
        }
        endShape();
    }
}


class Container {
    constructor(x,y,rotation,scale) {
        this.x=x;
        this.y=y;
        this.rotation=rotation;
        this.scale = scale;
        this.items = [];
        this.matrix;
    }

    push(item) {
        this.items.push(item);
    }

    cast(pos, dir) {
        let item;
        let min_distance = Infinity;
        let calc_pt;
        for(item of this.items) {
            let pt_calc = item.cast(pos,dir);
            if(pt_calc) {
                const dist = pt_calc.dist;
                if( dist < min_distance) {
                    min_distance = dist;
                    calc_pt = pt_calc;
                }
            }
        }
        if(min_distance == Infinity) {
            //Fail distance
            return {'dist':MAX_POSS_DISTANCE, 'reflect': null};
        }
        return {'dist': min_distance, 'reflect': calc_pt.reflect};
        
    }

    show() {
        let item;
        for(item of this.items) {
            item.show(this.matrix);
        }
    }
}