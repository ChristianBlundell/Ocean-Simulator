import { Vec3 } from "playcanvas"
import { useScript } from "../../../utils"
import { Box, entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from "../../basic"
import { AIScript } from "./ai"

export interface FishConfigProps extends EntityConfigProps {
    kind: string
}

export interface FishRuntimeProps extends EntityRuntimeProps {
}

export type FishProps = EntityProps<FishConfigProps, FishRuntimeProps>

export const Fish = (props: FishProps) => {
    const root = entity(props)

    root.addComponent('rigidbody')
    root.rigidbody!.type = 'dynamic'

    //root.addComponent('script')
    //root.script!.create(useScript(AIScript))

    Box({
        parent: root,
        transform: {
            scale: new Vec3(0.1, 0.618, 1)
        }
    })

    //TODO: add fins

    return root
}