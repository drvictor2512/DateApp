// app/tabs/chat.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#00C2D1';

// Sử dụng data từ heart.tsx
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
        lastMessage: 'Hey there!',
        timestamp: '2 hours ago',
        unread: true,
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
        lastMessage: "That's awesome! 😊",
        timestamp: '5 hours ago',
        unread: false,
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
        lastMessage: 'See you tomorrow!',
        timestamp: '1 day ago',
        unread: false,
    },
];

export default function Chat() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChats = PROFILES.filter(profile =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderMatchItem = ({ item }: { item: typeof PROFILES[0] }) => (
        <TouchableOpacity
            style={styles.matchCard}
            onPress={() => router.push({ pathname: '/tabs/chatDetails', params: { id: item.id, name: item.name } })}
        >
            <Image source={{ uri: item.image }} style={styles.matchImage} />
            <Text style={styles.matchName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
        </TouchableOpacity>
    );

    const renderChatItem = ({ item }: { item: typeof PROFILES[0] }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push({ pathname: '/tabs/chatDetails', params: { id: item.id, name: item.name } })}
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
                        placeholder="Search"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Matches Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Matches ({PROFILES.length})</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.matchesContainer}
                >
                    {PROFILES.map((profile) => (
                        <View key={profile.id}>
                            {renderMatchItem({ item: profile })}
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Chats Section */}
            <View style={styles.chatsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Chats ({filteredChats.length})</Text>
                    <TouchableOpacity>
                        <Ionicons name="options-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={filteredChats}
                    renderItem={renderChatItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.chatsList}
                />
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