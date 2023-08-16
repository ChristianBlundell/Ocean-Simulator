import { Keypoint } from "@tensorflow-models/pose-detection";
import * as _ from "underscore";
import { KeypointIDs, KeypointName } from "../../keypoints";

const BYTES_PER_KEYPOINT = (1 * Int8Array.BYTES_PER_ELEMENT) + ((2 + 1) * Float64Array.BYTES_PER_ELEMENT)

export class Serializer {
    private readonly keypointsInverse: { [keypointID: number]: KeypointName }
    private readonly idBuffer: Buffer

    constructor(
        public readonly id: string,
        public readonly keypointIDs: KeypointIDs
    ) {
        this.keypointsInverse = _.invert(keypointIDs)
        this.idBuffer = Buffer.from(this.id)

        console.assert(this.idBuffer.byteLength < 256, 'id must encode into a buffer with a length that can fit into a uint8')
    }

    serialize(keypoints: Keypoint[]): ArrayBuffer {
        const buffer = Buffer.alloc(1 + this.idBuffer.byteLength + keypoints.length * BYTES_PER_KEYPOINT)
        
        buffer[0] = new Uint8Array([this.idBuffer.length])[0]
        this.idBuffer.copy(buffer, 1, 0, this.idBuffer.byteLength)

        const IDs = new Int8Array(buffer, 1 + this.idBuffer.byteLength, keypoints.length)
        const positions = new Float64Array(buffer, IDs.byteOffset + IDs.byteLength, 2 * keypoints.length)
        const scores = new Float64Array(buffer, positions.byteOffset + positions.byteLength, keypoints.length)

        keypoints.forEach((keypoint, i) => {
            IDs[i] = (this.keypointIDs as any)[keypoint.name!]
            positions[(2 * i) + 0] = keypoint.x
            positions[(2 * i) + 1] = keypoint.y
            scores[i] = keypoint.score ?? NaN
        })

        return buffer
    }

    deserialize(buffer: ArrayBuffer): { id: string, keypoints: Keypoint[] } {
        const idBuffer = Buffer.from(buffer, 1, new Uint8Array(buffer, 0, 1)[0])
        const id = idBuffer.toString()

        const keypoints: Keypoint[] = new Array((buffer.byteLength - (idBuffer.byteLength + 1)) / BYTES_PER_KEYPOINT)

        const IDs = new Int8Array(buffer, idBuffer.byteOffset + idBuffer.byteLength, keypoints.length)
        const positions = new Float64Array(buffer, IDs.byteOffset + IDs.byteLength, 2 * keypoints.length)
        const scores = new Float64Array(buffer, positions.byteOffset + positions.byteLength, keypoints.length)

        for (let i = 0; i < keypoints.length; i++) {
            keypoints[i] = {
                name: this.keypointsInverse[IDs[i]],
                x: positions[(2 * i) + 0],
                y: positions[(2 * i) + 1],
                score: isNaN(scores[i]) ? undefined : scores[i]
            }
        }

        return { id, keypoints }
    }
}