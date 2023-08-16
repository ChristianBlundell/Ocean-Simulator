import { createServer, Server, ServerOptions } from 'https'
import * as _ from 'underscore'
import { WebSocketServer, WebSocket } from 'ws'
import { MessageType } from './message-types'
import { KeypointIDs, modelKeypoints } from '../../keypoints'

export class MultiCamServer {
    private server: Server
    private groups: {
        [id: string]: {
            ws: WebSocket
            IDs: KeypointIDs
        }
    } = {}

    constructor(
        public readonly PORT: number,
        public readonly HOST: string,
        public readonly PATH: string,
        public readonly otherServerOptions: ServerOptions
    ) {
        this.server = createServer(otherServerOptions)

        const wss = new WebSocketServer({
            server: this.server,
            path: PATH,
            host: HOST,
        })

        wss.on('connection', ws => this.handleConnection(ws))
    }

    start() {
        this.server.listen(this.PORT, this.HOST)
        console.log(`Started server on wss://${this.HOST}:${this.PORT}/${this.PATH}`)
    }

    private handleConnection(ws: WebSocket) {
        let isInited = false
        let id: string | undefined
        let group: typeof this.groups[number] | undefined
        let isSupplyingGroup = false

        let nextMsgType: MessageType = MessageType.None

        ws.on('message', (msg, isBinaryData) => {
            const msgStr = msg as unknown as string

            switch (nextMsgType) {
                case MessageType.None:
                    nextMsgType = msgStr as MessageType

                    if (![MessageType.Init, MessageType.MakeSupplier, MessageType.Data].includes(nextMsgType)) {
                        console.warn(`unrecognized message type from client ${id}: ${nextMsgType}`)
                        nextMsgType = MessageType.None
                    }

                    break

                case MessageType.Init:
                    let IDs_type: string
                    [id, IDs_type] = msgStr.split(',')

                    const IDs = modelKeypoints[IDs_type as keyof typeof modelKeypoints]

                    group = this.groups[id] = { ws, IDs }
                    isSupplyingGroup = false
                    isInited = true
                    break
                
                case MessageType.MakeSupplier:
                    if (!isInited) {
                        console.error(`client ${id!} sent msg but it needs to be init'd first`)
                        break
                    }
                    
                    const groupID = msgStr as string

                    if (!_.isEqual(this.groups[groupID], group!.IDs)) {
                        ws.close()
                        console.error(`client ${id!} tried to join group to supply client ${groupID} but mismatched keypoint IDs`)
                    }
                    
                    group = this.groups[groupID]
                    isSupplyingGroup = true
                    delete this.groups[id!]

                    break
                
                case MessageType.Data:
                    if (!isInited) {
                        console.error(`client ${id!} sent msg but it needs to be init'd first`)
                        break
                    }

                    if (isSupplyingGroup) {
                        console.assert(isBinaryData)
                        group!.ws.send(MessageType.Data)
                        group!.ws.send(msg, { binary: true })
                    }
                    else {
                        console.warn(`did not expect to receive keypoints from leader client in group ${id}`)
                    }
                    break
            }
        })
    }
}