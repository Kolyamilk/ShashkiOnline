// src/screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { colors } from '../styles/globalStyles';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const { userId, login } = useAuth();

  // Переход на Menu после успешного входа
  useEffect(() => {
    if (userId) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Menu' }],
      });
    }
  }, [userId, navigation]);

  const handleLogin = async () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Введите имя и пароль');
      return;
    }

    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (!snapshot.exists()) {
        Alert.alert('Ошибка', 'Пользователь не найден');
        return;
      }

      const users = snapshot.val();
      let foundUserId = null;
      for (const [userId, userData] of Object.entries(users)) {
        if (userData.name === name.trim() && userData.password === password.trim()) {
          foundUserId = userId;
          break;
        }
      }

      if (foundUserId) {
        login(foundUserId);
      } else {
        Alert.alert('Ошибка', 'Неверное имя или пароль');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось войти');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>

      <TextInput
        style={styles.input}
        placeholder="Имя"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Войти</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#2c3e50',
    color: colors.textLight,
    padding: 12,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;