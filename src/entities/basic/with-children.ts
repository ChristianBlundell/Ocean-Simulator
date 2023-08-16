import { Entity } from "playcanvas";
import { setTransform } from "../../math";
import { entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { PackagedEntity, PackagedEntityFactory } from "./factory";

export interface WithChildrenConfigProps extends EntityConfigProps {
    node?: PackagedEntityFactory
    children?: PackagedEntityFactory[]
}

export interface WithChildrenRuntimeProps extends EntityRuntimeProps {
    children?: Entity[]
}

export type WithChildrenProps = EntityProps<WithChildrenConfigProps, WithChildrenRuntimeProps>

export const WithChildren = ({ parent, node, children, transform, tags }: WithChildrenProps) => {
    parent = PackagedEntity(node ?? { factory: entity }, { parent, transform, tags })

    children
        ?.filter(child => child instanceof Entity)
        .forEach(child => parent.addChild(child as unknown as Entity))
    
    children
        ?.filter(child => child.factory instanceof Function)
        .forEach(child => PackagedEntity(child as PackagedEntityFactory, { parent, tags }))
    
    return parent
}