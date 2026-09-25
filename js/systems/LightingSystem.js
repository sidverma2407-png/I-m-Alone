class LightingSystem {
    setupBedroomLighting(scene) {
        // Minimal ambient
        const ambientLight = new THREE.AmbientLight(0x101520, 0.1); 
        scene.add(ambientLight);

        // Window moonlight
        this.moonLight = new THREE.DirectionalLight(0x6080aa, 0.5);
        this.moonLight.position.set(-5, 5, -5);
        scene.add(this.moonLight);
        
        return { ambientLight, moonLight: this.moonLight };
    }
}
const lightingSystem = new LightingSystem();
