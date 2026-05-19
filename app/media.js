import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
  Linking, RefreshControl, Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { getMedia, getLiveLink } from '../lib/firestore';

const TABS = [
  { id: 'photos', label: '📷 Photos' },
  { id: 'sermons', label: '🎙️ Sermons' },
];

function LiveBanner() {
  const [liveUrl, setLiveUrl] = useState('https://www.facebook.com');

  useEffect(() => {
    getLiveLink().then(url => setLiveUrl(url));
  }, []);

  return (
    <TouchableOpacity
      style={styles.liveBanner}
      onPress={() => Linking.openURL(liveUrl)}
      activeOpacity={0.85}
    >
      <View style={styles.liveDot} />
      <View style={styles.liveTextBox}>
        <Text style={styles.liveTitle}>Watch Us Live</Text>
        <Text style={styles.liveSubtitle}>
          Join our Facebook Live every Sunday at 10AM
        </Text>
      </View>
      <Text style={styles.liveArrow}>▶</Text>
    </TouchableOpacity>
  );
}

function getDriveImageUrl(url) {
  if (!url) return url;
  // Handle: https://drive.google.com/file/d/FILE_ID/view...
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  // Handle: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) {
    return `https://drive.google.com/uc?export=view&id=${match2[1]}`;
  }
  return url;
}

function PhotoGrid({ photos }) {
  if (photos.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🖼️</Text>
        <Text style={styles.emptyText}>No photos yet</Text>
        <Text style={styles.emptySubtext}>Check back soon!</Text>
      </View>
    );
  }

  return (
    <View style={styles.photoGrid}>
      {photos.map(item => (
        <TouchableOpacity key={item.id} style={styles.photoCell} activeOpacity={0.8}>
          <Image
  source={{ uri: getDriveImageUrl(item.url) }}
  style={{
    width: '100%',
    height: '100%',
    borderRadius: 10,
  }}
  resizeMode="cover"
/>
          {item.caption ? (
            <View style={styles.captionOverlay}>
              <Text style={styles.captionText} numberOfLines={1}>
                {item.caption}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function SermonList({ sermons }) {
  if (sermons.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎙️</Text>
        <Text style={styles.emptyText}>No sermons uploaded yet</Text>
        <Text style={styles.emptySubtext}>Check back soon!</Text>
      </View>
    );
  }

  return (
    <View style={styles.sermonList}>
      {sermons.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.sermonCard}
          onPress={() => Linking.openURL(item.url)}
          activeOpacity={0.8}
        >
          <View style={styles.sermonIconBox}>
            <Text style={styles.sermonIcon}>▶</Text>
          </View>
          <View style={styles.sermonInfo}>
            <Text style={styles.sermonTitle}>{item.title}</Text>
            <Text style={styles.sermonSpeaker}>{item.speaker}</Text>
            <Text style={styles.sermonDate}>{item.date}</Text>
          </View>
          <Text style={styles.sermonFb}>f</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function MediaScreen() {
  const [activeTab, setActiveTab] = useState('photos');
  const [photos, setPhotos] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadMedia() {
    const data = await getMedia();
    setPhotos(data.filter(d => d.type === 'photo'));
    setSermons(data.filter(d => d.type === 'sermon'));
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadMedia();
    setRefreshing(false);
  }

  useEffect(() => {
    loadMedia();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={{ marginTop: 60 }}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Live Banner */}
      <LiveBanner />

      {/* Tab Switch */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'photos' ? (
          <PhotoGrid photos={photos} />
        ) : (
          <SermonList sermons={sermons} />
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  liveBanner: {
    backgroundColor: '#1877F2',
    margin: 16,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    marginRight: 14,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  liveTextBox: {
    flex: 1,
  },
  liveTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  liveSubtitle: {
    fontSize: 12,
    color: '#B0C8F0',
    marginTop: 2,
  },
  liveArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.white,
  },
  content: {
    padding: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoCell: {
    width: '47.5%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.border,
    position: 'relative',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  captionText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sermonList: {
    gap: 10,
  },
  sermonCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sermonIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sermonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  sermonInfo: {
    flex: 1,
  },
  sermonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  sermonSpeaker: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  sermonDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sermonFb: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1877F2',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
});