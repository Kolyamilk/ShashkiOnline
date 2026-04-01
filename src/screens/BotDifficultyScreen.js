import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/globalStyles';

const difficulties = [
  { name: 'Легкий', value: 'easy' },
  { name: 'Средний', value: 'medium' },
  { name: 'Тяжелый', value: 'hard' },
  { name: 'Гроссмейстер', value: 'grandmaster' },
];

const BotDifficultyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите сложность</Text>
      {difficulties.map((diff) => (
        <TouchableOpacity
          key={diff.value}
          style={styles.button}
          onPress={() => navigation.navigate('BotGame', { difficulty: diff.value })}
        >
          <Text style={styles.buttonText}>{diff.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.button, styles.backButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Назад</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 40,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default BotDifficultyScreen;