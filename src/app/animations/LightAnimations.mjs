import { Animation } from '../core/Animation.mjs';
import { Light } from '../core/Light.mjs';
import { Model } from '../core/Model.mjs';

// Creates an animation that makes a Light follow a Model's position
// Optionally applies an extra transformation on the follower's model matrix
export function createFollow(follower, target, extraTransform = null) {
    console.assert(follower instanceof Light, 'createFollow(): follower must be a Light');
    console.assert(target instanceof Model, 'createFollow(): target must be a Model');

    return new Animation(follower, () => {
        follower.position = target.modelMatrix.getTranslation();

        if (typeof extraTransform === 'function') {
            extraTransform(follower.modelMatrix);
        }
    });
}