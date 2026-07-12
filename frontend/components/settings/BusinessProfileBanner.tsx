import { Image, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

const PROFILE_GREEN = '#1B3022';
const ACCENT_GOLD = '#D4C19C';

interface BusinessProfileBannerProps {
  businessName: string;
  secondaryText?: string;
  logoUri?: string | null;
}

export function BusinessProfileBanner({
  businessName,
  secondaryText,
  logoUri,
}: BusinessProfileBannerProps) {
  const initial = businessName.trim().charAt(0).toUpperCase() || 'B';

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarWrap}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.logo} resizeMode="cover" />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.profileName} numberOfLines={2}>
          {businessName}
        </Text>
        {secondaryText ? (
          <Text style={styles.profileMeta} numberOfLines={1}>
            {secondaryText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROFILE_GREEN,
    borderRadius: Radius.input,
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    gap: 16,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: PROFILE_GREEN,
  },
  textWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: ACCENT_GOLD,
  },
  profileMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.76)',
    letterSpacing: 0.2,
  },
});
