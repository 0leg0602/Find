import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener('contextmenu', event => event.preventDefault());

function randint(min, max) {
  return Math.floor(Math.random() * ((max + 1) - min)) + min;
}

function randitem(items_array) {
  return items_array[randint(0, items_array.length - 1)]
}



function start_game(level_name) {

  let completed_levels_list = JSON.parse(localStorage.getItem("completed_levels_list"))

  let is_level_completed = false;

  var level;
  let level_num;

  for (const key in levels) {
    if (levels[key].name == level_name) {
      level = levels[key];
      level_num = key;
    }
  }

  for (const key in completed_levels_list) {
    if (level.name == completed_levels_list[key].name) {
      is_level_completed = true;
    }
  }

  let timer = 0;
  let is_game_over = false;
  let is_game_started = false;
  
  $("#mainmenu").remove()

  if (localStorage.getItem("start_on_load") != null) {
    $("#levelselect").hide()
    $("html").hide()
    $("#gui").fadeIn("slow");
    $("html").fadeIn("slow");
    localStorage.removeItem("start_on_load")
  } else {
    $("#levelselect").slideUp("slow")
    $("#gui").slideDown("slow");
  }

  


  if (level.name == "learn to play") {

    $("#task").hide();

    $("#gui").promise().done(function () {

      $("#message").text("Use right mouse button to rotate the camera.");
      $("#message").fadeIn(1000);

    });
  } else {
    $("#gui").promise().done(function () {
      show_message("LEVEL " + level_num + ":\n" + level.name, 2000)
    });
  }



  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let tutorial_stage = 0;

  let intersecting_objects;

  let task_description = ["", ""]

  scene.background = new THREE.Color(0xeeeeee);


  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  if (level.name == "learn to play") {
    renderer.domElement.style.filter = "blur(9px)"
  }

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0;
  controls.noZoom = false;
  controls.noPan = true;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  controls.mouseButtons = {
  	LEFT: THREE.MOUSE.ROTATE,
  	MIDDLE: THREE.MOUSE.ROTATE,
  	RIGHT: THREE.MOUSE.ROTATE,
  }

  // controls.mouseButtons = {
  //   LEFT: "",
  //   MIDDLE: THREE.MOUSE.ROTATE,
  //   RIGHT: THREE.MOUSE.ROTATE,
  // }

  if (level.name == "learn to play") {
    controls.zoomSpeed = 0;
    controls.noZoom = true;
  }




  // const defaultMaterial = new THREE.MeshPhongMaterial({
  //   color: 0x00ff00,
  //   // flatShading: true,
  //   // vertexColors: true,
  //   // shininess: 0
  // });

  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  var shapes;

  var color_list;

  var objects_limit;


  if (level.name == "learn to play") {

    shapes = ["cube"];
    color_list = ["red", "blue", "green"];
    objects_limit = 20;

  } else if (level.name == "more shapes") {

    shapes = ["cube", "sphere", "cone"];
    color_list = ["red", "blue", "green"];
    objects_limit = 30;

  } else if (level.name == "more colors") {

    shapes = ["cube"];
    color_list = ["red", "blue", "green", "yellow", "violet", "orange"];
    objects_limit = 30;

  } else if (level.name == "now everything is spinning") {

    shapes = ["cube"];
    color_list = ["red", "blue", "green"];
    objects_limit = 30;

  } else {
    shapes = ["cube"];
    color_list = ["red"];
    objects_limit = 100;
  }



  var object_group = new THREE.Group();
  var delete_group = new THREE.Group();


  for (let i = 0; i < objects_limit; i++) {

    let rand_color = randitem(color_list);
    let rand_shape = randitem(shapes);

    const material = new THREE.MeshPhongMaterial({ color: rand_color });

    var geometry;

    switch (rand_shape) {
      case "cube":
        geometry = new THREE.BoxGeometry(1, 1, 1)
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(0.5, 32, 16);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        break;

    }

    let object = new THREE.Mesh(geometry, material);


    object.position.set(randint(-10, 10), randint(-10, 10), randint(-10, 10))
    object.rotation.set(((randint(-100, 100) / 100) * Math.PI), ((randint(-100, 100) / 100) * Math.PI), ((randint(-100, 100) / 100) * Math.PI))
    object.color_name = rand_color;
    object.shape_name = rand_shape;
    object_group.add(object);
  }


  scene.add(object_group);
  scene.add(delete_group);



  scene.add(new THREE.AmbientLight(0xcccccc));

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(0, 500, 2000);
  scene.add(light);

  camera.position.z = 5;

  function show_message(text, duration_time) {
    $("#message").text(text)
    $("#message").fadeIn(duration_time)
    $("#message").promise().done(function () {
      $("#message").fadeOut(duration_time)
      $("#message").promise().done(function () {
        $("#message").text("")
      });
    });
  }


  function onPointerMove(event) {

    if (level.name == "learn to play" && tutorial_stage == 0) {
      if (camera.position.distanceTo({ x: 0, y: 0, z: 5 }) >= 0.5) {
        tutorial_stage = 1;

        controls.zoomSpeed = 1.2;
        controls.noZoom = false;

        $("#message").animate({ opacity: 0 }, "fast")
        $("#message").promise().done(function () {
          $("#message").text("Use the scroll wheel to zoom.")
          $("#message").animate({ opacity: 1 }, "fast")
        });

      }
    }

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

  }

  function onscroll(event) {

    if (tutorial_stage == 1) {
      tutorial_stage = 2;
      $("canvas").css({ "animation-name": "unblur", "animation-duration": "1s", "animation-fill-mode": "forwards" });
      $("#message").fadeOut(1000);
      $("#task").fadeIn(1000);
    }

  }


  function select(event) {

    // console.log(event)

    if (intersecting_objects.length != 0) {
      var obj = intersecting_objects[0].object;
      if (object_group.children.includes(obj)) {

        if (event.type == "keydown" && event.code == "Space" && !event.repeat || event.type == "mousedown" && event.button == 0) {

          var animate_color;
          var is_correct;

          if (obj.color_name == task_description[0] && obj.shape_name == task_description[1]) {

            // SceneUtils.detach( obj, object_group, scene );
            // SceneUtils.attach( obj, scene, delete_group );

            object_group.remove(obj);
            delete_group.add(obj);
            is_correct = true;

          } else {
            is_correct = false;
          }

          if (is_correct) {
            $("#task").animate({ opacity: 0 }, "fast");
            $("#task").promise().done(function () {
              set_task()
              $("#task").css({ "background-color": "rgb(128,128,128)", "border-color": "rgb(128,128,128)", "color": "rgb(255,255,255)" }, "fast");
              $("#task").animate({ opacity: 1 }, "fast");
            });

          } else {
            $("#task").animate({ backgroundColor: "red", borderColor: "red", color: "red" }, "fast");
            $("#task").animate({ backgroundColor: "rgb(128,128,128)", borderColor: "rgb(128,128,128)", color: "rgb(255,255,255)" }, "fast");
          }

          if (!is_game_started) {
            is_game_started = true;
            timer = Date.now();
          }
          // $("#task").animate({});


        }


      }
    }

  }

  function game_over(is_win) {
    if (!is_game_over) {
      $("#task").text("GAME OVER");
      $("canvas").slideUp("slow");
      $("#gui").slideUp("slow");
      $("#gui").promise().done(function () {
        if (is_win) {
          $("#gameover_label").text("LEVEL COMPLETED")
          $("#next_level_button").show()
        } else {
          $("#gameover_label2").text("you ran out of time");
          $("#gameover_label").css({ "background": "linear-gradient(180deg, #09009f, #ff0000 80%)", "background-clip": "text" });
        }
        $("#gameover").show();
        $("#gameover").animate({ right: "0%" }, 1000)
      });
      is_game_over = true;
      if (!is_level_completed && is_win) {
        let completed_levels_list = JSON.parse(localStorage.getItem("completed_levels_list"))
        completed_levels_list[completed_levels_list.length] = { name: level.name };
        localStorage.setItem("completed_levels_list", JSON.stringify(completed_levels_list))
      }
    }
  }




  function set_task() {
    if (object_group.children.length > 0) {
      var random_item = randitem(object_group.children);
      task_description = [random_item.color_name, random_item.shape_name]
      if (level.name == "learn to play") {
        $("#task").text("Click on a " + task_description[0] + " " + task_description[1]);
      } else {
        $("#task").text(task_description[0] + " " + task_description[1]);
      }
    } else {
      game_over(true)
    }
  }

  function animate() {
    if (!is_game_over) {

      if (is_game_started) {


        let time_elapsed = (Date.now() - timer) / 1000;

        if (level.gamemode.startsWith("time limit")) {
          let time_limit = level.gamemode.split(",")[1];
          let progress_percent = (time_elapsed / time_limit)
          let time_left = Math.round(time_limit - time_elapsed)
          if (time_left >= 0) {
            $("#progress_label").text(time_left)
            if (time_left <= 5) {
              show_message(time_left, 500)
            }
            $("#progress").css("background", "linear-gradient(90deg, red " + progress_percent * (progress_percent * 100) + "%, rgba(255, 0, 0, 0) " + progress_percent * 100 + "%)")
          } else {
            game_over(false)
            return;
          }
        }
      }


      // cube.rotation.y += 0.01;
      if (level.name != "learn to play") {
        for (const mesh_object_num in object_group.children) {
          let mesh_object = object_group.children[mesh_object_num]
          mesh_object.rotation.y += 0.01;
          mesh_object.rotation.x += 0.01;
          mesh_object.rotation.z += 0.01;
        }
      }

      if (level.name == "now everything is spinning") {
        object_group.rotation.y += 0.01;
        object_group.rotation.x += 0.01;
        object_group.rotation.z += 0.01;
        delete_group.rotation.y += 0.01;
        delete_group.rotation.x += 0.01;
        delete_group.rotation.z += 0.01;
      }

      if (delete_group.children.length > 0) {
        for (const delete_object_num in delete_group.children) {
          const delete_object = delete_group.children[delete_object_num]
          delete_object.scale.subScalar(0.03)
          if (delete_object.scale.x < 0) {
            delete_group.remove(delete_object)
          }
        }
      }


      // update the picking ray with the camera and pointer position
      raycaster.setFromCamera(pointer, camera);

      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      // for (let i = 0; i < intersects.length; i++) {

      //   intersects[i].object.material.color.set(0xff0000);

      // }

      intersecting_objects = intersects;

      renderer.render(scene, camera);

    }


  }

  function onresize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // renderer.setPixelRatio(window.devicePixelRatio);
  }

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('mousedown', select);
  window.addEventListener('keydown', select);
  window.addEventListener('wheel', onscroll);
  window.addEventListener('resize', onresize);

  set_task()

  renderer.setAnimationLoop(animate);
  window.current_level = level;
  window.current_level_num = level_num;
  window.scene = scene;
  window.game_over = game_over;



}

window.start_game = start_game





