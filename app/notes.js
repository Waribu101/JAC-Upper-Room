import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Modal, Platform, Alert, ActivityIndicator,
} from 'react-native';
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Colors } from '../constants/colors';

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotesScreen() {
  const [uid,     setUid]     = useState(null);
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [viewing, setViewing] = useState(null); // note being read
  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [saving,  setSaving]  = useState(false);

  // Restore existing session if one exists (persisted via AsyncStorage in
  // lib/firebase.js). Only sign in anonymously if there's truly no user yet.
  // This is what keeps the same UID — and therefore the same saved notes —
  // across app restarts.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        loadNotes(user.uid);
      } else {
        signInAnonymously(auth).catch(err => {
          console.error('Anon auth failed:', err);
          setLoading(false);
        });
      }
    });
    return unsubscribe;
  }, []);

  const loadNotes = async (userId) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'notes', userId, 'entries'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveNote = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'notes', uid, 'entries'), {
        title: title.trim(),
        body:  body.trim(),
        date:  new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
        createdAt: serverTimestamp(),
      });
      setTitle(''); setBody('');
      setModal(false);
      await loadNotes(uid);
    } catch (e) {
      Alert.alert('Error', 'Could not save note. Please try again.');
    }
    setSaving(false);
  };

  const deleteNote = (noteId) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'notes', uid, 'entries', noteId));
          setViewing(null);
          await loadNotes(uid);
        },
      },
    ]);
  };

  const openNew = () => { setTitle(''); setBody(''); setModal(true); };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>My Notes</Text>
        <TouchableOpacity style={s.addBtn} onPress={openNew}>
          <Text style={s.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Notes list */}
      {notes.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📝</Text>
          <Text style={s.emptyTitle}>No notes yet</Text>
          <Text style={s.emptySub}>
            Take notes during a service or Bible study — they'll be saved here.
          </Text>
          <TouchableOpacity style={s.emptyBtn} onPress={openNew}>
            <Text style={s.emptyBtnText}>Write your first note</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => setViewing(item)}
              activeOpacity={0.8}
            >
              <View style={s.cardTop}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.cardDate}>{item.date}</Text>
              </View>
              {item.body ? (
                <Text style={s.cardBody} numberOfLines={2}>{item.body}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}

      {/* New Note Modal */}
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={s.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle}>New Note</Text>
            <TouchableOpacity onPress={saveNote} disabled={saving || !title.trim()}>
              <Text style={[s.modalSave, (!title.trim() || saving) && s.modalSaveDim]}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={s.inputTitle}
            placeholder="Title"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
          <View style={s.divider} />
          <TextInput
            style={s.inputBody}
            placeholder="Write your note here…"
            placeholderTextColor={Colors.textMuted}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </View>
      </Modal>

      {/* View Note Modal */}
      <Modal visible={!!viewing} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setViewing(null)}>
              <Text style={s.modalCancel}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle} numberOfLines={1}>{viewing?.title}</Text>
            <TouchableOpacity onPress={() => deleteNote(viewing?.id)}>
              <Text style={s.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.viewDate}>{viewing?.date}</Text>
          <View style={s.divider} />
          <Text style={s.viewBody}>{viewing?.body || 'No content.'}</Text>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  addBtn:      { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 },
  addBtnText:  { color: Colors.white, fontWeight: '700', fontSize: 13 },

  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon:   { fontSize: 48, marginBottom: 16 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySub:    { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn:    { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText:{ color: Colors.white, fontWeight: '700' },

  card: {
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  cardTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },
  cardDate:  { fontSize: 11, color: Colors.textMuted, marginLeft: 8 },
  cardBody:  { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },

  modalContainer: { flex: 1, backgroundColor: Colors.white, paddingTop: Platform.OS === 'web' ? 20 : 0 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle:   { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1, textAlign: 'center' },
  modalCancel:  { fontSize: 14, color: Colors.textMuted },
  modalSave:    { fontSize: 14, fontWeight: '700', color: Colors.primary },
  modalSaveDim: { opacity: 0.35 },
  deleteText:   { fontSize: 14, fontWeight: '600', color: Colors.danger },

  inputTitle: {
    fontSize: 20, fontWeight: '700', color: Colors.text,
    padding: 16, paddingBottom: 12,
  },
  inputBody: {
    flex: 1, fontSize: 15, color: Colors.text, lineHeight: 22,
    padding: 16, paddingTop: 12,
  },
  divider:  { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  viewDate: { fontSize: 12, color: Colors.textMuted, padding: 16, paddingBottom: 12 },
  viewBody: { fontSize: 15, color: Colors.text, lineHeight: 24, padding: 16, paddingTop: 12 },
});