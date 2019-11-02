var scl = 1;
var LARGEST_TIME_UNIT = 1000000;
var itime = 0;

function time_step() {
    itime ++;
    if(itime > LARGEST_TIME_UNIT) {
        itime = 0;
    }
}

function mirrorReflect(dir, mirror_dir) {
    let new_dir = createVector();
    //console.log(dir);
    if( mirror_dir.x == 0) {
        new_dir.x = -dir.x;
        new_dir.y = dir.y;
        return new_dir;
    }
    const m_mirror = mirror_dir.y / mirror_dir.x;
    //console.log(m_mirror);
    const x0 = dir.x;
    const y0 = dir.y;
    const m2 = pow(m_mirror,2);
    const x_f = ((1-m2) * x0 + 2 * m_mirror * y0) / (m2 + 1);
    const y_f = (-(1-m2) * y0 + 2 * m_mirror * x0) / (m2 + 1);
    new_dir.x = x_f;
    new_dir.y = y_f;
    //console.log(new_dir);
    return new_dir;
}
var freq = 450;


class Photon {
    constructor(pos, angle, wall, iteration, time_set, freq_s) {
        this.reset(pos, angle, wall, iteration, time_set, freq_s);
    }
    
    reset(pos, angle, wall, iteration, time_set, freq_s) {
        freq = freq + 0.3;
        if (freq > 700) {
            freq = 450;
        }
        /*this.pos = createVector();
        this.pos.x = pos.x;
        this.pos.y = pos.y;*/
        this.pos = {'x': pos.x, 'y': pos.y};
        this.dir = angle;
        this.iteration = iteration ? iteration : 1;
        this.origin_pt = this.pos;
        this.dist_travel = this.castEnviron(wall);
        this.collision_pt = this.findPt(pos,this.dist_travel - 0.000001);
        this.refraction_pt = this.findPt(pos,this.dist_travel + 0.000001);
        //dots.push(new Dot(this.collision_pt.x,this.collision_pt.y,5));
        this.freqs;
        this.freq = freq_s ? freq_s : freq;
        this.length = 20;
        this.color = colorFreq(this.freq);//color(random()*55+200,66,66);
        //this.time_i = 0;
        this.time_paused = time_set ? time_set: itime;
        this.time_i = itime - this.time_paused;
        if(this.time_i < 0) {
            this.time_i = this.time_i + LARGEST_TIME_UNIT;
        }
        /*if(this.time_i > 0) {
            console.log(this.time_i);
        }*/
        this.impact_material;
        this.impact_angle;
        //this.wall; // Calculated below
        this.walls_environment = wall;
        this.impacted = false;
        this.tip = true;
        this.impact_reflection;

    }

    updatePos() {
        this.time_i++;
    }

    reflectionArr() {
        /*if(this.wall) {
            /*if(this.wall.hasOwnProperty('material')){
                if(this.wall.material.mirror == false){
                    console.log('no mirror');
                    return [];
                }
            }
            
        } else {
            //console.log('missing wall error caught');
            return [];
        }*/
        if(this.wall == null) {
            //console.log('missing wall error caught');
            return [];
        }
        /*if(this.wall.material == null){
            console.log('no material');
            return [];
        }*/
        if(this.wall.mirror == false) {
            //console.log('no mirror');
            return [];
        }
        if(this.impact_reflection == null) {
            return [];
        }
        let new_direction = mirrorReflect(l.dir, this.impact_reflection);//*l.wall.direction()*/);
        return [this.collision_pt,new_direction,this.walls_environment, this.iteration + 1, itime,this.freq];
    }

    reflection() {
        /*if(this.impact_reflection == null) {
            return;
        }
        let new_direction = mirrorReflect(l.dir, this.impact_reflection););
        let x = new Photon(this.collision_pt,new_direction,this.walls_environment);
        */
        let param = this.reflectionArr();
        if(param.length == 0) {
            return;
        }
        let x= new Photon(...param);
        x.iteration = this.iteration + 1;
        x.color = this.color;
        return x;
    }

