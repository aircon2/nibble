import { Fragment, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

const nodes = [
  { label: 'A', x: 160, y: 25 },
  { label: 'B', x: 80, y: 80 }, { label: 'C', x: 240, y: 80 },
  { label: 'D', x: 40, y: 145 }, { label: 'E', x: 120, y: 145 },
  { label: 'F', x: 200, y: 145 }, { label: 'G', x: 280, y: 145 },
];
const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];

export function TreeDiagram({ order = [], onSelect, disabled = false }: { order?: string[]; onSelect?: (node: string) => void; disabled?: boolean }) {
  const [width, setWidth] = useState(280);
  const height = width * 180 / 320;
  return <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} accessibilityLabel="Binary tree: A is the root; B and C are its children; D and E are below B; F and G are below C." style={{ height }}>
    <Svg width="100%" height={height} viewBox="0 0 320 180" pointerEvents="none">
      {edges.map(([from, to]) => <Line key={`${from}-${to}`} x1={nodes[from].x} y1={nodes[from].y} x2={nodes[to].x} y2={nodes[to].y} stroke="#98AA91" strokeWidth={4} />)}
      {nodes.map((node) => {
        const step = order.indexOf(node.label);
        return <Fragment key={node.label}>
          <Circle cx={node.x} cy={node.y} r={22} fill={step >= 0 ? '#D3985D' : '#355B4D'} />
          <SvgText x={node.x} y={node.y + 6} textAnchor="middle" fill="#FFFFFF" fontSize={19} fontWeight="bold">{node.label}</SvgText>
          {step >= 0 && <>
            <Circle cx={node.x + 19} cy={node.y - 12} r={11} fill="#FFFDF8" stroke="#D3985D" strokeWidth={1.5} />
            <SvgText x={node.x + 19} y={node.y - 8} textAnchor="middle" fill="#355B4D" fontSize={11} fontWeight="bold">{step + 1}</SvgText>
          </>}
        </Fragment>;
      })}
    </Svg>
    {onSelect && nodes.map((node) => <Pressable
      key={node.label}
      accessibilityRole="button"
      accessibilityLabel={`Visit node ${node.label}`}
      accessibilityState={{ disabled: disabled || order.includes(node.label) }}
      disabled={disabled || order.includes(node.label)}
      onPress={() => onSelect(node.label)}
      style={{ position: 'absolute', left: node.x * width / 320 - 24, top: node.y * height / 180 - 24, width: 48, height: 48, borderRadius: 24 }}
    />)}
  </View>;
}
