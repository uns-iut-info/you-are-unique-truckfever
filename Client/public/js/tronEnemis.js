// méthode de création d'un tron enemie, malheuresement n'ayant pas réussis à implémenter l'assetManager 
// les enemies seront temporairement des cubes, le temps de l'implémentation 
function createEnemie(scene,username,x,y,z,orientation,color) {
    console.log("CREATION DU TRON EEENNEEMI SUIVANT : ", username)
    BABYLON.SceneLoader.ImportMesh("", "/assets/models/truck/", "Spaceship.babylon", scene,  (newMeshes, particleSystems, skeletons) => {
            //console.log(newMeshes)
            let tron = newMeshes[0];
            tron.name = username
            let tronMaterial = new BABYLON.StandardMaterial(username+"Material", scene);
            //tronMaterial.diffuseTexture = new BABYLON.Texture("models/Tron/Sphere_003_baked_EMIT.jpg");
            //tronMaterial.emissiveTexture = new BABYLON.Texture("models/Tron/Sphere_003_baked_EMIT.jpg");
            tronMaterial.emissiveColor = new BABYLON.Color3(colorList[color].r,colorList[color].g,colorList[color].b);
            if(displayEffects){
                tronMaterial.glow = new BABYLON.GlowLayer("glow", scene, {blurKernelSize : 50});
                tronMaterial.glow.intensity = 1;
                tronMaterial.glow.addIncludedOnlyMesh(tron);
            }

            tron.material = tronMaterial;
            tron.color = color;
            tron.speed = 0.025;
            tron.x = x;
            tron.y = y;
            tron.z = z;
            tron.base =  new BABYLON.Vector3(tron.x, tron.y, tron.z); 
            tron.baseRotationY = orientation;
            tron.baseRotationZ = Math.PI;
            tron.baseRotationX = Math.PI;
            tron.rotation.y = tron.baseRotationY;
            tron.rotation.x = tron.baseRotationX;
            tron.rotation.z = tron.baseRotationZ;
            tron.frontVector = new BABYLON.Vector3(0, 0, 0);
            tron.checkCollisions = false;
            tron.position = new BABYLON.Vector3(tron.x,tron.y,tron.z);
            tron.name = username;
            tron.scaling = new BABYLON.Vector3(1,1,2);
            
            tron.move = (x,y,z,rotationx,rotationy,rotationz) => {
                tron.position = new BABYLON.Vector3(x,y,z);
                tron.frontVector = rotationy
                tron.rotation.x = rotationx+0.15
                tron.rotation.y = rotationy
                tron.rotation.z = rotationz
            }
            tron.move2 = (deltaTime) => {
                tron.moveWithCollisions(tron.frontVector.multiplyByFloats(tron.speed*deltaTime, tron.speed*deltaTime, tron.speed*deltaTime));

            }
            //console.log("creation du tron enemis " , username)
            if(displayParticles) {particleTron(tron);}
            return tron;
    });
}

function particleTron(tron){
    
    // Create a particle system
    var particleSystem = new BABYLON.ParticleSystem("particles", 100, scene);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture("/assets/images/Spark.png", scene);

    // Where the particles come from
    particleSystem.emitter = tron; // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(-1, -1, -3); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(1, 1, -3); // To...

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(colorList[tron.color].r,colorList[tron.color].g,colorList[tron.color].b, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

    // Size of each particle (random between...
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 0.01;
    particleSystem.maxLifeTime = 0.1;

    // Emission rate
    particleSystem.emitRate = 1500;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(1,-8, 10);
    particleSystem.direction2 = new BABYLON.Vector3(1, 8, -10);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 2;
    particleSystem.updateSpeed = 0.005;

    // Start the particle system
    particleSystem.start();
}