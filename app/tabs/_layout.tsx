import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    return (
        <Tabs screenOptions={{
            headerShown: false, tabBarStyle: {
                borderTopWidth: 1,
                paddingTop: 5,
                paddingBottom: insets.bottom,
                height: 60 + insets.bottom

            },
            tabBarShowLabel: false
        }}>
            <Tabs.Screen name="home" options={{
                tabBarIcon: ({ color, size }) => (<Ionicons
                    name="person-outline" size={size} color={color} />)
            }} />
            <Tabs.Screen name="heart" options={{
                tabBarIcon: ({ color, size }) => (<Ionicons
                    name="heart-outline" size={size} color={color} />)
            }} />
            <Tabs.Screen name="save" options={{
                tabBarIcon: ({ color, size }) => (<Ionicons
                    name="bookmark-outline" size={size} color={color} />)
            }} />
            <Tabs.Screen name="chat" options={{
                tabBarIcon: ({ color, size }) => (<Ionicons
                    name="paper-plane-outline" size={size} color={color} />)
            }} />
            {/* Hidden screens - không hiện trên tab bar */}
            <Tabs.Screen
                name="filter"
                options={{
                    href: null, // Ẩn khỏi tab bar
                }}
            />
            <Tabs.Screen
                name="myProfile"
                options={{
                    href: null, // Ẩn khỏi tab bar
                }}
            />
            <Tabs.Screen
                name="viewProfile"
                options={{
                    href: null, // Ẩn khỏi tab bar
                }}
            />
            <Tabs.Screen
                name="chatDetails"
                options={{
                    href: null, // Ẩn khỏi tab bar
                }}
            />
        </Tabs>
    )
}