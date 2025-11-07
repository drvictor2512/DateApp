import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getUser, listUsers, updateUser, User } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { IMAGE_FALLBACK } from '../../lib/config'
import { emit as emitEvent } from '../../lib/events'
import { clearPrefs, getPrefs } from '../../lib/prefs'

const { width } = Dimensions.get('window')
const SWIPE_THRESHOLD = width * 0.25
const PRIMARY_COLOR = '#00C2D1'
const SECONDARY_COLOR = '#5A6C7A'

type CardProfile = {
  id: string
  name: string
  age: number
  job?: string
  pronouns?: string
  city?: string
  image: string
}

export default function Heart() {
  const router = useRouter()
  const { user: me, setUser } = useAuth()
  const [index, setIndex] = useState(0)
  const [profiles, setProfiles] = useState<CardProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [endRound, setEndRound] = useState(false)
  const [matchUser, setMatchUser] = useState<{ id: string; name: string; image: string } | null>(null)
  const positionX = useRef(new Animated.Value(0)).current
  const lastPrefsStr = useRef<string | null>(null)
  const likedMeIds = useRef<Set<string>>(new Set())

  const rotate = positionX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-15deg', '0deg', '15deg'],
  })

  const likeOpacity = positionX.interpolate({ inputRange: [0, width / 3], outputRange: [0, 1], extrapolate: 'clamp' })
  const nopeOpacity = positionX.interpolate({ inputRange: [-width / 3, 0], outputRange: [1, 0], extrapolate: 'clamp' })
  const nextScale = positionX.interpolate({ inputRange: [-width, 0, width], outputRange: [1, 0.96, 1], extrapolate: 'clamp' })
  const nextTranslateY = positionX.interpolate({ inputRange: [-width, 0, width], outputRange: [0, 10, 0], extrapolate: 'clamp' })

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !endRound && !matchUser,
        onMoveShouldSetPanResponder: (_, g) => !endRound && !matchUser && (Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 5),
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: Animated.event([null, { dx: positionX }], { useNativeDriver: false }),
        onPanResponderRelease: (_, { dx, vx }) => {
          const like = dx > SWIPE_THRESHOLD || vx > 0.8
          const nope = dx < -SWIPE_THRESHOLD || vx < -0.8
          const likedId = profiles[index]?.id
          if (like) {
            Animated.timing(positionX, { toValue: width * 1.2, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
              // advance card immediately, perform network update in background for snappy UX
              nextCard()
              if (likedId) { likeUser(likedId).catch((e) => console.warn('likeUser failed', e)) }
            })
          } else if (nope) {
            Animated.timing(positionX, { toValue: -width * 1.2, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => nextCard())
          } else {
            Animated.spring(positionX, { toValue: 0, useNativeDriver: true, friction: 7, tension: 90 }).start()
          }
        },
      }),
    [positionX, profiles, index, endRound, me?.id, (me?.matches || []).length, matchUser]
  )

  const nextCard = () => {
    positionX.setValue(0)
    setIndex((i) => {
      const len = Math.max(1, profiles.length)
      if (profiles.length > 0) {
        const next = (i + 1) % len
        if (next === 0) {
          setEndRound(true)
          return i // keep current index so overlay shows after last card
        }
        return next
      }
      return i
    })
  }

  async function refreshWithPrefs(prefs?: any) {
    try {
      const [users, p] = await Promise.all([listUsers(), prefs ? Promise.resolve(prefs) : getPrefs()])
      const meId = me?.id
      const myMatches = new Set(me?.matches || [])
      const eligibleRaw = users.filter((u) => {
        if (u.id === meId) return false
        if (myMatches.has(u.id)) return false
        return true
      })
      likedMeIds.current = new Set((users || []).filter((u) => (u.matches || []).includes(meId || '')).map((u) => u.id));
      const eligible = eligibleRaw.filter((u) => applyPrefs(u, p))
      const mapped: CardProfile[] = eligible.map((u) => ({
        id: u.id,
        name: u.name,
        age: u.age,
        job: u.occupation,
        pronouns: u.gender === 0 ? 'she/ her' : 'he/ him',
        city: u.location,
        image: (u.photos && u.photos[0]) || u.avatar || IMAGE_FALLBACK,
      }))
      setProfiles(mapped)
      setLoading(false)
      setIndex(0)
      lastPrefsStr.current = JSON.stringify(p)
    } catch (e) {
      console.warn('Failed to load users from MockAPI', e)
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshWithPrefs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id, (me?.matches || []).length])

  useFocusEffect(
    useCallback(() => {
      // On focus, reload only if prefs changed
      (async () => {
        try {
          const p = await getPrefs()
          const str = JSON.stringify(p)
          if (str !== lastPrefsStr.current) {
            refreshWithPrefs(p)
          }
        } catch { }
      })()
      // On blur, clear filters so that returning from other tabs resets
      return () => {
        clearPrefs().catch(() => { })
      }
    }, [me?.id])
  )

  function applyPrefs(u: User, prefs: { gender?: 0 | 1 | null; ageMin: number; ageMax: number; languages: string[] }) {
    if (prefs.gender === 0 || prefs.gender === 1) {
      if (u.gender !== prefs.gender) return false
    }
    if (typeof u.age === 'number') {
      if (u.age < prefs.ageMin || u.age > prefs.ageMax) return false
    }
    if (prefs.languages && prefs.languages.length) {
      const set = new Set((u.languages || []).map((s) => s.toLowerCase()))
      const ok = prefs.languages.some((l) => set.has(l.toLowerCase()))
      if (!ok) return false
    }
    return true
  }

  const likeUser = async (targetId: string) => {
    if (!me) return
    const current = Array.isArray(me.matches) ? me.matches : []
    if (current.includes(targetId)) return
    const next = [...current, targetId]
    try {
      await updateUser(me.id, { matches: next })
      const newMe = { ...me, matches: next } as any
      setUser(newMe)
      try { await AsyncStorage.setItem('auth_user', JSON.stringify(newMe)) } catch (e) { }
      try { emitEvent('matches:changed') } catch (e) { }
      // Always show a match modal (lightweight UX): no mutual check
      let info = profiles.find((p) => p.id === targetId)
      if (!info) {
        try {
          const u = await getUser(targetId)
          info = {
            id: u.id,
            name: u.name,
            age: u.age as any,
            image: (u.photos && u.photos[0]) || u.avatar || IMAGE_FALLBACK,
          } as any
        } catch { }
      }
      setMatchUser({ id: targetId, name: info?.name || '', image: (info as any)?.image || IMAGE_FALLBACK })
    } catch (e) {
      console.warn('Failed to update matches', e)
    }
  }

  const current = profiles[index]
  const next = profiles[(index + 1) % Math.max(1, profiles.length)]

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
      <View style={styles.progressBar}><View style={[
        styles.progressFill,
        { width: `${profiles.length ? (((index % profiles.length) + 1) / profiles.length) * 100 : 0}%` },
      ]} /></View>

      {/* Next card underneath for depth effect */}
      <View style={styles.cardStack}>
        {next && (
          <Animated.View style={[styles.card, styles.cardUnder, { transform: [{ scale: nextScale }, { translateY: nextTranslateY }] }]}>
            <Image source={{ uri: next.image }} style={styles.image} />
          </Animated.View>
        )}

        {/* Top interactive card */}
        {current ? (
          <Animated.View
            style={[styles.card, { transform: [{ translateX: positionX }, { rotate }] }]}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push({ pathname: '/tabs/viewProfile', params: { id: current.id, from: '/tabs/heart' } } as any)} style={{ flex: 1 }}>
              <Image source={{ uri: current.image }} style={styles.image} />

              {/* Text overlay info */}
              <View style={styles.infoOverlay}>
                <Text style={styles.nameText}>{current.name}, {current.age} <Ionicons name="shield-checkmark" size={14} color={PRIMARY_COLOR} /></Text>
                <View style={styles.badgeRow}>
                  {!!current.pronouns && <Text style={styles.badge}>{current.pronouns}</Text>}
                </View>
                <View style={styles.jobRow}>
                  <Ionicons name="briefcase-outline" size={14} color="#fff" />
                  <Text style={styles.jobText}>{current.job || '—'}</Text>
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
        ) : (
          <View style={[styles.card, styles.cardUnder, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#6B7280' }}>{loading ? 'Loading profiles…' : 'No profiles available'}</Text>
          </View>
        )}
      </View>

      {/* Bottom actions (optional tap helpers) */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => Animated.timing(positionX, { toValue: -width * 1.2, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => nextCard())} disabled={!current || endRound || !!matchUser}>
          <Ionicons name="close" size={28} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]} onPress={() => {
          const likedId = profiles[index]?.id
          Animated.timing(positionX, { toValue: width * 1.2, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
            // advance card immediately and perform network update in background
            nextCard()
            if (likedId) { likeUser(likedId).catch((e) => console.warn('likeUser failed', e)) }
          })
        }} disabled={!current || endRound || !!matchUser}>
          <Ionicons name="checkmark" size={28} color="#10B981" />
        </TouchableOpacity>
      </View>

      {endRound && (
        <View style={styles.endOverlay}>
          <View style={styles.endCard}>
            <Ionicons name="sparkles-outline" size={36} color={PRIMARY_COLOR} />
            <Text style={styles.endTitle}>Hết gợi ý</Text>
            <Text style={styles.endSubtitle}>Danh sách bạn có thể kết nối hiện đã hết. Nhấn Tiếp tục để xem lại từ đầu.</Text>
            <TouchableOpacity style={styles.endBtn} onPress={() => { setEndRound(false); setIndex(0); positionX.setValue(0) }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {matchUser && (
        <View style={styles.endOverlay}>
          <View style={styles.matchCard}>
            <View style={{ width: 88, height: 88, borderRadius: 44, overflow: 'hidden', marginBottom: 10 }}>
              <Image source={{ uri: matchUser.image }} style={{ width: '100%', height: '100%' }} />
            </View>
            <Ionicons name="heart" size={22} color={PRIMARY_COLOR} />
            <Text style={styles.endTitle}>New match found!</Text>
            <Text style={styles.endSubtitle}>Bạn và {matchUser.name} đã thích nhau.</Text>
            <TouchableOpacity style={styles.endBtn} onPress={() => { setMatchUser(null); router.replace('/tabs/chat' as any) }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Đi tới Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 8 }} onPress={() => setMatchUser(null)}>
              <Text style={{ color: SECONDARY_COLOR }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  endOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center', padding: 20 },
  endCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 10 },
  endTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 4 },
  endSubtitle: { color: SECONDARY_COLOR, textAlign: 'center' },
  endBtn: { marginTop: 8, backgroundColor: PRIMARY_COLOR, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  matchCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
})



