import { RIGIDBODY_TYPE_DYNAMIC } from "playcanvas"
import { mergeTags } from "../../utils"
import { PackagedEntityFactory, Repetition, PackagedEntity, EntityProps, EntityConfigProps, EntityRuntimeProps, entity } from "../basic"
import { FingerConfigProps, Finger } from "./finger"

export const TAG_LIMB_END = "limb-end"
export const TAG_LIMB_END_PALM = "limb-end/palm"

export interface LimbEndConfigProps extends EntityConfigProps {
    fingers: FingerConfigProps[]
    palm: PackagedEntityFactory
}

export interface LimbEndRuntimeProps extends EntityRuntimeProps {
}

export type LimbEndProps = EntityProps<LimbEndConfigProps, LimbEndRuntimeProps>

export const LimbEnd = (props: LimbEndProps) => {
    const root = entity({
        parent: props.parent,
        transform: props.transform,
    })

    const palm = PackagedEntity(props.palm, {
        parent: root,
        material: props.material,
        tags: mergeTags([TAG_LIMB_END, TAG_LIMB_END_PALM], props.tags),
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 1.3
        }
    })

    Repetition({
        parent: palm,
        tags: mergeTags(['limb-end'], props.tags),

        items: props.fingers,
        itemPkg: {
            factory: ({ item, index, tags, parent }) => Finger({
                ...item,
                parent,
                tags: mergeTags(['limb-end', `finger-${index}`], tags),
                material: props.material,
            }),
        }
    })

    return entity({
        parent: palm,
        transform: {
            position: props.palm.config?.transform?.position.clone().mulScalar(-1)
        }
    })
}