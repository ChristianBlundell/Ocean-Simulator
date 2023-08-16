import { Entity, Vec3 } from "playcanvas"
import { EntityConfigProps, EntityProps, EntityRuntimeProps } from "../entity"
import { Transforms, translates } from "../transforms"
import { ATTR_CURVE_POSITION_T, ATTR_CURVE_POSITION_T_NORMALIZED } from "./layout"

export interface GrowthConfigProps extends EntityConfigProps {
    rate: number
    random?: { rate: number }
}

export interface GrowthRuntimeProps extends EntityRuntimeProps<Entity> {
}

export type GrowthProps = EntityProps<GrowthConfigProps, GrowthRuntimeProps>

export const Growth = ({ parent, rate, random }: GrowthProps) =>
    Transforms({
        parent,
        ...translates(
            new Vec3(rate, 0, 0),
            new Vec3(random?.rate ?? 0, 0, 0),
            true,
            [`${ATTR_CURVE_POSITION_T}0`, `${ATTR_CURVE_POSITION_T_NORMALIZED}0`],
            [ATTR_CURVE_POSITION_T]
        )
    })