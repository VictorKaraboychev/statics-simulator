import React, { useEffect, useState } from 'react'
import { BackSide, BoxGeometry, BufferGeometry, Color, MeshPhongMaterial, RingGeometry, SphereGeometry, TorusGeometry, Vector3 } from 'three'
import Truss from '../../utility/truss/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import Force from './Force'
import { ThreeEvent } from '@react-three/fiber'
import { TrussConnectionDetailsType, TrussJointDetailsType } from '../../types/truss'
import { TRUSS_COLORS } from '../../config/TrussConfig'
import { useTheme } from '@mui/material'

interface TrussModelProps {
	truss: Truss,
	scale: number,
	view?: string,
	hoverSelected?: React.MutableRefObject<boolean>,
	selectedJoints?: Set<string>,
	selectedConnections?: Set<string>,
	position?: Vector3,
	enableForces?: boolean,
	onJointClick?: (e: ThreeEvent<MouseEvent>, id: string, details: TrussJointDetailsType) => void,
	onConnectionClick?: (e: ThreeEvent<MouseEvent>, id: string, details: TrussConnectionDetailsType) => void,
}

const TrussModel = (props: TrussModelProps) => {
	const { palette } = useTheme()

	const truss = props.truss

	const scale = props.scale
	const joints = truss.joints

	const [hovered, setHovered] = useState(false)

	useEffect(() => {
		document.body.style.cursor = hovered ? 'pointer' : 'auto'

		return () => {
			document.body.style.cursor = 'auto'
		}
	}, [hovered])

	const handleHoverSelected = (hover: boolean) => {
		if (props.hoverSelected) {
			props.hoverSelected.current = hover
		}
	}

	return (
		<group
			position={props.position ? props.position.multiplyScalar(scale) : undefined}
		>
			<group
				onPointerOver={() => setHovered(true)}
				onPointerOut={() => setHovered(false)}
			>
				<group
					position={[0, 0, -2]}
				>
					{truss.connections.map(([aIndex, bIndex, connection]) => {
						const a = joints[aIndex]
						const b = joints[bIndex]

						const aPos = a.position.clone().multiplyScalar(scale)
						const bPos = b.position.clone().multiplyScalar(scale)

						const selected = props.selectedConnections?.has(connection.id)

						const utilization = connection.utilization

						const stressType = connection.failure ? connection.stressType : 'neutral'
						const color = new Color(TRUSS_COLORS[stressType] ?? 0x000000)

						return (
							<group
								key={connection.id}
								position={[0, 0, selected ? 1 : 0]}
								onClick={(e) => props.onConnectionClick?.(
									e,
									connection.id,
									{
										id: `${aIndex}-${bIndex}`,
										length: a.distanceTo(b),
										angle: a.angleTo(b),
										connection: connection,
										a,
										b,
									}
								)}
								onPointerOver={() => selected && handleHoverSelected(true)}
								onPointerOut={() => selected && handleHoverSelected(false)}
							>
								<primitive
									object={new Line2(
										new LineGeometry().setPositions([
											...aPos.toArray(),
											0,
											...bPos.toArray(),
											0,
										]),
										new LineMaterial({
											color: color.getHex(),
											linewidth: 5 * Math.min(Math.abs(utilization), 1) + 1,
											worldUnits: true,
										}),
									)}
								/>
								<primitive
									object={new Line2(
										new LineGeometry().setPositions([
											...aPos.toArray(),
											-0.5,
											...bPos.toArray(),
											-0.5,
										]),
										new LineMaterial({
											color: new Color(palette.primary.main).getHex(),
											linewidth: 5 * Math.min(Math.abs(utilization), 1) + 4,
											transparent: true,
											opacity: selected ? 1 : 0,
											worldUnits: true,
										}),
									)}
								/>
							</group>
						)
					})}
				</group>
				<group>
					{joints.map((joint, i) => {
						const p = joint.position.clone()

						let geometry: { main: BufferGeometry, selected: BufferGeometry } = { main: new SphereGeometry(5, 16, 16), selected: new SphereGeometry(6.5, 16, 16) }

						if (joint.fixed) {
							geometry = { main: new BoxGeometry(10, 10, 10), selected: new BoxGeometry(13, 13, 13) }
						}

						// geometry = { main: new TorusGeometry(3.5, 2, 20, 16), selected: new SphereGeometry(6.5, 16, 16) }

						const selected = props.selectedJoints?.has(joint.id)

						return (
							<group
								key={joint.id}
								position={new Vector3(p.x, p.y, 0.5).multiplyScalar(scale)}
								rotation={[0, 0, (joint.fixtures.x ? !joint.fixtures.y : joint.fixtures.y) ? Math.PI / 4 : 0]}
								onClick={(e) => props.onJointClick?.(
									e,
									joint.id,
									{
										id: i,
										joint: joints[i],
									}
								)}
								onPointerOver={() => selected && handleHoverSelected(true)}
								onPointerOut={() => selected && handleHoverSelected(false)}
							>
								<mesh
									geometry={geometry.main}
									material={new MeshPhongMaterial({
										color: joint.fixed ? '#999999' : '#ffffff',
									})}
								/>
								{selected && (
									<mesh
										geometry={geometry.selected}
										material={new MeshPhongMaterial({
											color: palette.primary.main,
											side: BackSide,
											emissive: palette.primary.main,
										})}
									/>
								)}
							</group>

						)
					})}
				</group>
			</group>
			{props.enableForces && (
				<group>
					{joints.reduce((acc, joint) => {
						if (Math.floor(Math.abs(joint.externalForce.x) * 100) > 0 || Math.floor(Math.abs(joint.externalForce.y) * 100) > 0) {
							acc.push(
								<Force
									key={joint.id}
									force={joint.externalForce}
									origin={joint.position.clone().multiplyScalar(scale)}
								/>
							)
						}

						return acc
					}, [] as React.ReactNode[])}
				</group>
			)}
		</group>
	)
}

export default TrussModel