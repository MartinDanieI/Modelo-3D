import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. ESCENA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;
camera.position.y = 0.5;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

// ILUMINACIÓN SKIN PRO (Más fría/profesional)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Aumentado brillo base
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2); // Luz direccional fuerte
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const spotLight = new THREE.SpotLight(0x00B4D8, 15); // Aumentada intensidad
spotLight.position.set(0, 10, 0);
scene.add(spotLight);

// GRUPO
const carouselGroup = new THREE.Group();
scene.add(carouselGroup);

// PARTÍCULAS DE FONDO
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 500;
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 30;
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.04, color: 0x90e0ef, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// MODELOS
const camisas = [
    { id: 'celeste', file: 'camisetas/Camisa_celeste.glb' },
    { id: 'colombia', file: 'camisetas/Camisa_colombia.glb' },
    { id: 'morada', file: 'camisetas/Camisa_morada.glb' },
    { id: 'naranja', file: 'camisetas/Camisa_naranja.glb' },
    { id: 'roja', file: 'camisetas/Camisa_roja.glb' },
    { id: 'verde', file: 'camisetas/Camisa_verde.glb' }
];

const manager = new THREE.LoadingManager();
manager.onLoad = () => {
    const screen = document.getElementById('loading-screen');
    if (screen) { screen.style.opacity = '0'; setTimeout(() => screen.remove(), 500); }
};

const loader = new GLTFLoader(manager);
const radius = 5.0; // Radio reducido para centrar más

camisas.forEach((item, index) => {
    loader.load(item.file, (gltf) => {
        const model = gltf.scene;

        // MATEMÁTICA PARA CENTRAR LA PRIMERA (Index 0 al frente)
        const angle = (index / camisas.length) * Math.PI * 2 + (Math.PI / 2);

        model.position.x = Math.cos(angle) * radius;
        model.position.z = Math.sin(angle) * radius;
        model.rotation.y = -angle + Math.PI / 2;

        // === ESCALA PERFECTA ===
        model.scale.set(0.35, 0.35, 0.35);

        model.userData = { id: item.id, link: `visor.html?modelo=${item.id}` };

        model.traverse(child => { if (child.isMesh) child.castShadow = true; });
        carouselGroup.add(model);
    });
});

// === LOGICA DE ROTACIÓN EXACTA ===
let targetRotationY = 0;
const rotationStep = (Math.PI * 2) / camisas.length;

window.moveCarousel = (direction) => {
    // direction: 1 (Izquierda), -1 (Derecha)
    targetRotationY += direction * rotationStep;
};

// MOUSE PARALLAX
let mouseX = 0, mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - windowHalfX) * 0.0001;
    mouseY = (e.clientY - windowHalfY) * 0.0001;
});

// CLICKS
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
document.addEventListener('click', (event) => {
    if (event.target.closest('.nav-arrow')) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(carouselGroup.children, true);
    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.link) obj = obj.parent;
        if (obj.userData.link) {
            document.body.style.opacity = 0;
            document.body.style.transition = "opacity 0.5s";
            setTimeout(() => window.location.href = obj.userData.link, 500);
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    // Suavizado de rotación
    carouselGroup.rotation.y += (targetRotationY - carouselGroup.rotation.y) * 0.1;

    // Parallax fondo
    particlesMesh.rotation.y = mouseX * 2;
    particlesMesh.rotation.x = mouseY * 2;
    carouselGroup.rotation.x = mouseY * 0.5;

    // Animación individual
    const time = Date.now() * 0.001;
    carouselGroup.children.forEach((child, i) => {
        child.position.y = Math.sin(time + i) * 0.2;
        child.rotation.y += 0.002;
    });

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});