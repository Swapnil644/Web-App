
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { Item } from '../types';
import Spinner from '../components/UI/Spinner';
import { deleteObject, ref } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

const AdminPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<any[]>([]); // simplified for this example
  const [loadingItems, setLoadingItems] = useState(true);
  const [emailToMakeAdmin, setEmailToMakeAdmin] = useState('');
  const [adminMessage, setAdminMessage] = useState('');


  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData: Item[] = [];
      querySnapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(itemsData);
      setLoadingItems(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (item: Item) => {
    if (window.confirm('ADMIN ACTION: Are you sure you want to permanently delete this item?')) {
      try {
        await deleteDoc(doc(db, 'items', item.id));
        if (item.imageUrl) {
          const imageRef = ref(storage, item.imageUrl);
          await deleteObject(imageRef);
        }
        alert('Item deleted successfully.');
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item.");
      }
    }
  };

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToMakeAdmin) return;

    setAdminMessage('Processing...');
    const functionsInstance = getFunctions();
    const addAdminRole = httpsCallable(functionsInstance, 'addAdminRole');
    try {
        const result = await addAdminRole({ email: emailToMakeAdmin });
        setAdminMessage((result.data as any).message);
    } catch (error: any) {
        setAdminMessage(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Manage Roles</h2>
        <form onSubmit={handleMakeAdmin} className="flex flex-col sm:flex-row gap-4">
            <input 
                type="email"
                value={emailToMakeAdmin}
                onChange={(e) => setEmailToMakeAdmin(e.target.value)}
                placeholder="User email to make admin"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
                Make Admin
            </button>
        </form>
        {adminMessage && <p className="mt-4 text-sm">{adminMessage}</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">All Reported Items</h2>
        {loadingItems ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.userDisplayName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(item.createdAt.seconds * 1000).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
   