import { Vec3 } from "playcanvas";
import { mergeTags } from "../../utils";
import { entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { EntityFactory, PackagedEntity, PackagedEntityFactory } from "./factory";

export const TAG_MIRRORED_AXIS_X_REGULAR = "front"
export const TAG_MIRRORED_AXIS_X_MIRROR = "back"
export const TAG_MIRRORED_AXIS_Y_REGULAR = "left"
export const TAG_MIRRORED_AXIS_Y_MIRROR = "right"
export const TAG_MIRRORED_AXIS_Z_REGULAR = "top"
export const TAG_MIRRORED_AXIS_Z_MIRROR = "bottom"


export interface MirroredConfigProps<
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps,
        Factory extends EntityFactory<Config, Runtime> = EntityFactory<Config, Runtime>,
    > extends EntityConfigProps {
    mirror: {
        x?: boolean
        y?: boolean
        z?: boolean
    }

    pkg: PackagedEntityFactory<Config, Runtime, Factory>
}

export type MirroredRuntimeProps<Runtime extends EntityRuntimeProps = EntityRuntimeProps> = Runtime

export type MirroredProps<
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps,
        Factory extends EntityFactory<Config, Runtime> = EntityFactory<Config, Runtime>,
    > = EntityProps<
        MirroredConfigProps<Config, Runtime, Factory>,
        MirroredRuntimeProps
    >

export const Mirrored = <
    Config extends EntityConfigProps = EntityConfigProps,
    Runtime extends EntityRuntimeProps = EntityRuntimeProps,
    Factory extends EntityFactory<Config, Runtime> = EntityFactory<Config, Runtime>,
    >(props: MirroredProps<Config, Runtime, Factory>) => {
    const root = entity(props)
    
    mirrorConfigs(props.mirror).map(({ tags, scale }) =>
        PackagedEntity(props.pkg, {
            tags: mergeTags(props.tags, tags),
            parent: entity({
                parent: root,
                transform: {
                    scale
                }
            })
        } as Partial<EntityRuntimeProps> as Partial<Runtime>)
    )
}

interface MirroringConfig {
    scale: Vec3
    tags: string[]
}

const mirrorConfigs = (settings: MirroredConfigProps["mirror"]): MirroringConfig[] => {
    if (settings.x) {
        const mirrorVec = new Vec3(-1, 1, 1)

        const regular = mirrorConfigs({
            ...settings,
            x: false,
        })
        return [
            ...(regular.map(({ scale, tags }) => ({
                scale,
                tags: [TAG_MIRRORED_AXIS_X_REGULAR, ...tags]
            }))),

            ...(regular.map(({ scale, tags }) => ({
                scale: new Vec3().copy(mirrorVec).mul(scale),
                tags: [TAG_MIRRORED_AXIS_X_MIRROR, ...tags]
            })))
        ]
    }
    else if (settings.y) {
        const mirrorVec = new Vec3(1, -1, 1)

        const regular = mirrorConfigs({
            ...settings,
            y: false,
        })
        return [
            ...(regular.map(({ scale, tags }) => ({
                scale,
                tags: [TAG_MIRRORED_AXIS_Y_REGULAR, ...tags]
            }))),

            ...(regular.map(({ scale, tags }) => ({
                scale: new Vec3().copy(mirrorVec).mul(scale),
                tags: [TAG_MIRRORED_AXIS_Y_MIRROR, ...tags]
            })))
        ]
    }
    else if (settings.z) {
        const mirrorVec = new Vec3(1, 1, -1)

        const regular = mirrorConfigs({
            ...settings,
            z: false,
        })
        return [
            ...(regular.map(({ scale, tags }) => ({
                scale,
                tags: [TAG_MIRRORED_AXIS_Z_REGULAR, ...tags]
            }))),

            ...(regular.map(({ scale, tags }) => ({
                scale: new Vec3().copy(mirrorVec).mul(scale),
                tags: [TAG_MIRRORED_AXIS_Z_MIRROR, ...tags]
            })))
        ]
    }
    else return [{
        tags: [],
        scale: Vec3.ONE
    }]
}