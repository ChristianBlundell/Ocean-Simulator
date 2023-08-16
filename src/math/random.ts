import { Vec3 } from "playcanvas";

const makeRandomFactory = (scalar: () => number) => ({
    scalar,
    vec3: () => new Vec3(scalar(), scalar(), scalar())
})

export const random = {
    uniform: makeRandomFactory(Math.random),
    logNormal: makeRandomFactory(() => Math.exp(Math.random()))
}