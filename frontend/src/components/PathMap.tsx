import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { lessons } from '@/data/lessons';
import { colors, fonts } from '@/theme';
import { Mascot } from './Mascot';

export type PathTheme = 'forest' | 'mountain' | 'beach' | 'solid';

const route = 'M 192 47 C 185 98 112 99 101 182 C 83 277 273 280 288 395 C 302 493 112 505 101 610 C 92 699 184 727 196 788';
const SECTION_HEIGHT = 740;
const stopPattern = [
  { x: 101, y: 182, cardX: 151 },
  { x: 288, y: 395, cardX: 20 },
  { x: 101, y: 610, cardX: 151 },
];
const symbols: Record<string, string> = {
  'two-sum': '＋', 'valid-parentheses': '{ }', 'tree-traversals': '♧',
  'longest-substring': '▣', 'merge-sorted-arrays': '↔', 'binary-search': '⌕',
  'maximum-subarray': '◇', 'three-sum': '＋', 'trapping-rain-water': '☂',
  'minimum-window-substring': '▣', 'validate-bst': '♧',
  'binary-tree-max-path': '♧', 'edit-distance': '◇',
};
const stops = lessons.map((_, index) => ({
  ...stopPattern[index % 3],
  y: stopPattern[index % 3].y + Math.floor(index / 3) * SECTION_HEIGHT,
}));

function travelPoints(index: number) {
  const section = Math.floor(index / 3) * SECTION_HEIGHT;
  if (index % 3 === 0) return [
    { x: 101, y: 182 + section }, { x: 105, y: 235 + section }, { x: 170, y: 275 + section },
    { x: 255, y: 330 + section }, { x: 288, y: 395 + section },
  ];
  if (index % 3 === 1) return [
    { x: 288, y: 395 + section }, { x: 280, y: 455 + section }, { x: 210, y: 495 + section },
    { x: 125, y: 550 + section }, { x: 101, y: 610 + section },
  ];
  return [
    { x: 101, y: 610 + section }, { x: 105, y: 680 + section }, { x: 160, y: 740 + section },
    { x: 196, y: 788 + section }, { x: 185, y: 838 + section }, { x: 115, y: 875 + section },
    { x: 101, y: 922 + section },
  ];
}

const palette = {
  forest: { base: '#DFEBD8', road: '#F7E8CB', border: '#D8C9A7', ink: '#355B4D' },
  mountain: { base: '#DFEAF1', road: '#F8F1DE', border: '#C8D2CC', ink: '#46627B' },
  beach: { base: '#F9E9CF', road: '#FFF4D8', border: '#DFC9A4', ink: '#8B6A42' },
  solid: { base: '#EFE8DB', road: '#FBF7ED', border: '#D6C9B7', ink: '#5B564E' },
} as const;

