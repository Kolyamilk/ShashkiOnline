import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { colors } from '../styles/globalStyles';
import { LinearGradient } from 'expo-linear-gradient';
import Piece from '../components/Piece'; // добавили для превью


// Пресеты для доски (6 вариантов)
const boardPresets = [
  { name: 'Классика', light: '#f0d9b5', dark: '#b58863' },
  { name: 'Мрамор', light: '#e8e8e8', dark: '#a0a0a0' },
  { name: 'Дуб', light: '#e3c194', dark: '#8b5a2b' },
  { name: 'Лаванда', light: '#e6e6fa', dark: '#8a6e8b' },
  { name: 'Мятный', light: '#d4f0d0', dark: '#6b8e6b' },
  { name: 'Океан', light: '#c0e0ff', dark: '#2f6f8f' },
];

// Пресеты для шашек (добавлен коричневый)
const piecePresets = [
  { name: 'Белый', color: '#FFFFFF' },
  { name: 'Чёрный', color: '#333333' },
  { name: 'Красный', color: '#FF4444' },
  { name: 'Серый', color: '#d6d6d6' },
  { name: 'Зелёный', color: '#44FF44' },
  { name: 'Жёлтый', color: '#FFFF44' },
  { name: 'Оранжевый', color: '#FF8800' },
  { name: 'Фиолетовый', color: '#AA44FF' },
  { name: 'Коричневый', color: '#8B4513' },
];

// Пресеты для стиля дамки
const kingStylePresets = [
  { name: 'Корона', value: 'crown', preview: '👑' },
  { name: 'Звезда', value: 'star', preview: '⭐' },
  { name: 'Огонь', value: 'fire', preview: '🔥' },
  { name: 'Бриллиант', value: 'diamond', preview: '💎' },
  { name: 'Голубь', value: 'dove', preview: '🕊️' },
  { name: 'Сердце', value: 'heart', preview: '♥️' },
  { name: 'Какашки', value: 'poop', preview: '💩' },
  { name: 'Квадрат', value: 'square', preview: '■' },
  { name: 'Ромб', value: 'rhombus', preview: '◆' },
];

