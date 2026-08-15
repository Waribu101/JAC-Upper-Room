import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../lib/authContext';

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with that email already exists — try logging in instead.';
    case 'auth/invalid-email':
      return 'That email address doesn\u2019t look right.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function AuthGate() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  async function handleSubmit() {
    setError('');
    if (!email || !password || (isSignup && !name)) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email.trim(), password, name);
      } else {
        await login(email.trim(), password);
      }
      // No manual navigation needed — App.js watches auth state via
      // useAuth() and swaps to MainTabs automatically once user is set.
    } catch (e) {
      setError(friendlyError(e.code));
    }
    setLoading(false);
  }

  function toggleMode() {
    setError('');
    setMode(isSignup ? 'login' : 'signup');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.cross}>✝</Text>
        <Text style={styles.title}>JAC Upper Room</Text>
        <Text style={styles.subtitle}>
          {isSignup ? 'Create your account' : 'Welcome back'}
        </Text>
      </View>

      <View style={styles.form}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {isSignup && (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoComplete="name"
              textContentType="name"
            />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          textContentType={isSignup ? 'newPassword' : 'password'}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              {isSignup ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={toggleMode} style={styles.toggleWrap}>
        <Text style={styles.toggleText}>
          {isSignup
            ? 'Already have an account? '
            : "Don't have an account? "}
          <Text style={styles.toggleLink}>
            {isSignup ? 'Log in' : 'Sign up'}
          </Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  cross: {
    fontSize: 48,
    color: Colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  toggleLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});