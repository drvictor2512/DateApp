import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PRIMARY_COLOR = '#00C2D1';
const SECONDARY_COLOR = '#5A6C7A';
const BORDER_COLOR = '#E5EAF0';
const CARD_BACKGROUND = '#FFFFFF';
const LIGHT_BACKGROUND = '#F2F6F9';

const FEATURES = [
  { label: 'Unlimited swipes', free: true, premium: true },
  { label: 'Advanced filters', free: true, premium: true },
  { label: 'Remove ads', free: false, premium: true },
  { label: 'Undo accidental left swipes', free: false, premium: true },
  { label: 'Push your profile to more viewers', free: false, premium: true },
];

export default function Home() {
  const router = useRouter();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top header: menu and settings buttons */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu" size={24} color="#1F2A37" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="settings-outline" size={24} color="#1F2A37" />
        </TouchableOpacity>
      </View>

      {/* Profile summary card with avatar, completion and CTA */}
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarColumn}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInnerRing}>
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?img=5' }}
                  style={styles.avatarImage}
                />
              </View>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>45% complete</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>Joshua Edwards, 29</Text>
              <Ionicons name="shield-checkmark" size={18} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.profileSubText}>
              Complete your profile to unlock better matches.
            </Text>
            {/* Navigate to Edit Profile screen */}
            <TouchableOpacity style={styles.editButton} onPress={() => router.push('/tabs/myProfile')}>
              <Text style={styles.editButtonText}>Edit your profile</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Verification info card */}
      <View style={styles.verificationCard}>
        <View style={styles.verificationIcon}>
          <Ionicons name="shield-checkmark" size={22} color={PRIMARY_COLOR} />
        </View>
        <View style={styles.verificationTextWrapper}>
          <Text style={styles.verificationTitle}>
            Verification adds an extra layer of authenticity and trust to your profile.
          </Text>
          <TouchableOpacity>
            <Text style={styles.verifyLink}>Verify your account now!</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="chevron-forward" size={18} color={SECONDARY_COLOR} />
      </View>

      {/* Tabs row (Plans/Safety) */}
      <View style={styles.tabsRow}>
        <TouchableOpacity style={styles.tabItemActive}>
          <Text style={styles.tabLabelActive}>Plans</Text>
          <View style={styles.tabIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabLabel}>Safety</Text>
        </TouchableOpacity>
      </View>

      {/* Premium plan highlight card */}
      <View style={styles.premiumCard}>
        <View style={styles.premiumTitleRow}>
          <Text style={styles.premiumTitle}>HeartSync Premium</Text>
          <Ionicons name="sparkles-outline" size={20} color="#FFFFFFAA" />
        </View>
        <Text style={styles.premiumDescription}>
          Unlock exclusive features and supercharge your dating experience.
        </Text>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeText}>Upgrade from $7.99</Text>
        </TouchableOpacity>
      </View>

      {/* Feature comparison table */}
      <View style={styles.featuresCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderLabel}>Whats included</Text>
          <Text style={styles.tableHeaderColumn}>Free</Text>
          <Text style={styles.tableHeaderColumn}>Premium</Text>
        </View>
        {FEATURES.map((feature) => (
          <View style={styles.tableRow} key={feature.label}>
            <Text style={styles.featureLabel}>{feature.label}</Text>
            <View style={styles.checkColumn}>
              <Ionicons
                name={feature.free ? 'checkbox' : 'square-outline'}
                size={22}
                color={feature.free ? PRIMARY_COLOR : '#C7D0DC'}
              />
            </View>
            <View style={styles.checkColumn}>
              <Ionicons
                name={feature.premium ? 'checkbox' : 'square-outline'}
                size={22}
                color={feature.premium ? PRIMARY_COLOR : '#C7D0DC'}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_BACKGROUND,
  },
  profileCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 18,
  },
  profileRow: {
    flexDirection: 'row',
  },
  avatarColumn: {
    alignItems: 'center',
    marginRight: 18,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${PRIMARY_COLOR}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInnerRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  progressPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: `${PRIMARY_COLOR}1A`,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  profileSubText: {
    fontSize: 13,
    color: SECONDARY_COLOR,
    marginTop: 4,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  verificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${PRIMARY_COLOR}1A`,
  },
  verificationTextWrapper: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 13,
    color: SECONDARY_COLOR,
    marginBottom: 6,
  },
  verifyLink: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 18,
  },
  tabItemActive: {
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabelActive: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 6,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: SECONDARY_COLOR,
  },
  tabIndicator: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: PRIMARY_COLOR,
  },
  premiumCard: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#00A5B8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  upgradeButton: {
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  featuresCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableHeaderLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  tableHeaderColumn: {
    width: 72,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: SECONDARY_COLOR,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  checkColumn: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    flex: 1,
    fontSize: 14,
    color: SECONDARY_COLOR,
  },
});
