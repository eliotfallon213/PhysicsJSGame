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

          var renderer = Physics.renderer('canvas', {
            el: 'game-arena',
            width: viewWidth,
            height: viewHeight,
            meta: false, // don't display meta data
            styles: {
              // set colors for the circle bodies
              'circle': {
                strokeStyle: '#351024',
                lineWidth: 1,
                fillStyle: '#d33682',
                angleIndicator: '#351024'
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
            restitution: 0.99,
            cof: 0.99
          }));

          // add a circle
          world.add(
            Physics.body('circle', {
              x: 50, // x-coordinate
              y: 30, // y-coordinate
              vx: 0.5, // velocity in x-direction
              vy: 0.01, // velocity in y-direction
              radius: 40
            })
          );

          // ensure objects bounce when edge collision is detected
          world.add(Physics.behavior('body-impulse-response'));

          // add some gravity
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
