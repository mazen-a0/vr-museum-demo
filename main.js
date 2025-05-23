import {
  FreeCamera,
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  CreateSphere,
  CreateGround,
  SceneLoader
} from "@babylonjs/core";

import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import "@babylonjs/loaders/OBJ";

import "@babylonjs/loaders/glTF";            
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

registerBuiltInLoaders();

import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("#babylon-canvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const camera = new FreeCamera("museumCam", new Vector3(0, 2, -10), scene);
camera.setTarget(new Vector3(0, 1, 0));
camera.attachControl(canvas, true);

//movement setup
camera.keysUp.push(87);    
camera.keysDown.push(83);  
camera.keysLeft.push(65);  
camera.keysRight.push(68); 
camera.speed = 0.3;
camera.angularSensibility = 500;

// gravity and collision§
camera.checkCollisions = true;
camera.applyGravity = true;
camera.ellipsoid = new Vector3(1, 1, 1);
scene.gravity = new Vector3(0, -0.1, 0);

const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
light.intensity = 0.9;

const ground = CreateGround("museumFloor", { width: 50, height: 50 }, scene);
ground.position.y = 0; // ensure it's at floor level
ground.checkCollisions = true;

// Debug sphere ---
const sphere = CreateSphere("debugSphere", { diameter: 2, segments: 32 }, scene);
sphere.position = new Vector3(0, 1, 0);
sphere.checkCollisions = true;

const dLoader

console.log("Attempting to load model");

SceneLoader.ImportMesh(
  null,
  "/assets/",
  "building-test.obj",
  scene,
  (meshes, particleSystems, skeletons, animationGroups, transformNodes) => {
    console.log("Model loaded!", meshes);

    meshes.forEach(mesh => {
      mesh.checkCollisions = true;
      mesh.scaling = new Vector3(1, 1, 1);
      mesh.position = new Vector3(0, 0, 0);
      mesh.rotation = new Vector3(0, 0, 0);
    });
  },
  null,
  (scene, message, exception) => {
    console.error("Load error:", message, exception);
  }
);

// Load Osiris.obj
SceneLoader.ImportMesh(
  null,
  "/assets/",
  "Osiris.obj",
  scene,
  (meshes) => {
    console.log("Osiris loaded", meshes);
    meshes.forEach(mesh => {
      mesh.checkCollisions = true;
      mesh.scaling = new Vector3(1, 1, 1);
      mesh.position = new Vector3(-10, 0, 0); // Position left of center
    });
  },
  null,
  (scene, message, exception) => {
    console.error("Osiris load error:", message, exception);
  }
);

// Load RM2352_merged.obj
SceneLoader.ImportMesh(
  null,
  "/assets/",
  "RM2352_merged.obj",
  scene,
  (meshes) => {
    console.log("RM2352_merged loaded", meshes);
    meshes.forEach(mesh => {
      mesh.checkCollisions = true;
      mesh.scaling = new Vector3(1, 1, 1);
      mesh.position = new Vector3(10, 0, 0); // Position right of center
    });
  },
  null,
  (scene, message, exception) => {
    console.error("RM2352_merged load error:", message, exception);
  }
);

SceneLoader.ImportMesh(
  null,
  "/assets/",
  "cube.glb",
  scene,
  (meshes) => {
    console.log("RM2352_merged loaded", meshes);
    meshes.forEach(mesh => {
      mesh.checkCollisions = true;
      mesh.scaling = new Vector3(1, 1, 1);
      mesh.position = new Vector3(10, 0, 0); // Position right of center
    });
  },
  null,
  (scene, message, exception) => {
    console.error("RM2352_merged load error:", message, exception);
  }
);

window.addEventListener("resize", () => {
  engine.resize();
});

//Render loop
engine.runRenderLoop(() => {
  scene.render();
});

// Show debug UI
scene.debugLayer.show();

window.addEventListener("keydown", function (ev) {
  if (ev.key === "d" || ev.key === "D") {
    if (scene.debugLayer.isVisible()) {
      scene.debugLayer.hide();
    } else {
      scene.debugLayer.show();
    }
  }
});