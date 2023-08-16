import { Entity, ScriptType } from "playcanvas";
import { uniqueId } from "underscore";
import { ATTRIBUTES_DEFINITIONS, recursiveChildrenWithTag, ScriptAttributesDefinition, useScript } from "../../utils";
import { EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { EntityFactory } from "./factory";
import { Script } from "./script";

export interface DynamicChildrenConfigProps<
        CloneConfig extends EntityConfigProps = EntityConfigProps,
        CloneRuntime extends EntityRuntimeProps = EntityRuntimeProps,
        CloneFactory extends EntityFactory<CloneConfig, CloneRuntime> = EntityFactory<CloneConfig, CloneRuntime>,
    > extends EntityConfigProps {
    growthRate: number
    maxDepth?: number
    maxClones?: number

    //TODO: need way to express probability distribution of where in the spline
    // of child elements to clone the new element.

    cloneTemplate?: Entity
    childCoordinatesAttributePrefixes: string[]
    targetTag?: string
}

export interface DynamicChildrenRuntimeProps extends EntityRuntimeProps<Entity> {
    parent?: Entity
}

export type DynamicChildrenProps = EntityProps<DynamicChildrenConfigProps, DynamicChildrenRuntimeProps>

export const DynamicChildren = ({
        parent,
        tags,
        transform,
        
        growthRate,
        maxClones,
        maxDepth,
        cloneTemplate,
        childCoordinatesAttributePrefixes,
        
        targetTag,
    }: DynamicChildrenProps) =>
        Script({
            parent,
            tags,
            transform,

            script: DynamicChildrenScript,
            attributes: {
                growthRate,
                maxDepth: maxDepth ?? 1,
                maxClones: maxClones ?? Infinity,
                cloneTemplate: cloneTemplate ? cloneTemplate : parent,
                cloned_tag: uniqueId('dynamic_children__cloned_tag__'),
                target_tag: targetTag,
                childCoordinatesAttributePrefixes
            }
        })

export class DynamicChildrenScript extends ScriptType {
    lifetime!: number
    depth!: number
    maxDepth!: number
    maxClones!: number
    growthRate!: number
    cloneTemplate!: Entity
    cloned_tag!: string
    target_tag!: string
    childCoordinatesAttributePrefixes!: string[]

    override initialize(): void {
        this.setNewLifetime()
    }

    private setNewLifetime() {
        this.lifetime = -(this.growthRate * (1 + (0.1 * Math.random())))
    }

    override update(dt: number): void {
        this.lifetime += dt

        if (this.lifetime >= 0) {
            this.newChild()
            this.setNewLifetime()
        }
    }

    private newChild() {
        if (this.depth >= this.maxDepth)
            return

        const target = this.target_tag?.length > 0 ?
            this.entity.children.find(child => child.tags.has(this.target_tag)) :
            this.entity
        
        if (target.children.filter(child => child.tags.has(this.cloned_tag)).length >= this.maxClones)
            return

        const child = this.cloneTemplate.clone()
        
        recursiveChildrenWithTag(child, this.cloned_tag).forEach(subchild => subchild.parent.removeChild(subchild))
            
        const dynamicChildrenScript = child.script?.get(useScript(DynamicChildrenScript)) as DynamicChildrenScript
        if (dynamicChildrenScript) {
            console.log('updating child DynamicChildrenScript')
            dynamicChildrenScript.depth = this.depth + 1
            dynamicChildrenScript.cloneTemplate = this.cloneTemplate
        }
        
        if (this.cloned_tag?.length > 0)
            child.tags.add(this.cloned_tag)
        
        for (const tag of this.childCoordinatesAttributePrefixes)
            child.tags.add(`${tag}${Math.random()}`)
        
        target.addChild(child)
        child.enabled = true
    }

    static readonly [ATTRIBUTES_DEFINITIONS]: ScriptAttributesDefinition<typeof DynamicChildrenScript> = {
        lifetime: {
            type: 'number',
            default: NaN
        },

        depth: {
            type: 'number',
            min: 0,
            default: 0
        },

        growthRate: {
            type: 'number',
            min: 0.01,
            default: 1
        },

        maxDepth: {
            type: 'number',
            min: 0,
            default: 1
        },

        maxClones: {
            type: 'number',
            min: 0,
            default: Infinity
        },

        cloneTemplate: {
            type: 'entity'
        },

        cloned_tag: {
            type: 'string',
            default: ''
        },

        target_tag: {
            type: 'string',
            default: ''
        },

        childCoordinatesAttributePrefixes: {
            type: 'string',
            array: true,
        }
    }
}