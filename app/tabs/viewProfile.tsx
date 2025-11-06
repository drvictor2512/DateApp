import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { getUser, updateUser, User } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { IMAGE_FALLBACK } from '../../lib/config';

const PRIMARY_COLOR = '#00C2D1';
const SECONDARY_COLOR = '#5A6C7A';
const BORDER_COLOR = '#E5EAF0';

export default function ViewProfile() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: me, setUser } = useAuth();
  const [matchUser, setMatchUser] = useState<null | { id: string; name: string; image: string }>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        const u = await getUser(String(id));
        if (!mounted) return;
        setData(u);
        setLoading(false);
      } catch (e) {
        console.warn('Failed to load profile', e);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const paddingH = 16; const gap = 12;
  const tile = Math.floor((width - paddingH * 2 - gap * 2) / 3);
  const mainSize = tile * 2 + gap;
  const smallStyle = { width: tile, height: tile, borderRadius: 12 } as const;

  const avatar = data?.avatar || (data?.photos && data.photos[0]) || IMAGE_FALLBACK;
  const photos = (data?.photos || []).slice();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerIcon} />
      </View>

      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          {/* Photos grid (read-only) */}
          <View style={{ paddingHorizontal: paddingH }}>
            <View style={{ flexDirection: 'row', gap }}>
              <View style={{ width: mainSize }}>
                <View style={[styles.photoMain, { width: mainSize, height: mainSize }]}> 
                  <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                </View>
              </View>
              <View style={{ gap }}>
                {[0,1].map((i) => (
                  <View key={i} style={[styles.photoSlot, smallStyle]}>
                    {photos[i] ? (
                      <Image source={{ uri: photos[i] }} style={smallStyle} />
                    ) : (
                      <View style={[smallStyle, { backgroundColor: '#F2F6F9', alignItems:'center', justifyContent:'center' }]}>
                        <Ionicons name="image-outline" size={18} color={SECONDARY_COLOR} />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap, marginTop: gap }}>
              {[2,3,4].map((i, idx) => (
                <View key={i} style={[styles.photoSlot, smallStyle]}>
                  {photos[i] ? (
                    <>
                      <Image source={{ uri: photos[i] }} style={smallStyle} />
                      {idx === 2 && photos.length > 5 && (
                        <View style={styles.moreOverlay}><Text style={{ color: '#fff', fontWeight: '700' }}>{`+${photos.length - 5}`}</Text></View>
                      )}
                    </>
                  ) : (
                    <View style={[smallStyle, { backgroundColor: '#F2F6F9', alignItems:'center', justifyContent:'center' }]}>
                      <Ionicons name="image-outline" size={18} color={SECONDARY_COLOR} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Basic info */}
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>
              {data?.name ?? '—'}{data?.age ? `, ${data.age}` : ''}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Ionicons name="briefcase-outline" size={14} color={SECONDARY_COLOR} />
              <Text style={{ color: SECONDARY_COLOR }}>{data?.occupation || '—'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Ionicons name="location-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={{ color: '#111827' }}>{data?.location || '—'}</Text>
            </View>
          </View>

          {/* About me */}
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={styles.sectionTitle}>About me</Text>
            <Text style={{ color: SECONDARY_COLOR, lineHeight: 20 }}>{data?.bio || '—'}</Text>
          </View>

          {/* My details */}
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={styles.sectionTitle}>My details</Text>
            <View style={styles.detailsList}>
              {([
                { label: 'Gender & Pronouns', value: data ? (data.gender === 0 ? 'Female (she/her)' : 'Male (he/him)') : '—', icon: 'male-outline' },
                { label: 'Education', value: data?.education || '—', icon: 'school-outline' },
                { label: 'Height', value: data?.height ? `${data.height} cm` : '—', icon: 'ruler-outline' },
                { label: 'Smoking', value: data?.smoking || '—', icon: 'cafe-outline' },
                { label: 'Drinking', value: data?.drinking || '—', icon: 'wine-outline' },
                { label: 'Pets', value: data?.pets || '—', icon: 'paw-outline' },
                { label: 'Children', value: data?.children || '—', icon: 'people-outline' },
                { label: 'Zodiac sign', value: data?.zodiac || '—', icon: 'planet-outline' },
                { label: 'Religion', value: data?.religion || '—', icon: 'hand-left-outline' },
              ]).map((row) => (
                <View key={row.label} style={styles.detailRow}>
                  <View style={styles.detailLeft}><Ionicons name={row.icon as any} size={18} color={SECONDARY_COLOR} /><Text style={styles.detailLabel}>{row.label}</Text></View>
                  <View style={styles.detailRight}><Text style={styles.detailValue}>{row.value}</Text></View>
                </View>
              ))}
            </View>
          </View>

          {/* Interests */}
          {!!(data?.interests && data.interests.length) && (
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <Text style={styles.sectionTitle}>I enjoy</Text>
              <View style={styles.tagsWrap}>
                {data!.interests!.map((d) => (<Text key={d} style={styles.tag}>{d}</Text>))}
              </View>
            </View>
          )}

          {/* Languages */}
          {!!(data?.languages && data.languages.length) && (
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <Text style={styles.sectionTitle}>I communicate in</Text>
              <View style={styles.tagsWrap}>
                {data!.languages!.map((d) => (<Text key={d} style={styles.tag}>{d}</Text>))}
              </View>
            </View>
          )}
        </>
      )}

      {/* Bottom actions: dislike / like */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={[styles.circleBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.circleBtn, { backgroundColor: '#D1FAE5' }]}
          onPress={async () => {
            if (!me || !data) { router.back(); return }
            const current = Array.isArray(me.matches) ? me.matches : []
            if (!current.includes(data.id)) {
              const next = [...current, data.id]
              try {
                await updateUser(me.id, { matches: next })
                setUser({ ...me, matches: next })
              } catch (e) { console.warn('Failed to update matches', e) }
            }
            // Always show lightweight match modal (no mutual check)
            setMatchUser({ id: data.id, name: data.name, image: (data.photos && data.photos[0]) || data.avatar || IMAGE_FALLBACK })
          }}
        >
          <Ionicons name="checkmark" size={26} color="#10B981" />
        </TouchableOpacity>
      </View>
      {matchUser && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' }}>
            <View style={{ width: 88, height: 88, borderRadius: 44, overflow: 'hidden', marginBottom: 10 }}>
              <Image source={{ uri: matchUser.image }} style={{ width: '100%', height: '100%' }} />
            </View>
            <Ionicons name="heart" size={22} color={PRIMARY_COLOR} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 4 }}>New match found!</Text>
            <Text style={{ color: SECONDARY_COLOR, textAlign: 'center' }}>Bạn và {matchUser.name} đã thích nhau.</Text>
            <TouchableOpacity style={{ marginTop: 8, backgroundColor: PRIMARY_COLOR, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 }} onPress={() => { setMatchUser(null); router.replace('/tabs/chat' as any) }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Đi tới Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 8 }} onPress={() => setMatchUser(null)}>
              <Text style={{ color: SECONDARY_COLOR }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  headerRow: { paddingHorizontal: 16, marginTop: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F6F9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F2F6F9', color: SECONDARY_COLOR, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },

  // Details list (read-only)
  detailsList: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 16, overflow: 'hidden' },
  detailRow: { paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER_COLOR },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontSize: 14, color: '#111827' },
  detailRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailValue: { fontSize: 13, color: SECONDARY_COLOR },

  photoMain: { borderRadius: 12, backgroundColor: '#FFF5D8', borderWidth: 1, borderColor: BORDER_COLOR, overflow: 'hidden' },
  photoSlot: { borderRadius: 12, borderWidth: 1, borderColor: BORDER_COLOR, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  moreOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000066' },
  bottomActions: { paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-evenly' },
  circleBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
})


