import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../utils/theme';
import { TEST_DATA, MESSAGE_TYPES } from '../utils/constants';
import EmergencyButton from '../components/EmergencyButton';
import storageService from '../services/storageService';
import bleService from '../services/bleService';
import wifiService from '../services/wifiService';

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    checkConnectionStatus();
  }, []);

  const loadMessages = async () => {
    try {
      // Load messages from storage
      const storedMessages = await storageService.getMessages();
      
      // If no stored messages, use test data
      if (storedMessages.length === 0) {
        setMessages(TEST_DATA.SAMPLE_MESSAGES);
      } else {
        setMessages(storedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to test data
      setMessages(TEST_DATA.SAMPLE_MESSAGES);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const bleConnected = bleService.getConnectedDevices().length > 0;
      const wifiConnected = wifiService.getConnectedPeers().length > 0;
      setIsConnected(bleConnected || wifiConnected);
    } catch (error) {
      console.error('Error checking connection status:', error);
      setIsConnected(false); // Set to false on error
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      type: MESSAGE_TYPES.CHAT,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      sender: 'You',
      isOwn: true,
    };

    // Add to local messages
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Store in local storage
    await storageService.addMessage(message);

    // Send via BLE and Wi-Fi
    try {
      await bleService.broadcastMessage(message);
      await wifiService.broadcastMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isOwn ? styles.ownBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isOwn ? styles.ownText : styles.otherText
        ]}>
          {item.message}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isOwn ? styles.ownTime : styles.otherTime
        ]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleClearMessages = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearMessages();
              setMessages([]);
            } catch (error) {
              console.error('Error clearing messages:', error);
            }
          },
        },
      ]
    );
  };

  const handleAddTestMessage = () => {
    const testMessages = [
      'Is everyone safe in this area?',
      'I can see emergency services approaching',
      'Road is clear ahead',
      'Need help with first aid',
      'All clear here, how about you?',
    ];

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    const testMessage = {
      id: Date.now().toString(),
      type: MESSAGE_TYPES.CHAT,
      message: randomMessage,
      timestamp: new Date().toISOString(),
      sender: 'User_' + Math.floor(Math.random() * 100),
      isOwn: false,
    };

    setMessages(prev => [...prev, testMessage]);
    storageService.addMessage(testMessage);
  };

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Emergency Chat</Text>
            <View style={styles.connectionStatus}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isConnected ? COLORS.success : COLORS.error }
              ]} />
              <Text style={styles.statusText}>
                {isConnected ? 'Connected' : 'Offline'}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <EmergencyButton
              title="Test"
              onPress={handleAddTestMessage}
              variant="secondary"
              size="small"
              style={styles.headerButton}
            />
            <EmergencyButton
              title="Clear"
              onPress={handleClearMessages}
              variant="warning"
              size="small"
              style={styles.headerButton}
            />
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: newMessage.trim() ? COLORS.primary : COLORS.textDisabled }
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  title: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  
  statusText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  
  headerActions: {
    flexDirection: 'row',
  },
  
  headerButton: {
    marginLeft: SPACING.sm,
    minWidth: 60,
  },
  
  messagesList: {
    flex: 1,
  },
  
  messagesContent: {
    padding: SPACING.md,
  },
  
  messageContainer: {
    marginBottom: SPACING.sm,
  },
  
  ownMessage: {
    alignItems: 'flex-end',
  },
  
  otherMessage: {
    alignItems: 'flex-start',
  },
  
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.md,
    marginBottom: SPACING.xs,
  },
  
  ownText: {
    color: COLORS.text,
  },
  
  otherText: {
    color: COLORS.text,
  },
  
  messageTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  
  ownTime: {
    color: COLORS.text,
    opacity: 0.8,
  },
  
  otherTime: {
    color: COLORS.textTertiary,
  },
  
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
    maxHeight: 100,
  },
  
  sendButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  
  sendButtonText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default ChatScreen;
