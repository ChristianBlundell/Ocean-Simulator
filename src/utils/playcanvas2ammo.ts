import type Ammo from 'ammojs-typed'

import { Vec3, Quat } from 'playcanvas'

export namespace PlayCanvas2Ammo {
    export function vec3(v: Vec3) {
        ///@ts-ignore
        return new Ammo.btVector3(v.x, v.y, v.z)
    }

    export function quat(q: Quat) {
        ///@ts-ignore
        return new Ammo.btQuaternion(q.x, q.y, q.z, q.w)
    }
}