import { Entity, ScriptType, Vec3 } from "playcanvas";
import { identity } from "underscore";
import { reifyTransform, transform, Transform } from "../../math";
import { ATTRIBUTES_DEFINITIONS, getAttributeFromTags, scriptAttributeSchemas } from "../../utils";
import { EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { Script } from "./script";

export interface TransformTags {
    all: string[]
    translation: string[]
    rotation: string[]
    scale: string[]
}

export const schema_TransformTags = [
    {
        name: 'all',
        type: 'string',
        array: true,
        default: [] as any,
    },
    {
        name: 'translation',
        type: 'string',
        array: true,
        default: [] as any,
    },
    {
        name: 'rotation',
        type: 'string',
        array: true,
        default: [] as any,
    },
    {
        name: 'scale',
        type: 'string',
        array: true,
        default: [] as any,
    }
]

export interface TransformsConfigProps extends EntityConfigProps {
    children?: boolean
    children_unaffected_tags?: string[] | Partial<TransformTags>
    factor_tags?: string[] | Partial<TransformTags>
}

export interface TransformsRuntimeProps extends EntityRuntimeProps<Entity> {
}

export type TransformsProps = EntityProps<TransformsConfigProps, TransformsRuntimeProps>

export const Transforms = ({
        parent,
        transform,
        children,
        children_unaffected_tags,
        factor_tags,
    }: TransformsProps) =>
    Script({
        parent,
        script: TransformScript,
        attributes: {
            transform,
            children,
            children_unaffected_tags:
                children_unaffected_tags instanceof Array ?
                    { all: children_unaffected_tags } :
                    children_unaffected_tags,
            factor_tags:
                factor_tags instanceof Array ?
                    { all: factor_tags } :
                    factor_tags
        }
    })

export const translates =
    (v: Vec3, random?: Vec3,
        children?: boolean, children_unaffected_tags?: string[],
        factor_tags?: string[]) => ({
        transform: {
            position: v,
            random: {
                position: random
            }
        },
        children,
        children_unaffected_tags: { translation: children_unaffected_tags },
        factor_tags: { translation: factor_tags },
    }) as TransformsConfigProps

export const rotates =
    (v: Vec3, random?: Vec3,
        children?: boolean, children_unaffected_tags?: string[],
        factor_tags?: string[]) => ({
        transform: {
            rotation: v,
            random: {
                rotation: random
            }
        },
        children,
        children_unaffected_tags: { rotation: children_unaffected_tags },
        factor_tags: { rotation: factor_tags },
    }) as TransformsConfigProps

export const scales = 
    (v: Vec3, random?: Vec3,
        children?: boolean, children_unaffected_tags?: string[],
        factor_tags?: string[]) => ({
        transform: {
            scale: v,
            random: {
                scale: random
            }
        },
        children,
        children_unaffected_tags: { scale: children_unaffected_tags },
        factor_tags: { scale: factor_tags },
    }) as TransformsConfigProps

export class TransformScript extends ScriptType {
    transform!: Transform
    children!: boolean
    children_unaffected_tags!: TransformTags
    factor_tags!: TransformTags

    override update(dt: number): void {
        const reifiedTransform = reifyTransform(this.transform)

        if (this.children) {
            for (const child of this.entity.children) {
                if (child instanceof Entity) {
                    const unaffected = this.children_unaffected_tags.all.some(tag => child.tags.has(tag))
                    const unaffected_translation = this.children_unaffected_tags.translation.some(tag => child.tags.has(tag))
                    const unaffected_rotation = this.children_unaffected_tags.rotation.some(tag => child.tags.has(tag))
                    const unaffected_scale = this.children_unaffected_tags.scale.some(tag => child.tags.has(tag))

                    if (!unaffected) {
                        const factor = this.factor_tags.all.map(attribute_tag => getAttributeFromTags(child, attribute_tag)).find(identity) ?? 1
                        const factor_translation = (this.factor_tags.translation.map(attribute_tag => getAttributeFromTags(child, attribute_tag)).find(identity) ?? 1) * factor
                        const factor_rotation = (this.factor_tags.rotation.map(attribute_tag => getAttributeFromTags(child, attribute_tag)).find(identity) ?? 1) * factor
                        const factor_scale = (this.factor_tags.scale.map(attribute_tag => getAttributeFromTags(child, attribute_tag)).find(identity) ?? 1) * factor

                        const childTransform: Transform = {
                            position: unaffected_translation ? undefined : reifiedTransform.position.clone().mulScalar(factor_translation),
                            rotation: unaffected_rotation ? undefined : reifiedTransform.rotation.clone().mulScalar(factor_rotation),
                            scale: unaffected_scale ? undefined : reifiedTransform.scale.clone().mulScalar(factor_scale),
                            random: {
                                position: unaffected_translation ? undefined : reifiedTransform.random.position.clone().mulScalar(factor_translation),
                                rotation: unaffected_rotation ? undefined : reifiedTransform.random.rotation.clone().mulScalar(factor_rotation),
                                scale: unaffected_scale ? undefined : reifiedTransform.random.scale.clone().mulScalar(factor_scale),
                            }
                        }
                        
                        transform(child, childTransform, dt)
                    }
                }
            }
        }
        else {
            transform(this.entity, reifiedTransform, dt)
        }
    }

    static [ATTRIBUTES_DEFINITIONS] = {
        transform: {
            type: 'json',
            schema: scriptAttributeSchemas.transform
        },

        children: {
            type: 'boolean',
            default: false
        },

        children_unaffected_tags: {
            type: 'json',
            schema: schema_TransformTags
        },

        factor_tags: {
            type: 'json',
            schema: schema_TransformTags
        }
    }
}