import Truss from '../Truss'

/**
 * @returns {number}
 * Returns how much the bridge costs
 */
export const cost = (truss: Truss): number => {
    const joints = truss.joints

    // const cost = truss.connections.reduce((acc, c) => {
    //     // acc += joints[c[0]].distanceTo(joints[c[1]]) * 15
    //     return acc
    // }, truss.size * 5)

    let cost = truss.size * 5
    for (let i = 0; i < truss.size; i++) {
        const a = joints[i]
        for (let j = i; j < truss.size; j++) {
            const b = joints[j]
            if (b.id in a.connections) {
                cost += a.distance(b) * 15
            }
        }
    }

    // cost += truss.size * 5
    return cost
}
