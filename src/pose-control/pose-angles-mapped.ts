import { EulerAngle } from "../math";

export type PoesAnglesMapped<T, NumberMapping, EulerAnglesMapping> =
    T extends number ? NumberMapping :
    T extends EulerAngle ? EulerAnglesMapping :
    { [K in keyof T]: PoesAnglesMapped<T[K], NumberMapping, EulerAnglesMapping> }

export type PoseAnglesMappedNumbers<T, NumberMapping> =
    PoesAnglesMapped<
            T,
            NumberMapping,
            {
                x: NumberMapping,
                y: NumberMapping,
                z: NumberMapping,
            }
        >