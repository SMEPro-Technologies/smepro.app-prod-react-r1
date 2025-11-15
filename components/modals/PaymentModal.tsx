import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  includeAddon?: boolean; // whether to include Level-Up package
}

export default function PaymentModal({ visible, onClose, includeAddon = false }: PaymentModalProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      initializePaymentSheet();
    }
  }, [visible]);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);

      // Call backend to create subscription
      const response = await fetch('https://api.smepro.app/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeAddon }),
      });

      const { paymentIntentClientSecret, customerId, ephemeralKeySecret } = await response.json();

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'SMEPro Solo',
        customerId,
        customerEphemeralKeySecret: ephemeralKeySecret,
        paymentIntentClientSecret,
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        Alert.alert('PaymentSheet init failed', error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err: any) {
      Alert.alert('Error initializing PaymentSheet', err.message);
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert('Payment failed', error.message);
    } else {
      Alert.alert('Payment successful', 'Your subscription is now active!');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>Confirm Your Plan</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <Button title="Proceed to Payment" onPress={openPaymentSheet} />
          )}
          <Button title="Cancel" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
});
