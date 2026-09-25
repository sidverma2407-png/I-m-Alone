class LightingSystem {
    setupBedroomLighting(scene) {
        // Minimal ambient
        const ambientLight = new THREE.AmbientLight(0x101520, 0.1); 
        scene.add(ambientLight);

        // Window moonlight
        const moonLight = new THREE.DirectionalLight(0x6080aa, 0.5);
        moonLight.position.set(-5, 5, -5);
        scene.add(moonLight);
        
        return { ambientLight, moonLight };
    }
}
const lightingSystem = new LightingSystem();
