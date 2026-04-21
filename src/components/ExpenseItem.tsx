import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ExpenseItem = () => {
  return (
    <View style={styles.container}>
      <Text>ExpenseItem Placeholder</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 4,
  },
});
