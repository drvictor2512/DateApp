import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#00C2D1';
const SECONDARY_COLOR = '#5A6C7A';

const MOCK: Record<string, any> = {
  '1': { id: '1', name: 'Ava Jones', age: 25, verified: true, distanceKm: 2, city: 'Las Vegas, NV 89104', about: 'It would be wonderful to meet someone who appreciates the arts and enjoys exploring the vibrant culture of the city. I value open-mindedness, good communication, and a shared passion for classical music and fine arts. Also, mother of 2 cats ;)', details: ['5’6” (168 cm)', 'Non-smoker', 'Cat lover', 'Master degree', 'Want two', 'Occasionally', 'Virgo', 'Relationship/Friendship', 'No religious affiliation'], enjoys: ['Classical Music & Art', 'Thriller Films', 'Nature', 'Baking', 'Asian Food', 'Mathematics & Technology'], languages: ['English (Native)', 'Spanish (Fluent)', 'Tagalog (Verbal)', 'Mandarin Chinese (Verbal)'], images: ['https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=1200&q=80', 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1200&q=80', 'https://images.unsplash.com/photo-1520975922203-b9e6b9f7b1af?w=1200&q=80', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80'] },
  '2': { id: '2', name: 'Rae Smith', age: 27, verified: true, distanceKm: 4, city: 'Los Angeles, CA', about: 'Designer who loves coffee, galleries and weekend road trips. Looking to meet kind, curious people.', details: ['5’4” (162 cm)', 'Non-smoker', 'Dog lover'], enjoys: ['Illustration', 'Coffee brewing', 'Reading'], languages: ['English'], images: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80', 'https://images.unsplash.com/photo-1520975922203-b9e6b9f7b1af?w=1200&q=80'] },
  '3': { id: '3', name: 'Mia Brown', age: 24, verified: false, distanceKm: 7, city: 'Seattle, WA', about: 'Illustrator and nature lover. Weekend hikes and sketchbook always in backpack.', details: ['5’5” (165 cm)', 'Occasionally drinks'], enjoys: ['Hiking', 'Nature', 'Photography'], languages: ['English'], images: ['https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=1200&q=80'] },
}

export default function ViewProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = MOCK[id ?? '1'];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.replace('/tabs/heart')}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HeartSync</Text>
        <View style={styles.headerIcon} />
      </View>

      <View style={styles.heroWrapper}>
        <Image source={{ uri: data.images[0] }} style={styles.hero} />
        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>{data.name}, {data.age} {data.verified && <Ionicons name="shield-checkmark" size={14} color={PRIMARY_COLOR} />}</Text>
          <View style={styles.badgeRow}><Text style={styles.badge}>she/ her/ hers</Text></View>
          <View style={styles.jobRow}><Ionicons name="briefcase-outline" size={14} color="#fff" /><Text style={styles.jobText}>Business Analyst at Tech</Text></View>
        </View>
      </View>

      <View style={styles.locationCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="location-outline" size={16} color={PRIMARY_COLOR} />
          <Text style={{ color: '#111827' }}>{data.city}</Text>
        </View>
        <Text style={{ color: SECONDARY_COLOR }}>{data.distanceKm.toFixed(1)} kilometres away</Text>
      </View>

      <Text style={styles.sectionTitle}>About me</Text>
      <Text style={styles.sectionText}>{data.about}</Text>

      <Text style={styles.sectionTitle}>My details</Text>
      <View style={styles.tagsWrap}>
        {data.details.map((d: string) => (
          <Text key={d} style={styles.tag}>{d}</Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>I enjoy</Text>
      <View style={styles.tagsWrap}>
        {data.enjoys.map((d: string) => (
          <Text key={d} style={styles.tag}>{d}</Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>I communicate in</Text>
      <View style={styles.tagsWrap}>
        {data.languages.map((d: string) => (
          <Text key={d} style={styles.tag}>{d}</Text>
        ))}
      </View>

      <View style={styles.gallery}>
        {data.images.slice(1).map((img: string) => (
          <Image key={img} source={{ uri: img }} style={styles.galleryImg} />
        ))}
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={[styles.circleBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => router.replace('/tabs/heart')}>
          <Ionicons name="close" size={26} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.circleBtn, { backgroundColor: '#D1FAE5' }]} onPress={() => router.replace('/tabs/chat')}>
          <Ionicons name="checkmark" size={26} color="#10B981" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 16 },
  headerRow: { marginTop: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F6F9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  heroWrapper: { height: 360, borderRadius: 16, overflow: 'hidden', backgroundColor: '#00000010' },
  hero: { width: '100%', height: '100%' },
  heroInfo: { position: 'absolute', left: 16, bottom: 16, right: 16 },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800', textShadowColor: '#00000055', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  badge: { color: '#111827', fontSize: 12, backgroundColor: '#E6FFFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  jobRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8 },
  jobText: { color: '#fff', fontSize: 12 },
  locationCard: { backgroundColor: '#E6FFFB', borderRadius: 12, padding: 14, gap: 4, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 18, marginBottom: 8 },
  sectionText: { color: SECONDARY_COLOR, lineHeight: 20 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F2F6F9', color: SECONDARY_COLOR, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  gallery: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  galleryImg: { width: '32%', aspectRatio: 1, borderRadius: 10 },
  bottomActions: { paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-evenly' },
  circleBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
})


