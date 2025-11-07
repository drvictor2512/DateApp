import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id, name, image, from } = useLocalSearchParams<{ id?: string; name?: string; image?: string; from?: string }>();
    const displayName = String(name || 'Unknown');
    const avatar = decodeURIComponent(String(image || '')) || undefined;

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);
    const [muted, setMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(false);

    useEffect(() => {
        let t: any = null;
        if (running) {
            t = setInterval(() => setSeconds((s) => s + 1), 1000);
        }
        return () => { if (t) clearInterval(t); };
    }, [running]);

    const fmt = (s: number) => {
        const mm = Math.floor(s / 60).toString().padStart(2, '0');
        const ss = (s % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    const endCall = () => {
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={endCall} style={styles.headerBack}>
                    <Ionicons name="chevron-back" size={28} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cuộc gọi</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.avatarWrap}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]} />
                    )}
                </View>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.status}>{running ? 'Đang gọi…' : 'Đã kết nối'}</Text>
                <Text style={styles.timer}>{fmt(seconds)}</Text>

                <View style={styles.controlsRow}>
                    <TouchableOpacity style={styles.controlBtn} onPress={() => setMuted((v) => !v)}>
                        <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color={muted ? '#fff' : '#111827'} />
                        <Text style={styles.controlLabel}>{muted ? 'Tắt tiếng' : 'Âm'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.controlBtn, styles.endBtn]} onPress={endCall}>
                        <Ionicons name="call" size={28} color="#fff" />
                        <Text style={[styles.controlLabel, { color: '#fff' }]}>Kết thúc</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlBtn} onPress={() => setVideoOff((v) => !v)}>
                        <Ionicons name={videoOff ? 'videocam-off' : 'videocam'} size={24} color={videoOff ? '#fff' : '#111827'} />
                        <Text style={styles.controlLabel}>{videoOff ? 'Camera tắt' : 'Camera'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B1020', },
    header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
    headerBack: { width: 40 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    avatarWrap: { width: 180, height: 180, borderRadius: 90, overflow: 'hidden', marginBottom: 18, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' },
    avatar: { width: '100%', height: '100%' },
    avatarPlaceholder: { backgroundColor: '#6B7280' },
    name: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 6 },
    status: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
    timer: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 24 },
    controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 },
    controlBtn: { alignItems: 'center', justifyContent: 'center', gap: 6, width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', opacity: 0.95 },
    controlLabel: { marginTop: 6, color: '#111827', fontSize: 12, fontWeight: '600' },
    endBtn: { backgroundColor: '#EF4444' },
});
