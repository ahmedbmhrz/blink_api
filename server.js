const express = require('express');
const cors = require('cors');
const admin = require("firebase-admin");

const serviceAccount = require("./blinkchat-pre.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Basic route
app.get('/api/test', (req, res) => {
  res.status(200).send('REST API is working');
});



app.get('/api/users/:id', async (req, res) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// New endpoint for getting shared media
app.get('/api/chats/:chatId/media', async (req, res) => {
  try {
    const chatDoc = await admin.firestore()
      .collection('chats')
      .doc(req.params.chatId)
      .get();
    
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    const messages = chatData.messages || [];
    
    // Filter and format media messages
    const media = messages
      .filter(msg => msg.img || msg.file)
      .map(msg => ({
        type: msg.img ? 'image' : 'file',
        url: msg.img || msg.file,
        fileName: msg.fileName,
        date: msg.createAt,
        senderId: msg.senderId
      }));

    res.status(200).json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/chats/:chatId/media', async (req, res) => {
  try {
    const chatDoc = await admin.firestore()
      .collection('chats')
      .doc(req.params.chatId)
      .get();
    
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    const messages = chatData.messages || [];
    
    // Filter and format media messages
    const media = messages
      .filter(msg => msg.img || msg.file)
      .map(msg => ({
        type: msg.img ? 'image' : 'file',
        url: msg.img || msg.file,
        fileName: msg.fileName,
        date: msg.createAt,
        senderId: msg.senderId
      }));

    res.status(200).json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint for getting all messages in a chat
app.get(' ', async (req, res) => {
  try {
    const chatDoc = await admin.firestore()
      .collection('chats')
      .doc(req.params.chatId)
      .get();
    
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    const messages = chatData.messages || [];
    
    // Format messages for response
    const formattedMessages = messages.map(msg => ({
      text: msg.text,
      senderId: msg.senderId,
      date: msg.createAt,
      img: msg.img || null,
      file: msg.file || null,
      fileName: msg.fileName || null
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint for getting all chats for a user
app.get('/api/users/:userId/chats', async (req, res) => {
  try {
    const userChatsDoc = await admin.firestore()
      .collection('userchats')
      .doc(req.params.userId)
      .get();
    
    if (!userChatsDoc.exists) {
      return res.status(404).json({ message: 'No chats found for this user' });
    }

    const userChatsData = userChatsDoc.data();
    const chats = userChatsData.chats || [];
    
    // Get detailed information for each chat
    const chatPromises = chats.map(async (chat) => {
      // Get receiver user info
      const receiverDoc = await admin.firestore()
        .collection('users')
        .doc(chat.receiverId)
        .get();
      
      const receiver = receiverDoc.exists ? receiverDoc.data() : null;
      
      return {
        chatId: chat.chatId,
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        isSeen: chat.isSeen,
        receiver: receiver ? {
          id: chat.receiverId,
          username: receiver.username,
          avatar: receiver.avatar
        } : null
      };
    });

    const detailedChats = await Promise.all(chatPromises);
    
    // Sort chats by updatedAt timestamp in descending order
    const sortedChats = detailedChats.sort((a, b) => b.updatedAt - a.updatedAt);

    res.status(200).json(sortedChats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});