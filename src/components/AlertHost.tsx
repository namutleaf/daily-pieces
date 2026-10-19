import React, { useEffect, useState } from 'react';
import { AlertButton, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { AlertRequest, setAlertPresenter } from '../utils/alert';

export default function AlertHost() {
  const [queue, setQueue] = useState<AlertRequest[]>([]);

  useEffect(() => {
    setAlertPresenter((request) => setQueue((prev) => [...prev, request]));
    return () => setAlertPresenter(null);
  }, []);

  const current = queue[0];

  const handlePress = (button: AlertButton) => {
    setQueue((prev) => prev.slice(1));
    button.onPress?.();
  };

  return (
    <Modal visible={!!current} transparent animationType="fade" onRequestClose={() => setQueue((p) => p.slice(1))}>
      <View style={styles.backdrop}>
        {current && (
          <View style={styles.card}>
            <Text style={styles.title}>{current.title}</Text>
            {!!current.message && <Text style={styles.message}>{current.message}</Text>}
            <View style={styles.actions}>
              {current.buttons.map((button, i) => {
                const primary = button.style !== 'cancel';
                return (
                  <Pressable
                    key={`${button.text}-${i}`}
                    style={({ pressed }) => [
                      styles.btn,
                      primary && styles.btnPrimary,
                      button.style === 'destructive' && styles.btnDestructive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handlePress(button)}
                  >
                    <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{button.text ?? '확인'}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: theme.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.bg,
  },
  btnPrimary: {
    backgroundColor: theme.accent,
  },
  btnDestructive: {
    backgroundColor: '#E5484D',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  btnTextPrimary: {
    color: '#fff',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
