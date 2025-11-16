
import React from 'react';
import ItemForm from '../components/Items/ItemForm';

const ReportItemPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8">Report an Item</h1>
      <div className="max-w-2xl mx-auto">
        <ItemForm />
      </div>
    </div>
  );
};

export default ReportItemPage;
   