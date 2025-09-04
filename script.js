
import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        // Descomenta la siguiente línea si vas a cargar modelos .glb
        // import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

        // --- FUNCIÓN REUTILIZABLE PARA INICIAR UNA ESCENA 3D ---
        function initViewer(canvasId, modelInfo) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas con id ${canvasId} no encontrado.`);
                return;
            }

            // 1. Escena
            const scene = new THREE.Scene();

            // 2. Cámara
            const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
            camera.position.z = 3;

            // 3. Renderizador
            const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);

            // 4. Controles de órbita (para mover el objeto)
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; // Efecto de "arrastre" suave
            controls.dampingFactor = 0.05;
            controls.enableZoom = true;
            controls.autoRotate = true; // Rotación automática
            controls.autoRotateSpeed = 1.0;

            // 5. Luces
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            // --- CARGA DEL MODELO 3D (AQUÍ ES DONDE PONES TU CAMISETA) ---
            
            // --- OPCIÓN A: USAR UN CARGADOR GLTF PARA TUS MODELOS DE BLENDER ---
            // const loader = new GLTFLoader();
            // loader.load(
            //     'path/to/your/tshirt.glb', // <--- REEMPLAZA ESTO CON LA RUTA A TU MODELO
            //     (gltf) => {
            //         const model = gltf.scene;
            //         model.scale.set(1, 1, 1); // Ajusta la escala si es necesario
            //         model.position.set(0, 0, 0); // Centra el modelo
            //         scene.add(model);
            //     },
            //     undefined, // Función de progreso (opcional)
            //     (error) => {
            //         console.error('Un error ocurrió al cargar el modelo:', error);
            //     }
            // );

            // --- OPCIÓN B: MARCADOR DE POSICIÓN (GEOMETRÍA BÁSICA DE THREE.JS) ---
            const geometry = modelInfo.geometry;
            const material = new THREE.MeshStandardMaterial({ 
                color: modelInfo.color,
                metalness: 0.3,
                roughness: 0.6
            });
            const placeholderMesh = new THREE.Mesh(geometry, material);
            scene.add(placeholderMesh);
            // --- FIN DEL MARCADOR DE POSICIÓN ---


            // Responsividad: Ajustar el tamaño del canvas si la ventana cambia
            window.addEventListener('resize', () => {
                const container = canvas.parentElement;
                if(container.clientWidth > 0 && container.clientHeight > 0) {
                    camera.aspect = container.clientWidth / container.clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(container.clientWidth, container.clientHeight);
                }
            });

            // Bucle de animación
            function animate() {
                requestAnimationFrame(animate);
                controls.update(); // Necesario para el damping y la autorotación
                renderer.render(scene, camera);
            }

            animate();
        }

        // --- INICIAR LOS 5 VISUALIZADORES CUANDO LA PÁGINA ESTÉ LISTA ---
        document.addEventListener('DOMContentLoaded', () => {
            // Información para los modelos de marcador de posición
            const models = [
                { id: 'canvas-1', geometry: new THREE.IcosahedronGeometry(1, 0), color: 0x3b82f6 }, // Azul
                { id: 'canvas-2', geometry: new THREE.TorusGeometry(0.8, 0.3, 16, 100), color: 0x8b5cf6 }, // Violeta
                { id: 'canvas-3', geometry: new THREE.OctahedronGeometry(1), color: 0xec4899 }, // Rosa
                { id: 'canvas-4', geometry: new THREE.TorusKnotGeometry(0.7, 0.2, 100, 16), color: 0xf59e0b }, // Naranja
                { id: 'canvas-5', geometry: new THREE.CapsuleGeometry(0.6, 0.6, 4, 8), color: 0x10b981 } // Verde
            ];

            models.forEach(model => {
                initViewer(model.id, { geometry: model.geometry, color: model.color });
            });
        });