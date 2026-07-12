import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronLeft, LogOut } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { BusinessProfileBanner } from '@/components/settings/BusinessProfileBanner';
import { screenStyles } from '@/constants/screenLayout';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useSettingsAccess } from '@/hooks/useSettingsAccess';
import { useAuthStore } from '@/store/authStore';
import { getBusinessProfile, formatProfileValue } from '@/utils/businessProfile';
const LOGOUT_RED = '#EA4335';

export default function SettingsScreen() {
  const router = useRouter();
  const registration = useAuthStore((s) => s.registration);
  const logout = useAuthStore((s) => s.logout);
  const profile = getBusinessProfile(registration);
  const { visibleMenuItems } = useSettingsAccess();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={screenStyles.pageHeader}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={screenStyles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={screenStyles.pageTitle}>Settings</Text>
        </View>
        <Pressable onPress={() => router.push('/dashboard/business-profile' as Href)}>
          <BusinessProfileBanner
            businessName={formatProfileValue(profile.businessName, 'Your Business')}
            secondaryText={
              profile.gstNumber
                ? `GSTIN: ${profile.gstNumber}`
                : profile.businessType
                  ? profile.businessType
                  : registration.businessId
                    ? `Business ID: ${registration.businessId}`
                    : 'Registered Organization'
            }
          />
        </Pressable>

        <View style={styles.menuList}>
          {visibleMenuItems.map((item) => {
            if (item.isLogout) {
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={handleLogout}
                  activeOpacity={0.9}
                  style={styles.menuCard}
                >
                  <View style={styles.logoutIconWrap}>
                    <LogOut size={20} color={LOGOUT_RED} />
                  </View>
                  <Text style={styles.logoutTitle}>{item.title}</Text>
                </TouchableOpacity>
              );
            }

            const Icon = item.icon;
            const content = (
              <>
                <View style={styles.iconWrap}>
                  <Icon size={20} color={Colors.textPrimary} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
              </>
            );

            if (item.route) {
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  style={styles.menuCard}
                  onPress={() => router.push(item.route as Href)}
                >
                  {content}
                </TouchableOpacity>
              );
            }

            return (
              <View key={item.id} style={styles.menuCard}>
                {content}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  menuList: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginTop: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  logoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE8E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },

  logoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: LOGOUT_RED,
  },
});
