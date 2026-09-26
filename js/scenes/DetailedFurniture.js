// DetailedFurniture.js

// Helper to create a mesh
function createMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createDetailedBed(woodMat, mattressMat, blanketMat, pillowMat) {
    const group = new THREE.Group();

    // Bed Frame
    const frameGeo = new THREE.BoxGeometry(1.6, 0.2, 2.1);
    const frame = createMesh(frameGeo, woodMat);
    frame.position.y = 0.3;
    group.add(frame);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const legPositions = [
        [-0.75, 0.2, -1.0], [0.75, 0.2, -1.0],
        [-0.75, 0.2, 1.0], [0.75, 0.2, 1.0]
    ];
    legPositions.forEach(pos => {
        const leg = createMesh(legGeo, woodMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
    });

    // Headboard
    const headboardGeo = new THREE.BoxGeometry(1.7, 1.0, 0.1);
    const headboard = createMesh(headboardGeo, woodMat);
    headboard.position.set(0, 0.7, -1.0);
    group.add(headboard);

    // Mattress
    const mattressGeo = new THREE.BoxGeometry(1.5, 0.25, 2.0);
    const mattress = createMesh(mattressGeo, mattressMat);
    mattress.position.set(0, 0.525, 0);
    group.add(mattress);

    // Blanket
    const blanketGeo = new THREE.BoxGeometry(1.55, 0.26, 1.4);
    const blanket = createMesh(blanketGeo, blanketMat);
    blanket.position.set(0, 0.53, 0.3);
    group.add(blanket);

    // Pillows
    const pillowGeo = new THREE.BoxGeometry(0.6, 0.1, 0.4);
    const pillow1 = createMesh(pillowGeo, pillowMat);
    pillow1.position.set(-0.35, 0.7, -0.7);
    // Add slight rotation for realism
    pillow1.rotation.x = 0.1;
    group.add(pillow1);

    const pillow2 = createMesh(pillowGeo, pillowMat);
    pillow2.position.set(0.35, 0.7, -0.7);
    pillow2.rotation.x = 0.1;
    group.add(pillow2);

    return group;
}

function createDetailedDesk(woodMat, metalMat) {
    const group = new THREE.Group();

    // Top
    const topGeo = new THREE.BoxGeometry(1.5, 0.05, 0.7);
    const top = createMesh(topGeo, woodMat);
    top.position.y = 0.75;
    group.add(top);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8);
    const legPositions = [
        [-0.7, 0.375, -0.3], [0.7, 0.375, -0.3],
        [-0.7, 0.375, 0.3], [0.7, 0.375, 0.3]
    ];
    legPositions.forEach(pos => {
        const leg = createMesh(legGeo, metalMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
    });

    // Drawers box
    const drawersGeo = new THREE.BoxGeometry(0.4, 0.4, 0.65);
    const drawers = createMesh(drawersGeo, woodMat);
    drawers.position.set(0.5, 0.5, 0);
    group.add(drawers);

    // Drawer fronts and handles
    const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 8);
    handleGeo.rotateZ(Math.PI / 2);
    
    for (let i = 0; i < 2; i++) {
        const dFrontGeo = new THREE.BoxGeometry(0.38, 0.18, 0.02);
        const dFront = createMesh(dFrontGeo, woodMat);
        dFront.position.set(0.5, 0.6 - i*0.2, 0.33);
        group.add(dFront);

        const handle = createMesh(handleGeo, metalMat);
        handle.position.set(0.5, 0.6 - i*0.2, 0.35);
        group.add(handle);
    }

    return group;
}

