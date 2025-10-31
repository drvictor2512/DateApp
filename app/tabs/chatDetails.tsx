import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY_COLOR = '#00C2D1';

// Mock messages data
const MESSAGES = [
    {
        id: '1',
        text: 'Hi there! 👋',
        sender: 'other',
        timestamp: 'Today',
        time: '10:30 AM',
    },
    {
        id: '2',
        text: 'Hey! How are you?',
        sender: 'me',
        timestamp: 'Today',
        time: '10:32 AM',
    },
    {
        id: '3',
        text: "I'm doing great! Would you like to grab coffee sometime?",
        sender: 'other',
        timestamp: 'Today',
        time: '10:35 AM',
    },
    {
        id: '4',
        text: "That sounds amazing! I'd love to ☕",
        sender: 'me',
        timestamp: 'Today',
        time: '10:37 AM',
    },
    {
        id: '5',
        text: 'Perfect! How about this Saturday?',
        sender: 'other',
        timestamp: 'Today',
        time: '10:40 AM',
    },
];


export default function ChatDetail() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id, name, age, image } = useLocalSearchParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(MESSAGES);

    // Profile data từ params
    const profile = {
        name: (name as string) || 'Ava Jones',
        age: parseInt((age as string) || '25'),
        image: decodeURIComponent((image as string) || 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800&q=80'),
    };

    const handleSend = () => {
        if (message.trim()) {
            const newMessage = {
                id: Date.now().toString(),
                text: message,
                sender: 'me',
                timestamp: 'Today',
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    const renderMessage = ({ item, index }: { item: typeof MESSAGES[0], index: number }) => {
        const isMe = item.sender === 'me';
        const showTimestamp = index === 0 || messages[index - 1].timestamp !== item.timestamp;

        return (
            <View>
                {showTimestamp && (
                    <View style={styles.timestampContainer}>
                        <Text style={styles.timestamp}>{item.timestamp}</Text>
                    </View>
                )}
                <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                    {!isMe && (
                        <Image source={{ uri: profile.image }} style={styles.messageAvatar} />
                    )}
                    <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
                        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.text}</Text>
                        <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>{item.time}</Text>
                    </View>
                </View>
            </View>
        );
    };



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top + 20}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileInfo} onPress={() => router.push(`/tabs/viewProfile?id=${id}`)}>
                    <Image source={{ uri: profile.image }} style={styles.headerAvatar} />
                    <View>
                        <View style={styles.headerNameRow}>
                            <Text style={styles.headerName}>{profile.name}, {profile.age}</Text>
                            <Ionicons name="chevron-forward" size={16} color={PRIMARY_COLOR} />
                        </View>
                        <View style={styles.onlineStatus}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>Active 4 mins ago</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerActionButton}>
                        <Ionicons name="videocam-outline" size={22} color="#1F2937" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerActionButton}>
                        <Ionicons name="ellipsis-vertical" size={22} color="#1F2937" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                // ensure taps on messages/input still work while keyboard is open
                keyboardShouldPersistTaps="handled"
                // add extra bottom padding so last messages are visible above the input/keyboard
                contentContainerStyle={[
                    styles.messagesList,
                    { paddingBottom: 120 + insets.bottom },
                ]}
                inverted={false}
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.inputActionButton}>
                    <Ionicons name="add-circle-outline" size={28} color={PRIMARY_COLOR} />
                </TouchableOpacity>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity style={styles.emojiButton}>
                        <Ionicons name="happy-outline" size={22} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.sendButton, message.trim() && styles.sendButtonActive]}
                    onPress={handleSend}
                    disabled={!message.trim()}
                >
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        marginRight: 12,
    },
    profileInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    headerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
    },
    onlineText: {
        fontSize: 12,
        color: '#6B7280',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    gameSuggestion: {
        flexDirection: 'row',
        backgroundColor: '#E0F7F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        gap: 12,
    },
    gameText: {
        flex: 1,
    },
    gameTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    gameSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },
    typePromptContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 12,
    },
    typePrompt: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    timestampContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-end',
    },
    messageRowMe: {
        justifyContent: 'flex-end',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: '70%',
        borderRadius: 16,
        padding: 12,
    },
    messageBubbleOther: {
        backgroundColor: '#F3F4F6',
        borderBottomLeftRadius: 4,
    },
    messageBubbleMe: {
        backgroundColor: PRIMARY_COLOR,
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        color: '#111827',
        lineHeight: 20,
        marginBottom: 4,
    },
    messageTextMe: {
        color: '#fff',
    },
    messageTime: {
        fontSize: 11,
        color: '#6B7280',
    },
    messageTimeMe: {
        color: '#E0F7F9',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 8,
    },
    inputActionButton: {
        marginBottom: 4,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 44,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        maxHeight: 100,
        paddingVertical: 4,
    },
    emojiButton: {
        marginLeft: 8,
        marginBottom: 4,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonActive: {
        backgroundColor: PRIMARY_COLOR,
    },
});