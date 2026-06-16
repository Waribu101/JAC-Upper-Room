import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { adminLogin, adminLogout, onAuthChange, adminSignUp } from '../lib/auth';
import { db } from '../lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, orderBy, query, serverTimestamp,
  setDoc, getDoc,
} from 'firebase/firestore';

// ─── Login Screen ─────────────────────────────────────────
function LoginScreen() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true); setError('');
    const result = await adminLogin(email, password);
    if (!result.success) setError(result.message);
    setLoading(false);
  }

  async function handleSignUp() {
    if (!email || !password || !confirmPassword || !inviteCode) { setError('All fields are required.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    const result = await adminSignUp(email, password, inviteCode);
    if (!result.success) setError(result.message);
    setLoading(false);
  }

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>{mode === 'login' ? 'Admin Login' : 'Create Account'}</Text>
        <Text style={styles.loginSubtitle}>JAC Upper Room</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {mode === 'signup' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={Colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Invite Code"
              placeholderTextColor={Colors.textMuted}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="none"
            />
          </>
        )}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={mode === 'login' ? handleLogin : handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.loginButtonText}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          <Text style={styles.switchModeText}>
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Section Tab Button ───────────────────────────────────
function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Announcements Section ────────────────────────────────
function AnnouncementsSection() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [department, setDepartment] = useState('all');
  const [postedBy, setPostedBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  const DEPTS = ['all', 'men', 'women', 'youth', 'sunday_school'];

  async function load() {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!title || !body || !postedBy) return;
    setSaving(true);
    await addDoc(collection(db, 'announcements'), {
      title, body, department, postedBy,
      date: serverTimestamp(),
    });
    setTitle(''); setBody(''); setPostedBy(''); setDepartment('all');
    await load();
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'announcements', id));
    await load();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Add Announcement</Text>
      <TextInput style={styles.input} placeholder="Title" placeholderTextColor={Colors.textMuted} value={title} onChangeText={setTitle} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Body" placeholderTextColor={Colors.textMuted} value={body} onChangeText={setBody} multiline numberOfLines={4} />
      <TextInput style={styles.input} placeholder="Posted By" placeholderTextColor={Colors.textMuted} value={postedBy} onChangeText={setPostedBy} />
      <Text style={styles.fieldLabel}>Department</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {DEPTS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.chip, department === d && styles.chipActive]}
            onPress={() => setDepartment(d)}
          >
            <Text style={[styles.chipText, department === d && styles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.addButtonText}>+ Post Announcement</Text>}
      </TouchableOpacity>
      <Text style={styles.sectionLabel}>Existing Announcements</Text>
      {items.map(item => (
        <View key={item.id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{item.title}</Text>
            <Text style={styles.listItemSub}>{item.department} • {item.postedBy}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── Photos Section ───────────────────────────────────────
function PhotosSection() {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    const q = query(collection(db, 'media'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.type === 'photo'));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!url) return;
    setSaving(true);
    await addDoc(collection(db, 'media'), {
      type: 'photo', url, caption, order: Date.now(),
    });
    setUrl(''); setCaption('');
    await load();
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'media', id));
    await load();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Add Photo</Text>
      <Text style={styles.fieldLabel}>
        Tip: Upload to Google Drive or Imgur, then paste the direct image link below
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Photo URL (e.g. https://i.imgur.com/xxx.jpg)"
        placeholderTextColor={Colors.textMuted}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Caption (optional)"
        placeholderTextColor={Colors.textMuted}
        value={caption}
        onChangeText={setCaption}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.addButtonText}>+ Add Photo</Text>}
      </TouchableOpacity>
      <Text style={styles.sectionLabel}>Existing Photos</Text>
      {items.length === 0 && (
        <Text style={styles.emptyHint}>No photos added yet.</Text>
      )}
      {items.map(item => (
        <View key={item.id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle} numberOfLines={1}>{item.url}</Text>
            <Text style={styles.listItemSub}>{item.caption || 'No caption'}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── Live Link Section ────────────────────────────────────
function LiveLinkSection() {
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'liveLink'));
        if (snap.exists()) setUrl(snap.data().url || '');
      } catch (e) {}
    }
    load();
  }, []);

  async function handleSave() {
    if (!url) return;
    setSaving(true);
    await setDoc(doc(db, 'settings', 'liveLink'), { url });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <View style={styles.section}>
     <Text style={styles.sectionLabel}>YouTube Live Link</Text>
<Text style={styles.fieldLabel}>
  Before each service, paste the YouTube Live URL here. Members will tap "Watch Us Live" to join.
</Text>
<TextInput
  style={styles.input}
  placeholder="https://www.youtube.com/live/..."
        placeholderTextColor={Colors.textMuted}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.addButton} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.addButtonText}>
            {saved ? '✓ Saved!' : 'Update Live Link'}
          </Text>
        )}
      </TouchableOpacity>
      {url ? (
        <View style={styles.currentLinkBox}>
          <Text style={styles.fieldLabel}>Current link:</Text>
          <Text style={styles.currentLinkText} numberOfLines={2}>{url}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Sermons Section ──────────────────────────────────────
function SermonsSection() {
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    const q = query(collection(db, 'media'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.type === 'sermon'));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!title || !speaker || !url || !date) return;
    setSaving(true);
    await addDoc(collection(db, 'media'), {
      type: 'sermon', title, speaker, url, date, order: Date.now(),
    });
    setTitle(''); setSpeaker(''); setUrl(''); setDate('');
    await load();
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'media', id));
    await load();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Add Sermon</Text>
      <TextInput style={styles.input} placeholder="Title" placeholderTextColor={Colors.textMuted} value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Speaker" placeholderTextColor={Colors.textMuted} value={speaker} onChangeText={setSpeaker} />
      <TextInput style={styles.input} placeholder="Video URL (YouTube, Facebook, etc.)" placeholderTextColor={Colors.textMuted} value={url} onChangeText={setUrl} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Date (e.g. May 15, 2026)" placeholderTextColor={Colors.textMuted} value={date} onChangeText={setDate} />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.addButtonText}>+ Add Sermon</Text>}
      </TouchableOpacity>
      <Text style={styles.sectionLabel}>Existing Sermons</Text>
      {items.map(item => (
        <View key={item.id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{item.title}</Text>
            <Text style={styles.listItemSub}>{item.speaker} • {item.date}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── Leadership Section ───────────────────────────────────
function LeadershipSection() {
  const [name,     setName]     = useState('');
  const [role,     setRole]     = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [items,    setItems]    = useState([]);

  async function load() {
    const q = query(collection(db, 'leadership'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!name || !role) return;
    setSaving(true);
    await addDoc(collection(db, 'leadership'), {
      name, role, photoUrl: photoUrl.trim(), order: Date.now(),
    });
    setName(''); setRole(''); setPhotoUrl('');
    await load();
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'leadership', id));
    await load();
  }

  async function handleUpdatePhoto(id, url) {
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'leadership', id), { photoUrl: url });
    await load();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Add Leader</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Role (e.g. Bishop)"
        placeholderTextColor={Colors.textMuted}
        value={role}
        onChangeText={setRole}
      />
      <TextInput
        style={styles.input}
        placeholder="Photo URL (optional — Imgur, Google Drive, etc.)"
        placeholderTextColor={Colors.textMuted}
        value={photoUrl}
        onChangeText={setPhotoUrl}
        autoCapitalize="none"
      />
      <Text style={styles.fieldLabel}>
        Tip: Upload the photo to Imgur (imgur.com) and paste the direct .jpg link above.
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={saving}>
        {saving
          ? <ActivityIndicator color={Colors.white} />
          : <Text style={styles.addButtonText}>+ Add Leader</Text>}
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Existing Leadership</Text>
      {items.map(item => (
        <LeaderAdminCard
          key={item.id}
          item={item}
          onDelete={() => handleDelete(item.id)}
          onUpdatePhoto={(url) => handleUpdatePhoto(item.id, url)}
        />
      ))}
    </View>
  );
}

// ─── Leader Admin Card (with inline photo URL editing) ────
function LeaderAdminCard({ item, onDelete, onUpdatePhoto }) {
  const [editing,  setEditing]  = useState(false);
  const [newUrl,   setNewUrl]   = useState(item.photoUrl || '');
  const [saving,   setSaving]   = useState(false);

  const initials = item.name
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  async function save() {
    setSaving(true);
    await onUpdatePhoto(newUrl.trim());
    setSaving(false);
    setEditing(false);
  }

  return (
    <View style={styles.leaderAdminCard}>
      <View style={styles.leaderAdminRow}>
        {/* Avatar preview */}
        {item.photoUrl ? (
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.leaderAdminAvatar}
          />
        ) : (
          <View style={[styles.leaderAdminAvatar, styles.leaderAdminAvatarFallback]}>
            <Text style={styles.leaderAdminInitials}>{initials}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.listItemTitle}>{item.name}</Text>
          <Text style={styles.listItemSub}>{item.role}</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editPhotoLink}>
              {item.photoUrl ? '✏️ Change photo URL' : '📷 Add photo URL'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {editing && (
        <View style={styles.editPhotoRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Photo URL"
            placeholderTextColor={Colors.textMuted}
            value={newUrl}
            onChangeText={setNewUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.savePhotoBtn}
            onPress={save}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <Text style={styles.savePhotoBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Services Section ─────────────────────────────────────
function ServicesSection() {
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!name || !day || !time || !location) return;
    setSaving(true);
    await addDoc(collection(db, 'services'), { name, day, time, location, order: Date.now() });
    setName(''); setDay(''); setTime(''); setLocation('');
    await load();
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'services', id));
    await load();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Add Service</Text>
      <TextInput style={styles.input} placeholder="Service Name" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Day (e.g. Sunday)" placeholderTextColor={Colors.textMuted} value={day} onChangeText={setDay} />
      <TextInput style={styles.input} placeholder="Time (e.g. 10:00 AM)" placeholderTextColor={Colors.textMuted} value={time} onChangeText={setTime} />
      <TextInput style={styles.input} placeholder="Location" placeholderTextColor={Colors.textMuted} value={location} onChangeText={setLocation} />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.addButtonText}>+ Add Service</Text>}
      </TouchableOpacity>
      <Text style={styles.sectionLabel}>Existing Services</Text>
      {items.map(item => (
        <View key={item.id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{item.name}</Text>
            <Text style={styles.listItemSub}>{item.day} • {item.time} • {item.location}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── Departments Section ──────────────────────────────────
function DepartmentsSection() {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [meets, setMeets] = useState('');
  const [leader, setLeader] = useState('');
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    const q = query(collection(db, 'departments'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!name || !leader) return;
    setSaving(true);
    await addDoc(collection(db, 'departments'), {
      name, icon, color, description, meets, leader, order: Date.now(),
    });
    setName(''); setIcon(''); setColor(''); setDescription(''); setMeets(''); setLeader('');
    await load();
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'departments', id));
    await load();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Add Department</Text>
      <TextInput style={styles.input} placeholder="Name (e.g. Youth)" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Icon (emoji e.g. ⚡)" placeholderTextColor={Colors.textMuted} value={icon} onChangeText={setIcon} />
      <TextInput style={styles.input} placeholder="Color (e.g. #2E7D32)" placeholderTextColor={Colors.textMuted} value={color} onChangeText={setColor} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor={Colors.textMuted} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
      <TextInput style={styles.input} placeholder="Meets (e.g. Every Friday at 6PM)" placeholderTextColor={Colors.textMuted} value={meets} onChangeText={setMeets} />
      <TextInput style={styles.input} placeholder="Leader Name" placeholderTextColor={Colors.textMuted} value={leader} onChangeText={setLeader} />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.addButtonText}>+ Add Department</Text>}
      </TouchableOpacity>
      <Text style={styles.sectionLabel}>Existing Departments</Text>
      {items.map(item => (
        <View key={item.id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{item.icon} {item.name}</Text>
            <Text style={styles.listItemSub}>{item.leader} • {item.meets}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── Main Admin Screen ────────────────────────────────────
export default function AdminScreen() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');

  useEffect(() => {
    const unsub = onAuthChange(u => {
      setUser(u);
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    return (
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const TABS = [
    { id: 'announcements', label: '📢' },
    { id: 'photos', label: '📷' },
    { id: 'live', label: '🔴' },
    { id: 'sermons', label: '🎙️' },
    { id: 'leadership', label: '👤' },
    { id: 'services', label: '🕐' },
    { id: 'departments', label: '👥' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.adminHeader}>
        <Text style={styles.adminTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={adminLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {TABS.map(t => (
          <TabButton key={t.id} label={t.label} active={activeTab === t.id} onPress={() => setActiveTab(t.id)} />
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'announcements' && <AnnouncementsSection />}
        {activeTab === 'photos' && <PhotosSection />}
        {activeTab === 'live' && <LiveLinkSection />}
        {activeTab === 'sermons' && <SermonsSection />}
        {activeTab === 'leadership' && <LeadershipSection />}
        {activeTab === 'services' && <ServicesSection />}
        {activeTab === 'departments' && <DepartmentsSection />}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: 24 },
  loginCard: { width: '100%', maxWidth: 400, backgroundColor: Colors.white, borderRadius: 16, padding: 28, borderWidth: 1, borderColor: Colors.border },
  loginTitle: { fontSize: 24, fontWeight: '800', color: Colors.primary, textAlign: 'center' },
  loginSubtitle: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 24, marginTop: 4 },
  errorText: { color: Colors.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  input: { backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.text, marginBottom: 12 },
  textArea: { height: 90, textAlignVertical: 'top' },
  loginButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  loginButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  adminHeader: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  adminTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  logoutText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  tabBar: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 52 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabBtnText: { fontSize: 20 },
  tabBtnTextActive: { color: Colors.primary },
  content: { flex: 1 },
  section: { padding: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.secondary, letterSpacing: 1.5, marginTop: 16, marginBottom: 10, textTransform: 'uppercase' },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 6, fontWeight: '500', lineHeight: 18 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '700' },
  addButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4, marginBottom: 8 },
  addButtonText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  listItem: { backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  listItemTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  listItemSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  deleteBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  deleteBtnText: { color: Colors.danger, fontSize: 12, fontWeight: '700' },
  emptyHint: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginVertical: 12 },
  currentLinkBox: { backgroundColor: Colors.white, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border, marginTop: 8 },
  currentLinkText: { fontSize: 13, color: Colors.primary, marginTop: 4, fontWeight: '500' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
eyeBtn: { padding: 10 },
eyeIcon: { fontSize: 18 },
switchModeText: { color: Colors.primary, fontSize: 13, textAlign: 'center', marginTop: 14, fontWeight: '600' },
  leaderAdminCard: { backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  leaderAdminRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leaderAdminAvatar: { width: 44, height: 44, borderRadius: 22 },
  leaderAdminAvatarFallback: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  leaderAdminInitials: { fontSize: 16, fontWeight: '700', color: Colors.white },
  editPhotoLink: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 4 },
  editPhotoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  savePhotoBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  savePhotoBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
});