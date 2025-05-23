// @ts-nocheck

/**
 * Dynamically loads a script and executes a callback after it's loaded.
 * @param {string} url - URL of the script.
 * @param {Function} callback - Function to run after the script has loaded.
 */
function loadScript(url, callback) {
  console.log('[Diagnostic] Attempting to load script:', url);
  const script = document.createElement('script');
  script.src = url;
  script.onload = function() {
    console.log('[Diagnostic] Successfully loaded script:', url);
    callback();
  };
  script.onerror = function() {
    console.error('[Diagnostic] Failed to load script:', url);
  };
  document.head.appendChild(script);
}

/**
 * Initializes the Three.js scene.
 */
function init() {
  console.log('[Diagnostic] Initializing Three.js scene...');
  
  // Ensure full viewport usage by adjusting body styles
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';

  // Check if THREE is available
  if (!window.THREE) {
    console.error('[Diagnostic] THREE is not defined.');
    return;
  }
  
  // Create scene, camera, and renderer
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
  // Ensure canvas fills the screen
  renderer.domElement.style.display = 'block';
  document.body.appendChild(renderer.domElement);
  camera.lookAt(scene.position);
  console.log('[Diagnostic] Renderer and camera created.');

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Fallback cube for visual confirmation
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, -2);
  scene.add(cube);
  console.log('[Diagnostic] Fallback cube added.');

  /**
   * Load 3D model from URL.
   * @param {string} url - URL of the model.
   */
  function loadModel(url) {
    const extension = url.split('.').pop().toLowerCase();
    console.log('[Diagnostic] Loading model:', url);
    if (extension === 'glb') {
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load(
        url,
        function(gltf) {
          console.log('[Diagnostic] Loaded GLB model:', url);
          scene.add(gltf.scene);
        },
        undefined,
        function(error) {
          console.error('[Diagnostic] Error loading GLB model:', url, error);
        }
      );
    } else if (extension === 'obj') {
      const objLoader = new THREE.OBJLoader();
      objLoader.load(
        url,
        function(object) {
          console.log('[Diagnostic] Loaded OBJ model:', url);
          scene.add(object);
        },
        undefined,
        function(error) {
          console.error('[Diagnostic] Error loading OBJ model:', url, error);
        }
      );
    } else {
      console.warn('[Diagnostic] Unsupported file type for model:', url);
    }
  }

  // List of models to load from public assets folder (only .glb and .obj files)
  const models = [
    'assets/building-test.obj',
    'assets/building.glb',
    'assets/cube.glb',
    'assets/Osiris.obj',
    'assets/RM2352_merged.obj'
  ];

  // Load each model
  models.forEach(modelPath => {
    loadModel(modelPath);
  });

  // Set camera position
  camera.position.z = 5;
  console.log('[Diagnostic] Camera position set.');

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
  console.log('[Diagnostic] Animation loop started.');

  // Handle browser resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('[Diagnostic] Renderer resized:', window.innerWidth, window.innerHeight);
  });
}

/**
 * Loads Three.js and its loaders if not already loaded, then initializes the scene.
 */
function loadThreeJSAndInit() {
  console.log('[Diagnostic] Checking for THREE library...');
  
  function loadLoaders(callback) {
    let loadersToLoad = [];
    if (!THREE.GLTFLoader) {
      // Updated URL to CDN version that exists
      loadersToLoad.push('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
    } else {
      console.log('[Diagnostic] GLTFLoader already exists.');
    }
    if (!THREE.OBJLoader) {
      loadersToLoad.push('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js');
    } else {
      console.log('[Diagnostic] OBJLoader already exists.');
    }
    let loadedCount = 0;
    if (loadersToLoad.length === 0) {
      callback();
      return;
    }
    loadersToLoad.forEach(loaderUrl => {
      loadScript(loaderUrl, () => {
        console.log('[Diagnostic] Loader script loaded:', loaderUrl);
        loadedCount++;
        if (loadedCount === loadersToLoad.length) {
          callback();
        }
      });
    });
  }
  
  if (!window.THREE) {
    console.log('[Diagnostic] THREE not found. Loading from CDN...');
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', () => {
      console.log('[Diagnostic] Three.js loaded from CDN.');
      loadLoaders(init);
    });
  } else {
    console.log('[Diagnostic] THREE library already loaded.');
    loadLoaders(init);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadThreeJSAndInit);
} else {
  loadThreeJSAndInit();
}