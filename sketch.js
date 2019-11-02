
var light = [];
var particle;
//var scl = 20;
var wall = [];
var i = 0;
var food;
var shape;
var dots = [];
var photon_limit = 2000;

function setup() {
  createCanvas(600, 600);
  /*wall = [new Boundary(100,200,400,500), new Boundary(300,200,500,500), new Boundary(300,200,400,500)];
  for(let i=0; i< 3; i++) {
    wall.push(new Boundary(random(600),random(600),random(600),random(600)));
  }*/

  //wall.push(new Boundary(0,0,600,0));
  wall.push(new Boundary(600,0,600,600));
  //wall.push(new Boundary(600,600,0,600));
  wall.push(new Boundary(0,600,0,0));
  
  //Erases photons going outside viewer
  let no_mirror = {'mirror':false}
  wall.push(new Boundary(-10,-10,610,-10,no_mirror));
  wall.push(new Boundary(610,-10,610,610,no_mirror));
  wall.push(new Boundary(610,610,-10,610,no_mirror));
  wall.push(new Boundary(-10,610,-10,-10,no_mirror));


  particle = new Particle();
  shape = new Polynomial(.01,0,0,0,width/2,height/2 -100,-100,100);
  wall.push(shape);
  wall.push(new Boundary(200,300,400,500));
  
  //wall.push(new Boundary(100,200,400,500));
  wall.push(new Circle(100,100,99,true));
}


let xxi = 10000;
function draw() {
  background(0);
  //wall.show();
  for(w of wall) {
    w.show();
  }
  shape.show();
  particle.updatePos(mouseX,mouseY);
  particle.show();
  var  d;
  for(d of dots) {
    d.show();
  }
  while(dots.length > 200) {
    dots.shift();
  }
  
  /*let fun = distanceToLine(particle.pos, vect2d(100,200),vect2d(300,300));
  fill(255);
  ellipse(fun.x,fun.y,6,6);
  if(xxi > 99) {
    console.log(fun.dist);
  }*/

  //let fun_dir = {x:1,y:1};
  //let fun = mirrorReflect(fun_dir,{x: particle.pos.x - 300,y: particle.pos.y - 300});
  //line(300,300, particle.pos.x,particle.pos.y);
  //line(300,300, fun.x*30 + 300,fun.y*30 + 300);
  //line(300,300, fun_dir.x*30 + 300,fun_dir.y*30 + 300);
  //particle.castDot(wall);
  //ellipse(100,i++,8,8);
  
  
  /*itime ++;
  if( itime > LARGEST_TIME_UNIT) { 
    itime=0;
  }*/
  time_step();

  const angle = random(3600)/10;
  /*var g = new Ray(particle.pos, angle);
  const p = g.totalCast(wall);
  */let new_dir = p5.Vector.fromAngle(radians(angle));/*
  if(p) {
    if(xxi++ > 100) {
      xxi = 0;
      q.push([particle.pos,new_dir,wall]);
      //light.push(new Photon(particle.pos,new_dir,wall, 1));
  }}*/
  if(xxi++ > 100) {
    xxi = 0;
    q.push([particle.pos,new_dir,wall]);
  }
  for(l of light) {
    if(l.show() && l.iteration <= 10/*random() > .12*/) {
      /*let new_photon = l.reflection();
      if( new_photon) {
        light.push(new_photon);
      }*/
      const check_var = l.reflectionArr();
      if(check_var.length > 0) {
        q.push(check_var);
      }
      
    }
  }
  let ph;
  for( ph of light) {
    if(q.length == 0) {
      break;
    }
    if(ph.impacted) {
      if( q[0][0] == null) {
        q.shift();
        continue;
      }
      ph.reset(...q.shift());
    }
  }
  while(light.length < photon_limit) {
    if(q.length == 0) {
      break;
    }
    if( q[0][0] == null) {
      q.shift();
      continue;
    }
    light.push(new Photon(...q.shift()));
  }
  /*
  if(light.length > 0) {
    while( light[0].impacted){
      light.shift();
      if(light.length == 0) {
        break;
      }
    }
    while( light.length > 3550) {
      light.shift();
    }
  }*/

}

function mousePressed() {
  let new_pos = vect2d(particle.pos.x, particle.pos.y);
  for(let i = 0; i< 999; i++) {
    const angle = random(36000)/100;
    //var g = new Ray(particle.pos, angle);
    //const p = g.totalCast(wall);
    const p = 1;
    let new_dir = p5.Vector.fromAngle(radians(angle));
    if(p) {
      if(xxi++ > 1) {
        xxi = 0;
        q.push([new_pos,new_dir,wall, 1, itime]);
        //light.push(new Photon(particle.pos,new_dir,wall, 1));
      }
    }
  }
  q.push([new_pos,vect2d(0,1),wall, 1, itime]);
  q.push([new_pos,vect2d(0,-1),wall, 1, itime]);
  q.push([new_pos,vect2d(1,0),wall, 1, itime]);
  q.push([new_pos,vect2d(-1,0),wall, 1, itime]);
  /*
  light.push(new Photon(particle.pos,vect2d(0,1),wall, 1));
  light.push(new Photon(particle.pos,vect2d(0,-1),wall, 1));
  light.push(new Photon(particle.pos,vect2d(1,0),wall, 1));
  light.push(new Photon(particle.pos,vect2d(-1,0),wall, 1));
  */
}
