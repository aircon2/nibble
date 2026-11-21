import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { mascotXml } from './mascotXml';

export function Mascot({ size = 112, waveOnPress = false, celebrate = false }: {
  size?: number;
  waveOnPress?: boolean;
  celebrate?: boolean;
}) {
  const [angle, setAngle] = useState(0);
  const [waving, setWaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wave = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setWaving(true);
    [-18, 12, -22, 10, -12, 0].forEach((nextAngle, index, sequence) => {
      timers.current.push(setTimeout(() => {
        setAngle(nextAngle);
        if (index === sequence.length - 1) setWaving(false);
      }, index * 110));
    });
  }, []);

  useEffect(() => {
    if (!celebrate) return;
    const timer = setTimeout(wave, 250);
    return () => clearTimeout(timer);
  }, [celebrate, wave]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const xml = useMemo(
    () => mascotXml.replace('<g id="waving-paw">', `<g id="waving-paw" transform="rotate(${angle} 20 28)">`),
    [angle],
  );
  const content = <>
    <SvgXml xml={xml} width={size} height={size} />
    {waving && <Text style={{ position: 'absolute', top: 0, left: 0, fontSize: size * 0.2, color: '#F3B942' }}>✦</Text>}
    {waving && <Text style={{ position: 'absolute', top: size * 0.1, right: 0, fontSize: size * 0.15, color: '#F3B942' }}>✦</Text>}
  </>;

  if (waveOnPress) {
    return <Pressable onPress={wave} accessibilityLabel="Wave at Nibble the beaver" accessibilityRole="button" style={{ width: size, height: size }}>{content}</Pressable>;
  }
  return <View accessibilityLabel="Nibble the beaver" accessibilityRole="image" style={{ width: size, height: size }}>{content}</View>;
}
