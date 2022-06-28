
import Truss from "../Truss"

export const efficiency = (truss: Truss): number => {
    let inefficiency = 0
    let max = 0
    let min = 1000000
    const joints = truss.joints
    for (let i = 0; i < joints.length; i++) {
        const from = joints[i]
        for (let j = i; j < truss.joints.length; j++) {
            const to = joints[j]
            
            const force = truss.getStress(from.id, to.id)
            if (force) {
                inefficiency += Math.abs(force)
                if (force > max) max = force
                if (force < min) min = force
            }
        }
    }


    return inefficiency * (max - min)
}