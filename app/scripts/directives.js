/*jshint unused:false, bitwise: false */
/*global Physics:true */
'use strict';

angular.module('physicsJsgameApp')
  .directive('gameArena', function() {
    //needs to be totally rewritten in Angular
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        console.log(scope);
        console.log(element);
        console.log(attr);
        
        var physics = new Physics(function(world) {

          var viewWidth = 1000;
          var viewPortWidth = 500;
          var viewHeight = 300;

          element.css('height', viewHeight+'px');
          element.css('width', viewPortWidth+'px');
          element.css('overflow-x', 'scroll');
          element.css('overflow-y', 'hidden');
          element.css('border', '1px solid #000');
          element.css('position', 'relative');

          var renderer = Physics.renderer('canvas', {
            el: 'game-arena',
            width: viewWidth,
            height: viewHeight,
            meta: false, // don't display meta data
            styles: {
              // Defines the default canvas colour
              'color': '0xffaa56',
    
              'point' : '0xffaa56',
    
              'circle' : {
                strokeStyle: '#000000',
                lineWidth: 2,
                fillStyle: '#FFAA56',
                angleIndicator: '#FFAA56'
              },
    
              'convex-polygon' : {
                strokeStyle: '0xE8900C',
                lineWidth: 3,
                fillStyle: '0xD5DE4C',
                angleIndicator: '0xE8900C'
              }
            }
          });

          // add the renderer
          world.add(renderer);
          // render on each step
          world.on('step', function() {

            var middle = {
              x: 0.5*viewPortWidth,
              y: 0.5*viewHeight
            };
            element.scrollLeft(bodyHam.state.pos.get(0) - middle.x);
            // renderer.options.offset.set( middle.x - bodyHam.state.pos.get(0), viewHeight );

            world.render();
          });

          // bounds of the window
          var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
          var groundBounds = Physics.aabb(0, viewHeight, 1000, 40);

          // constrain objects to these bounds
          world.add(Physics.behavior('edge-collision-detection', {
            aabb: groundBounds,
            restitution: 0,
            cof: 0.99
          }));

          var bodyCentreX = 250;
          var bodyCentreY = 258;

          // // add a circle
          var bodyHam = Physics.body('circle', {
              x: bodyCentreX, // x-coordinate
              y: bodyCentreY, // y-coordinate
              vx: 0.0, // velocity in x-direction
              vy: 0.0, // velocity in y-direction
              radius: 15
            });
          bodyHam.view = new Image();
          //bodyHam.mass = 5;
          bodyHam.cof = 2;
          bodyHam.view.src = 'images/hamster-body.png';

          var headHam = Physics.body('circle', {
              x: bodyCentreX+10, // x-coordinate
              y: bodyCentreY-29, // y-coordinate
              vx: 0.0, // velocity in x-direction
              vy: 0.0, // velocity in y-direction
              radius: 15
            });
          headHam.view = new Image();
          headHam.cof = 2;
          headHam.view.src = 'images/hamster-head-small.png';

          var baseFoot = Physics.body('rectangle', {
              x: bodyCentreX+15, // x-coordinate
              y: bodyCentreY+19, // y-coordinate
              width: 10,
              height: 7
            });

          var pushFoot = Physics.body('rectangle', {
              x: bodyCentreX-10, // x-coordinate
              y: bodyCentreY+19, // y-coordinate
              width: 10,
              height: 7
            });

          var deck = Physics.body('rectangle', {
              x: bodyCentreX, // x-coordinate
              y: bodyCentreY+26, // y-coordinate
              width: 65,
              height: 5
            });
          var backWheel = Physics.body('circle', {
              x: bodyCentreX-20, // x-coordinate
              y: bodyCentreY+33, // y-coordinate
              vx: 0.0, // velocity in x-direction
              vy: 0.0, // velocity in y-direction
              radius: 5
            });
          backWheel.cof = 0.1;
          var frontWheel = Physics.body('circle', {
              x: bodyCentreX+20, // x-coordinate
              y: bodyCentreY+33, // y-coordinate
              vx: 0.0, // velocity in x-direction
              vy: 0.0, // velocity in y-direction
              radius: 5
            });
          frontWheel.cof = 0.1;

          var rigidConstraints = Physics.behavior('verlet-constraints', {
            iterations: 1
          });

          rigidConstraints.distanceConstraint(headHam, bodyHam, 0.2);
          rigidConstraints.distanceConstraint(baseFoot, bodyHam, 0.2);
          rigidConstraints.distanceConstraint(pushFoot, bodyHam, 0.2);
          rigidConstraints.distanceConstraint(pushFoot, headHam, 0.2);
          rigidConstraints.distanceConstraint(baseFoot, headHam, 0.2);
          rigidConstraints.distanceConstraint(baseFoot, deck, 0.2);
          rigidConstraints.distanceConstraint(pushFoot, deck, 0.2);
          rigidConstraints.distanceConstraint(pushFoot, baseFoot, 0.2);
          rigidConstraints.distanceConstraint(baseFoot, frontWheel, 0.1);
          rigidConstraints.distanceConstraint(frontWheel, backWheel, 0.1);
          rigidConstraints.distanceConstraint(backWheel, deck, 0.1);
          rigidConstraints.distanceConstraint(frontWheel, deck, 0.1);

          //rigidConstraints.angleConstraint(bodyHam, headHam, baseFoot, 0.5);

          // world.on('render', function( data ){

          //   var constraints = rigidConstraints.getConstraints().distanceConstraints,c;

          //   for ( var i = 0, l = constraints.length; i < l; ++i ){

          //     c = constraints[ i ];
          //     //renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, '#351024');
          //   }
          // });

          world.add(bodyHam);
          world.add(headHam);
          world.add(baseFoot);
          world.add(pushFoot);
          world.add(deck);
          world.add(backWheel);
          world.add(frontWheel);
          world.add(rigidConstraints);


          // ensure objects bounce when edge collision is detected
          world.add(Physics.behavior('body-impulse-response'));

          world.add( Physics.behavior('body-collision-detection') );
          world.add( Physics.behavior('sweep-prune') );

          // // add some gravity
          world.add(Physics.behavior('constant-acceleration'));

          // subscribe to ticker to advance the simulation
          Physics.util.ticker.on(function(time, dt) {

            world.step(time);

          });

          // start the ticker
          Physics.util.ticker.start();

          window.setInterval(function(){
            var velVector = Physics.vector( 0.05, 0 );
            bodyHam.accelerate(velVector);
          }, 3000);

        });

      }

    };
  });