function createDetailedChair(frameMat, seatMat) {
    const group = new THREE.Group();

    // Base Center
    const baseCenterGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16);
    const baseCenter = createMesh(baseCenterGeo, frameMat);
    baseCenter.position.y = 0.2;
    group.add(baseCenter);

    // Legs (star base)
    const legGeo = new THREE.BoxGeometry(0.04, 0.04, 0.3);
    for(let i=0; i<5; i++) {
        const leg = createMesh(legGeo, frameMat);
        leg.position.y = 0.05;
        leg.rotation.y = (Math.PI * 2 / 5) * i;
        leg.translateZ(0.15);
        group.add(leg);
        
        // Caster wheels
        const wheelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheel = createMesh(wheelGeo, frameMat);
        wheel.position.copy(leg.position);
        wheel.translateZ(0.12);
        wheel.position.y = 0.03;
        group.add(wheel);
    }

    // Seat
    const seatGeo = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const seat = createMesh(seatGeo, seatMat);
    seat.position.y = 0.45;
    group.add(seat);

    // Backrest support
    const supportGeo = new THREE.BoxGeometry(0.05, 0.4, 0.05);
    const support = createMesh(supportGeo, frameMat);
    support.position.set(0, 0.7, -0.2);
    // Slight angle
    support.rotation.x = -0.1;
    group.add(support);

    // Backrest
    const backrestGeo = new THREE.BoxGeometry(0.45, 0.4, 0.08);
    const backrest = createMesh(backrestGeo, seatMat);
    backrest.position.set(0, 0.9, -0.22);
    backrest.rotation.x = -0.1;
    group.add(backrest);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.05, 0.2, 0.3);
    const armL = createMesh(armGeo, seatMat);
    armL.position.set(-0.25, 0.6, 0);
    group.add(armL);
    
    const armR = createMesh(armGeo, seatMat);
    armR.position.set(0.25, 0.6, 0);
    group.add(armR);

    return group;
}

function createDetailedWardrobe(woodMat, metalMat) {
    const group = new THREE.Group();

    // Main body
    const bodyGeo = new THREE.BoxGeometry(1.2, 2.0, 0.6);
    const body = createMesh(bodyGeo, woodMat);
    body.position.y = 1.0;
    group.add(body);

    // Baseboard
    const baseGeo = new THREE.BoxGeometry(1.22, 0.1, 0.62);
    const base = createMesh(baseGeo, woodMat);
    base.position.y = 0.05;
    group.add(base);

    // Top trim
    const topGeo = new THREE.BoxGeometry(1.25, 0.05, 0.65);
    const top = createMesh(topGeo, woodMat);
    top.position.y = 2.025;
    group.add(top);

    // Doors
    const doorGeo = new THREE.BoxGeometry(0.58, 1.8, 0.04);
    const doorL = createMesh(doorGeo, woodMat);
    doorL.position.set(-0.3, 1.05, 0.3);
    group.add(doorL);

    const doorR = createMesh(doorGeo, woodMat);
    doorR.position.set(0.3, 1.05, 0.3);
    group.add(doorR);

    // Handles
    const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8);
    const handleL = createMesh(handleGeo, metalMat);
    handleL.position.set(-0.05, 1.0, 0.33);
    group.add(handleL);

    const handleR = createMesh(handleGeo, metalMat);
    handleR.position.set(0.05, 1.0, 0.33);
    group.add(handleR);

    return group;
}

function createDetailedNightstand(woodMat, metalMat) {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.4);
    const body = createMesh(bodyGeo, woodMat);
    body.position.y = 0.25;
    group.add(body);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.1, 8);
    const legPositions = [
        [-0.2, 0.05, -0.15], [0.2, 0.05, -0.15],
        [-0.2, 0.05, 0.15], [0.2, 0.05, 0.15]
    ];
    legPositions.forEach(pos => {
        const leg = createMesh(legGeo, metalMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
    });
    // Adjust body up due to legs
    body.position.y = 0.35;

    // Top
    const topGeo = new THREE.BoxGeometry(0.52, 0.02, 0.42);
    const top = createMesh(topGeo, woodMat);
    top.position.y = 0.61;
    group.add(top);

    // Drawers
    const drawerGeo = new THREE.BoxGeometry(0.46, 0.2, 0.02);
    const handleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8);
    handleGeo.rotateZ(Math.PI/2);

    for(let i=0; i<2; i++) {
        const drawer = createMesh(drawerGeo, woodMat);
        drawer.position.set(0, 0.22 + i*0.22, 0.21);
        group.add(drawer);

        const handle = createMesh(handleGeo, metalMat);
        handle.position.set(0, 0.22 + i*0.22, 0.23);
        group.add(handle);
    }

    return group;
}

