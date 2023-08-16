import { BoxConfigProps, SphereConfigProps } from "../../../../entities"
import { LimbConfigProps } from "../../../../entities/organic"
import { material, MaterialProps } from "../../../../utils"
import { DNA as DNABase } from "../../../DNA"

export interface DNA extends DNABase {
    body: BoxConfigProps
    neck: BoxConfigProps
    head: SphereConfigProps
    arms: LimbConfigProps
    legs: LimbConfigProps

    materials: {
        skin: MaterialProps
        wetsuit: MaterialProps
    }
}