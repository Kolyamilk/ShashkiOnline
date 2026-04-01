import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { colors } from '../styles/globalStyles';

const LeaderboardScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userList = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            stats: data[key].stats || { totalGames: 0, wins: 0 }, // гарантия наличия stats
          }));
          // Сортировка по проценту побед
          userList.sort((a, b) => {
            const rateA = a.stats.totalGames === 0 ? 0 : (a.stats.wins / a.stats.totalGames);
            const rateB = b.stats.totalGames === 0 ? 0 : (b.stats.wins / b.stats.totalGames);
            return rateB - rateA;
          });
          setUsers(userList);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  const showPlayerStats = (user) => {
    const totalGames = user.stats?.totalGames || 0;
    const wins = user.stats?.wins || 0;
    const winRate = totalGames === 0 ? 0 : ((wins / totalGames) * 100).toFixed(1);
    Alert.alert(
      user.name,
      `Сыграно игр: ${totalGames}\nПобед: ${wins}\nПроцент побед: ${winRate}%`,
      [{ text: 'OK' }]
    );
  };

  const renderItem = ({ item, index }) => {
    const winRate = item.stats.totalGames === 0 ? 0 : ((item.stats.wins / item.stats.totalGames) * 100).toFixed(1);
    return (
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PlayerProfile', { playerId: item.id })}>
        <Text style={styles.rank}>{index + 1}</Text>
        <Text style={styles.avatar}>{item.avatar}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.rate}>{winRate}%</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Рейтинг игроков</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Menu')}>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  rank: {
    width: 40,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
    textAlign: 'center',
  },
  avatar: {
    fontSize: 28,
    marginHorizontal: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: colors.textLight,
  },
  rate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textLight,
    width: 60,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LeaderboardScreen;