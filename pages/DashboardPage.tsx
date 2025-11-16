
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Item, ItemStatus } from '../types';
import ItemCard from '../components/Items/ItemCard';
import Spinner from '../components/UI/Spinner';
import { deleteObject, ref } from 'firebase/storage';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'items'), 
        where('userId', '==', currentUser.uid), 
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const itemsData: Item[] = [];
        querySnapshot.forEach((doc) => {
          itemsData.push({ id: doc.id, ...doc.data() } as Item);
        });
        setMyItems(itemsData);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleDelete = async (item: Item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
        try {
            await deleteDoc(doc(db, 'items', item.id));
            if (item.imageUrl) {
                const imageRef = ref(storage, item.imageUrl);
                await deleteObject(imageRef);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item.");
        }
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    try {
        const itemRef = doc(db, 'items', itemId);
        await updateDoc(itemRef, { status: newStatus });
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status.");
    }
  };


  if (loading) {
    return <Spinner />;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">My Reported Items</h2>
        {myItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myItems.map(item => (
              <div key={item.id}>
                <ItemCard item={item} />
                <div className="mt-2 flex items-center space-x-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as ItemStatus)}
                    className="flex-grow px-2 py-1 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={ItemStatus.OPEN}>Open</option>
                    <option value={ItemStatus.CLAIMED}>Claimed</option>
                    <option value={ItemStatus.CLOSED}>Closed</option>
                  </select>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't reported any items yet.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
   