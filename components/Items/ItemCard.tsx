
import React from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../../types';
import { Timestamp } from 'firebase/firestore';

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <Link to={`/item/${item.id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-transform transform group-hover:-translate-y-1 group-hover:shadow-xl">
        <img
          src={item.imageUrl || 'https://picsum.photos/400/300'}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white truncate">{item.title}</h3>
            <span
              className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                item.type === 'lost'
                  ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300'
                  : 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300'
              }`}
            >
              {item.type}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Date:</strong> {item.date ? new Date((item.date as Timestamp).seconds * 1000).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Status:</strong> <span className="capitalize">{item.status}</span></p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
   