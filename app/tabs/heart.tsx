import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window')
const SWIPE_THRESHOLD = width * 0.25
const PRIMARY_COLOR = '#00C2D1'
const SECONDARY_COLOR = '#5A6C7A'

// Mock profiles used for the swipe deck
const PROFILES = [
  {
    id: '1',
    name: 'Ava Jones',
    age: 25,
    job: 'Business Analyst at Tech',
    pronouns: 'she/ her/ hers',
    city: 'Las Vegas, NV 89104',
    distanceKm: 2,
    image: 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800&q=80',
  },
  {
    id: '2',
    name: 'Rae Smith',
    age: 27,
    job: 'Product Designer',
    pronouns: 'she/ her',
    city: 'Los Angeles, CA',
    distanceKm: 4,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
  },
  {
    id: '3',
    name: 'Mia Brown',
    age: 24,
    job: 'Illustrator',
    pronouns: 'she/ her',
    city: 'Seattle, WA',
    distanceKm: 7,
    image: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=800&q=80',
  },
]

export default function Heart() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const position = useRef(new Animated.ValueXY()).current

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-15deg', '0deg', '15deg'],
  })

  // Overlay opacity for like/dislike indicators
  const likeOpacity = position.x.interpolate({ inputRange: [0, width / 3], outputRange: [0, 1], extrapolate: 'clamp' })
  const nopeOpacity = position.x.interpolate({ inputRange: [-width / 3, 0], outputRange: [1, 0], extrapolate: 'clamp' })

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
        onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
        onPanResponderRelease: (_, { dx }) => {
          if (dx > SWIPE_THRESHOLD) {
            Animated.timing(position, { toValue: { x: width * 1.2, y: 0 }, duration: 200, useNativeDriver: true }).start(() => nextCard())
          } else if (dx < -SWIPE_THRESHOLD) {
            Animated.timing(position, { toValue: { x: -width * 1.2, y: 0 }, duration: 200, useNativeDriver: true }).start(() => nextCard())
          } else {
            Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start()
          }
        },
      }),
    [position]
  )

  const nextCard = () => {
    position.setValue({ x: 0, y: 0 })
    setIndex((i) => (i + 1) % PROFILES.length)
  }

  const current = PROFILES[index]
  const next = PROFILES[(index + 1) % PROFILES.length]

  return (
    <View style={styles.screen}>
      {/* Header with menu, title and filter */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu" size={22} color="#1F2A37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HeartSync</Text>
        <TouchableOpacity style={[styles.headerIcon, { backgroundColor: '#DFF8FB' }]} onPress={() => router.push('/tabs/filter')}>
          <Ionicons name="options-outline" size={18} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      {/* Progress bar mimic under header */}
      <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${((index % PROFILES.length) + 1) / PROFILES.length * 100}%` }]} /></View>

      {/* Next card underneath for depth effect */}
      <View style={styles.cardStack}>
        <View style={[styles.card, styles.cardUnder]}> 
          <Image source={{ uri: next.image }} style={styles.image} />
        </View>

        {/* Top interactive card */}
        <Animated.View
          style={[styles.card, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/tabs/viewProfile?id=${current.id}`)} style={{ flex: 1 }}>
            <Image source={{ uri: current.image }} style={styles.image} />

            {/* Text overlay info */}
            <View style={styles.infoOverlay}>
              <Text style={styles.nameText}>{current.name}, {current.age} <Ionicons name="shield-checkmark" size={14} color={PRIMARY_COLOR} /></Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>{current.pronouns}</Text>
              </View>
              <View style={styles.jobRow}>
                <Ionicons name="briefcase-outline" size={14} color="#fff" />
                <Text style={styles.jobText}>{current.job}</Text>
              </View>
            </View>

            {/* Like / Nope indicators (bottom center) */}
            <Animated.View style={[styles.badgeBottom, { opacity: likeOpacity }]}>
              <Ionicons name="checkmark-circle" size={84} color="#2DD4BF" />
            </Animated.View>
            <Animated.View style={[styles.badgeBottom, { opacity: nopeOpacity }]}>
              <Ionicons name="close-circle" size={84} color="#F87171" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom actions (optional tap helpers) */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => Animated.timing(position, { toValue: { x: -width * 1.2, y: 0 }, duration: 200, useNativeDriver: true }).start(nextCard)}>
          <Ionicons name="close" size={28} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]} onPress={() => Animated.timing(position, { toValue: { x: width * 1.2, y: 0 }, duration: 200, useNativeDriver: true }).start(nextCard)}>
          <Ionicons name="checkmark" size={28} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  headerIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F6F9' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  progressBar: { height: 4, backgroundColor: '#E6F3F6', borderRadius: 2, marginTop: 6, marginBottom: 14 },
  progressFill: { height: 4, backgroundColor: PRIMARY_COLOR, borderRadius: 2 },
  cardStack: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { position: 'absolute', width: '100%', height: '82%', borderRadius: 16, overflow: 'hidden', backgroundColor: '#00000010' },
  cardUnder: { transform: [{ scale: 0.96 }, { translateY: 10 }] },
  image: { width: '100%', height: '100%' },
  infoOverlay: { position: 'absolute', left: 16, bottom: 16, right: 16 },
  nameText: { color: '#fff', fontSize: 22, fontWeight: '800', textShadowColor: '#00000055', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  badge: { color: '#111827', fontSize: 12, backgroundColor: '#E6FFFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  jobRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8 },
  jobText: { color: '#fff', fontSize: 12 },
  badgeBottom: { position: 'absolute', left: 0, right: 0, bottom: 80, alignItems: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: 10 },
  actionBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
})