import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#00C2D1';
const SECONDARY_COLOR = '#5A6C7A';
const BORDER_COLOR = '#E5EAF0';
const LIGHT_BACKGROUND = '#F2F6F9';

export default function MyProfile() {
  const router = useRouter();
  const [aboutMe, setAboutMe] = useState('');
  const aboutInputRef = useRef<TextInput>(null);

  const [interestOpen, setInterestOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Coffee brewing', 'Trekking']);
  const interestOptions = useMemo(() => ['Sci-fi movies', 'Cooking', 'Hiking', 'Photography', 'Reading'], []);

  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Finnish']);
  const languageOptions = useMemo(() => ['English', 'Vietnamese', 'Spanish', 'French', 'German'], []);

  const addInterest = (v: string) => { setSelectedInterests((p) => (p.includes(v) ? p : [...p, v])); setInterestOpen(false); };
  const removeInterest = (v: string) => setSelectedInterests((p) => p.filter((i) => i !== v));
  const addLanguage = (v: string) => { setSelectedLanguages((p) => (p.includes(v) ? p : [...p, v])); setLanguageOpen(false); };
  const removeLanguage = (v: string) => setSelectedLanguages((p) => p.filter((i) => i !== v));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={styles.headerIcon} />
      </View>

      <View style={styles.progressWrapper}>
        <Text style={styles.progressLabel}>Profile completion: <Text style={{ color: PRIMARY_COLOR, fontWeight: '700' }}>45%</Text></Text>
        <View style={styles.progressBarTrack}><View style={styles.progressBarFill} /></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.sectionSub}>The main photo is how you appear to others on the swipe view.</Text>
        <View style={styles.photosGrid}>
          <View style={styles.photoMain} />
          <View style={styles.photoSlot}><Ionicons name="add" size={24} color={SECONDARY_COLOR} /></View>
          <View style={styles.photoSlot}><Ionicons name="add" size={24} color={SECONDARY_COLOR} /></View>
          <View style={styles.photoSlot}><Ionicons name="add" size={24} color={SECONDARY_COLOR} /></View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About me</Text>
        <Text style={styles.sectionSub}>Make it easy for others to get a sense of who you are.</Text>
        <TouchableOpacity activeOpacity={0.9} onPress={() => aboutInputRef.current?.focus()} style={styles.textAreaPlaceholder}>
          <TextInput ref={aboutInputRef} value={aboutMe} onChangeText={setAboutMe} placeholder={"Share a few words about yourself, your interests, and what you're looking for in a connection..."} multiline textAlignVertical="top" style={styles.textAreaInput} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My details</Text>
        <View style={styles.detailsList}>
          {[
            { label: 'Occupation', value: 'Add', icon: 'briefcase-outline' },
            { label: 'Gender & Pronouns', value: 'Male', icon: 'male-outline' },
            { label: 'Education', value: 'Add', icon: 'school-outline' },
            { label: 'Location', value: 'NV 89104', icon: 'location-outline' },
          ].map((row) => (
            <TouchableOpacity key={row.label} style={styles.detailRow}>
              <View style={styles.detailLeft}><Ionicons name={row.icon as any} size={18} color={SECONDARY_COLOR} /><Text style={styles.detailLabel}>{row.label}</Text></View>
              <View style={styles.detailRight}><Text style={styles.detailValue}>{row.value}</Text><Ionicons name="chevron-forward" size={16} color={SECONDARY_COLOR} /></View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 10 }} />
          {[
            { label: 'Height', value: 'Add', icon: 'ruler-outline' },
            { label: 'Smoking', value: 'Add', icon: 'cafe-outline' },
            { label: 'Drinking', value: 'Add', icon: 'wine-outline' },
            { label: 'Pets', value: 'Add', icon: 'paw-outline' },
            { label: 'Children', value: 'Add', icon: 'people-outline' },
            { label: 'Zodiac sign', value: 'Add', icon: 'planet-outline' },
            { label: 'Religion', value: 'Add', icon: 'hand-left-outline' },
          ].map((row) => (
            <TouchableOpacity key={row.label} style={styles.detailRow}>
              <View style={styles.detailLeft}><Ionicons name={row.icon as any} size={18} color={SECONDARY_COLOR} /><Text style={styles.detailLabel}>{row.label}</Text></View>
              <View style={styles.detailRight}><Text style={styles.detailValue}>{row.value}</Text><Ionicons name="chevron-forward" size={16} color={SECONDARY_COLOR} /></View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I enjoy</Text>
        <Text style={styles.sectionSub}>Adding your interest is a great way to find like-minded connections.</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setInterestOpen((o) => !o)}>
          <Text style={styles.selectText}>Choose an interest</Text>
          <Ionicons name={interestOpen ? 'chevron-up' : 'chevron-down'} size={16} color={SECONDARY_COLOR} />
        </TouchableOpacity>
        {interestOpen && (
          <View style={styles.dropdownPanel}>
            {interestOptions.map((opt) => (
              <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => addInterest(opt)}>
                <Text style={styles.dropdownText}>{opt}</Text>
                <Ionicons name="add" size={18} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.tagRow}>
          {selectedInterests.map((t) => (
            <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text><TouchableOpacity onPress={() => removeInterest(t)}><Ionicons name="close" size={14} color={SECONDARY_COLOR} /></TouchableOpacity></View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I communicate in</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setLanguageOpen((o) => !o)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="globe-outline" size={16} color={SECONDARY_COLOR} /><Text style={styles.selectText}>Choose a language</Text></View>
          <Ionicons name={languageOpen ? 'chevron-up' : 'chevron-down'} size={16} color={SECONDARY_COLOR} />
        </TouchableOpacity>
        {languageOpen && (
          <View style={styles.dropdownPanel}>
            {languageOptions.map((opt) => (
              <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => addLanguage(opt)}>
                <Text style={styles.dropdownText}>{opt}</Text>
                <Ionicons name="add" size={18} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.tagRow}>
          {selectedLanguages.map((t) => (
            <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text><TouchableOpacity onPress={() => removeLanguage(t)}><Ionicons name="close" size={14} color={SECONDARY_COLOR} /></TouchableOpacity></View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Linked accounts</Text>
        {[
          { label: 'Instagram', icon: 'logo-instagram' },
          { label: 'Facebook', icon: 'logo-facebook' },
          { label: 'Twitter', icon: 'logo-twitter' },
        ].map((row) => (
          <TouchableOpacity key={row.label} style={styles.accountRow}>
            <View style={styles.detailLeft}><Ionicons name={row.icon as any} size={18} color={SECONDARY_COLOR} /><Text style={styles.detailLabel}>{row.label}</Text></View>
            <View style={styles.detailRight}><Text style={styles.detailValue}>Add</Text><Ionicons name="chevron-forward" size={16} color={SECONDARY_COLOR} /></View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { marginTop: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: LIGHT_BACKGROUND },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  progressWrapper: { marginTop: 8, marginBottom: 18 },
  progressLabel: { fontSize: 13, color: SECONDARY_COLOR, marginBottom: 8 },
  progressBarTrack: { height: 8, borderRadius: 8, backgroundColor: '#E6F3F6' },
  progressBarFill: { width: '45%', height: 8, borderRadius: 8, backgroundColor: PRIMARY_COLOR },
  section: { paddingVertical: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  sectionSub: { fontSize: 12, color: SECONDARY_COLOR, marginBottom: 10 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoMain: { width: 180, height: 200, borderRadius: 12, backgroundColor: '#FFF5D8', borderWidth: 1, borderColor: BORDER_COLOR },
  photoSlot: { width: 90, height: 95, borderRadius: 12, borderWidth: 1, borderColor: BORDER_COLOR, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  textAreaPlaceholder: { height: 120, borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, padding: 12, backgroundColor: '#FFFFFF' },
  textAreaInput: { flex: 1, fontSize: 13, color: '#111827' },
  detailsList: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 16, overflow: 'hidden' },
  detailRow: { paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER_COLOR },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontSize: 14, color: '#111827' },
  detailRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailValue: { fontSize: 13, color: SECONDARY_COLOR },
  selectBox: { height: 44, borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 14, color: '#111827' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: LIGHT_BACKGROUND },
  tagText: { fontSize: 12, color: SECONDARY_COLOR, marginRight: 6 },
  accountRow: { paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, backgroundColor: '#FFFFFF', marginTop: 10 },
  dropdownPanel: { marginTop: 8, borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BORDER_COLOR },
  dropdownText: { fontSize: 14, color: '#111827' },
});



