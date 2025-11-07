import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function Login() {
  const router = useRouter();
  const { login, user, hydrated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (hydrated && user) {
      router.replace('/tabs' as any);
    }
  }, [hydrated, user, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Ionicons name="heart" size={48} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>HeartSync</Text>
        <Text style={styles.subtitle}>Nơi trái tim kết nối, tình yêu tìm thấy sự đồng điệu.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.formContainer}>
          {!hydrated && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator />
              <Text style={{ color: '#6B7280', marginTop: 8 }}>Đang kiểm tra phiên...</Text>
            </View>
          )}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error ? <Text style={{ color: '#EF4444', textAlign: 'center' }}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            disabled={loading}
            onPress={async () => {
              setError('');
              setLoading(true);
              try {
                await login(username.trim(), password);
                router.replace('/tabs' as any);
              } catch (e: any) {
                setError(e?.message || 'Đăng nhập thất bại');
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3E8FF', paddingHorizontal: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#A78BFA', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  logoInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  formContainer: { gap: 16 },
  inputContainer: { position: 'relative', marginBottom: 16 },
  inputIcon: { position: 'absolute', left: 16, top: 16, zIndex: 1 },
  input: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 50, paddingVertical: 14, paddingLeft: 48, paddingRight: 16, fontSize: 16, color: '#1F2937' },
  submitButton: { backgroundColor: '#8B5CF6', borderRadius: 50, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
