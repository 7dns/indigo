import { Animation } from '../core/Animation.mjs';
import { Camera } from '../core/Camera.mjs';
import { Model } from '../core/Model.mjs';
import { Vector3 } from "../math/Vector3.mjs";

// Camera animation presets for use with the Animation model

// Creates an animation moving the camera's position, target, and up vector smoothly
export function createMovementTo(target, newPosition, newTarget, newUp, duration = 1000, newFov = null) {
    console.assert(target instanceof Camera, 'animateCameraTo(): target must be a Camera');
    console.assert(newPosition instanceof Vector3, 'animateCameraTo(): newPosition must be a Vector3');
    console.assert(newTarget instanceof Vector3 || newTarget instanceof Model, 'animateCameraTo(): newTarget must be a Vector3 or Model');
    console.assert(newUp instanceof Vector3, 'animateCameraTo(): newUp must be a Vector3');
    console.assert(typeof duration === 'number' && duration > 0, 'animateCameraTo(): duration must be a positive number');

    const startPos = target.position.clone();
    const startTarget = target.target.clone();
    const startUp = target.up.clone();
    let elapsed = 0;

    return new Animation(target, (camera, deltaTime) => {
        elapsed += deltaTime;
        const t = Math.min(elapsed / duration, 1);

        let newTargetCoordinates = newTarget instanceof Model ? newTarget.modelMatrix.getTranslation() : newTarget;

        camera.position = Vector3.lerp(startPos, newPosition, t);
        camera.target = Vector3.lerp(startTarget, newTargetCoordinates, t);
        camera.up = Vector3.lerp(startUp, newUp, t);
    });
}

// Creates an animation smoothly changing the camera's field of view (zoom)
export function createZoomTo(target, newFov, duration = 1000) {
    console.assert(target instanceof Camera, 'animateCameraTo(): target must be a Camera');
    console.assert(newFov === null || typeof newFov === 'number', 'animateCameraTo(): newFov must be null or a number');
    
    const startFov = target.fov;
    newFov = newFov !== null ? newFov : startFov;
    let elapsed = 0;
    
    return new Animation(target, (camera, deltaTime) => {
        elapsed += deltaTime;
        const t = Math.min(elapsed / duration, 1);

        camera.fov = (startFov * (1 - t)) + (newFov * t);
    });
}