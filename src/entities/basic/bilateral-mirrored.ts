import { Vec3 } from "playcanvas";
import { mergeTags } from "../../utils";
import { XYZArrowsWrapped } from "./arrow";
import { entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { EntityFactory, PackagedEntity, PackagedEntityFactory } from "./factory";
import { TAG_MIRRORED_AXIS_Y_MIRROR, TAG_MIRRORED_AXIS_Y_REGULAR } from "./mirrored";

export interface BilateralMirroredConfigProps<
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps,
        Factory extends EntityFactory<Config, Runtime> = EntityFactory<Config, Runtime>,
    > extends EntityConfigProps {
    pkg: PackagedEntityFactory<Config, Runtime, Factory>
}

export type BilateralMirroredRuntimeProps<Runtime extends EntityRuntimeProps = EntityRuntimeProps> = Runtime

export type BilateralMirroredProps<
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps,
        Factory extends EntityFactory<Config, Runtime> = EntityFactory<Config, Runtime>,
    > = EntityProps<
        BilateralMirroredConfigProps<Config, Runtime, Factory>,
        BilateralMirroredRuntimeProps
    >

export const BilateralMirrored = <
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps,
        Factory extends EntityFactory<Config, Runtime> = EntityFactory<Config, Runtime>,
    >(props: BilateralMirroredProps<Config, Runtime, Factory>) => {
    const root = (XYZArrowsWrapped(entity))(props)
    
    PackagedEntity(props.pkg, {
        tags: mergeTags(props.tags, [TAG_MIRRORED_AXIS_Y_REGULAR]),
        parent: root
    } as Partial<EntityRuntimeProps> as Partial<Runtime>)

    PackagedEntity(props.pkg, {
        tags: mergeTags(props.tags, [TAG_MIRRORED_AXIS_Y_MIRROR]),
        parent: root
    } as Partial<EntityRuntimeProps> as Partial<Runtime>)

    return props.parent
}