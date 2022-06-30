
import Truss from "../Truss"

export const efficiency = (truss: Truss): number => {
    let inefficiency = 0
    let max = 0
    let min = 1000000
    let close_one = 0
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

    inefficiency = inefficiency / joints.length

    //arbitrary number to be added to inefficiency that factors in 
    //the fact that the truss over shoots the max and min forces
    if (max > 1) close_one = 10 * (max - 1) 
    if (min < 0.9) close_one += 10 * (1 - min)

    return inefficiency * (max - min) + close_one
}