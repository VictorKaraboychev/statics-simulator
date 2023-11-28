import React, { useEffect, useState } from 'react'
import { BackSide, BoxGeometry, BufferGeometry, Color, MeshBasicMaterial, SphereGeometry, Vector2, Vector3 } from 'three'
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
	view?: string,
	hoverSelected?: React.MutableRefObject<boolean>,
	selectedJoints?: Set<string>,
	selectedConnections?: Set<string>,
	scale: Vector3,
	position?: Vector3,
	enableForces?: boolean,
	onJointClick?: (e: ThreeEvent<MouseEvent>, id: string, details: TrussJointDetailsType) => void,
	onConnectionClick?: (e: ThreeEvent<MouseEvent>, id: string, details: TrussConnectionDetailsType) => void,
}

const TrussModel = (props: TrussModelProps) => {
	const { palette } = useTheme()

	const truss = props.truss

	const scale = props.scale.clone()
	const scale2D = new Vector2(scale.x, scale.y)
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
			position={props.position ? props.position.multiply(scale) : undefined}
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

						const aPos = a.position.clone().multiply(scale2D)
						const bPos = b.position.clone().multiply(scale2D)

						const selected = props.selectedConnections?.has(connection.id)

						const utilization = Math.min(Math.abs(connection.utilization), 1)

						const stressType = (props.view === 'stress' || connection.failure) ? connection.stressType : 'neutral'
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
											linewidth: 0.25 * utilization + 0.1,
											worldUnits: true,
										}),
									)}
								/>
								<primitive
									object={new Line2(
										new LineGeometry().setPositions([
											...aPos.toArray(),
											-0.05,
											...bPos.toArray(),
											-0.05,
										]),
										new LineMaterial({
											color: new Color(palette.primary.main).getHex(),
											linewidth: 0.25 * utilization + 0.25,
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

						let geometry: { main: BufferGeometry, selected: BufferGeometry } = { main: new SphereGeometry(0.25, 16, 16), selected: new SphereGeometry(0.325, 16, 16) }

						if (joint.fixed) {
							geometry = { main: new BoxGeometry(0.5, 0.5, 0.5), selected: new BoxGeometry(0.65, 0.65, 0.65) }
						}

						const selected = props.selectedJoints?.has(joint.id)

						return (
							<group
								key={joint.id}
								position={new Vector3(p.x, p.y, 0.5).multiply(scale)}
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
									material={new MeshBasicMaterial({
										color: joint.fixed ? '#555555' : '#aaaaaa',
									})}
								/>
								{selected && (
									<mesh
										geometry={geometry.selected}
										material={new MeshBasicMaterial({
											color: palette.primary.main,
											side: BackSide,
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
						if (Math.floor(Math.abs(joint.force.x) * 100) > 0 || Math.floor(Math.abs(joint.force.y) * 100) > 0) {
							acc.push(
								<Force
									key={joint.id}
									force={joint.force}
									origin={joint.position.clone().multiply(scale2D)}
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