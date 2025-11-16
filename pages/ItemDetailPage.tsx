
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Item } from '../types';
import Spinner from '../components/UI/Spinner';

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      setLoading(true);
      const docRef = doc(db, 'items', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() } as Item);
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    };

    fetchItem();
  }, [id]);

  const handleContactOwner = async () => {
    if (!currentUser || !item || currentUser.uid === item.userId) return;
    
    setContacting(true);
    try {
        const participants = [currentUser.uid, item.userId].sort();
        
        // Check if a chat already exists
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, 
            where('relatedItemId', '==', item.id),
            where('participants', 'array-contains', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        let existingChatId: string | null = null;
        querySnapshot.forEach(doc => {
            const chat = doc.data();
            const p = chat.participants.sort();
            if(p[0] === participants[0] && p[1] === participants[1]) {
                existingChatId = doc.id;
            }
        });


        if (existingChatId) {
            navigate(`/chat/${existingChatId}`);
        } else {
            // Create a new chat
            const newChatRef = await addDoc(collection(db, 'chats'), {
                participants,
                relatedItemId: item.id,
                createdAt: serverTimestamp(),
                lastMessage: null,
            });
            navigate(`/chat/${newChatRef.id}`);
        }

    } catch (error) {
        console.error("Error creating or finding chat: ", error);
        alert("Could not initiate chat.");
    } finally {
        setContacting(false);
    }
};

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  if (!item) return <p className="text-center text-xl">Item not found.</p>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img 
            className="h-64 w-full object-cover md:w-64" 
            src={item.imageUrl || 'https://picsum.photos/400/300'} 
            alt={item.title} 
          />
        </div>
        <div className="p-8">
          <div className={`uppercase tracking-wide text-sm ${item.type === 'lost' ? 'text-red-500' : 'text-green-500'} font-semibold`}>
            {item.type}
          </div>
          <h1 className="block mt-1 text-3xl leading-tight font-bold text-black dark:text-white">{item.title}</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{item.description}</p>
          
          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-400">
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Date:</strong> {item.date ? new Date((item.date as Timestamp).seconds * 1000).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Status:</strong> <span className="capitalize">{item.status}</span></p>
            <p><strong>Reported by:</strong> {item.userDisplayName}</p>
          </div>

          {currentUser && currentUser.uid !== item.userId && (
            <div className="mt-8">
              <button
                onClick={handleContactOwner}
                disabled={contacting}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
              >
                {contacting ? 'Opening chat...' : `Contact ${item.type === 'lost' ? 'Owner' : 'Finder'}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
   