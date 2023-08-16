import { modelKeypoints, KeypointIDs } from "../../keypoints";
import { Serializer } from "./serializer";

export enum MessageType {
    /**
     * The next message data will be the {@link MessageType} of the following
     * message's data.
     */
    None = "",

    /**
     * The next message data would be the string ID for this client and the key
     * in {@link modelKeypoints} of the {@link KeypointIDs} used for this
     * client.
     */
    Init = "init",

    /**
     * The next message data would be 2D keypoints serialized with
     * {@link Serializer}.
     */
    Data = "data",

    /**
     * The next message data would be the string ID for the leader client
     * that this client will supply data for.
     */
    MakeSupplier = "make-supplier",
}