import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { useAuth } from '../../lib/auth';
import { updateUser, type User } from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../lib/cloudinary';
import { IMAGE_FALLBACK, CLOUDINARY } from '../../lib/config';

const PRIMARY_COLOR = '#00C2D1';
const SECONDARY_COLOR = '#5A6C7A';
const BORDER_COLOR = '#E5EAF0';
const LIGHT_BACKGROUND = '#F2F6F9';

export default function MyProfile() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { width } = useWindowDimensions();
  const [aboutMe, setAboutMe] = useState('');
  const aboutInputRef = useRef<TextInput>(null);

  const [interestOpen, setInterestOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Coffee brewing', 'Trekking']);
  const interestOptions = useMemo(
    () => [
      'Cooking', 'Hiking', 'Photography', 'Reading', 'Gaming', 'Yoga', 'Travel', 'Music', 'Dancing', 'Movies',
      'Coffee', 'Baking', 'Art', 'Running', 'Cycling', 'Board games', 'Karaoke', 'Coding', 'Meditation', 'Volunteering', 'Pets', 'Football', 'Basketball'
    ],
    []
  );

  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Finnish']);
  const languageOptions = useMemo(
    () => ['Vietnamese', 'English', 'French', 'German', 'Spanish', 'Italian', 'Japanese', 'Korean', 'Chinese', 'Thai', 'Russian', 'Portuguese'],
    []
  );

  const savePatch = async (patch: Partial<User>) => {
    if (!user) return;
    try {
      await updateUser(user.id, patch);
      setUser({ ...(user as any), ...(patch as any) });
    } catch (e) {
      console.warn('Failed to persist user update', e);
    }
  };

  const addInterest = (v: string) => {
    setSelectedInterests((p) => {
      if (p.includes(v)) return p;
      const next = [...p, v];
      savePatch({ interests: next });
      return next;
    });
    setInterestOpen(false);
  };
  const removeInterest = (v: string) => setSelectedInterests((p) => { const next = p.filter((i) => i !== v); savePatch({ interests: next }); return next; });
  const addLanguage = (v: string) => {
    setSelectedLanguages((p) => {
      if (p.includes(v)) return p;
      const next = [...p, v];
      savePatch({ languages: next });
      return next;
    });
    setLanguageOpen(false);
  };
  const removeLanguage = (v: string) => setSelectedLanguages((p) => { const next = p.filter((i) => i !== v); savePatch({ languages: next }); return next; });

  // Prefill from current user
  useEffect(() => {
    if (!user) return;
    setAboutMe(user.bio ?? '');
    setSelectedInterests(Array.isArray(user.interests) ? user.interests : []);
    setSelectedLanguages(Array.isArray(user.languages) ? user.languages : []);
  }, [user]);

  // Other modal for custom interest/language
  const [otherModal, setOtherModal] = useState<null | { type: 'interest' | 'language'; text: string }>(null);
  const saveOther = async () => {
    const text = (otherModal?.text || '').trim();
    if (!text) { setOtherModal(null); return; }
    if (otherModal?.type === 'interest') {
      addInterest(text);
    } else if (otherModal?.type === 'language') {
      addLanguage(text);
    }
    setOtherModal(null);
  };

  // Editing modal state
  type EditField = { key: keyof User; label: string; type: 'text' | 'number' | 'select'; options?: Array<{ label: string; value: any }>; };
  const [editing, setEditing] = useState<null | (EditField & { value: any })>(null);
  const [saving, setSaving] = useState(false);
  const [photoEditMode, setPhotoEditMode] = useState(false);
  const [linkModal, setLinkModal] = useState<null | { provider: 'facebook' | 'instagram' | 'twitter'; url: string }>(null);

  const openEditor = (field: EditField) => {
    if (!user) return;
    setEditing({ ...field, value: (user as any)[field.key] ?? '' });
  };

  const persist = async () => {
    if (!user || !editing) return;
    try {
      setSaving(true);
      const patch: Partial<User> = { [editing.key]: editing.value } as any;
      const updated = await updateUser(user.id, patch);
      setUser({ ...(user as any), ...(patch as any) });
      setEditing(null);
    } catch (e) {
      console.warn('Failed to update user', e);
    } finally {
      setSaving(false);
    }
  };

  const deleteFromCloudinaryByToken = async (token?: string) => {
    if (!token) return false;
    try {
      const body = new FormData();
      body.append('token', token);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/delete_by_token`, {
        method: 'POST',
        body,
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const confirmDeleteAvatar = () => {
    if (!user) return;
    Alert.alert('Xóa ảnh đại diện?', 'Ảnh sẽ bị gỡ khỏi hồ sơ.', [
      { text: 'Hủy' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          await deleteFromCloudinaryByToken(user.avatarDeleteToken);
          await savePatch({ avatar: '' });
        }
      }
    ]);
  };

  const confirmDeletePhotoAt = (idx: number) => {
    if (!user) return;
    Alert.alert('Xóa ảnh?', 'Ảnh sẽ bị gỡ khỏi hồ sơ.', [
      { text: 'Hủy' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          const photos = Array.isArray(user.photos) ? [...user.photos] : [];
          const tokens = Array.isArray(user.photoDeleteTokens) ? [...user.photoDeleteTokens] : [];
          const removed = photos.splice(idx, 1)[0];
          const token = tokens.splice(idx, 1)[0];
          await deleteFromCloudinaryByToken(token);
          await savePatch({ photos, photoDeleteTokens: tokens });
        }
      }
    ]);
  };

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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <TouchableOpacity onPress={() => setPhotoEditMode((v) => !v)}>
            <Text style={{ color: PRIMARY_COLOR, fontWeight: '700' }}>{photoEditMode ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>The main photo is how you appear to others on the swipe view.</Text>
        {/* Photos responsive layout: 3 columns grid with big left card */}
        {(() => {
          const paddingH = 20; const gap = 12;
          const tile = Math.floor((width - paddingH * 2 - gap * 2) / 3);
          const mainSize = tile * 2 + gap;
          const smallStyle = { width: tile, height: tile, borderRadius: 12 } as const;
          return (
            <View>
              <View style={{ flexDirection: 'row', gap }}>
                {/* Main avatar */}
                <View style={{ width: mainSize }}>
                  <TouchableOpacity style={[styles.photoMain, { width: mainSize, height: mainSize }]} onPress={() => openEditor({ key: 'avatar', label: 'Avatar', type: 'text' })} onLongPress={async () => {
            // Long press to pick and upload new avatar
            if (!user) return;
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return;
            const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
            if (pick.canceled) return;
            try {
              const up = await uploadImage(pick.assets[0].uri);
              await savePatch({ avatar: up.secure_url, avatarDeleteToken: up.delete_token });
            } catch (e) { console.warn(e); }
          }} activeOpacity={0.85}>
            <Image source={{ uri: (user?.avatar) ?? IMAGE_FALLBACK }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
            {photoEditMode && !!user?.avatar && (
              <TouchableOpacity onPress={confirmDeleteAvatar} style={styles.deleteBadge}>
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
                </View>
                {/* Right column (2 tiles) */}
                <View style={{ gap }}>
                  {Array.from({ length: 2 }).map((_, i) => {
                    const idx = i; // first two photos
                    const ph = Array.isArray(user?.photos) ? user!.photos![idx] : undefined;
                    if (ph) return (
                      <View key={i} style={[styles.photoSlot, smallStyle]}>
                        <Image source={{ uri: ph }} style={smallStyle} />
                        {photoEditMode && (
                          <TouchableOpacity onPress={() => confirmDeletePhotoAt(idx)} style={styles.deleteBadge}><Ionicons name="trash" size={16} color="#fff" /></TouchableOpacity>
                        )}
                      </View>
                    );
                    return (
                      <TouchableOpacity key={i} style={[styles.photoSlot, smallStyle]} onPress={async () => {
                        if (!user) return;
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') return;
                        const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
                        if (pick.canceled) return;
                        try {
                          const up = await uploadImage(pick.assets[0].uri);
                          const next = [...(user.photos || [])];
                          const tokens = [...(user.photoDeleteTokens || [])];
                          next.splice(idx, 0, up.secure_url);
                          tokens.splice(idx, 0, up.delete_token || '');
                          await savePatch({ photos: next, photoDeleteTokens: tokens });
                        } catch (e) { console.warn(e); }
                      }}>
                        <Ionicons name="add" size={24} color={SECONDARY_COLOR} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              {/* Bottom row (3 tiles) */}
              <View style={{ flexDirection: 'row', gap, marginTop: gap }}>
                {Array.from({ length: 3 }).map((_, i) => {
                  const idx = i + 2; // next three photos
                  const ph = Array.isArray(user?.photos) ? user!.photos![idx] : undefined;
                  const extra = Math.max(0, (user?.photos?.length || 0) - 5);
                  if (ph) return (
                    <View key={i} style={[styles.photoSlot, smallStyle]}>
                      <Image source={{ uri: ph }} style={smallStyle} />
                      {i === 2 && extra > 0 && (
                        <View style={styles.moreOverlay}><Text style={{ color: '#fff', fontWeight: '700' }}>{`+${extra}`}</Text></View>
                      )}
                      {photoEditMode && (
                        <TouchableOpacity onPress={() => confirmDeletePhotoAt(idx)} style={styles.deleteBadge}><Ionicons name="trash" size={16} color="#fff" /></TouchableOpacity>
                      )}
                    </View>
                  );
                  return (
                    <TouchableOpacity key={i} style={[styles.photoSlot, smallStyle]} onPress={async () => {
                      if (!user) return;
                      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (status !== 'granted') return;
                      const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
                      if (pick.canceled) return;
                      try {
                        const up = await uploadImage(pick.assets[0].uri);
                        const next = [...(user.photos || [])];
                        const tokens = [...(user.photoDeleteTokens || [])];
                        next.splice(idx, 0, up.secure_url);
                        tokens.splice(idx, 0, up.delete_token || '');
                        await savePatch({ photos: next, photoDeleteTokens: tokens });
                      } catch (e) { console.warn(e); }
                    }}>
                      <Ionicons name="add" size={24} color={SECONDARY_COLOR} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })()}
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
          {([
            { label: 'Occupation', key: 'occupation' as const, value: user?.occupation || 'Add', icon: 'briefcase-outline', type: 'text' as const },
            { label: 'Gender & Pronouns', key: 'gender' as const, value: user ? (user.gender === 0 ? 'Female (she/her)' : 'Male (he/him)') : 'Add', icon: 'male-outline', type: 'select' as const },
            { label: 'Education', key: 'education' as const, value: user?.education || 'Add', icon: 'school-outline', type: 'text' as const },
            { label: 'Location', key: 'location' as const, value: user?.location || 'Add', icon: 'location-outline', type: 'text' as const },
          ]).map((row) => (
            <TouchableOpacity key={row.label} style={styles.detailRow} onPress={() => openEditor(row)}>
              <View style={styles.detailLeft}><Ionicons name={row.icon as any} size={18} color={SECONDARY_COLOR} /><Text style={styles.detailLabel}>{row.label}</Text></View>
              <View style={styles.detailRight}><Text style={styles.detailValue}>{row.value}</Text><Ionicons name="chevron-forward" size={16} color={SECONDARY_COLOR} /></View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 10 }} />
          {([
            { label: 'Height', key: 'height' as const, value: user?.height ? `${user.height} cm` : 'Add', icon: 'ruler-outline', type: 'number' as const },
            { label: 'Smoking', key: 'smoking' as const, value: user?.smoking || 'Add', icon: 'cafe-outline', type: 'text' as const },
            { label: 'Drinking', key: 'drinking' as const, value: user?.drinking || 'Add', icon: 'wine-outline', type: 'text' as const },
            { label: 'Pets', key: 'pets' as const, value: user?.pets || 'Add', icon: 'paw-outline', type: 'text' as const },
            { label: 'Children', key: 'children' as const, value: user?.children || 'Add', icon: 'people-outline', type: 'text' as const },
            { label: 'Zodiac sign', key: 'zodiac' as const, value: user?.zodiac || 'Add', icon: 'planet-outline', type: 'text' as const },
            { label: 'Religion', key: 'religion' as const, value: user?.religion || 'Add', icon: 'hand-left-outline', type: 'text' as const },
          ]).map((row) => (
            <TouchableOpacity key={row.label} style={styles.detailRow} onPress={() => openEditor(row)}>
              <View style={styles.detailLeft}><Ionicons name={row.icon as any} size={18} color={SECONDARY_COLOR} /><Text style={styles.detailLabel}>{row.label}</Text></View>
              <View style={styles.detailRight}><Text style={styles.detailValue}>{row.value}</Text><Ionicons name="chevron-forward" size={16} color={SECONDARY_COLOR} /></View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Edit modal */}
      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing?.label}</Text>
            {editing?.type === 'select' ? (
              <View style={{ gap: 10 }}>
                {[{ label: 'Female (she/her)', value: 0 }, { label: 'Male (he/him)', value: 1 }].map(opt => (
                  <TouchableOpacity key={String(opt.value)} style={styles.modalOption} onPress={() => setEditing((e) => e ? { ...e, value: opt.value } : e)}>
                    <Text style={{ color: '#111827' }}>{opt.label}</Text>
                    {editing?.value === opt.value && <Ionicons name="checkmark" size={18} color={PRIMARY_COLOR} />}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.modalInput}
                keyboardType={editing?.type === 'number' ? 'numeric' : 'default'}
                value={editing?.value?.toString() ?? ''}
                onChangeText={(t) => setEditing((e) => e ? { ...e, value: editing?.type === 'number' ? (t.replace(/[^0-9]/g, '')) : t } : e)}
                placeholder={editing?.label}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setEditing(null)} style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]}>
                <Text style={{ color: '#111827' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={saving} onPress={persist} style={[styles.modalBtn, { backgroundColor: PRIMARY_COLOR, opacity: saving ? 0.7 : 1 }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <TouchableOpacity style={styles.dropdownItem} onPress={() => setOtherModal({ type: 'interest', text: '' })}>
              <Text style={styles.dropdownText}>Other...</Text>
              <Ionicons name="create-outline" size={18} color={PRIMARY_COLOR} />
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.dropdownItem} onPress={() => setOtherModal({ type: 'language', text: '' })}>
              <Text style={styles.dropdownText}>Other...</Text>
              <Ionicons name="create-outline" size={18} color={PRIMARY_COLOR} />
            </TouchableOpacity>
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
        {([
          { label: 'Instagram', icon: 'logo-instagram', provider: 'instagram' as const },
          { label: 'Facebook', icon: 'logo-facebook', provider: 'facebook' as const },
          { label: 'Twitter', icon: 'logo-twitter', provider: 'twitter' as const },
        ]).map((row) => {
          const url = user?.linkedAccounts?.[row.provider] || '';
          const valueText = url ? (url.length > 28 ? url.slice(0, 28) + '…' : url) : 'Add';
          return (
            <TouchableOpacity key={row.label} style={styles.accountRow} onPress={() => setLinkModal({ provider: row.provider, url })}>
              <View style={styles.detailLeft}><Ionicons name={row.icon as any} size={18} color={SECONDARY_COLOR} /><Text style={styles.detailLabel}>{row.label}</Text></View>
              <View style={styles.detailRight}><Text style={[styles.detailValue, { color: url ? PRIMARY_COLOR : SECONDARY_COLOR }]}>{valueText}</Text><Ionicons name="chevron-forward" size={16} color={SECONDARY_COLOR} /></View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
      {/* Linked account modal */}
      <Modal visible={!!linkModal} transparent animationType="slide" onRequestClose={() => setLinkModal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Liên kết {linkModal?.provider}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={`Dán liên kết ${linkModal?.provider}`}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              value={linkModal?.url ?? ''}
              onChangeText={(t) => setLinkModal((m) => (m ? { ...m, url: t } : m))}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setLinkModal(null)} style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]}>
                <Text style={{ color: '#111827' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!user || !linkModal) return;
                  const next = { ...(user.linkedAccounts || {}) } as Record<string, string>;
                  next[linkModal.provider] = linkModal.url.trim();
                  await savePatch({ linkedAccounts: next as any });
                  setLinkModal(null);
                }}
                style={[styles.modalBtn, { backgroundColor: PRIMARY_COLOR }]}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Other input modal */}
      <Modal visible={!!otherModal} transparent animationType="fade" onRequestClose={() => setOtherModal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{otherModal?.type === 'interest' ? 'Add custom interest' : 'Add custom language'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={otherModal?.type === 'interest' ? 'Your interest...' : 'Language...'}
              value={otherModal?.text ?? ''}
              onChangeText={(t) => setOtherModal((o) => (o ? { ...o, text: t } : o))}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setOtherModal(null)} style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]}>
                <Text style={{ color: '#111827' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveOther} style={[styles.modalBtn, { backgroundColor: PRIMARY_COLOR }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  imageOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000055', borderRadius: 12 },
  moreOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000066', borderRadius: 12 },
  modalBackdrop: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  modalOption: { paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deleteBadge: { position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
});




