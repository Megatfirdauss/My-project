
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';

const LOGS_KEY = 'otp_logs';
const SESSIONS_KEY = 'otp_sessions';

export default function SettingsScreen() {
  const [sessions, setSessions] = useState(0);
  const [records, setRecords] = useState(0);

  const loadStats = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem(SESSIONS_KEY);
      const savedLogs = await AsyncStorage.getItem(LOGS_KEY);

      setSessions(Number(savedSessions) || 0);

      const parsedLogs = savedLogs ? JSON.parse(savedLogs) : [];
      setRecords(Array.isArray(parsedLogs) ? parsedLogs.length : 0);
    } catch (error) {
      console.log('Settings loading error:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const resetData = () => {
    Alert.alert(
      'Reset Simulation Data',
      'Semua rekod aktiviti dan jumlah sesi akan dipadam. Tindakan ini tidak boleh dibatalkan.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                LOGS_KEY,
                SESSIONS_KEY,
              ]);

              setSessions(0);
              setRecords(0);

              Alert.alert(
                'Reset Successful',
                'Semua data simulasi telah dipadam.'
              );
            } catch (error) {
              Alert.alert(
                'Reset Failed',
                'Tidak berjaya memadam data.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080D18"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>OTP SECURITY LAB</Text>
        <Text style={styles.subtitle}>APPLICATION PREFERENCES V5</Text>

        <Text style={styles.title}>Settings</Text>

        <Text style={styles.description}>
          Manage your application and testing environment.
        </Text>

        <Text style={styles.sectionTitle}>GENERAL</Text>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Application Name</Text>
          <Text style={styles.itemValue}>OTP Security Lab</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Application Version</Text>
          <Text style={styles.itemValue}>5.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Appearance</Text>
          <Text style={styles.itemValue}>Dark Interface</Text>
        </View>

        <Text style={styles.sectionTitle}>STATISTICS</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL SESSIONS</Text>
            <Text style={styles.statValue}>{sessions}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ACTIVITY RECORDS</Text>
            <Text style={styles.statValue}>{records}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SECURITY</Text>

        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>
            SAFE SIMULATION MODE
          </Text>

          <Text style={styles.securityDescription}>
            Enabled. The application only generates local test records.
            No real OTP messages or requests are sent.
          </Text>

          <View style={styles.status}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>PROTECTED</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Reset Simulation Data</Text>

          <Text style={styles.itemValue}>
            Permanently delete all activity records and session counts.
          </Text>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetData}
          >
            <Text style={styles.resetButtonText}>
              RESET ALL DATA
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Developer</Text>
          <Text style={styles.itemValue}>OTP Security Lab</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Storage</Text>
          <Text style={styles.itemValue}>
            Local device storage (AsyncStorage)
          </Text>
        </View>

        <Text style={styles.footer}>
          OTP SECURITY LAB • VERSION 5.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080D18',
  },
  content: {
    padding: 22,
    paddingTop: 55,
    paddingBottom: 40,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: '#8491A8',
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 38,
  },
  description: {
    color: '#8491A8',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#36E69A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 22,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#121B2B',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#26344A',
    padding: 18,
    marginBottom: 10,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemValue: {
    color: '#8491A8',
    fontSize: 12,
    marginTop: 7,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#121B2B',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#26344A',
    padding: 16,
  },
  statLabel: {
    color: '#8491A8',
    fontSize: 9,
    fontWeight: 'bold',
  },
  statValue: {
    color: '#36E69A',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 10,
  },
  securityCard: {
    backgroundColor: '#0D2926',
    borderRadius: 13,
    padding: 18,
    borderWidth: 1,
    borderColor: '#205345',
  },
  securityTitle: {
    color: '#36E69A',
    fontSize: 12,
    fontWeight: '900',
  },
  securityDescription: {
    color: '#A6B8B5',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: '#36E69A',
    marginRight: 8,
  },
  statusText: {
    color: '#36E69A',
    fontSize: 10,
    fontWeight: '900',
  },
  resetButton: {
    backgroundColor: '#351C26',
    borderWidth: 1,
    borderColor: '#773344',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FF7777',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    color: '#59677D',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 35,
  },
});
