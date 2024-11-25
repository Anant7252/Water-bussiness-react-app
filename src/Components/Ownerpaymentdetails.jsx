import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';
import 'react-datepicker/dist/react-datepicker.css';
import { getAuth } from 'firebase/auth';

const auth = getAuth(app); 
const db = getFirestore(app);

function Ownerpaymentdetails() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPayments, setNewPayments] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No owner logged in!");
        setLoading(false);
        return;
      }

      const customersRef = collection(db, "owners", user.uid, "customers");
      const customersSnap = await getDocs(customersRef);

      if (!customersSnap.empty) {
        const customerList = customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomers(customerList);
        setFilteredCustomers(customerList);
      } else {
        console.log("No customers found for this owner!");
      }
      setLoading(false);
    };

    fetchCustomerData();
  }, []);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phoneNumber.includes(query) ||
        customer.address.toLowerCase().includes(query)
      );
    });
    setFilteredCustomers(filtered);
  };

  const handleEdit = (customerId) => {
    setIsEditing(customerId);
  };

  const handleSave = async (customer) => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No owner logged in!");
      return;
    }

    const payment = newPayments[customer.id];

    if (payment === undefined || payment === '' || isNaN(payment)) {
      console.log('Invalid payment value');
      return;
    }

    const customerDocRef = doc(db, "owners", user.uid, "customers", customer.id);
    await updateDoc(customerDocRef, { payment: parseFloat(payment) });
    setIsEditing(false);
  };

  const handlePaymentChange = (customerId, value) => {
    setNewPayments((prev) => ({ ...prev, [customerId]: value }));
  };

  const renderCustomerDetails = () => {
    return filteredCustomers.map((customer) => (
      <div key={customer.id} className='border-b-2 text-xl border-gray-800 gap flex flex-col gap-1 font-sans p-2'>
        <h1>Customer Name: {customer.name}</h1>
        <h2>Phone Number: {customer.phoneNumber}</h2>
        <p>Address: {customer.address}</p>
        <div>
          <p>Payment: &#8377;{isEditing === customer.id ? (
            <input
              type="number"
              placeholder='Type the new payment'
              value={newPayments[customer.id] || ''}
              onChange={(e) => handlePaymentChange(customer.id, e.target.value)}
              className='px-4 py-1 rounded-3xl border-2 border-black'
            />
          ) : (
            customer.payment
          )}</p>
          <button
            onClick={isEditing === customer.id ? () => handleSave(customer) : () => handleEdit(customer.id)} 
            className='border- mt-2 border-gray-900 bg-blue-950 text-white px-4 py-1 rounded-3xl'>
            {isEditing === customer.id ? 'Save' : 'Edit' }
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-3xl'>Owner Payment Details</h1>
      <div className='flex gap-4'>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type name or phonenumber"
          className='px-4 py-1 border-2 border-black rounded-3xl'
        />
        <button onClick={handleSearch} className="px-4 py-1 border-2 border-black rounded-3xl">Search</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="w-full border-t-2 border-black flex flex-col flex-wrap gap-5">
          {renderCustomerDetails()}
        </div>
      )}
    </div>
  );
}

export default Ownerpaymentdetails;
