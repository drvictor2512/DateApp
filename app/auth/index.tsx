import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Logo and Header */}
            <View style={styles.header}>
                <View style={styles.logoOuter}>
                    <View style={styles.logoInner}>
                        <Ionicons name="heart" size={48} color="#fff" />
                    </View>
                </View>
                <Text style={styles.title}>HeartSync</Text>
                <Text style={styles.subtitle}>Where Hearts Connect, Love Finds Its Sync.</Text>
            </View>

            {/* Auth Card */}
            <View style={styles.card}>
                {/* Toggle Buttons */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                        onPress={() => setIsLogin(true)}
                    >
                        <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                            Đăng nhập
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                        onPress={() => setIsLogin(false)}
                    >
                        <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                            Đăng ký
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {/* Name Field (Signup only) */}
                    {!isLogin && (
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Họ và tên"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    )}

                    {/* Email Field */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Field */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon]}
                            placeholder="Mật khẩu"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Field (Signup only) */}
                    {!isLogin && (
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Xác nhận mật khẩu"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                            />
                        </View>
                    )}

                    {/* Forgot Password (Login only) */}
                    {isLogin && (
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>
                            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoOuter: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#A78BFA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    logoInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 50,
        padding: 4,
        marginBottom: 24,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 50,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#8B5CF6',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    toggleTextActive: {
        color: '#fff',
    },
    formContainer: {
        gap: 16,
    },
    inputContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        top: 16,
        zIndex: 1,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 50,
        paddingVertical: 14,
        paddingLeft: 48,
        paddingRight: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    inputWithIcon: {
        paddingRight: 48,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 1,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#8B5CF6',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 50,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

});