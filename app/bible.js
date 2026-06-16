import { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, TextInput, ActivityIndicator,
  ScrollView, Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

const BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
];

const CHAPTERS = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
  Ecclesiastes: 12, 'Song of Solomon': 8, Isaiah: 66, Jeremiah: 52,
  Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3, Amos: 9,
  Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3,
  Haggai: 2, Zechariah: 14, Malachi: 4, Matthew: 28, Mark: 16, Luke: 24,
  John: 21, Acts: 28, Romans: 16, '1 Corinthians': 16, '2 Corinthians': 13,
  Galatians: 6, Ephesians: 6, Philippians: 4, Colossians: 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
  Titus: 3, Philemon: 1, Hebrews: 13, James: 5, '1 Peter': 5, '2 Peter': 3,
  '1 John': 5, '2 John': 1, '3 John': 1, Jude: 1, Revelation: 22,
};

export default function BibleScreen() {
  const [view,      setView]      = useState('books'); // 'books' | 'chapters' | 'reading'
  const [book,      setBook]      = useState(null);
  const [chapter,   setChapter]   = useState(1);
  const [verses,    setVerses]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');

  const fetchChapter = async (b, c) => {
    setLoading(true); setError(null); setVerses([]);
    try {
      const slug = b.toLowerCase().replace(/ /g, '+');
      const res  = await fetch(`https://bible-api.com/${slug}+${c}?translation=kjv`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVerses(data.verses || []);
      setBook(b); setChapter(c);
      setView('reading');
    } catch (e) {
      setError('Could not load chapter. Please check your connection.');
    }
    setLoading(false);
  };

  const filteredBooks = BOOKS.filter(b =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const chapterCount = book ? CHAPTERS[book] || 1 : 1;

  // Book list view
  if (view === 'books') {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Bible · KJV</Text>
        </View>
        <View style={s.searchWrap}>
          <TextInput
            style={s.searchInput}
            placeholder="Search book…"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          data={filteredBooks}
          keyExtractor={b => b}
          numColumns={2}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.bookCard}
              onPress={() => { setBook(item); setView('chapters'); }}
              activeOpacity={0.8}
            >
              <Text style={s.bookName}>{item}</Text>
              <Text style={s.bookChapters}>{CHAPTERS[item]} ch.</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // Chapter picker view
  if (view === 'chapters') {
    const cols = Array.from({ length: chapterCount }, (_, i) => i + 1);
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setView('books')}>
            <Text style={s.backBtn}>← Books</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{book}</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={s.chaptersGrid}>
          {cols.map(c => (
            <TouchableOpacity
              key={c}
              style={s.chapterBtn}
              onPress={() => fetchChapter(book, c)}
              activeOpacity={0.8}
            >
              {loading && chapter === c
                ? <ActivityIndicator size="small" color={Colors.primary} />
                : <Text style={s.chapterNum}>{c}</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Reading view
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => setView('chapters')}>
          <Text style={s.backBtn}>← {book}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{book} {chapter}</Text>
        <View style={s.chapterNav}>
          {chapter > 1 && (
            <TouchableOpacity onPress={() => fetchChapter(book, chapter - 1)}>
              <Text style={s.navBtn}>‹</Text>
            </TouchableOpacity>
          )}
          {chapter < chapterCount && (
            <TouchableOpacity onPress={() => fetchChapter(book, chapter + 1)}>
              <Text style={s.navBtn}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={s.loadingText}>Loading {book} {chapter}…</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchChapter(book, chapter)}>
            <Text style={s.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={v => String(v.verse)}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          renderItem={({ item }) => (
            <View style={s.verseRow}>
              <Text style={s.verseNum}>{item.verse}</Text>
              <Text style={s.verseText}>{item.text.trim()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 12,
    paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  backBtn:     { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  searchWrap: { padding: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInput: {
    backgroundColor: Colors.background, borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 14,
    fontSize: 14, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border,
  },

  bookCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    padding: 12, justifyContent: 'space-between',
    minHeight: 70,
  },
  bookName:     { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  bookChapters: { fontSize: 11, color: Colors.textMuted },

  chaptersGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10,
  },
  chapterBtn: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  chapterNum: { fontSize: 15, fontWeight: '600', color: Colors.text },

  chapterNav: { flexDirection: 'row', gap: 4 },
  navBtn:     { fontSize: 24, color: Colors.primary, paddingHorizontal: 8 },

  verseRow:  { flexDirection: 'row', gap: 12, marginBottom: 14 },
  verseNum:  { fontSize: 12, fontWeight: '700', color: Colors.secondary, minWidth: 20, paddingTop: 2 },
  verseText: { flex: 1, fontSize: 16, color: Colors.text, lineHeight: 26 },

  loadingText: { fontSize: 13, color: Colors.textMuted, marginTop: 12 },
  errorText:   { fontSize: 14, color: Colors.danger, textAlign: 'center', marginBottom: 16 },
  retryBtn:    { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  retryText:   { color: Colors.white, fontWeight: '700' },
});