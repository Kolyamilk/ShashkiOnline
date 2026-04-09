import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../styles/globalStyles';

// Статичные данные подарков (позже заменятся на данные из БД)
const giftsData = [
  {
    id: '1',
    name: 'Розовый мишка',
    emoji: '🧸',
    from: 'Анна',
    date: '2 марта 2025',
  },
  {
    id: '2',
    name: 'Торт с сюрпризом',
    emoji: '🎂',
    from: 'Дмитрий',
    date: '14 фев 2025',
  },
  {
    id: '3',
    name: 'Букет лаванды',
    emoji: '💐',
    from: 'Елена',
    date: '8 мар 2025',
  },
  {
    id: '4',
    name: 'Коробка конфет',
    emoji: '🍫',
    from: 'Максим',
    date: '23 фев 2025',
  },
  {
    id: '5',
    name: 'Воздушный шар',
    emoji: '🎈',
    from: 'Ольга',
    date: '1 мар 2025',
  },
  {
    id: '6',
    name: 'Игровой набор',
    emoji: '🎮',
    from: 'Сергей',
    date: '10 мар 2025',
  },
  {
    id: '7',
    name: 'Книга-квест',
    emoji: '📚',
    from: 'Наталья',
    date: '5 мар 2025',
  },
  {
    id: '8',
    name: 'Плед с рукавами',
    emoji: '🧣',
    from: 'Ирина',
    date: '12 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  {
    id: '9',
    name: 'Фоторамка',
    emoji: '🖼️',
    from: 'Алексей',
    date: '18 мар 2025',
  },
  
];

const ProfileGiftScreen = ({ navigation }) => {
  const renderGiftItem = ({ item }) => (
    <TouchableOpacity
      style={styles.giftCard}
      activeOpacity={0.7}
      onPress={() => alert(`Подарок: ${item.name} от ${item.from}`)} // временное действие
    >
      <Text style={styles.giftEmoji}>{item.emoji}</Text>
      <Text style={styles.giftName}>{item.name}</Text>
      <Text style={styles.giftFrom}>от {item.from}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar/>
      <View style={styles.container}>
        {/* Header с кнопкой назад */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Мои подарки</Text>
          <View style={styles.placeholderRight} />
        </View>

        {/* Сетка подарков */}
        <FlatList
          data={giftsData}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          renderItem={renderGiftItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Пока нет подарков 🎁</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    marginTop:50,
    flex: 1,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 17,
    color: colors.primary || '#007aff',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholderRight: {
    width: 60, // баланс для центрирования заголовка
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 20,
  },
  giftCard: {
    flex: 1,
    margin: 8,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  giftEmoji: {
    fontSize: 38,
    marginBottom: 8,
  },
  giftName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  giftFrom: {
    fontSize: 11,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 2,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
  },
});

export default ProfileGiftScreen;