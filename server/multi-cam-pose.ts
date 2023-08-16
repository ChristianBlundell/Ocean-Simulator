import * as fs from 'fs'
import { MultiCamServer } from '../src/pose-control/motion-control/keypoints-unprojectors/multi-camera/server'

const PORT = 3000
const HOST = 'localhost'
const PATH = 'multi-cam-pose'

const server = new MultiCamServer(
    PORT,
    HOST,
    PATH,
    {
        key: fs.readFileSync("cert.key"),
        cert: fs.readFileSync("cert.crt"),
        ca: fs.readFileSync("ca.crt"),
    }
)

server.start()