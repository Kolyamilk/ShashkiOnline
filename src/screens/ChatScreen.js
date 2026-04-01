// src/screens/ChatScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  BackHandler,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ref, push, onValue, off, query, limitToLast, orderByChild, get, remove } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/globalStyles';
import { sendPushNotification } from '../utils/notifications';

const ChatScreen = ({ route, navigation }) => {
  const { userId } = useAuth();
  const { openWithUser } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(openWithUser || null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const flatListRef = useRef();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  // ← Проверка приглашений
  useEffect(() => {
    if (!userId) return;
    const checkInvites = async () => {
      const invitationsRef = ref(db, 'invitations');
      const snapshot = await get(invitationsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const [invId, invData] of Object.entries(data)) {
          if (invData.from === userId && invData.status === 'accepted' && invData.gameId) {
            console.log('🎮 Приглашение принято пока был в чате!');
            await remove(ref(db, `invitations/${invId}`));
            navigation.navigate('OnlineGame', { 
              gameId: invData.gameId, 
              playerKey: userId, 
              myRole: 1 
            });
            break;
          }
        }
      }
    };
    const interval = setInterval(checkInvites, 2000);
    return () => clearInterval(interval);
  }, [userId, navigation]);

  // Загружаем имя выделенного пользователя
  useEffect(() => {
    if (selectedUser) {
      const fetchUserName = async () => {
        const userRef = ref(db, `users/${selectedUser}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setSelectedUserName(snapshot.val().name);
        }
      };
      fetchUserName();
    }
  }, [selectedUser]);

  // ← Отслеживание клавиатуры с ПРИНУДИТЕЛЬНЫМ сбросом
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(scrollToBottom, 100);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // ← Принудительный сброс с задержкой
        setTimeout(() => {
          setKeyboardVisible(false);
        }, 50);
        setTimeout(scrollToBottom, 100);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [navigation])
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserData(data);
      }
    };
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const messagesRef = query(ref(db, 'chat_messages'), orderByChild('timestamp'), limitToLast(50));
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, msg]) => ({
          id,
          ...msg,
        }));
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      } else {
        setMessages([]);
        setLoading(false);
      }
    });
    return () => off(messagesRef);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !userData) return;

    const newMessage = {
      userId,
      name: userData.name,
      avatar: userData.avatar,
      text: inputText.trim(),
      timestamp: Date.now(),
      to: selectedUser || null,
    };
    
    const newMessageRef = push(ref(db, 'chat_messages'), newMessage);
    
    if (selectedUser && selectedUser !== userId) {
      await sendPushNotification(
        selectedUser,
        `Новое сообщение от ${userData.name}`,
        inputText.trim(),
        { type: 'new_message', messageId: newMessageRef.key }
      );
    }
    
    setInputText('');
    setTimeout(scrollToBottom, 200);
  };

  const deleteMessage = (messageId) => {
    Alert.alert(
      'Удалить сообщение',
      'Вы уверены?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            const messageRef = ref(db, `chat_messages/${messageId}`);
            remove(messageRef);
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }) => {
    const canDelete = userData?.isAdmin === true;
    const isForMe = item.to === userId;
    const isFromMe = item.userId === userId;
    const isHighlighted = selectedUser && item.userId === selectedUser && !isFromMe;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={canDelete ? () => deleteMessage(item.id) : null}
        delayLongPress={500}
      >
        <View style={[
          styles.messageContainer,
          isFromMe && styles.myMessage,
          isForMe && styles.privateMessage,
          isHighlighted && styles.highlightedMessage,
        ]}>
          <View style={styles.messageHeader}>
            <Text style={styles.avatar}>{item.avatar}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.text}>{item.text}</Text>
          {item.to && (
            <Text style={styles.privateBadge}>
              🔒 Личное сообщение для {item.to === userId ? 'вас' : selectedUserName}
            </Text>
          )}
        </View>
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

  // ← ТОЛЬКО отступ для навигации (без keyboardHeight)
  const hasNavigationButtons = insets.bottom > 5;
  const containerPaddingBottom = hasNavigationButtons ? insets.bottom + 5 : 5;

  console.log('📊 paddingBottom:', containerPaddingBottom, 'keyboardVisible:', keyboardVisible);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* ← Для Android: пусть система управляет клавиатурой через adjustResize */}
      <View style={[styles.container, { paddingBottom: containerPaddingBottom }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
          {selectedUser ? (
            <View style={styles.privateChatBadge}>
              <Text style={styles.privateChatBadgeText}>
                🔒 Личный чат с {selectedUserName}
              </Text>
            </View>
          ) : (
            <Text style={styles.headerTitle}>Общий чат</Text>
          )}
          <View style={{ width: 50 }} />
        </View>

        {selectedUser && (
          <View style={styles.selectedUserBar}>
            <Text style={styles.selectedUserBarText}>
              ✉️ Вы пишете {selectedUserName}
            </Text>
            <TouchableOpacity onPress={() => setSelectedUser(null)}>
              <Text style={styles.clearSelectedText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          style={{ flex: 1 }}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"  // ← Скрывать клавиатуру при скролле
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={selectedUser ? `Напишите ${selectedUserName}...` : "Напишите сообщение..."}
            placeholderTextColor="#aaa"
            multiline
            onFocus={scrollToBottom}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  privateChatBadge: {
    backgroundColor: '#9b59b6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  privateChatBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  selectedUserBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  selectedUserBarText: {
    color: colors.primary,
    fontSize: 12,
  },
  clearSelectedText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 8,
    marginVertical: 4,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4ECDC4',
  },
  privateMessage: {
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  highlightedMessage: {
    backgroundColor: '#3a4a5a',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    fontSize: 16,
    marginRight: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textLight,
    marginRight: 8,
  },
  time: {
    fontSize: 10,
    color: '#ccc',
  },
  text: {
    fontSize: 16,
    color: '#fff',
  },
  privateBadge: {
    fontSize: 10,
    color: '#FFD700',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: colors.textLight,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: 22,
  },
  sendText: {
    fontSize: 24,
    color: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default ChatScreen;