import { Entity, ScriptType } from "playcanvas"
import { ATTRIBUTES_DEFINITIONS, ScriptAttributesDefinition } from "../../utils"
import { EntityConfigProps, EntityProps, EntityRuntimeProps, PackagedEntity, PackagedEntityFactory } from "../basic"
import { Script } from "../basic"

export interface SpawnConfigProps extends EntityConfigProps {
    count: number
    spawnPkg: PackagedEntityFactory
    collisionPkg: PackagedEntityFactory
}

export interface SpawnRuntimeProps extends EntityRuntimeProps {
}

export type SpawnProps = EntityProps<SpawnConfigProps, SpawnRuntimeProps>

export const Spawn = (props: SpawnProps) =>
    Script({
        parent: PackagedEntity(props.collisionPkg, {
            parent: props.parent,
            tags: props.tags
        }),
        script: SpawnScript,
        attributes: {
            entitiesTotal: 30,
            spawnPkg: props.spawnPkg
        }
    })

export class SpawnScript extends ScriptType {
    entitiesTotal!: number
    entitiesAdded!: number
    currentlyColliding!: Entity[]
    spawnPkg!: PackagedEntityFactory

    override initialize(): void {
        this.currentlyColliding = []
        this.entity.addComponent('collision')
        this.entity.collision!.on('triggerenter', (e: Entity) => this.currentlyColliding.push(e))
        this.entity.collision!.on('triggerleave', (e: Entity) => this.currentlyColliding.splice(this.currentlyColliding.findIndex(e2 => e === e2), 1))
    }

    override update(dt: number): void {
        if (this.currentlyColliding.length === 0) {
            if (this.entitiesAdded !== this.entitiesTotal) {
                PackagedEntity(this.spawnPkg, {
                    parent: this.entity.parent
                })
            }
        }
    }

    static [ATTRIBUTES_DEFINITIONS]: ScriptAttributesDefinition<typeof SpawnScript> = {
        entitiesTotal: {
            type: 'number',
            min: 0,
            max: 100,
            default: 25,
        },

        entitiesAdded: {
            type: 'number',
            default: 0
        },

        spawnPkg: {
            type: "json"
        }
    }
}