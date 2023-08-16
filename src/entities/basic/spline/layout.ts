import { Entity, ScriptType, Vec3 } from "playcanvas";
import { bezierSplineInfoAt, setTransform } from "../../../math";
import { ATTRIBUTES_DEFINITIONS, getAttributeFromTags } from "../../../utils";
import { EntityConfigProps, EntityProps, EntityRuntimeProps } from "../entity";
import { Script } from "../script";

export interface SplineResolution {
    t: number
}

/**
 * If this tag is present, the entity is a keypoint for the curve
 */
export const TAG_CURVE_KEYPOINT = "SOLID_CURVE__KEYPOINT"

/**
 * The position along the curve [0, (keypoints - 1)]
 */
export const ATTR_CURVE_POSITION_T = "SOLID_CURVE__POSITION_T:"

/**
 * The position within [0, 1]
 */
export const ATTR_CURVE_POSITION_T_NORMALIZED = "SOLID_CURVE__POSITION_T_NORM:"

export interface LayoutConfigProps extends EntityConfigProps {
    //extrapolation behavoir
}

export interface LayoutRuntimeProps extends EntityRuntimeProps<Entity> {
}
    
export type LayoutProps = EntityProps<LayoutConfigProps, LayoutRuntimeProps>

export const Layout = (props: LayoutProps) =>
    Script({
            ...props,
            script: LayoutScript,
            attributes: {}
        })

export class LayoutScript extends ScriptType {
    private last_update!: {
        positions: Vec3[]
        children_guids: string[]
    }

    override initialize(): void {
        this.last_update = {
            positions: [],
            children_guids: []
        }
    }

    override update(dt: number): void {
        const children_t = LayoutScript.getSplineChildrenT(this.entity)
        const keypointsInfo = LayoutScript.keypointsInfo(children_t, this.last_update)

        const children_changed = keypointsInfo.changed
            || this.last_update.children_guids.length !== children_t.length
            || children_t.some(child => !this.last_update.children_guids.includes(child.entity.getGuid()))

        if (children_changed) {
            for(const child of children_t) {
                const { position, rotation } = bezierSplineInfoAt(keypointsInfo.keypoints, child.t)

                if (child.entity.tags.has(TAG_CURVE_KEYPOINT))
                    setTransform(child.entity, { rotation })
                else {
                    setTransform(child.entity, {
                        position,
                        rotation,
                    })
                }
            }

            this.last_update.children_guids = children_t.map(child => child.entity.getGuid())
        }
    }

    static getSplineChildrenT(spline: Entity): { t: number, entity: Entity }[] {
        const children = spline.children.filter(child => child instanceof Entity) as Entity[]
        const children_keypoints_count = children.filter(child => child.tags.has(TAG_CURVE_KEYPOINT)).length

        const children_t = 
            children.map(child => {
                const t_local = getAttributeFromTags(child, ATTR_CURVE_POSITION_T)
                const t_normal = getAttributeFromTags(child, ATTR_CURVE_POSITION_T_NORMALIZED)
                
                const t = t_local ?? (t_normal * (children_keypoints_count - 1)) ?? NaN
                
                if (!t_local)
                    child.tags.add(`${ATTR_CURVE_POSITION_T_NORMALIZED}${t}`)
                if (!t_normal)
                    child.tags.add(`${ATTR_CURVE_POSITION_T_NORMALIZED}${t / (children_keypoints_count - 1)}`)

                return {
                    entity: child,
                    t
                }
            })
            .filter(child => !isNaN(child.t))
        
        return children_t
    }

    static keypointsInfo(
            children_t: ReturnType<typeof this.getSplineChildrenT>,
            last_update_keypoints: { positions: Vec3[] }
        ) {
        const child_keypoints = children_t.filter(child => child.entity.tags.has(TAG_CURVE_KEYPOINT))
        console.assert(child_keypoints.every(({ t }) => t >= 0 && t < child_keypoints.length && ((t % 1) === 0)))
        child_keypoints.sort((a, b) => a.t - b.t)

        const current_keypoint_positions = child_keypoints.map(child => child.entity.getLocalPosition())

        const changed = current_keypoint_positions.length !== last_update_keypoints.positions.length ||
            !last_update_keypoints.positions.every((v, i) => v.equals(current_keypoint_positions[i]))

        if (changed) {
            last_update_keypoints.positions = current_keypoint_positions.map(v => v.clone())
        }
        
        return {
            keypoints: current_keypoint_positions,
            changed
        }
    }

    static [ATTRIBUTES_DEFINITIONS] = {}
}