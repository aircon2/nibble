import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CodePuzzle as CodePuzzleData } from '@/data/lessons';
import { colors, fonts } from '@/theme';

type Slot = number | null;

type TileProps = {
  id: string;
  text: string;
  fromSlot: Slot;
  disabled: boolean;
  onTap: (id: string, fromSlot: Slot) => void;
  onDrop: (id: string, fromSlot: Slot, x: number, y: number) => void;
};

function CodeTile({ id, text, fromSlot, disabled, onTap, onDrop }: TileProps) {
  const [pan] = useState(() => new Animated.ValueXY());
  const [dragging, setDragging] = useState(false);
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: () => setDragging(true),
    onPanResponderMove: (_, gesture) => pan.setValue({ x: gesture.dx, y: gesture.dy }),
    onPanResponderRelease: (_, gesture) => {
      setDragging(false);
      pan.setValue({ x: 0, y: 0 });
      if (Math.abs(gesture.dx) + Math.abs(gesture.dy) < 8) onTap(id, fromSlot);
      else onDrop(id, fromSlot, gesture.moveX, gesture.moveY);
    },
    onPanResponderTerminate: () => {
      setDragging(false);
      pan.setValue({ x: 0, y: 0 });
    },
  }), [disabled, fromSlot, id, onDrop, onTap, pan]);

  return (
    <Animated.View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${text.trim().replace(/\s+/g, ' ')}. ${fromSlot === null ? 'Tap to add.' : 'Tap to remove.'}`}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event) => { if (event.nativeEvent.actionName === 'activate' && !disabled) onTap(id, fromSlot); }}
      style={[styles.tile, fromSlot === null ? styles.bankTile : styles.placedTile, dragging && styles.draggingTile, { transform: pan.getTranslateTransform() }]}
    >
      <Text style={styles.grip}>⠿</Text>
      <Text style={styles.tileText}>{text.trim()}</Text>
      <Text style={styles.tileAction}>{fromSlot === null ? '+' : '×'}</Text>
    </Animated.View>
  );
}

export function CodePuzzle({ puzzle, value, onChange, disabled = false }: {
  puzzle: CodePuzzleData;
  value: (string | null)[];
  onChange: (value: (string | null)[]) => void;
  disabled?: boolean;
}) {
  const slotRefs = useRef<(ComponentRef<typeof View> | null)[]>([]);

  function move(id: string, fromSlot: Slot, toSlot: Slot) {
    if (disabled || (fromSlot === null && toSlot === null)) return;
    const next = Array.from({ length: puzzle.solutionIds.length }, (_, i) => value[i] ?? null);
    if (fromSlot !== null && toSlot !== null) {
      [next[fromSlot], next[toSlot]] = [next[toSlot], next[fromSlot]];
    } else if (fromSlot !== null) {
      next[fromSlot] = null;
    } else if (toSlot !== null) {
      next[toSlot] = id;
    }
    onChange(next);
  }

  function tap(id: string, fromSlot: Slot) {
    const empty = Array.from({ length: puzzle.solutionIds.length }, (_, i) => value[i] ?? null).indexOf(null);
    move(id, fromSlot, fromSlot === null ? (empty < 0 ? null : empty) : null);
  }

  async function drop(id: string, fromSlot: Slot, x: number, y: number) {
    const bounds = await Promise.all(slotRefs.current.slice(0, puzzle.solutionIds.length).map((node) =>
      new Promise<{ x: number; y: number; width: number; height: number } | null>((resolve) => {
        if (!node) return resolve(null);
        node.measureInWindow((left, top, width, height) => resolve({ x: left, y: top, width, height }));
      })
    ));
    const destination = bounds.findIndex((rect) => rect && x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height);
    move(id, fromSlot, destination < 0 ? null : destination);
  }

  return (
    <View style={styles.root}>
      <Text style={styles.instruction}>Drag each line into a slot. Drag it out or tap it to undo.</Text>
      <View style={styles.editor}>
        <Text style={styles.fixedCode}>{puzzle.before}</Text>
        {puzzle.solutionIds.map((_, index) => {
          const id = value[index];
          const block = puzzle.blocks.find((candidate) => candidate.id === id);
          return (
            <View
              key={index}
              ref={(node) => { slotRefs.current[index] = node; }}
              collapsable={false}
              style={styles.slot}
            >
              {block ? (
                <CodeTile id={block.id} text={block.text} fromSlot={index} disabled={disabled} onTap={tap} onDrop={drop} />
              ) : (
                <Text style={styles.slotLabel}>{String(index + 1).padStart(2, '0')}  Drop a line here</Text>
              )}
            </View>
          );
        })}
        {puzzle.after && <Text style={styles.fixedCode}>{puzzle.after}</Text>}
      </View>
      <Text style={styles.bankLabel}>CODE LINES</Text>
      <View style={styles.bank}>
        {puzzle.blocks.filter((block) => !value.includes(block.id)).map((block) => (
          <CodeTile key={block.id} id={block.id} text={block.text} fromSlot={null} disabled={disabled} onTap={tap} onDrop={drop} />
        ))}
        {value.filter(Boolean).length === puzzle.blocks.length && <Text style={styles.bankEmpty}>All lines placed. Tap or drag a line out to change it.</Text>}
      </View>
      {value.some(Boolean) && !disabled && (
        <Pressable accessibilityRole="button" onPress={() => onChange([])} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear code</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: 12 },
  instruction: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted, marginBottom: 12 },
  editor: { backgroundColor: colors.ink, borderRadius: 17, padding: 14, gap: 8, overflow: 'visible' },
  fixedCode: { fontFamily: 'monospace', fontSize: 11, lineHeight: 17, color: '#F2EDE3' },
  slot: { minHeight: 45, justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#9FAD9B', borderRadius: 10, backgroundColor: '#486054', overflow: 'visible' },
  slotLabel: { fontFamily: 'monospace', fontSize: 11, color: '#D5DDCF', paddingHorizontal: 10 },
  tile: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 10, minHeight: 43, overflow: 'visible' },
  bankTile: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, marginBottom: 8 },
  placedTile: { backgroundColor: '#DDE7D5' },
  draggingTile: { zIndex: 100, elevation: 10, opacity: 0.9 },
  grip: { fontFamily: fonts.bold, fontSize: 18, color: colors.muted, marginRight: 8 },
  tileText: { flex: 1, fontFamily: 'monospace', fontSize: 11, lineHeight: 16, color: colors.ink },
  tileAction: { fontFamily: fonts.bold, fontSize: 18, color: colors.green, marginLeft: 6 },
  bankLabel: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.5, color: colors.muted, marginTop: 17, marginBottom: 9 },
  bank: { overflow: 'visible' },
  bankEmpty: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, paddingVertical: 7 },
  clearButton: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 3 },
  clearText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.green, textDecorationLine: 'underline' },
});
