
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Message, Chat, Item } from '../types';
import Spinner from '../components/UI/Spinner';

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribeChat = onSnapshot(chatDocRef, async (doc) => {
      if (doc.exists()) {
        const chatData = { id: doc.id, ...doc.data() } as Chat;
        setChat(chatData);

        // Fetch related item
        const itemDocRef = doc(db, 'items', chatData.relatedItemId);
        const itemDoc = await getDoc(itemDocRef);
        if(itemDoc.exists()) {
          setItem({ id: itemDoc.id, ...itemDoc.data() } as Item);
        }

      }
      setLoading(false);
    });

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [chatId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !chatId || !currentUser) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text: newMessage,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    setNewMessage('');
  };

  if (loading) return <Spinner />;
  if (!chat || !currentUser || !chat.participants.includes(currentUser.uid)) {
    return <p className="text-center">Chat not found or you don't have access.</p>;
  }

  return (
    <div className="flex flex-col h-[75vh] max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <header className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold">Chat about: {item?.title || '...'}</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderId === currentUser.uid
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
   