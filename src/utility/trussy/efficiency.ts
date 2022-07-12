
import { TrussConstraintsType } from "../../types/truss"
import Truss from "../Truss"

export const efficiency = (truss: Truss, constraints: TrussConstraintsType): number => {
    // let max = 0
    // let min = 1000000
    // let close_one = 0
    let inefficiency = 0
    const joints = truss.joints
    const connections = truss.connections

    let max = 0

    for (let i = 0; i < connections.length; i++) {
        const [a, b] = connections[i]
        const stress = truss.getStress(joints[a].id, joints[b].id, constraints)
        max = Math.max(stress, max)
    }

    // const { maxCompression, maxTension } = truss.getMaxForces()

    // let inefficiency = truss.connections.reduce((acc, [a, b]) => {
    //     const stress = truss.getStress(joints[a].id, joints[b].id, constraints)

    //     acc += Math.abs(stress)
    //     // if (force) {
    //     //     acc += Math.abs(force)
    //     //     if (force > max) max = force
    //     //     if (force < min) min = force
    //     // }
    //     return acc
    // }, 0)

    // inefficiency = inefficiency / joints.length

    // //arbitrary number to be added to inefficiency that factors in 
    // //the fact that the truss over shoots the max and min forces
    // if (max > 1) close_one = 10 * (max - 1)
    // if (min < 0.9) close_one += 10 * (1 - min)

    return inefficiency
}