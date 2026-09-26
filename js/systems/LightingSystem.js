class LightingSystem {
    setupBedroomLighting(scene) {
        // Minimal ambient
        const ambientLight = new THREE.AmbientLight(0x101520, 0.1); 
        scene.add(ambientLight);

        // Window moonlight
        this.moonLight = new THREE.DirectionalLight(0x6080aa, 0.5);
        this.moonLight.position.set(-5, 5, -5);
        
        // CRITICAL FOR FURNITURE GROUNDING
        this.moonLight.castShadow = true;
        this.moonLight.shadow.mapSize.width = 2048;
        this.moonLight.shadow.mapSize.height = 2048;
        this.moonLight.shadow.camera.near = 0.5;
        this.moonLight.shadow.camera.far = 25;
        // The room is roughly 10x10, so make the orthographic camera cover it
        this.moonLight.shadow.camera.left = -7;
        this.moonLight.shadow.camera.right = 7;
        this.moonLight.shadow.camera.top = 7;
        this.moonLight.shadow.camera.bottom = -7;
        this.moonLight.shadow.bias = -0.0005; // Prevent shadow acne

        scene.add(this.moonLight);
        
        return { ambientLight, moonLight: this.moonLight };
    }
}
const lightingSystem = new LightingSystem();
