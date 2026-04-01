import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../context/SettingsContext';

const AnimatedPiece = ({ from, to, piece, onFinish, myRole, cellSize }) => {
  const { 
    myPieceColor, 
    opponentPieceColor, 
    myKingStyle, 
    opponentKingStyle, 
    kingCrownColor 
  } = useSettings();

  const kingStyle = piece.player === 1 ? myKingStyle : opponentKingStyle;
  
  const offsetX = -10;
  const offsetY = -10;

  const getDisplayRow = (row) => (myRole === 1 ? 7 - row : row);

  const fromX = from.col * cellSize + cellSize / 2 + offsetX;
  const fromY = getDisplayRow(from.row) * cellSize + cellSize / 2 + offsetY;
  const toX = to.col * cellSize + cellSize / 2 + offsetX;
  const toY = getDisplayRow(to.row) * cellSize + cellSize / 2 + offsetY;

  const translateX = useRef(new Animated.Value(fromX)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  const pieceColor = piece.player === 1 ? myPieceColor : opponentPieceColor;

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

  const renderKingSymbol = () => {
    switch (kingStyle) {
      case 'star': return '⭐';
      case 'fire': return '🔥';
      case 'diamond': return '💎';
      case 'dove': return '🕊️';
      case 'heart': return '♥️';
      case 'poop': return '💩';
      default: return '👑';
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: toX,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: toY,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  // Если это дамка – отображаем только эмодзи
  if (piece.king) {
    return (
      <Animated.View style={[styles.kingContainer, { transform: [{ translateX }, { translateY }] }]}>
        <Text style={[styles.kingEmoji, { color: kingCrownColor }]}>
          {renderKingSymbol()}
        </Text>
      </Animated.View>
    );
  }

  // Обычная шашка
  return (
    <Animated.View style={[styles.container, { transform: [{ translateX }, { translateY }] }]}>
      <LinearGradient
        colors={[pieceColor, darkenColor(pieceColor)]}
        style={styles.piece}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piece: {
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#888',
  },
  kingContainer: {
    position: 'absolute',
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kingEmoji: {
    fontSize: 32,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default AnimatedPiece;