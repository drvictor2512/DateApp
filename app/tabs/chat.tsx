// app/tabs/chat.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { listUsers } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { API_BASE, IMAGE_FALLBACK } from '../../lib/config';
import { on as onEvent } from '../../lib/events';

const PRIMARY_COLOR = '#00C2D1';


type ChatProfile = {
    id: string;
    name: string;
    age?: number;
    job?: string;
    city?: string;
    distanceKm?: number;
    image: string;
    lastMessage?: string;
    timestamp?: string;
    unread?: boolean;
};

export default function Chat() {
    const router = useRouter();
    const { user: me } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [profiles, setProfiles] = useState<ChatProfile[]>([]);
    const [chats, setChats] = useState<ChatProfile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            try {
                const users = await listUsers();
                const mapped: ChatProfile[] = users
                    .filter(u => u.id !== me?.id)
                    .map(u => ({
                        id: u.id,
                        name: u.name || 'Unknown',
                        age: u.age,
                        job: u.occupation,
                        city: u.location,
                        image: u.avatar || (u.photos && u.photos[0]) || IMAGE_FALLBACK,
                        lastMessage: undefined,
                        timestamp: undefined,
                        unread: false,
                    }));
                if (mounted) setProfiles(mapped);

                if (me && me.id) {
                    try {
                        const res = await fetch(`${API_BASE}/messages`);
                        if (res.ok) {
                            const convos = await res.json();
                            const myConvos = convos.filter((c: any) =>
                                String(c.user1Id) === String(me.id) || String(c.user2Id) === String(me.id)
                            );
                            const mappedChatsRaw: ChatProfile[] = myConvos.map((c: any) => {
                                const last = (c.messages && c.messages.length > 0) ? c.messages[c.messages.length - 1] : null;
                                const partnerId = String(c.user1Id) === String(me.id) ? String(c.user2Id) : String(c.user1Id);
                                const partner = users.find(u => String(u.id) === String(partnerId));
                                return {
                                    id: partnerId,
                                    name: partner?.name || 'Unknown',
                                    age: partner?.age,
                                    job: partner?.occupation,
                                    city: partner?.location,
                                    image: partner?.avatar || (partner?.photos && partner.photos[0]) || IMAGE_FALLBACK,
                                    lastMessage: last?.text,
                                    timestamp: last?.timestamp,
                                    unread: Boolean(c.messages && c.messages.some((m: any) => String(m.senderId) !== String(me.id) && !m.isRead)),
                                };
                            });

                            // dedupe by partner id, keeping the most recent conversation per partner
                            const dedupeMap = new Map<string, ChatProfile>();
                            for (const ch of mappedChatsRaw) {
                                const existing = dedupeMap.get(ch.id);
                                if (!existing) {
                                    dedupeMap.set(ch.id, ch);
                                } else {
                                    // keep the one with a newer timestamp
                                    if ((ch.timestamp || '') > (existing.timestamp || '')) {
                                        dedupeMap.set(ch.id, ch);
                                    }
                                }
                            }
                            const mappedChats = Array.from(dedupeMap.values()).sort((a, b) => {
                                const ta = a.timestamp || '';
                                const tb = b.timestamp || '';
                                return tb.localeCompare(ta);
                            });
                            if (mounted) setChats(mappedChats);
                        }
                    } catch (e) {
                        console.warn('Failed to load conversations for chat', e);
                    }
                }
            } catch (e) {
                console.warn('Failed to load users for chat', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        const unsubConv = onEvent('conversations:changed', () => {
            if (mounted) load();
        });
        const unsubMatches = onEvent('matches:changed', () => {
            if (mounted) load();
        });

        return () => { mounted = false; unsubConv(); unsubMatches(); };
    }, [me?.id]);

    const filteredChats = chats.filter(profile =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderMatchItem = ({ item }: { item: ChatProfile }) => (
        <TouchableOpacity
            style={styles.matchCard}
            onPress={() => router.push({ pathname: '/tabs/chatDetails', params: { id: item.id, name: item.name, from: '/tabs/chat' } })}
        >
            <Image source={{ uri: item.image }} style={styles.matchImage} />
            <Text style={styles.matchName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
        </TouchableOpacity>
    );

    const renderChatItem = ({ item }: { item: ChatProfile }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push({ pathname: '/tabs/chatDetails', params: { id: item.id, name: item.name, from: '/tabs/chat' } })}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.image }} style={styles.avatar} />
                {item.unread && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatTime}>{item.timestamp}</Text>
                </View>
                <Text style={[styles.chatMessage, item.unread && styles.unreadMessage]} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>

            {item.unread && <View style={styles.unreadBadge} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Matches Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Yêu thích ({(me?.matches || []).length})</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.matchesContainer}
                >
                    {(me?.matches || []).map((matchId) => {
                        const p = profiles.find(pr => pr.id === matchId);
                        if (!p) return null;
                        return (
                            <View key={p.id}>
                                {renderMatchItem({ item: p })}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Chats Section */}
            <View style={styles.chatsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Trò chuyện ({filteredChats.length})</Text>
                    <TouchableOpacity>
                        <Ionicons name="options-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator />
                        <Text style={{ color: '#6B7280', marginTop: 8 }}>Đang tải cuộc trò chuyện...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredChats}
                        renderItem={renderChatItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.chatsList}
                    />
                )}
            </View>
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
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        gap: 12,
        backgroundColor: '#fff',
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937',
    },
    section: {
        backgroundColor: '#fff',
        paddingTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    matchesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    matchCard: {
        alignItems: 'center',
        marginRight: 16,
        width: 70,
    },
    matchImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        borderColor: PRIMARY_COLOR,
        marginBottom: 8,
    },
    matchName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    chatsSection: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    chatsList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    chatContent: {
        flex: 1,
        marginLeft: 12,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    chatTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    chatMessage: {
        fontSize: 14,
        color: '#6B7280',
    },
    unreadMessage: {
        fontWeight: '600',
        color: '#111827',
    },
    unreadBadge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PRIMARY_COLOR,
        marginLeft: 8,
    },
});