function createDetailedWindowFrame(woodMat, glassMat) {
    const group = new THREE.Group();
    // Assuming size 1.5w x 2.0h, centering at origin

    // Outer Frame
    const frameVertGeo = new THREE.BoxGeometry(0.1, 2.0, 0.1);
    const frameLeft = createMesh(frameVertGeo, woodMat);
    frameLeft.position.set(-0.7, 0, 0);
    group.add(frameLeft);

    const frameRight = createMesh(frameVertGeo, woodMat);
    frameRight.position.set(0.7, 0, 0);
    group.add(frameRight);

    const frameHorzGeo = new THREE.BoxGeometry(1.5, 0.1, 0.1);
    const frameTop = createMesh(frameHorzGeo, woodMat);
    frameTop.position.set(0, 0.95, 0);
    group.add(frameTop);

    const frameBottom = createMesh(frameHorzGeo, woodMat);
    frameBottom.position.set(0, -0.95, 0);
    group.add(frameBottom);

    // Sill (bottom wider part)
    const sillGeo = new THREE.BoxGeometry(1.6, 0.05, 0.15);
    const sill = createMesh(sillGeo, woodMat);
    sill.position.set(0, -1.025, 0.025);
    group.add(sill);

    // Middle Divider
    const dividerGeo = new THREE.BoxGeometry(0.05, 2.0, 0.05);
    const divider = createMesh(dividerGeo, woodMat);
    group.add(divider);

    const dividerHGeo = new THREE.BoxGeometry(1.5, 0.05, 0.05);
    const dividerH = createMesh(dividerHGeo, woodMat);
    group.add(dividerH);

    // Glass Panes
    const glassGeo = new THREE.PlaneGeometry(0.65, 0.9);
    const positions = [
        [-0.35, 0.45, 0], [0.35, 0.45, 0],
        [-0.35, -0.45, 0], [0.35, -0.45, 0]
    ];
    positions.forEach(pos => {
        const pane = createMesh(glassGeo, glassMat);
        pane.position.set(pos[0], pos[1], pos[2]);
        group.add(pane);
        
        // Add back face for glass if needed
        const paneBack = createMesh(glassGeo, glassMat);
        paneBack.position.set(pos[0], pos[1], pos[2]);
        paneBack.rotation.y = Math.PI;
        group.add(paneBack);
    });

    return group;
}

function createDetailedClock(bodyMat, glassMat, emissiveMat) {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.3, 0.15, 0.1);
    const body = createMesh(bodyGeo, bodyMat);
    group.add(body);

    // Screen border/chamfer
    const screenBorderGeo = new THREE.BoxGeometry(0.25, 0.1, 0.11);
    const screenBorder = createMesh(screenBorderGeo, bodyMat);
    // Move it slightly forward to overlay
    screenBorder.position.z = 0.01;
    group.add(screenBorder);

    // Glass/Screen
    const screenGeo = new THREE.BoxGeometry(0.23, 0.08, 0.12);
    const screen = createMesh(screenGeo, glassMat);
    group.add(screen);

    // Glowy text area (simulate with a small plane)
    const textGeo = new THREE.PlaneGeometry(0.18, 0.06);
    const text = createMesh(textGeo, emissiveMat);
    text.position.set(0, 0, 0.061);
    group.add(text);

    return group;
}

function createDetailedPainting(frameMat, canvasMat) {
    const group = new THREE.Group();

    // Canvas
    const canvasGeo = new THREE.BoxGeometry(1.0, 1.5, 0.02);
    const canvas = createMesh(canvasGeo, canvasMat);
    group.add(canvas);

    // Frame
    const frameVertGeo = new THREE.BoxGeometry(0.05, 1.6, 0.04);
    const frameL = createMesh(frameVertGeo, frameMat);
    frameL.position.set(-0.525, 0, 0.01);
    group.add(frameL);

    const frameR = createMesh(frameVertGeo, frameMat);
    frameR.position.set(0.525, 0, 0.01);
    group.add(frameR);

    const frameHorzGeo = new THREE.BoxGeometry(1.1, 0.05, 0.04);
    const frameT = createMesh(frameHorzGeo, frameMat);
    frameT.position.set(0, 0.775, 0.01);
    group.add(frameT);

    const frameB = createMesh(frameHorzGeo, frameMat);
    frameB.position.set(0, -0.775, 0.01);
    group.add(frameB);

    return group;
}
