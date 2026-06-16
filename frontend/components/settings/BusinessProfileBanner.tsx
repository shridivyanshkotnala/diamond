import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

const PROFILE_GREEN = '#1B3022';
const ACCENT_GOLD = '#D4C19C';

interface BusinessProfileBannerProps {
  businessName: string;
}

export function BusinessProfileBanner({ businessName }: BusinessProfileBannerProps) {
  const nameLines = businessName.includes('\n')
    ? businessName.split('\n')
    : businessName.split(' ').length > 1
      ? [businessName.split(' ')[0], businessName.split(' ').slice(1).join(' ')]
      : [businessName];

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatar} />
      <Text style={styles.profileName}>
        {nameLines.join('\n')}
      </Text>
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
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
  },
  profileName: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: ACCENT_GOLD,
  },
});
