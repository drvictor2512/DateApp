// app/tabs/save.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const PRIMARY_COLOR = '#00C2D1';

// Saved profiles data
const SAVED_PROFILES = [
    {
        id: '1',
        name: 'Ava Jones',
        age: 25,
        job: 'Business Analyst',
        city: 'Las Vegas, NV',
        distanceKm: 2,
        image: 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800&q=80',
        saved: true,
    },
    {
        id: '2',
        name: 'Rae Smith',
        age: 27,
        job: 'Product Designer',
        city: 'Los Angeles, CA',
        distanceKm: 4,
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
        saved: true,
    },
    {
        id: '3',
        name: 'Mia Brown',
        age: 24,
        job: 'Illustrator',
        city: 'Seattle, WA',
        distanceKm: 7,
        image: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=800&q=80',
        saved: true,
    },
    {
        id: '4',
        name: 'Emma Wilson',
        age: 26,
        job: 'Marketing Manager',
        city: 'San Francisco, CA',
        distanceKm: 5,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
        saved: true,
    },
    {
        id: '5',
        name: 'Sofia Davis',
        age: 23,
        job: 'Software Engineer',
        city: 'Austin, TX',
        distanceKm: 3,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        saved: true,
    },
    {
        id: '6',
        name: 'Isabella Martinez',
        age: 28,
        job: 'Photographer',
        city: 'Portland, OR',
        distanceKm: 6,
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
        saved: true,
    },
];

export default function Save() {
    const router = useRouter();
    const [savedProfiles, setSavedProfiles] = useState(SAVED_PROFILES);

    const handleUnsave = (id: string) => {
        setSavedProfiles(prev => prev.filter(profile => profile.id !== id));
    };

    const renderProfileCard = ({ item }: { item: typeof SAVED_PROFILES[0] }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/tabs/viewProfile?id=${item.id}`)}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />

            {/* Gradient overlay */}
            <View style={styles.gradient} />

            {/* Unsave button */}
            <TouchableOpacity
                style={styles.unsaveButton}
                onPress={(e) => {
                    e.stopPropagation();
                    handleUnsave(item.id);
                }}
            >
                <Ionicons name="bookmark" size={20} color={PRIMARY_COLOR} />
            </TouchableOpacity>

            {/* Distance badge */}
            <View style={styles.distanceBadge}>
                <Ionicons name="location" size={12} color="#fff" />
                <Text style={styles.distanceText}>{item.distanceKm} km</Text>
            </View>

            {/* Profile info */}
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
            <Text style={styles.emptyTitle}>No saved profiles yet</Text>
            <Text style={styles.emptySubtitle}>
                Bookmark profiles you like to save them for later
            </Text>
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/tabs/heart')}
            >
                <Text style={styles.exploreButtonText}>Start Exploring</Text>
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
                <Text style={styles.headerTitle}>Saved</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.countBadge}>{savedProfiles.length}</Text>
                </View>
            </View>

            {/* Grid */}
            {savedProfiles.length > 0 ? (
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