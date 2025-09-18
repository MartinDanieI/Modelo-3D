import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// CAMBIO CLAVE: Descomentado para poder usarlo.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- FUNCIÓN REUTILIZABLE PARA INICIAR UNA ESCENA 3D ---
function initViewer(canvasId, modelInfo) {
    const canvas = document.getElementById(canvasId);
    // CAMBIO DE ESTABILIDAD: Obtenemos el contenedor padre para asegurar dimensiones correctas.
    const container = canvas.parentElement;

    if (!canvas || !container) {
        console.error(`Canvas o contenedor no encontrado para ${canvasId}.`);
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) {
         console.error(`¡El contenedor para ${canvasId} sigue teniendo dimensiones cero!`);
         return;
    }

    // 1. Escena
    const scene = new THREE.Scene();

    // 2. Cámara
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.5);

    // 3. Renderizador
    // Se restaura el cambio para el fondo blanco
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff, 1);

    // 4. Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    // CAMBIO DE ZOOM: Permitimos que la cámara se acerque mucho más.
    controls.minDistance = 1;
    controls.maxDistance = 4;

    // 5. Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // --- CARGA DEL MODELO 3D (LÓGICA ACTUALIZADA) ---
    
    // CAMBIO CLAVE: Comprobamos si el modelo tiene una URL para cargar un .glb
    if (modelInfo.url) {
        // --- OPCIÓN A: USAR UN CARGADOR GLTF PARA TUS MODELOS DE BLENDER ---
        const loader = new GLTFLoader();
        loader.load(
            modelInfo.url, // Usamos la URL del objeto de configuración
            (gltf) => {
                const model = gltf.scene;
                
                // --- CÓDIGO PARA CENTRAR Y ESCALAR AUTOMÁTICAMENTE (CON CORRECCIONES) ---
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                // 2. Mover el modelo para que su centro esté en el origen (0,0,0) - MODO CORREGIDO
                model.position.sub(center);

                // CAMBIO DE CENTRADO: Aumentamos el valor para subir más la camiseta.
                model.position.y += 0.8;

                // 3. Escalar el modelo para que quepa bien en la vista
                const maxDim = Math.max(size.x, size.y, size.z);
                
                // LA SOLUCIÓN: Añadimos una "red de seguridad" para evitar la división por cero.
                if (maxDim > 0) {
                    // CAMBIO DE TAMAÑO: Hacemos el modelo un poco más grande desde el inicio.
                    const scale = 2.2 / maxDim;
                    model.scale.set(scale, scale, scale);
                }
                // --- FIN DEL CÓDIGO AUTOMÁTICO ---

                scene.add(model);
            },
            undefined, 
            (error) => {
                console.error(`Ocurrió un error al cargar el modelo ${modelInfo.url}:`, error);
            }
        );
    } else {
        // --- OPCIÓN B: MARCADOR DE POSICIÓN (PARA LOS DEMÁS VISORES) ---
        const geometry = modelInfo.geometry;
        const material = new THREE.MeshStandardMaterial({ 
            color: modelInfo.color,
            metalness: 0.3,
            roughness: 0.6
        });
        const placeholderMesh = new THREE.Mesh(geometry, material);
        scene.add(placeholderMesh);
    }
    // --- FIN DE LA LÓGICA DE CARGA ---

    // Responsividad
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if(newWidth > 0 && newHeight > 0) {
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        }
    });

    // Bucle de animación
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

// --- INICIAR LOS VISUALIZADORES ---
// CAMBIO DE ESTABILIDAD: Usamos 'load' y 'requestAnimationFrame' para evitar errores de timing.
window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        const models = [
            { id: 'canvas-1', url: 'camisetas/Camisa_celeste.glb' },
            { id: 'canvas-2', url: 'camisetas/Camisa_colombia.glb' },
            { id: 'canvas-3', url: 'camisetas/Camisa_morada.glb' },
            { id: 'canvas-4', url: 'camisetas/Camisa_naranja.glb' },
            { id: 'canvas-5', url: 'camisetas/Camisa_roja.glb' },
            { id: 'canvas-6', url: 'camisetas/Camisa_verde.glb' }
        ];

        models.forEach(model => {
            initViewer(model.id, model);
        });
    });
});