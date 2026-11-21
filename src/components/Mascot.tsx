import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { mascotXml } from './mascotXml';

export function Mascot({ size = 112 }: { size?: number }) {
  return (
    <View accessibilityLabel="Nibble the beaver" accessibilityRole="image" style={{ width: size, height: size }}>
      <SvgXml xml={mascotXml} width={size} height={size} />
    </View>
  );
}
