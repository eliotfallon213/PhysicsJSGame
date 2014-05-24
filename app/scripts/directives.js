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

          var viewWidth = 500;
          var viewHeight = 300;

          element.css('height', viewHeight+'px');
          element.css('width', viewWidth+'px');
          element.css('border', '1px solid #000');
          element.css('position', 'relative');

          var renderer = Physics.renderer('pixi', {
            el: 'game-arena',
            width: viewWidth,
            height: viewHeight,
            meta: false, // don't display meta data
            styles: {
              // Defines the default canvas colour
              'color': '0xFFFF00',
    
              'point' : '0xE8900C',
    
              'circle' : {
                strokeStyle: '0xE8900C',
                lineWidth: 3,
                fillStyle: '0xD5DE4C',
                angleIndicator: '0xE8900C'
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
            world.render();
          });

          // bounds of the window
          var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

          // constrain objects to these bounds
          world.add(Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 1,
            cof: 0.99
          }));

          var bodyCentreX = 250;
          var bodyCentreY = 220;

          // // add a circle
          var bodyHam = Physics.body('circle', {
              x: bodyCentreX, // x-coordinate
              y: bodyCentreY, // y-coordinate
              vx: 0.0, // velocity in x-direction
              vy: 0.0, // velocity in y-direction
              radius: 20
            });

          var headHam = Physics.body('circle', {
              x: bodyCentreX, // x-coordinate
              y: bodyCentreY-35, // y-coordinate
              vx: 0.0, // velocity in x-direction
              vy: 0.0, // velocity in y-direction
              radius: 15
            });
          headHam.view = renderer.createDisplay('sprite', {
            texture: 'hamster-head-30.png',
            anchor: {
              x: 0.5,
              y: 0.5
            }
          });
          console.log(headHam.view);

          var baseFoot = Physics.body('rectangle', {
              x: bodyCentreX+15, // x-coordinate
              y: bodyCentreY+23, // y-coordinate
              width: 15,
              height: 7
            });

          var pushFoot = Physics.body('rectangle', {
              x: bodyCentreX-15, // x-coordinate
              y: bodyCentreY+23, // y-coordinate
              width: 15,
              height: 7
            });

          var rigidConstraints = Physics.behavior('verlet-constraints', {
            iterations: 1
          });

          rigidConstraints.distanceConstraint(headHam, bodyHam, 0.2);
          // rigidConstraints.distanceConstraint(baseFoot, bodyHam, 0.2);
          // rigidConstraints.distanceConstraint(pushFoot, bodyHam, 0.2);
          // rigidConstraints.distanceConstraint(pushFoot, headHam, 0.2);
          // rigidConstraints.distanceConstraint(baseFoot, headHam, 0.2);


          // world.on('render', function( data ){

          //   var constraints = rigidConstraints.getConstraints().distanceConstraints,c;

          //   for ( var i = 0, l = constraints.length; i < l; ++i ){

          //     c = constraints[ i ];
          //     //renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, '#351024');
          //   }
          // });

          world.add(bodyHam);
          world.add(headHam);
          // world.add(baseFoot);
          // world.add(pushFoot);
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

        });

      }

    };
  });
