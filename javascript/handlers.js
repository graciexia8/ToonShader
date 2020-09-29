"use strict";

/*
Event handler that tracks mouse movements and allows user to rotate the model on screen.
*/
function eventHandler(scene) {

  const self = this;

  // Threshold HTML elements
  const thresholdSlider = document.getElementById("threshold_id");
  const thresholdOutput = document.getElementById("thresholdVal");

  // Toggle HTML elements
  const toggleCheckbox = document.getElementById("renderOption");

  // Private variables
  const canvas = scene.canvas;

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let previous_time = Date.now();

  // Control the rate at which animations refresh
  const frame_rate = 33; // 33 milliseconds = 1/30 sec

  // Indicate that event has started, prevent event bubbling.
  self.mouse_drag_started = function (event) {
    start_of_mouse_drag = event;
    event.preventDefault();
  };

  // Indicate that drag event has ended, prevent event bubbling.
  self.mouse_drag_ended = function (event) {
    start_of_mouse_drag = null;
    event.preventDefault();
  };

  // Handle case when we are dragging the mouse on screen
  self.mouse_dragged = function (event) {
    let delta_x, delta_y;

    // Get change in x and change in y for each drag.
    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = -(event.clientY - start_of_mouse_drag.clientY);

      // Update rotation angle from drag distances
      scene.angleX -= delta_y * 0.01;
      scene.angleY += delta_x * 0.01;
      // Render new scene
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  // Event handling for when user wants to toggle between diffuse lighting view vs B&W shading
  self.toggle_clicked = function (event) {

  }

  // Initialize and create mouse event types
  self.createAllEventHandlers = function () {
    canvas.addEventListener('mousedown', self.mouse_drag_started, false);
    canvas.addEventListener('mouseup', self.mouse_drag_ended, false);
    canvas.addEventListener('mousemove', self.mouse_dragged, false);

    toggleCheckbox.addEventListener( 'click', function() {
      // If the checkbox is checked, display the output text
      if (toggleCheckbox.checked == true){
        console.log("checked");
        scene.toggleRender = true;
      } else {
        console.log("unchecked");
        scene.toggleRender = false;
      }
    });

    // Read Threshold Slider value into object to Render
    // Threshold goes from 0.0-1.0
    thresholdSlider.oninput = function() {
        thresholdOutput.innerHTML = this.value;
        scene.threshold = parseFloat(this.value/100);
    }
  };

  // Handle re rendering/ animation of 3d Object
  self.animate = function () {
    let now, elapsed_time;
    now = Date.now();
    elapsed_time = now - previous_time;

    // Update new rotation angles if the change in time from last time stamp to now is longer than the frame rate.
    if (elapsed_time >= frame_rate) {
      // This controls auto rotation of the object, comment out to stop it from rotating
      // scene.angleX -= 0.5 * 0.01;
      // scene.angleY += 1 * 0.01;
      scene.render();
      previous_time = now;
    }
    // Prompt re-animation of scene.
    requestAnimationFrame(self.animate);
  };

  // initiate handlers
  self.createAllEventHandlers();
}



