import { Vec3, Vec2 } from "playcanvas"

export const xy = ({x, y, z}: Vec3) => new Vec2(x, y)
export const xz = ({x, y, z}: Vec3) => new Vec2(x, z)
export const yx = ({x, y, z}: Vec3) => new Vec2(y, x)
export const yz = ({x, y, z}: Vec3) => new Vec2(y, z)
export const zx = ({x, y, z}: Vec3) => new Vec2(z, x)
export const zy = ({ x, y, z }: Vec3) => new Vec2(z, y)

export const xyz = ({ x, y, z }: Vec3) => new Vec3(x, y, z)
export const yzx = ({ x, y, z }: Vec3) => new Vec3(y, z, x)
export const zxy = ({ x, y, z }: Vec3) => new Vec3(z, x, y)
export const zyx = ({ x, y, z }: Vec3) => new Vec3(z, y, x)
export const yxz = ({ x, y, z }: Vec3) => new Vec3(y, x, z)
export const xzy = ({ x, y, z }: Vec3) => new Vec3(x, z, y)