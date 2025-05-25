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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});