// Модальное окно выбора цвета с блокировкой и значком замка
const ColorPickerModal = ({ visible, onClose, onSelect, currentColor, title, disabledColors = [] }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.colorGrid}>
            {piecePresets.map((item) => {
              const isDisabled = disabledColors.includes(item.color);
              return (
                <TouchableOpacity
                  key={item.color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: item.color },
                    currentColor === item.color && styles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    if (!isDisabled) {
                      onSelect(item.color);
                      onClose();
                    }
                  }}
                  disabled={isDisabled}
                  activeOpacity={0.7}
                >
                  {isDisabled && (
                    <View style={styles.disabledOverlay}>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const KingStyleModal = ({ visible, onClose, onSelect, currentStyle, title }) => {
  const tempPiece = { player: 1, king: true };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.styleGrid}>
            {kingStylePresets.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.styleOption,
                  currentStyle === item.value && styles.styleOptionSelected,
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <View style={styles.previewKingWrapper}>
                  <Piece
                    piece={tempPiece}
                    canCapture={false}
                    overrideKingStyle={item.value}
                  />
                </View>
                <Text style={styles.styleName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Компонент интерактивного превью доски
const InteractivePreviewBoard = () => {
  const {
    boardLightColor,
    boardDarkColor,
    myPieceColor,
    setMyPieceColor,
    opponentPieceColor,
    setOpponentPieceColor,
    myKingStyle,
    setMyKingStyle,
    opponentKingStyle,
    setOpponentKingStyle,
    kingCrownColor,
  } = useSettings();

  const [myColorModalVisible, setMyColorModalVisible] = useState(false);
  const [opponentColorModalVisible, setOpponentColorModalVisible] = useState(false);
  const [myKingStyleModalVisible, setMyKingStyleModalVisible] = useState(false);
  const [opponentKingStyleModalVisible, setOpponentKingStyleModalVisible] = useState(false);

  const darkenColor = (color) => {
    if (color?.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const darker = (c) => Math.max(0, c - 40);
      return `#${darker(r).toString(16).padStart(2, '0')}${darker(g).toString(16).padStart(2, '0')}${darker(b).toString(16).padStart(2, '0')}`;
    }
    return color;
  };

  const renderCell = (row, col, pieceType) => {
    const isDark = (row + col) % 2 === 1;
    const bgColor = isDark ? boardDarkColor : boardLightColor;

    let pieceColor = null;
    let isKing = false;
    let onPress = null;
    let piece = null;
    let overrideStyle = null;

    if (pieceType === 'myNormal') {
      pieceColor = myPieceColor;
      onPress = () => setMyColorModalVisible(true);
    } else if (pieceType === 'myKing') {
      piece = { player: 1, king: true };
      overrideStyle = myKingStyle;
      onPress = () => setMyKingStyleModalVisible(true);
    } else if (pieceType === 'opponentNormal') {
      pieceColor = opponentPieceColor;
      onPress = () => setOpponentColorModalVisible(true);
    } else if (pieceType === 'opponentKing') {
      piece = { player: 2, king: true };
      overrideStyle = opponentKingStyle;
      onPress = () => setOpponentKingStyleModalVisible(true);
    }

    return (
      <TouchableOpacity
        key={`cell-${row}-${col}`}
        style={[styles.previewCell, { backgroundColor: bgColor }]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        {pieceType === 'myNormal' || pieceType === 'opponentNormal' ? (
          <LinearGradient
            colors={[pieceColor, darkenColor(pieceColor)]}
            style={styles.previewPiece}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : piece && (
          <Piece
            piece={piece}
            canCapture={false}
            overrideKingStyle={overrideStyle}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderBoard = () => {
    const rows = [];
    for (let r = 0; r < 8; r++) {
      const cells = [];
      for (let c = 0; c < 8; c++) {
        let pieceType = null;
        if (r < 3 && (r + c) % 2 === 1) pieceType = 'opponentNormal';
        if (r > 4 && (r + c) % 2 === 1) pieceType = 'myNormal';
        if (r === 0 && c === 1) pieceType = 'myKing';
        if (r === 7 && c === 2) pieceType = 'opponentKing';
        cells.push(renderCell(r, c, pieceType));
      }
      rows.push(
        <View key={`row-${r}`} style={styles.previewRow}>
          {cells}
        </View>
      );
    }
    return rows;
  };

  return (
    <>
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Предпросмотр</Text>
        <Text style={styles.previewHint}>
          Нажмите на шашку, чтобы изменить цвет. Нажмите на дамку, чтобы выбрать стиль.
        </Text>
        <View style={styles.previewBoard}>{renderBoard()}</View>
      </View>

      <ColorPickerModal
        visible={myColorModalVisible}
        onClose={() => setMyColorModalVisible(false)}
        onSelect={setMyPieceColor}
        currentColor={myPieceColor}
        title="Цвет ваших шашек"
        disabledColors={[opponentPieceColor]}
      />
      <ColorPickerModal
        visible={opponentColorModalVisible}
        onClose={() => setOpponentColorModalVisible(false)}
        onSelect={setOpponentPieceColor}
        currentColor={opponentPieceColor}
        title="Цвет шашек противника"
        disabledColors={[myPieceColor]}
      />
      <KingStyleModal
        visible={myKingStyleModalVisible}
        onClose={() => setMyKingStyleModalVisible(false)}
        onSelect={setMyKingStyle}
        currentStyle={myKingStyle}
        title="Стиль дамки (ваши фигуры)"
      />
      <KingStyleModal
        visible={opponentKingStyleModalVisible}
        onClose={() => setOpponentKingStyleModalVisible(false)}
        onSelect={setOpponentKingStyle}
        currentStyle={opponentKingStyle}
        title="Стиль дамки (противник)"
      />
    </>
  );
};

const SettingsScreen = ({ navigation }) => {
  const {
    boardLightColor,
    boardDarkColor,
    setBoardLightColor,
    setBoardDarkColor,
  } = useSettings();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Настройки</Text>
      <InteractivePreviewBoard />
      <Text style={styles.categoryTitle}>Доска</Text>
      <View style={styles.presetsGrid}>
        {boardPresets.map((preset, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.presetItem,
              (boardLightColor === preset.light && boardDarkColor === preset.dark) && styles.presetSelected,
            ]}
            onPress={() => {
              setBoardLightColor(preset.light);
              setBoardDarkColor(preset.dark);
            }}
          >
            <View style={styles.boardPreview}>
              <View style={styles.boardPreviewRow}>
                <View style={[styles.boardPreviewCell, { backgroundColor: preset.light }]} />
                <View style={[styles.boardPreviewCell, { backgroundColor: preset.dark }]} />
              </View>
              <View style={styles.boardPreviewRow}>
                <View style={[styles.boardPreviewCell, { backgroundColor: preset.dark }]} />
                <View style={[styles.boardPreviewCell, { backgroundColor: preset.light }]} />
              </View>
            </View>
            <Text style={styles.presetName}>{preset.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
        <Text style={styles.saveButtonText}>Назад</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16, // уменьшили общий отступ
    paddingBottom: 10,
  },
  previewKingEmoji: {
    fontSize: 24,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 16, // уменьшили
    textAlign: 'center',
  },
  previewContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    padding: 12, // уменьшили
    marginBottom: 16, // уменьшили
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  previewHint: {
    fontSize: 12, // уменьшили шрифт
    color: colors.textLight,
    marginBottom: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  previewBoard: {
    borderWidth: 2,
    borderColor: '#4a2c2c',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewRow: {
    flexDirection: 'row',
  },
  previewCell: {
    width: 36, // уменьшили размер клеток
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPiece: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888',
  },
  previewNormal: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  previewKing: {
    fontSize: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 12, // уменьшили
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 8, // уменьшили
    marginBottom: 8, // уменьшили
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#3a4a5a',
  },
  presetName: {
    color: colors.textLight,
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  boardPreview: {
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#888',
  },
  boardPreviewRow: {
    flexDirection: 'row',
  },
  boardPreviewCell: {
    width: 24,
    height: 24,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    padding: 12, // уменьшили
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20, // уменьшили
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  colorOption: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    margin: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFD700',
    transform: [{ scale: 1.05 }],
  },
  colorOptionDisabled: {
    opacity: 0.3,
  },
  disabledOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  styleOption: {
    width: 70,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    backgroundColor: '#1a2a3a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleOptionSelected: {
    borderColor: '#FFD700',
  },
  stylePreview: {
    fontSize: 30,
    marginBottom: 4,
  },
  styleName: {
    color: colors.textLight,
    fontSize: 12,
  },
  modalCloseButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;