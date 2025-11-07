import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, PanResponder, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_PREFS, getPrefs, setPrefs } from '../../lib/prefs';

const PRIMARY_COLOR = '#00C2D1';
const SECONDARY_COLOR = '#5A6C7A';
const BORDER_COLOR = '#E5EAF0';

export default function Filter() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [gender, setGender] = useState<'Male' | 'Female'>('Female');

  const minAge = 18;
  const maxAge = 80;
  const [ageRange, setAgeRange] = useState<[number, number]>([24, 35]);

  const [distanceKm, setDistanceKm] = useState(10);
  const [expandRadius, setExpandRadius] = useState(true);

  const [trackWidth, setTrackWidth] = useState(300);
  const onTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(Math.max(220, Math.floor(e.nativeEvent.layout.width - 24)));

  const minX = useRef(new Animated.Value(0)).current;
  const maxX = useRef(new Animated.Value(0)).current;
  const minStart = useRef(0);
  const maxStart = useRef(0);

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const updateAgesFromPositions = (mx: number, Mx: number) => {
    const a = Math.round(minAge + (mx / trackWidth) * (maxAge - minAge));
    const b = Math.round(minAge + (Mx / trackWidth) * (maxAge - minAge));
    setAgeRange([Math.min(a, b), Math.max(a, b)]);
  };

  const minPan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => { // @ts-ignore
          minStart.current = minX._value || 0
        },
        onPanResponderMove: (_, g) => {
          const next = clamp(minStart.current + g.dx, 0, (maxX as any)._value);
          minX.setValue(next);
          updateAgesFromPositions(next, (maxX as any)._value);
        },
      }),
    []
  );

  const maxPan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => { // @ts-ignore
          maxStart.current = maxX._value || 0
        },
        onPanResponderMove: (_, g) => {
          const next = clamp(maxStart.current + g.dx, (minX as any)._value, trackWidth);
          maxX.setValue(next);
          updateAgesFromPositions((minX as any)._value, next);
        },
      }),
    []
  );

  const distX = useRef(new Animated.Value(0)).current;
  const distStart = useRef(0);
  const distPan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => { // @ts-ignore
          distStart.current = distX._value || 0
        },
        onPanResponderMove: (_, g) => {
          const next = clamp(distStart.current + g.dx, 0, trackWidth);
          distX.setValue(next);
          const km = Math.round((next / trackWidth) * 80);
          setDistanceKm(Math.max(1, km));
        },
      }),
    []
  );

  const [langOpen, setLangOpen] = useState(false);
  const [langs, setLangs] = useState<string[]>(['English', 'Spanish']);
  const allLangs = ['English', 'Spanish', 'Vietnamese', 'French', 'German'];
  const addLang = (l: string) => setLangs((prev) => (prev.includes(l) ? prev : [...prev, l]));
  const removeLang = (l: string) => setLangs((prev) => prev.filter((x) => x !== l));

  const clearAll = async () => {
    setGender('Female');
    setAgeRange([24, 35]);
    minX.setValue(((24 - minAge) / (maxAge - minAge)) * trackWidth);
    maxX.setValue(((35 - minAge) / (maxAge - minAge)) * trackWidth);
    setDistanceKm(10);
    distX.setValue((10 / 80) * trackWidth);
    setLangs([]);
    await setPrefs(DEFAULT_PREFS);
  };

  // Load existing preferences
  useEffect(() => {
    (async () => {
      const p = await getPrefs();
      setGender(p.gender === 0 ? 'Female' : p.gender === 1 ? 'Male' : 'Female');
      setAgeRange([p.ageMin, p.ageMax]);
      setDistanceKm(p.distanceKm ?? 10);
      setExpandRadius(!!p.expandRadius);
      setLangs(p.languages || []);
    })();
  }, []);

  // Sync knobs when trackWidth known
  useEffect(() => {
    minX.setValue(((ageRange[0] - minAge) / (maxAge - minAge)) * trackWidth);
    maxX.setValue(((ageRange[1] - minAge) / (maxAge - minAge)) * trackWidth);
    distX.setValue(((distanceKm) / 80) * trackWidth);
  }, [trackWidth]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.replace('/tabs/heart')}>
          <Ionicons name="close" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bộ lọc</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={styles.label}>Bạn ưu tiên giới tính nào?</Text>
        <View style={styles.box}>
          {(['Male', 'Female'] as const).map((g) => (
            <TouchableOpacity key={g} style={styles.row} onPress={() => setGender(g)}>
              <Text style={{ color: '#111827' }}>{g === 'Male' ? 'Nam' : 'Nữ'}</Text>
              <View style={[styles.radio, gender === g && styles.radioChecked]}>
                {gender === g && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Khoảng tuổi:</Text>
        <View style={styles.box}>
          <View style={styles.sliderHeader}><Text style={styles.mono}>{minAge}</Text><Text style={styles.mono}>{maxAge}</Text></View>
          <View style={styles.track} onLayout={onTrackLayout}>
            <Animated.View style={[styles.fill, { left: Animated.add(minX, new Animated.Value(14)), width: Animated.subtract(maxX, minX) }]} />
            <Animated.View style={[styles.knob, { transform: [{ translateX: minX }] }]} {...minPan.panHandlers} />
            <Animated.View style={[styles.knob, { transform: [{ translateX: maxX }] }]} {...maxPan.panHandlers} />
          </View>
          <Text style={styles.smallNote}>{ageRange[0]} - {ageRange[1]}</Text>
        </View>

        <Text style={styles.sectionTitle}>Khoảng cách:</Text>
        <View style={styles.box}>
          <View style={styles.sliderHeader}><Text style={styles.mono}>10 km</Text><Text style={styles.mono}>80 km</Text></View>
          <View style={styles.track} onLayout={onTrackLayout}>
            <Animated.View style={[styles.fill, { left: 14, width: distX }]} />
            <Animated.View style={[styles.knob, { transform: [{ translateX: distX }] }]} {...distPan.panHandlers} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Hiển thị hồ sơ trong phạm vi 15 km khi hết đề xuất.</Text>
            <Switch value={expandRadius} onValueChange={setExpandRadius} thumbColor="#fff" trackColor={{ true: PRIMARY_COLOR, false: '#D1D5DB' }} />
          </View>
          <Text style={styles.smallNote}>{distanceKm} km</Text>
        </View>

        <Text style={styles.sectionTitle}>Ngôn ngữ:</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setLangOpen((o) => !o)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="globe-outline" size={16} color={SECONDARY_COLOR} />
            <Text style={{ color: '#111827' }}>Chọn ngôn ngữ</Text>
          </View>
          <Ionicons name={langOpen ? 'chevron-up' : 'chevron-down'} size={16} color={SECONDARY_COLOR} />
        </TouchableOpacity>
        {langOpen && (
          <View style={styles.dropdown}>
            {allLangs.map((l) => (
              <TouchableOpacity key={l} style={styles.dropdownItem} onPress={() => addLang(l)}>
                <Text style={{ color: '#111827' }}>{l}</Text>
                <Ionicons name="add" size={18} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.tagsRow}>
          {langs.map((l) => (
            <View key={l} style={styles.tag}>
              <Text style={styles.tagText}>{l}</Text>
              <TouchableOpacity onPress={() => removeLang(l)}>
                <Ionicons name="close" size={14} color={SECONDARY_COLOR} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom - 20) }]}>
        <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
          <Text style={{ color: '#111827', fontWeight: '700' }}>Xóa tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={async () => {
          const prefs = {
            gender: gender === 'Female' ? 0 : gender === 'Male' ? 1 : null,
            ageMin: ageRange[0],
            ageMax: ageRange[1],
            distanceKm,
            expandRadius,
            languages: langs,
          } as const;
          await setPrefs(prefs as any);
          router.replace('/tabs/heart');
        }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Áp dụng bộ lọc</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { height: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  headerIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F6F9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  label: { color: PRIMARY_COLOR, fontWeight: '700', marginBottom: 6 },
  sectionTitle: { color: PRIMARY_COLOR, fontWeight: '700', marginTop: 18, marginBottom: 6 },
  box: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  row: { paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BORDER_COLOR },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mono: { color: '#5A6C7A' },
  track: { height: 36, alignSelf: 'stretch', borderRadius: 18, backgroundColor: '#E6F3F6', justifyContent: 'center', paddingHorizontal: 12 },
  fill: { position: 'absolute', height: 6, backgroundColor: PRIMARY_COLOR, borderRadius: 3, top: 15 },
  knob: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: PRIMARY_COLOR },
  smallNote: { textAlign: 'right', color: '#5A6C7A', marginTop: 6 },

  selectBox: { height: 44, borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdown: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, marginTop: 8 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BORDER_COLOR },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F2F6F9', flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagText: { fontSize: 12, color: '#5A6C7A' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: BORDER_COLOR },
  clearBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  applyBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: PRIMARY_COLOR, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: BORDER_COLOR, alignItems: 'center', justifyContent: 'center' },
  radioChecked: { borderColor: PRIMARY_COLOR },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: PRIMARY_COLOR },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  switchText: { color: '#5A6C7A', flexShrink: 1, paddingRight: 12 },
});


