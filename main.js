// @ts-nocheck

function loadScript(url, callback) {
  console.log('[Diagnostic] Attempting to load script:', url);
  const script = document.createElement('script');
  script.src = url;
  script.onload = function () {
    console.log('[Diagnostic] Successfully loaded script:', url);
    callback();
  };
  script.onerror = function () {
    console.error('[Diagnostic] Failed to load script:', url);
  };
  document.head.appendChild(script);
}

function init() {
  console.log('[Diagnostic] Initializing Three.js scene...');

  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';

  if (!window.THREE) {
    console.error('[Diagnostic] THREE is not defined.');
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.display = 'block';
  document.body.appendChild(renderer.domElement);

  const clock = new THREE.Clock();

  const transformControls = new THREE.TransformControls(camera, renderer.domElement);
  scene.add(transformControls);

  window.addEventListener('keydown', function (event) {
    switch (event.key) {
      case '1':
        transformControls.setMode('translate');
        break;
      case '2':
        transformControls.setMode('rotate');
        break;
      case '3':
        transformControls.setMode('scale');
        break;
    }
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(5, 10, 7.5);
  scene.add(sunLight);

  const Controls = THREE.PointerLockControls || window.PointerLockControls;
  const controls = new Controls(camera, document.body);
  scene.add(controls.getObject());

  transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
  });

  let firstSelectable = null;
  let cube = null;
  let canJump = false;

  const objects = []; // For collision

  function loadModel(url, index) {
    const extension = url.split('.').pop().toLowerCase();
    console.log('[Diagnostic] Loading model:', url);

    if (extension === 'glb') {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');

      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      gltfLoader.load(
        url,
        function (gltf) {
          console.log('[Diagnostic] Loaded GLB model:', url);
          const model = gltf.scene;
          model.scale.set(1, 1, 1);

          if (index === 5) {
            model.position.set(0, -1, 0); // Make floor align with ground
            objects.push(model); // for collision
            controls.getObject().position.y = 1.6; // spawn on floor
          } else {
            const x = index * 3;
            const z = -5;
            model.position.set(x, 0, z);

            const pedestal = new THREE.Mesh(
              new THREE.CylinderGeometry(0.7, 0.7, 0.3, 32),
              new THREE.MeshStandardMaterial({ color: 0x555555 })
            );
            pedestal.position.set(x, -0.15, z);
            scene.add(pedestal);
          }

          scene.add(model);

          if (!firstSelectable && index !== 5) {
            firstSelectable = model;
            transformControls.attach(firstSelectable);
          }
        },
        undefined,
        function (error) {
          console.error('[Diagnostic] Error loading GLB model:', url, error);
        }
      );
    } else {
      console.warn('[Diagnostic] Unsupported file type for model:', url);
    }
  }

  const models = [
    'assets/RM7295_504kfaces_12-05-2025.glb',
    'assets/RM660_576kfaces_12-05-2025.glb',
    'assets/RM2392_362kfaces_12-05-2025.glb',
    'assets/RM2352_aligned_800kfaces_29-05-2025.glb',
    'assets/RM5089_1.2Mfaces_12-05-2025.glb',
    'assets/building.glb'
  ];

  models.forEach((modelPath, index) => {
    loadModel(modelPath, index);
  });

  document.addEventListener('click', () => {
    if (document.hasFocus()) {
      controls.lock();
    }
  });

  let moveForward = false,
      moveBackward = false,
      moveLeft = false,
      moveRight = false,
      moveUp = false,
      moveDown = false,
      isRunning = false;

  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  document.addEventListener('keydown', function (event) {
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': moveForward = true; break;
      case 'KeyS': case 'ArrowDown': moveBackward = true; break;
      case 'KeyA': case 'ArrowLeft': moveLeft = true; break;
      case 'KeyD': case 'ArrowRight': moveRight = true; break;
      case 'Space':
        if (canJump) {
          velocity.y += 3;
          canJump = false;
        }
        break;
      case 'KeyP':
        console.log('Camera position:', controls.getObject().position);
        break;
      
      case 'ShiftLeft':
      case 'ShiftRight':
        isRunning = true;
        break;
    }
  });

  document.addEventListener('keyup', function (event) {
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': moveForward = false; break;
      case 'KeyS': case 'ArrowDown': moveBackward = false; break;
      case 'KeyA': case 'ArrowLeft': moveLeft = false; break;
      case 'KeyD': case 'ArrowRight': moveRight = false; break;
      case 'ShiftLeft':
      case 'ShiftRight':
        isRunning = false;
        break;
    }
  });

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (controls.isLocked) {
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * delta; // gravity

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize();

      if (moveForward || moveBackward) velocity.z -= direction.z * 15.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 15.0 * delta;

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      controls.getObject().position.y += velocity.y * delta;

      if (controls.getObject().position.y < 1.6) {
        velocity.y = 0;
        controls.getObject().position.y = 1.6;
        canJump = true;
      }
    }

    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function loadThreeJSAndInit() {
  console.log('[Diagnostic] Checking for THREE library...');

  function loadLoaders(callback) {
    const loadersToLoad = [];

    if (!THREE.GLTFLoader) {
      loadersToLoad.push('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
    }
    if (!THREE.DRACOLoader) {
      loadersToLoad.push('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/DRACOLoader.js');
    }
    if (!THREE.PointerLockControls) {
      loadersToLoad.push('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/PointerLockControls.js');
    }
    if (!THREE.TransformControls) {
      loadersToLoad.push('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/TransformControls.js');
    }

    let loadedCount = 0;
    if (loadersToLoad.length === 0) {
      callback();
      return;
    }

    loadersToLoad.forEach(loaderUrl => {
      loadScript(loaderUrl, () => {
        loadedCount++;
        if (loadedCount === loadersToLoad.length) {
          callback();
        }
      });
    });
  }

  if (!window.THREE) {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', () => {
      loadLoaders(init);
    });
  } else {
    loadLoaders(init);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadThreeJSAndInit);
} else {
  loadThreeJSAndInit();
}