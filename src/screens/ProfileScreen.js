// src/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { colors } from '../styles/globalStyles';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { userId, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => {
            logout();
            // После выхода контекст обновится, и навигация автоматически переключится на Login (см. App.js)
            // navigation.replace('Login'); // не нужно, так как logout обновляет userId и AppNavigator перестроится
          },
        },
      ]
    );
  };

  const goBack = () => {
    navigation.navigate('Menu');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Не удалось загрузить профиль</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Выйти</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { totalGames, wins } = userData.stats;
  const winRate = totalGames === 0 ? 0 : ((wins / totalGames) * 100).toFixed(1);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.avatar}>{userData.avatar}</Text>
        <Text style={styles.name}>{userData.name}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Сыграно игр: {totalGames}</Text>
          <Text style={styles.statsText}>Побед: {wins}</Text>
          <Text style={styles.statsText}>Процент побед: {winRate}%</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between', // чтобы кнопки были внизу
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: 80,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: '#2c3e50',
    padding: 20,
    borderRadius: 20,
    width: '100%',
  },
  statsText: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 10,
  },
  buttonsContainer: {
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.textLight,
    fontSize: 18,
    marginBottom: 20,
  },
});

export default ProfileScreen;