import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUser } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { API_BASE, IMAGE_FALLBACK } from '../../lib/config';
import { emit as emitEvent } from '../../lib/events';

const PRIMARY_COLOR = '#00C2D1';

export default function ChatDetail() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id, name, age, image, from } = useLocalSearchParams();
    const { user: me } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [convo, setConvo] = useState<any | null>(null);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<any>(null);


    const [profile, setProfile] = useState({
        name: (name as string) || 'Ava Jones',
        age: parseInt((age as string) || '25'),
        image: decodeURIComponent((image as string) || IMAGE_FALLBACK),
    });

    const buildCleanPayload = (c: any, extraMessages?: any[]) => ({
        user1Id: String(c.user1Id),
        user2Id: String(c.user2Id),
        messages: typeof extraMessages !== 'undefined' ? extraMessages : (c.messages || []),
    });

    const patchMessages = async (convoId: string, convo: any, newMessages: any[]) => {
        try {
            const patchResp = await fetch(`${API_BASE}/messages/${convoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            });
            if (patchResp.ok) {
                return await patchResp.json();
            }
        } catch (err) {
            console.warn('Failed to PATCH messages', err);
        }

        const payload = buildCleanPayload(convo, newMessages);
        const putResp = await fetch(`${API_BASE}/messages/${convoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!putResp.ok) throw new Error('Failed to update conversation with messages');
        return await putResp.json();
    };

    const findConversationBetween = async (a: string | number, b: string | number) => {
        try {
            const q1 = await fetch(`${API_BASE}/messages?user1Id=${a}&user2Id=${b}`);
            if (q1.ok) {
                const arr = await q1.json();
                if (Array.isArray(arr) && arr.length) return arr[0];
            }
        } catch (e) {
            console.warn('Failed to find conversation', e);
        }
        try {
            const q2 = await fetch(`${API_BASE}/messages?user1Id=${b}&user2Id=${a}`);
            if (q2.ok) {
                const arr2 = await q2.json();
                if (Array.isArray(arr2) && arr2.length) return arr2[0];
            }
        } catch (e) {
            console.warn('Failed to find conversation', e);
        }
        return null;
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!id) return;
            try {
                const u = await getUser(String(id));
                if (!mounted) return;
                setProfile({
                    name: u.name || (name as string) || 'Ava Jones',
                    age: u.age || parseInt((age as string) || '25'),
                    image: u.avatar || (u.photos && u.photos[0]) || IMAGE_FALLBACK,
                });
            } catch (e) {

                console.warn('Failed to load profile for chat detail', e);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    const handleSend = async () => {
        if (sending) return;
        if (!me || !me.id) return setTimeout(() => setMessage(''), 0);
        if (!message.trim()) return;
        const text = message.trim();
        const apiMessage = {
            senderId: String(me.id),
            text,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        const uiMessage = {
            id: Date.now().toString(),
            text,
            sender: 'me',
            timestamp: apiMessage.timestamp,
            time: new Date(apiMessage.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        // optimistic UI (append and ensure unique keys)
        setMessages(prev => {
            const next = [...prev, uiMessage];
            const seen = new Set();
            return next.filter(m => {
                if (!m?.id) return true;
                if (seen.has(m.id)) return false;
                seen.add(m.id);
                return true;
            });
        });
        setMessage('');
        setSending(true);

        try {
            if (convo && convo.id) {
                const saved = await patchMessages(convo.id, convo, [...(convo.messages || []), apiMessage]);
                const mappedSaved = (saved.messages || []).map((m: any, idx: number) => ({
                    id: `${saved.id}_${idx}_${m.timestamp}`,
                    text: m.text,
                    sender: String(m.senderId) === String(me.id) ? 'me' : 'other',
                    timestamp: m.timestamp,
                    time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                }));
                setConvo(saved);
                setMessages(mappedSaved);
                try { emitEvent('conversations:changed'); } catch (err) { /* ignore */ }
            } else {
                try {
                    const existing = await findConversationBetween(String(me.id), String(id));
                    if (existing) {
                        const saved = await patchMessages(existing.id, existing, [...(existing.messages || []), apiMessage]);
                        const mappedSaved = (saved.messages || []).map((m: any, idx: number) => ({
                            id: `${saved.id}_${idx}_${m.timestamp}`,
                            text: m.text,
                            sender: String(m.senderId) === String(me.id) ? 'me' : 'other',
                            timestamp: m.timestamp,
                            time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        }));
                        setConvo(saved);
                        setMessages(mappedSaved);
                        try { emitEvent('conversations:changed'); } catch (err) { /* ignore */ }
                        return;
                    }
                } catch (err) {
                    // ignore and fall through to create
                }

                // create new conversation
                const payload = {
                    user1Id: String(me.id),
                    user2Id: String(id),
                    messages: [apiMessage],
                };
                const res = await fetch(`${API_BASE}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error('Failed to create conversation');
                const created = await res.json();
                // Immediately PUT a clean payload to remove any legacy keys the server might carry
                try {
                    const clean = buildCleanPayload(created, created.messages || []);
                    const putRes = await fetch(`${API_BASE}/messages/${created.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(clean),
                    });
                    if (putRes.ok) {
                        const replaced = await putRes.json();
                        setConvo(replaced);
                        const mappedCreated = (replaced.messages || []).map((m: any, idx: number) => ({
                            id: `${replaced.id}_${idx}_${m.timestamp}`,
                            text: m.text,
                            sender: String(m.senderId) === String(me.id) ? 'me' : 'other',
                            timestamp: m.timestamp,
                            time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        }));
                        setMessages(mappedCreated);
                    } else {
                        // fallback to created raw
                        setConvo(created);
                        const mappedCreated = (created.messages || []).map((m: any, idx: number) => ({
                            id: `${created.id}_${idx}_${m.timestamp}`,
                            text: m.text,
                            sender: String(m.senderId) === String(me.id) ? 'me' : 'other',
                            timestamp: m.timestamp,
                            time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        }));
                        setMessages(mappedCreated);
                    }
                } catch (err) {
                    console.warn('Failed to clean created conversation', err);
                    setConvo(created);
                    const mappedCreated = (created.messages || []).map((m: any, idx: number) => ({
                        id: `${created.id}_${idx}_${m.timestamp}`,
                        text: m.text,
                        sender: String(m.senderId) === String(me.id) ? 'me' : 'other',
                        timestamp: m.timestamp,
                        time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    }));
                    setMessages(mappedCreated);
                }
                // notify other screens (chat list) that conversations changed
                try { emitEvent('conversations:changed'); } catch (e) { /* ignore */ }
            }
        } catch (e) {
            console.warn('Failed to persist message', e);
            // revert optimistic UI: remove last message if it matches our uiMessage id
            setMessages(prev => prev.filter(m => m.id !== uiMessage.id));
            // restore text so user can retry
            setMessage(text);
        } finally {
            setSending(false);
        }
    };

    // auto-scroll to newest message when messages change
    useEffect(() => {
        // small timeout so layout finishes before scrolling
        const t = setTimeout(() => {
            try {
                if (flatListRef.current && typeof flatListRef.current.scrollToEnd === 'function') {
                    flatListRef.current.scrollToEnd({ animated: true });
                } else if (flatListRef.current && typeof flatListRef.current.scrollToOffset === 'function') {
                    // fallback: scroll to the bottom offset
                    flatListRef.current.scrollToOffset({ offset: 99999, animated: true });
                }
            } catch (err) {
                // ignoring scroll errors
            }
        }, 80);
        return () => clearTimeout(t);
    }, [messages]);

    const renderMessage = ({ item, index }: { item: any, index: number }) => {
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


    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!me || !id) return;
            setLoading(true);
            try {
                const convo = await findConversationBetween(String(me.id), String(id));
                if (!convo) {
                    if (mounted) setMessages([]);
                } else {
                    // --- Cleanup legacy fields if present ---
                    const hasLegacyKeys = Object.keys(convo).some(k => ['user1ID', 'user2ID', 'message'].includes(k));
                    if (hasLegacyKeys) {
                        try {
                            const clean = buildCleanPayload(convo);
                            const put = await fetch(`${API_BASE}/messages/${convo.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(clean),
                            });
                            if (put.ok) {
                                const replaced = await put.json();
                                convo.messages = replaced.messages || convo.messages || [];
                            }
                        } catch (err) {
                            console.warn('Failed to clean conversation', err);
                        }
                    }
                    try {
                        const originalMessages = convo.messages || [];
                        const updatedMessages = originalMessages.map((m: any) => {
                            if (String(m.senderId) !== String(me.id) && !m.isRead) {
                                return { ...m, isRead: true };
                            }
                            return m;
                        });
                        const hasChanges = updatedMessages.some((m: any, i: number) => m !== originalMessages[i] && originalMessages[i]);
                        if (hasChanges) {
                            const saved = await patchMessages(convo.id, convo, updatedMessages).catch(e => {
                                console.warn('Failed to mark messages read', e);
                                return null;
                            });
                            if (saved && saved.messages) {
                                convo.messages = saved.messages;
                            } else {
                                convo.messages = updatedMessages;
                            }
                        }
                    } catch (err) {
                        console.warn('Error marking messages read', err);
                    }

                    const mapped = (convo.messages || []).map((m: any, idx: number) => ({
                        id: `${convo.id}_${idx}_${m.timestamp}`,
                        text: m.text,
                        sender: String(m.senderId) === String(me.id) ? 'me' : 'other',
                        timestamp: m.timestamp,
                        time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    }));
                    if (mounted) {
                        setMessages(mapped);
                        setConvo(convo);
                    }
                }
            } catch (e) {
                console.warn('Failed to load conversation', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [me?.id, id]);



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top + 20}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (from) {
                        router.replace(String(from) as any);
                    } else {
                        router.back();
                    }
                }} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileInfo}
                    onPress={() => router.push({ pathname: '/tabs/viewProfile', params: { id, from: from || '/tabs/chat' } })}
                >
                    <Image source={{ uri: profile.image }} style={styles.headerAvatar} />
                    <View>
                        <View style={styles.headerNameRow}>
                            <Text style={styles.headerName}>{profile.name}, {profile.age}</Text>
                            <Ionicons name="chevron-forward" size={16} color={PRIMARY_COLOR} />
                        </View>
                        <View style={styles.onlineStatus}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>Hoạt động cách 4 phút</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerActionButton} onPress={() => router.push({ pathname: '/call', params: { id, name: profile.name, image: profile.image, from: from || '/tabs/chat' } } as any)}>
                        <Ionicons name="videocam-outline" size={22} color="#1F2937" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerActionButton}>
                        <Ionicons name="ellipsis-vertical" size={22} color="#1F2937" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                    <Text style={{ color: '#6B7280', marginTop: 8 }}>Đang tải tin nhắn...</Text>
                </View>
            ) : (
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.messagesList,
                        { paddingBottom: 120 + insets.bottom },
                    ]}
                    inverted={false}
                />
            )}

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
                    disabled={!message.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Ionicons name="send" size={20} color="#fff" />
                    )}
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