
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Share,
} from 'react-native';

type Provider = 'SMS' | 'WhatsApp' | 'Email';

type LogEntry = {
  id: number;
  time: string;
  message: string;
  status: string;
};

const LOGS_KEY = 'otp_logs';
const SESSIONS_KEY = 'otp_sessions';

export default function HomeScreen() {
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState<Provider>('SMS');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sessions, setSessions] = useState(0);
  const [running, setRunning] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  // LOAD DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedLogs = await AsyncStorage.getItem(LOGS_KEY);
        const savedSessions = await AsyncStorage.getItem(SESSIONS_KEY);

        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }

        if (savedSessions) {
          const count = Number(savedSessions);
          setSessions(Number.isFinite(count) ? count : 0);
        }
      } catch (error) {
        console.log('Storage loading error:', error);
      } finally {
        setStorageReady(true);
      }
    };

    loadData();
  }, []);

  // SAVE DATA
  useEffect(() => {
    if (!storageReady) return;

    const saveData = async () => {
      try {
        await AsyncStorage.multiSet([
          [LOGS_KEY, JSON.stringify(logs)],
          [SESSIONS_KEY, String(sessions)],
        ]);
      } catch (error) {
        console.log('Storage saving error:', error);
      }
    };

    saveData();
  }, [logs, sessions, storageReady]);

  // ADD ACTIVITY LOG
  const addLog = (message: string, status: string) => {
    setLogs(prev => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        message,
        status,
      },
      ...prev,
    ]);
  };

  // START SAFE SIMULATION
  const startTest = () => {
    if (running || !storageReady) return;

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 4) {
      addLog('Sila masukkan sekurang-kurangnya 4 digit.', 'WARNING');
      return;
    }

    const maskedPhone = `•••• ${cleanPhone.slice(-4)}`;

    setRunning(true);
    setSessions(prev => prev + 1);

    addLog(
      `${provider} simulation started for ${maskedPhone}`,
      'RUNNING'
    );

    setTimeout(() => {
      addLog(
        `${provider} simulation completed successfully.`,
        'COMPLETED'
      );
      setRunning(false);
    }, 1500);
  };

  // CLEAR ACTIVITY LOG
  const clearLogs = () => {
    if (running) return;

    Alert.alert(
      'Clear Activity Logs',
      'Adakah kau pasti mahu memadam semua rekod aktiviti?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => setLogs([]),
        },
      ]
    );
  };

  // EXPORT ACTIVITY LOG
  const exportLogs = async () => {
    if (logs.length === 0) {
      Alert.alert(
        'No Records',
        'Tiada rekod untuk dieksport.'
      );
      return;
    }

    const report = [
      'OTP SECURITY LAB - ACTIVITY REPORT',
      `Total Sessions: ${sessions}`,
      `Total Logs: ${logs.length}`,
      '',
      ...logs.map(
        item => `[${item.time}] ${item.status}: ${item.message}`
      ),
    ].join('\n');

    try {
      await Share.share({
        title: 'OTP Security Lab Activity Report',
        message: report,
      });
    } catch (error) {
      Alert.alert(
        'Export Error',
        'Tidak berjaya mengeksport rekod.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080D18"
      />

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>OTP SECURITY LAB</Text>
            <Text style={styles.subtitle}>CONTROL CENTER V4.0</Text>
          </View>

          <View style={styles.online}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SYSTEM OVERVIEW</Text>

          <Text style={styles.heroTitle}>
            Security{"\n"}Dashboard
          </Text>

          <Text style={styles.heroDescription}>
            Controlled OTP simulation environment.
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL SESSIONS</Text>
            <Text style={styles.statValue}>{sessions}</Text>
            <Text style={styles.statHint}>Tests performed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SYSTEM STATUS</Text>
            <Text style={styles.statValue}>SAFE</Text>
            <Text style={styles.statHint}>Local simulation only</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SIMULATION CONTROL</Text>

          <Text style={styles.label}>TEST IDENTIFIER / PHONE</Text>

          <TextInput
            style={styles.input}
            placeholder="+60 12 345 6789"
            placeholderTextColor="#69758B"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>MOCK PROVIDER</Text>

          <View style={styles.providers}>
            {(['SMS', 'WhatsApp', 'Email'] as Provider[]).map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => setProvider(item)}
                style={[
                  styles.providerButton,
                  provider === item && styles.providerActive,
                ]}
              >
                <Text
                  style={[
                    styles.providerText,
                    provider === item && styles.providerTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modeBox}>
            <Text style={styles.modeTitle}>SAFE SIMULATION MODE</Text>

            <Text style={styles.modeDescription}>
              Mock provider only. No real SMS, WhatsApp messages,
              email or OTP requests are transmitted.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (running || !storageReady) && styles.buttonDisabled,
            ]}
            onPress={startTest}
            disabled={running || !storageReady}
          >
            <Text style={styles.buttonText}>
              {!storageReady
                ? 'LOADING STORAGE...'
                : running
                  ? 'SIMULATION RUNNING...'
                  : 'START SAFE TEST'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVITY LOG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVITY LOG</Text>

          <View style={styles.logActions}>
            <Text style={styles.logCount}>
              {logs.length} RECORDS
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={exportLogs}
                disabled={logs.length === 0}
              >
                <Text
                  style={[
                    styles.actionText,
                    logs.length === 0 && styles.disabledText,
                  ]}
                >
                  EXPORT LOG
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={clearLogs}
                disabled={running || logs.length === 0}
              >
                <Text
                  style={[
                    styles.actionText,
                    styles.deleteText,
                    (running || logs.length === 0) && styles.disabledText,
                  ]}
                >
                  CLEAR ALL
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {logs.length === 0 ? (
            <Text style={styles.empty}>
              No activity recorded yet.
            </Text>
          ) : (
            logs.map(item => (
              <View key={item.id} style={styles.logItem}>
                <View style={styles.logTop}>
                  <Text style={styles.logTime}>{item.time}</Text>

                  <Text
                    style={[
                      styles.logStatus,
                      item.status === 'WARNING' && styles.warning,
                      item.status === 'RUNNING' && styles.runningText,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <Text style={styles.logMessage}>
                  {item.message}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.footerTitle}>SECURITY NOTICE</Text>

          <Text style={styles.footer}>
            This application operates in local simulation mode.
            No external OTP services are contacted.
          </Text>
        </View>

        <Text style={styles.copyright}>
          OTP SECURITY LAB • VERSION 4.0
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080D18',
  },
  content: {
    padding: 22,
    paddingTop: 20,
    paddingBottom: 45,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
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
  online: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12372D',
    padding: 9,
    borderRadius: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#36E69A',
    marginRight: 6,
  },
  onlineText: {
    color: '#36E69A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hero: {
    marginBottom: 25,
  },
  eyebrow: {
    color: '#36E69A',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 12,
    lineHeight: 44,
  },
  heroDescription: {
    color: '#8491A8',
    marginTop: 12,
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#121B2B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26344A',
  },
  statLabel: {
    color: '#8491A8',
    fontSize: 9,
    fontWeight: 'bold',
  },
  statValue: {
    color: '#36E69A',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 10,
  },
  statHint: {
    color: '#8491A8',
    fontSize: 10,
    marginTop: 5,
  },
  section: {
    backgroundColor: '#121B2B',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#26344A',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 20,
  },
  label: {
    color: '#8491A8',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  input: {
    backgroundColor: '#080D18',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#34445D',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    marginBottom: 20,
  },
  providers: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  providerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 9,
    backgroundColor: '#080D18',
    borderWidth: 1,
    borderColor: '#34445D',
    alignItems: 'center',
  },
  providerActive: {
    backgroundColor: '#0D2926',
    borderColor: '#36E69A',
  },
  providerText: {
    color: '#8491A8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  providerTextActive: {
    color: '#36E69A',
  },
  modeBox: {
    backgroundColor: '#0D2926',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  modeTitle: {
    color: '#36E69A',
    fontWeight: 'bold',
    fontSize: 11,
  },
  modeDescription: {
    color: '#A6B8B5',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 7,
  },
  button: {
    backgroundColor: '#36D99A',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#07150F',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  logActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logCount: {
    color: '#8491A8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionText: {
    color: '#36E69A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#FF7777',
  },
  disabledText: {
    opacity: 0.35,
  },
  empty: {
    color: '#8491A8',
    fontSize: 12,
  },
  logItem: {
    backgroundColor: '#080D18',
    borderRadius: 9,
    padding: 13,
    marginBottom: 10,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logTime: {
    color: '#8491A8',
    fontSize: 10,
  },
  logStatus: {
    color: '#36E69A',
    fontSize: 9,
    fontWeight: '900',
  },
  warning: {
    color: '#FFB84D',
  },
  runningText: {
    color: '#6DBBFF',
  },
  logMessage: {
    color: '#D0D9E7',
    fontSize: 11,
    lineHeight: 17,
  },
  footerBox: {
    backgroundColor: '#0D2926',
    borderRadius: 12,
    padding: 15,
    marginBottom: 18,
  },
  footerTitle: {
    color: '#36E69A',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 7,
  },
  footer: {
    color: '#A6B8B5',
    fontSize: 11,
    lineHeight: 18,
  },
  copyright: {
    color: '#59677D',
    fontSize: 9,
    textAlign: 'center',
  },
});
