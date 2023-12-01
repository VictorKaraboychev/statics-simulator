import { MeshProps } from '@react-three/fiber'
import { PlaneBufferGeometry, ShaderMaterial, Color, DoubleSide } from 'three'

interface InfiniteGridHelperProps extends MeshProps {
	size1?: number,
	size2?: number,
	color?: Color,
	distance?: number,
	axes?: 'xzy' | 'xyz' | 'yxz' | 'yzx' | 'zxy' | 'zyx'
}

export const InfiniteGridHelper = (props: InfiniteGridHelperProps) => {
	let { size1, size2, color, distance, axes, ...mesh } = props

	const planeAxes = axes?.slice(0, 2) ?? 'xz'

	const geometry = new PlaneBufferGeometry(2, 2, 1, 1)

	const material = new ShaderMaterial({
		side: DoubleSide,
		uniforms: {
			uSize1: {
				value: size1 ?? 10
			},
			uSize2: {
				value: size2 ?? 100
			},
			uColor: {
				value: color ?? new Color('red')
			},
			uDistance: {
				value: distance ?? 8000
			}
		},
		transparent: true,
		vertexShader: `
			varying vec3 worldPosition;
			
			uniform float uDistance;
			
			void main() {
				vec3 pos = position.${axes ?? 'xzy'} * uDistance;
				pos.${planeAxes} += cameraPosition.${planeAxes};
				
				worldPosition = pos;
				
				gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
			}
        `,
		fragmentShader: `
			varying vec3 worldPosition;
			
			uniform float uSize1;
			uniform float uSize2;
			uniform vec3 uColor;
			uniform float uDistance;
            
            float getGrid(float size) {
                vec2 r = worldPosition.${planeAxes} / size;
                
                vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
                float line = min(grid.x, grid.y);
                
                return 1.0 - min(line, 1.0);
            }
            
           	void main() {
				float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
			
				float g1 = getGrid(uSize1);
				float g2 = getGrid(uSize2);
				
				gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
				gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
			
				if (gl_FragColor.a <= 0.0) discard;
           	}
        `,
		extensions: {
			derivatives: true
		}
	})
	
	return (
		<mesh
			geometry={geometry}
			material={material}
			frustumCulled={false}
			{...mesh}
		/>
	)
}
