// src/screens/PlayersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ref, get, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';
import { colors } from '../styles/globalStyles';

const PlayersScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState({});
  const [pvpGames, setPvpGames] = useState({});
  const [botGames, setBotGames] = useState({});

  // Загружаем список всех пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userList = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          }));
          setPlayers(userList);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Подписываемся на онлайн-статусы
  useEffect(() => {
    const statusRef = ref(db, 'status');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStatuses(data);
      else setStatuses({});
    });
    return () => off(statusRef);
  }, []);

  // Подписываемся на игры PvP
  useEffect(() => {
    const gamesRef = ref(db, 'games_checkers');
    const unsubscribe = onValue(gamesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activeGames = {};
        for (const [gameId, game] of Object.entries(data)) {
          if (game.status === 'active') {
            activeGames[gameId] = game;
          }
        }
        setPvpGames(activeGames);
      } else {
        setPvpGames({});
      }
    });
    return () => off(gamesRef);
  }, []);

  // Подписываемся на игры с ботом
  useEffect(() => {
    const botGamesRef = ref(db, 'bot_games');
    const unsubscribe = onValue(botGamesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activeBotGames = {};
        for (const [gameId, game] of Object.entries(data)) {
          if (game.status === 'active') {
            activeBotGames[gameId] = game;
          }
        }
        setBotGames(activeBotGames);
      } else {
        setBotGames({});
      }
    });
    return () => off(botGamesRef);
  }, []);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'неизвестно';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} д назад`;
  };

  const isInPvpGame = (playerId) => {
    for (const game of Object.values(pvpGames)) {
      if (game.players && game.players[playerId]) return true;
    }
    return false;
  };

  const isInBotGame = (playerId) => {
    for (const game of Object.values(botGames)) {
      if (game.playerId === playerId) return true;
    }
    return false;
  };

  // ← Получаем текст статуса игры
  const getGameStatusText = (playerId) => {
    if (isInPvpGame(playerId)) return '🎮 Играет против игрока';
    if (isInBotGame(playerId)) return '🤖 Играет против компьютера';
    return null;
  };

  const sortPlayers = (playersList, statusesData) => {
    return [...playersList].sort((a, b) => {
      const statusA = statusesData[a.id];
      const statusB = statusesData[b.id];
      const onlineA = statusA?.online === true;
      const onlineB = statusB?.online === true;
      if (onlineA && !onlineB) return -1;
      if (!onlineA && onlineB) return 1;
      const lastSeenA = statusA?.lastSeen || 0;
      const lastSeenB = statusB?.lastSeen || 0;
      return lastSeenB - lastSeenA;
    });
  };

  const sortedPlayers = sortPlayers(players, statuses);

  const showPlayerStats = (player) => {
    const totalGames = player.stats?.totalGames || 0;
    const wins = player.stats?.wins || 0;
    const winRate = totalGames === 0 ? 0 : ((wins / totalGames) * 100).toFixed(1);
    Alert.alert(
      player.name,
      `Сыграно игр: ${totalGames}\nПобед: ${wins}\nПроцент побед: ${winRate}%`,
      [{ text: 'OK' }]
    );
  };

  const renderPlayer = ({ item }) => {
    const status = statuses[item.id];
    const isOnline = status?.online === true;
    const lastSeen = status?.lastSeen;
    const gameStatusText = getGameStatusText(item.id);  // ← Получаем текст статуса

    return (
      <TouchableOpacity 
        style={styles.playerItem} 
        onPress={() => navigation.navigate('PlayerProfile', { playerId: item.id })}
      >
        <View style={styles.playerInfo}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <View style={styles.playerDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
            </View>
            
            {/* ← Показываем статус игры если есть */}
            {gameStatusText ? (
              <View style={styles.gameStatusContainer}>
                <Text style={styles.gameStatusText}>{gameStatusText}</Text>
              </View>
            ) : (
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
                <Text style={styles.statusText}>
                  {isOnline ? 'В сети' : `был(а) ${formatLastSeen(lastSeen)}`}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Игроки</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={sortedPlayers}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  playerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  // ← Новый стиль для статуса игры
  gameStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  gameStatusText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineDot: {
    backgroundColor: '#4ECDC4',
  },
  offlineDot: {
    backgroundColor: '#888',
  },
  statusText: {
    fontSize: 12,
    color: '#aaa',
  },
  arrow: {
    fontSize: 18,
    color: colors.textLight,
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default PlayersScreen;