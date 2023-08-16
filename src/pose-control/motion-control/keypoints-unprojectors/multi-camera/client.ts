import { Keypoint } from "@tensorflow-models/pose-detection";
import { KeypointIDs, modelKeypoints } from "../../keypoints";
import { MessageType } from "./message-types";
import { Serializer } from "./serializer";

export class Client {
    private serializer: Serializer
    private ws: WebSocket
    private openerCBs?: {
        resolve(): void
        reject(reason?: any): void
    }
    
    public readonly suppliersData: {
        [id: string]: (Keypoint & {
            lastUpdate: EpochTimeStamp
        })[]
    } = {}

    constructor(
            public readonly id: string,
            public readonly serverUrl: string,
            public readonly keypointIDsType: keyof KeypointIDs
        ) {
        this.serializer = new Serializer(id, (modelKeypoints as any)[keypointIDsType])

        this.ws = new WebSocket(serverUrl)
        this.ws.binaryType = "arraybuffer"
        this.ws.addEventListener('open', () => {
            this.ws.send(MessageType.Init)
            this.ws.send(`${this.id},${this.keypointIDsType}`)
            this.openerCBs?.resolve()
        })
        this.ws.addEventListener('message', msg => {
            const { id: supplierID, keypoints: newKeypoints } = this.serializer.deserialize(msg.data as ArrayBuffer)
            const supplierKeypoints = this.suppliersData[supplierID]

            const now = new Date().getTime()

            newKeypoints.forEach(keypoint => {
                const item = {
                    ...keypoint,
                    lastUpdate: now
                }

                const index = supplierKeypoints.findIndex(keypoint2 => keypoint.name === keypoint2.name)
                if (index === -1)
                    supplierKeypoints.push(item)
                else supplierKeypoints[index] = item
            })

            for (let i = 0; i < supplierKeypoints.length; i++)
                if ((supplierKeypoints[i].lastUpdate - now) > 1000)
                    supplierKeypoints.splice(i--, 1)
        })
    }
    
    supplyData(keypoints: Keypoint[]) {
        this.ws.send(this.serializer.serialize(keypoints))
    }
}