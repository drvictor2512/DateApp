// app/tabs/save.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listUsers, updateUser } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { IMAGE_FALLBACK } from '../../lib/config';
import { emit as emitEvent } from '../../lib/events';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const PRIMARY_COLOR = '#00C2D1';

// Saved profile UI shape
type SavedProfile = {
    id: string;
    name: string;
    age: number;
    job: string;
    city: string;
    distanceKm: number;
    image: string;
    saved: boolean;
};

export default function Save() {
    const router = useRouter();
    const { user: me, setUser } = useAuth();
    const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!me || !Array.isArray(me.matches) || me.matches.length === 0) {
                if (mounted) setSavedProfiles([]);
                return;
            }
            setLoading(true);
            try {
                const users = await listUsers();
                const meMatches = Array.isArray(me?.matches) ? me!.matches : [];
                const picks = users
                    .filter(u => meMatches.includes(u.id))
                    .map(u => ({
                        id: u.id,
                        name: u.name || 'Unknown',
                        age: u.age || 0,
                        job: u.occupation || '—',
                        city: u.location || '—',
                        image: u.avatar || (u.photos && u.photos[0]) || IMAGE_FALLBACK,
                        distanceKm: 0,
                        saved: true,
                    }));
                if (mounted) setSavedProfiles(picks as any);
            } catch (e) {
                console.warn('Failed to load saved profiles', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [me?.matches]);

    const handleUnsave = async (id: string) => {
        setSavedProfiles((prev: SavedProfile[]) => prev.filter((profile: SavedProfile) => profile.id !== id));
        if (!me || !me.id) return;

        try {
            const current = Array.isArray(me.matches) ? me.matches : [];
            const next = current.filter(m => m !== id);
            await updateUser(me.id, { matches: next });
            const newMe = { ...me, matches: next } as any;
            setUser && setUser(newMe);
            // persist auth user so other sessions / reloads reflect the change
            try { await AsyncStorage.setItem('auth_user', JSON.stringify(newMe)); } catch (e) { }
            // notify other screens that matches changed
            try { emitEvent('matches:changed'); } catch (e) { }
        } catch (e) {
            console.warn('Failed to persist unsave', e);
        }
    };

    const renderProfileCard = ({ item }: { item: SavedProfile }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/tabs/viewProfile', params: { id: item.id, from: '/tabs/save' } } as any)}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.gradient} />

            <TouchableOpacity
                style={styles.unsaveButton}
                onPress={(e) => {
                    e.stopPropagation();
                    handleUnsave(item.id);
                }}
            >
                <Ionicons name="bookmark" size={20} color={PRIMARY_COLOR} />
            </TouchableOpacity>
            <View style={styles.distanceBadge}>
                <Ionicons name="location" size={12} color="#fff" />
                <Text style={styles.distanceText}>{item.distanceKm} km</Text>
            </View>

            <View style={styles.cardInfo}>
                <Text style={styles.cardName}>
                    {item.name}, {item.age}
                </Text>
                <View style={styles.jobRow}>
                    <Ionicons name="briefcase-outline" size={12} color="#fff" />
                    <Text style={styles.cardJob} numberOfLines={1}>{item.job}</Text>
                </View>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color="#fff" />
                    <Text style={styles.cardLocation} numberOfLines={1}>{item.city}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="bookmark-outline" size={80} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có hồ sơ được lưu</Text>
            <Text style={styles.emptySubtitle}>
                Đánh dấu hồ sơ bạn thích để lưu lại
            </Text>
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/tabs/heart')}
            >
                <Text style={styles.exploreButtonText}>Bắt đầu khám phá</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={22} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đã lưu</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.countBadge}>{savedProfiles.length}</Text>
                </View>
            </View>

            {/* Grid */}
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                    <Text style={{ color: '#6B7280', marginTop: 8 }}>Đang tải hồ sơ đã lưu...</Text>
                </View>
            ) : savedProfiles.length > 0 ? (
                <FlatList
                    data={savedProfiles}
                    renderItem={renderProfileCard}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                renderEmptyState()
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F6F9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    headerRight: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadge: {
        fontSize: 14,
        fontWeight: '700',
        color: PRIMARY_COLOR,
    },
    grid: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.4,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    unsaveButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    distanceBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    distanceText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    cardInfo: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12,
    },
    cardName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    jobRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    cardJob: {
        color: '#fff',
        fontSize: 12,
        flex: 1,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardLocation: {
        color: '#fff',
        fontSize: 11,
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    exploreButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 24,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});