    show() {
        if(! this.impacted) {
            this.time_i++;
            const scl_time = this.time_i * scl;
            const dist = min(scl_time, this.dist_travel);
            const x = this.pos.x + this.dir.x * dist;
            const y = this.pos.y + this.dir.y * dist;
            const photon_length = min(scl_time, this.length);
            //const dist_end = min(scl_time - photon_length, this.dist_travel);
            const dist_end = scl_time - photon_length;
            if( dist_end > this.dist_travel) {
                this.impacted = true;
                //this.impactResult();
                //return true;
            }
            if( dist >= this.dist_travel && this.tip) {
                this.tip = false;
                return true;
            }
            const x_end = this.pos.x + this.dir.x * ( dist_end);
            const y_end = this.pos.y + this.dir.y * ( dist_end);
            stroke(this.color);
            line(x_end,y_end,x,y);
        }
    }

    impactResult() {
        if (random() > .9) {
            let new_direction = mirrorReflect(this.dir, this.wall.direction());
            light.push(new Photon(this.collision_pt,new_direction,this.walls_environment)); // photons need a death signal. too small of energy
        }
    }

    
    findPt(pos,dist) {
        const pt = {'x': null, 'y': null};
        pt.x = pos.x + this.dir.x * dist;
        pt.y = pos.y + this.dir.y * dist;
        return pt;
    }

    castEnviron(walls) {
        if( Array.isArray(walls)) {
            let min_distance = Infinity;
            let impact_wall;
            let calc_pt;
            for( let w of walls) {
                let pt_calc = w.cast(this.pos,this.dir); 
                if(pt_calc) {
                    const dist = pt_calc.dist;
                    if( dist < min_distance) {
                        min_distance = dist;
                        impact_wall = w;
                        calc_pt = pt_calc;
                    }
                }
            }
            if(min_distance == Infinity) {
                //Fail distance
                return 1300;
            }
            this.wall = impact_wall;
            this.impact_reflection = calc_pt.reflect;
            return min_distance;
        } else {
            this.wall = walls;
            return walls.cast(this.pos,this.dir);
        }
    }
}

function   colorFreq(l) {
        let t;
        let r=0.0; 
        let g=0.0; 
        let b=0.0;
        if ((l>=400.0)&&(l<410.0)) { 
            t=(l-400.0)/(410.0-400.0); 
            r= +(0.33*t)-(0.20*t*t); }
        else if ((l>=410.0)&&(l<475.0)) { 
            t=(l-410.0)/(475.0-410.0); 
            r=0.14 -(0.13*t*t); }
        else if ((l>=545.0)&&(l<595.0)) { 
            t=(l-545.0)/(595.0-545.0); 
            r=+(1.98*t)-(t*t); }
        else if ((l>=595.0)&&(l<650.0)) { 
            t=(l-595.0)/(650.0-595.0); 
            r=0.98+(0.06*t)-(0.40*t*t); }
        else if ((l>=650.0)&&(l<700.0)) { 
            t=(l-650.0)/(700.0-650.0); 
            r=0.65-(0.84*t)+(0.20*t*t); }
        
        if ((l>=415.0)&&(l<475.0)) { 
            t=(l-415.0)/(475.0-415.0); 
            g= +(0.80*t*t); }
        else if ((l>=475.0)&&(l<590.0)) { 
            t=(l-475.0)/(590.0-475.0); 
            g=0.8 +(0.76*t)-(0.80*t*t); }
        else if ((l>=585.0)&&(l<639.0)) { 
            t=(l-585.0)/(639.0-585.0); 
            g=0.84-(0.84*t); }
                
        if ((l>=400.0)&&(l<475.0)) {
            t=(l-400.0)/(475.0-400.0); 
            b=    +(2.20*t)-(1.50*t*t); }
        else if ((l>=475.0)&&(l<560.0)) {
            t=(l-475.0)/(560.0-475.0); 
            b=0.7 -(t)+(0.30*t*t); }
        //console.log({'r':r,'g':g,'b':b});
        return color(255*r,255*g,255*b);
         
    }