function Pine({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <G transform={`translate(${x} ${y}) scale(${scale})`}>
    <Rect x={-3} y={18} width={6} height={13} fill="#7A6149" />
    <Path d="M 0 -18 L -16 10 L -9 10 L -20 24 L 20 24 L 9 10 L 16 10 Z" fill="#638C68" />
    <Path d="M 0 -18 L -16 10 L -9 10 L -20 24 L 0 24 Z" fill="#4F795C" opacity={0.65} />
  </G>;
}

function Cloud({ x, y }: { x: number; y: number }) {
  return <G fill="#FFFFFF" opacity={0.7}>
    <Ellipse cx={x} cy={y} rx={24} ry={9} />
    <Circle cx={x - 9} cy={y - 6} r={9} />
    <Circle cx={x + 6} cy={y - 8} r={11} />
  </G>;
}

function Scenery({ theme }: { theme: PathTheme }) {
  if (theme === 'solid') return null;
  if (theme === 'forest') return <>
    <Path d="M0 85 C70 20 130 95 195 55 C270 11 335 52 390 12 L390 810 L0 810 Z" fill="#CFE2C6" />
    <Path d="M0 290 C85 224 160 302 241 258 C310 220 359 245 390 225 L390 810 L0 810 Z" fill="#B9D4B4" opacity={0.55} />
    <Path d="M0 585 C91 528 158 610 250 557 C310 523 357 558 390 531 L390 810 L0 810 Z" fill="#A9CAA9" opacity={0.45} />
    <Cloud x={63} y={67} /><Cloud x={315} y={112} />
    <Pine x={37} y={120} scale={1.1} /><Pine x={345} y={90} scale={1.3} />
    <Pine x={346} y={261} scale={0.9} /><Pine x={44} y={346} scale={1.3} />
    <Pine x={340} y={510} scale={1.2} /><Pine x={48} y={554} scale={0.85} />
    <Pine x={345} y={698} scale={1.1} /><Pine x={45} y={747} scale={1.2} />
    {[70, 255, 333, 542, 680, 746].map((y, i) => <G key={y}>
      <Circle cx={i % 2 ? 358 : 31} cy={y} r={5} fill="#F6D7A4" />
      <Circle cx={i % 2 ? 369 : 43} cy={y + 10} r={3} fill="#FFF7DA" />
    </G>)}
  </>;
  if (theme === 'mountain') return <>
    <Circle cx={326} cy={78} r={34} fill="#F7E9B6" />
    <Cloud x={75} y={88} /><Cloud x={291} y={206} />
    <Path d="M-30 251 L71 91 L157 225 L236 83 L343 249 L418 154 L418 810 L-30 810 Z" fill="#A9C2D0" />
    <Path d="M36 148 L71 91 L108 150 L86 137 L72 146 L56 137 Z M206 126 L236 83 L267 131 L250 124 L239 132 L225 121 Z" fill="#F8FAF6" />
    <Path d="M-20 360 L61 242 L150 346 L238 212 L349 364 L410 285 L410 810 L-20 810 Z" fill="#89A9BA" opacity={0.7} />
    <Path d="M0 588 C72 527 149 562 203 524 C291 464 354 520 390 472 L390 810 L0 810 Z" fill="#7F9FAD" opacity={0.4} />
    <Pine x={28} y={440} scale={0.9} /><Pine x={357} y={340} scale={0.85} />
    <Pine x={349} y={626} scale={1.1} /><Pine x={34} y={711} scale={0.95} />
  </>;
  return <>
    <Circle cx={320} cy={91} r={42} fill="#F7D592" />
    <Path d="M0 145 C94 127 150 171 230 148 C304 128 352 150 390 136 L390 810 L0 810 Z" fill="#F5DDB5" />
    <Path d="M0 272 C84 252 146 288 221 270 C291 254 345 274 390 252 L390 810 L0 810 Z" fill="#E8CC9D" opacity={0.7} />
    <Path d="M0 496 C93 463 142 492 215 469 C297 442 350 476 390 457 L390 810 L0 810 Z" fill="#7FC2C8" />
    <Path d="M0 518 C80 489 154 525 224 497 C301 475 350 503 390 485 M0 555 C75 529 151 554 227 535 C294 516 357 544 390 527 M0 590 C88 565 153 601 224 575 C301 552 354 581 390 566" stroke="#E9F6F0" strokeWidth={8} fill="none" opacity={0.8} />
    <Path d="M0 691 C94 650 144 694 223 667 C294 644 353 684 390 662 L390 810 L0 810 Z" fill="#F1D6A8" />
    {[{ x: 43, y: 357, s: 1 }, { x: 349, y: 738, s: 0.75 }].map(({ x, y, s }) => <G key={x} transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 60 Q13 9 3 -19" stroke="#9A7951" strokeWidth={9} fill="none" />
      <Path d="M3 -19 Q-29 -37 -43 -17 M3 -19 Q28 -43 47 -20 M3 -19 Q-22 -14 -36 5 M3 -19 Q27 -17 36 8" stroke="#5C976E" strokeWidth={10} strokeLinecap="round" fill="none" />
    </G>)}
    <Circle cx={347} cy={322} r={5} fill="#EFAE95" /><Circle cx={40} cy={690} r={4} fill="#EFAE95" />
  </>;
}

export function PathMap({ theme, completedLessons, animateFrom }: {
  theme: PathTheme;
  completedLessons: string[];
  animateFrom?: string;
}) {
  const [width, setWidth] = useState(342);
  const [travel] = useState(() => new Animated.Value(0));
  const mapScroll = useRef<ScrollViewInstance>(null);
  const measuredWidth = useRef(342);
  const positionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { height: screenHeight } = useWindowDimensions();
  const [travelDone, setTravelDone] = useState(false);
  const scale = width / 390;
  const paint = palette[theme];
  const journeyLessons = [
    ...completedLessons.map((id) => lessons.find((lesson) => lesson.id === id)).filter((lesson): lesson is (typeof lessons)[number] => Boolean(lesson)),
    ...lessons.filter((lesson) => !completedLessons.includes(lesson.id)),
  ];
  const completedCount = journeyLessons.filter((lesson) => completedLessons.includes(lesson.id)).length;
  const currentIndex = Math.min(completedCount, lessons.length - 1);
  const mascotStop = completedCount === 0 ? { x: 192, y: 47 } : stops[currentIndex];
  const visibleCount = Math.min(lessons.length, Math.max(3, completedCount + 3));
  const sectionCount = Math.ceil(visibleCount / 3);
  const mapHeight = 810 + SECTION_HEIGHT * (sectionCount - 1);
  const fromIndex = journeyLessons.findIndex((lesson) => lesson.id === animateFrom);
  const shouldTravel = fromIndex === completedCount - 1 && completedCount < lessons.length && completedLessons.includes(animateFrom ?? '');
  const points = shouldTravel ? travelPoints(fromIndex) : null;
  const windowHeight = Math.max(580, Math.min(720, screenHeight * 0.82));
  const positionAtCurrentStop = (nextWidth: number) => {
    if (positionTimer.current) clearTimeout(positionTimer.current);
    const stopY = shouldTravel ? stops[fromIndex].y : mascotStop.y;
    positionTimer.current = setTimeout(() => mapScroll.current?.scrollTo({ y: Math.max(0, (stopY - 150) * nextWidth / 390), animated: false }), 180);
  };

  useEffect(() => {
    if (!shouldTravel) return;
    const travelTimer = setTimeout(() => {
      Animated.timing(travel, { toValue: 1, duration: 1600, useNativeDriver: false }).start(({ finished }) => {
        if (finished) {
          setTravelDone(true);
          mapScroll.current?.scrollTo({ y: Math.max(0, (mascotStop.y - 150) * scale), animated: true });
        }
      });
    }, 650);
    return () => { clearTimeout(travelTimer); travel.stopAnimation(); };
  }, [shouldTravel, travel, scale, mascotStop.y, fromIndex]);

  const mascotLeft = points && !travelDone
    ? travel.interpolate({ inputRange: points.map((_, index) => index / (points.length - 1)), outputRange: points.map((point) => (point.x - 44) * scale) })
    : (mascotStop.x - 44) * scale;
  const mascotTop = points && !travelDone
    ? travel.interpolate({ inputRange: points.map((_, index) => index / (points.length - 1)), outputRange: points.map((point) => (point.y - 75) * scale) })
    : completedCount === 0 ? 0 : (mascotStop.y - 75) * scale;

  return <ScrollView ref={mapScroll} nestedScrollEnabled directionalLockEnabled scrollEventThrottle={16} showsVerticalScrollIndicator={false} onLayout={(event) => {
    measuredWidth.current = event.nativeEvent.layout.width;
    setWidth(measuredWidth.current);
    positionAtCurrentStop(measuredWidth.current);
  }} onContentSizeChange={() => positionAtCurrentStop(measuredWidth.current)} style={[styles.map, { height: windowHeight, backgroundColor: paint.base }]} contentContainerStyle={{ height: mapHeight * scale }}>
    <View style={{ width: '100%', height: mapHeight * scale }}>
    <Svg width="100%" height="100%" viewBox={`0 0 390 ${mapHeight}`} style={StyleSheet.absoluteFill}>
      {Array.from({ length: sectionCount }, (_, section) => <G key={section} transform={`translate(0 ${section * SECTION_HEIGHT})`}>
        <Scenery theme={theme} />
        <Path d={route} stroke={paint.border} strokeWidth={43} strokeLinecap="round" fill="none" />
        <Path d={route} stroke={paint.road} strokeWidth={35} strokeLinecap="round" fill="none" />
        <Path d={route} stroke="#FFFFFF" strokeWidth={2} strokeDasharray="5 13" strokeLinecap="round" fill="none" opacity={0.8} />
      </G>)}
      <Circle cx={196} cy={mapHeight - 30} r={24} fill={paint.road} stroke={paint.border} strokeWidth={5} />
      <Path d={`M196 ${mapHeight - 45} L200 ${mapHeight - 35} L211 ${mapHeight - 35} L202 ${mapHeight - 29} L205 ${mapHeight - 19} L196 ${mapHeight - 25} L187 ${mapHeight - 19} L190 ${mapHeight - 29} L181 ${mapHeight - 35} L192 ${mapHeight - 35} Z`} fill="#D7AD64" />
    </Svg>

    <Animated.View style={[styles.startMascot, { left: mascotLeft, top: mascotTop }]}><Mascot size={66 * scale} waveOnPress /></Animated.View>
    {completedCount === 0 && <View style={[styles.startSign, { left: 211 * scale, top: 35 * scale }]}><Text style={[styles.signText, { color: paint.ink }]}>START</Text></View>}

    {journeyLessons.slice(0, visibleCount).map((lesson, index) => {
      const stop = stops[index];
      const done = completedLessons.includes(lesson.id);
      const current = index === currentIndex;
      const origin = stop.cardX === 20 ? 18 : 66;
      return <Pressable
        key={lesson.id}
        accessibilityRole="button"
        accessibilityLabel={`${lesson.title}, LeetCode ${lesson.leetcode}, ${done ? 'completed' : current ? 'next lesson' : 'practice lesson'}`}
        onPress={() => router.push({ pathname: '/lesson', params: { lesson: lesson.id } })}
        style={[styles.stopArea, { top: (stop.y - 51) * scale, left: origin * scale, width: 310 * scale, height: 108 * scale }]}
      >
        <View style={[styles.marker, { left: (stop.x - origin - 34) * scale, top: 17 * scale, width: 68 * scale, height: 68 * scale, borderRadius: 34 * scale, backgroundColor: done ? colors.green : colors.white, borderColor: current ? '#D3985D' : paint.ink, borderWidth: current ? 4 : 3 }]}>
          <Text style={[styles.markerSymbol, { color: done ? colors.white : paint.ink, fontSize: (index === 1 ? 22 : 31) * scale }]}>{done ? '✓' : symbols[lesson.id] ?? '◆'}</Text>
        </View>
        <View style={[styles.lessonCard, { left: (stop.cardX - origin) * scale, width: 215 * scale, borderColor: current ? '#D3985D' : '#FFFFFF' }]}>
          <Text style={[styles.cardKicker, { color: paint.ink }]}>{done ? 'COMPLETED' : current ? 'UP NEXT' : `LESSON ${lesson.number}`}</Text>
          <Text numberOfLines={1} style={styles.cardTitle}>{lesson.title}</Text>
          <Text numberOfLines={1} style={styles.cardMeta}>{lesson.pattern} · {lesson.difficulty}</Text>
          <Text style={styles.cardArrow}>{done ? '↻' : '→'}</Text>
        </View>
      </Pressable>;
    })}
    <View style={[styles.finishLabel, { top: (mapHeight - 35) * scale, left: 222 * scale }]}><Text style={[styles.finishText, { color: paint.ink }]}>KEEP GOING!</Text></View>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  map: { width: '100%', marginTop: 20, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  startMascot: { position: 'absolute', zIndex: 2 },
  startSign: { position: 'absolute', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  signText: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.5 },
  stopArea: { position: 'absolute' },
  marker: { position: 'absolute', alignItems: 'center', justifyContent: 'center', shadowColor: '#342B20', shadowOpacity: 0.18, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  markerSymbol: { fontFamily: fonts.bold, lineHeight: 38 },
  lessonCard: { position: 'absolute', top: 6, minHeight: 92, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255,253,248,0.96)', borderRadius: 17, borderWidth: 2, shadowColor: '#342B20', shadowOpacity: 0.12, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardKicker: { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.65 },
  cardTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, marginTop: 4, paddingRight: 12 },
  cardMeta: { fontFamily: fonts.medium, fontSize: 10, color: colors.muted, marginTop: 3, paddingRight: 12 },
  cardArrow: { position: 'absolute', right: 11, bottom: 8, fontFamily: fonts.bold, fontSize: 18, color: colors.green },
  finishLabel: { position: 'absolute', backgroundColor: colors.white, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  finishText: { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.4 },
});
