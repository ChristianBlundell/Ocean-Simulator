import { CreatureKind as CreatureKindBase } from "../../../creature"
import { Kind } from "./constants"
import { DNA } from "./DNA"
import { Factory } from "./factory"
import * as seed from './seed'

export const CreatureKind: CreatureKindBase<typeof Kind, DNA> = {
    name: Kind,
    defaultController: undefined,
    factory: Factory,
    seedGenePool: [seed.DiverA]
    
    //TODO: test if this is safe
    // seedGenePool: Object.values(seed)
}