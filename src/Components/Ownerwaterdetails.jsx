import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);

function Ownerwaterdetails() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWater, setSelectedWater] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDate = format(selectedDate, 'dd-MM-yy');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCustomerData(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCustomerData = async (user) => {
    const customersRef = collection(db, "owners", user.uid, "customers");
    const customersSnap = await getDocs(customersRef);

    if (!customersSnap.empty) {
      const customerList = customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customerList);
      setFilteredCustomers(customerList);

      const fetchedWaterDetails = {};
      customerList.forEach(customer => {
        const waterDetails = customer.waterDetails || {};
        fetchedWaterDetails[customer.id] = {
          ...waterDetails,
          payment: customer.payment || 0,
        };
      });
      setSelectedWater(fetchedWaterDetails);
    }
    setLoading(false);
  };

  const handleWaterCountChange = async (customerId, waterType, newCount) => {
    if (newCount < 0) return;

    const updatedWater = { ...selectedWater };
    const dateKey = formattedDate;

    if (!updatedWater[customerId]) {
      updatedWater[customerId] = {};
    }

    if (!updatedWater[customerId][dateKey]) {
      updatedWater[customerId][dateKey] = {};
    }

    if (!updatedWater[customerId][dateKey][`${waterType}Count`]) {
      updatedWater[customerId][dateKey][`${waterType}Count`] = 0;
    }

    updatedWater[customerId][dateKey][`${waterType}Count`] = newCount;

    let totalNormalCount = 0;
    let totalColdCount = 0;

    Object.keys(updatedWater[customerId]).forEach(date => {
      if (updatedWater[customerId][date].normalCount) {
        totalNormalCount += updatedWater[customerId][date].normalCount;
      }
      if (updatedWater[customerId][date].coldCount) {
        totalColdCount += updatedWater[customerId][date].coldCount;
      }
    });

    updatedWater[customerId].payment = totalNormalCount * 25 + totalColdCount * 30;
    setSelectedWater(updatedWater);

    const user = auth.currentUser;
    if (!user) return;

    const customerRef = doc(db, "owners", user.uid, "customers", customerId);

    await updateDoc(customerRef, {
      [`waterDetails.${dateKey}`]: updatedWater[customerId][dateKey],
      payment: updatedWater[customerId].payment,
    });
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phoneNumber.includes(query) ||
        customer.address.toLowerCase().includes(query)
      );
    });
    setFilteredCustomers(filtered);
  };

  const renderCustomerDetails = () => {
    return filteredCustomers.map((customer) => (
      <div className="sm:w-[80vw]  border-t-2 border-gray-500 text-xl" key={customer.id}>
        <div className="w-full h-auto border-b-2 border-gray-950 rounded-3xl overflow-hidden mb-5">
          <div className="flex flex-col p-5 gap-2">
            <h1>Customer Name: {customer.name}</h1>
            <h2>Phone Number: {customer.phoneNumber}</h2>
            <p>Address: {customer.address}</p>
            <p>Payment: &#8377;{selectedWater[customer.id]?.payment || 0}</p>

            <div className="flex gap-2">
              <input
                type="number"
                value={selectedWater[customer.id]?.[formattedDate]?.normalCount || 0}
                onChange={(e) => handleWaterCountChange(customer.id, 'normal', parseInt(e.target.value))}
                min="0"
                className="w-[30%] border-2 border-gray-800 rounded px-2 py-1"
              />
              <span>Normal Water Bottles</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={selectedWater[customer.id]?.[formattedDate]?.coldCount || 0}
                onChange={(e) => handleWaterCountChange(customer.id, 'cold', parseInt(e.target.value))}
                min="0"
                className="w-[30%] border-2 border-gray-800 rounded px-2 py-1"
              />
              <span>Cold Water Bottles</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col gap-5 relative">
      <h1 className='sm:text-3xl text-blue-900 font-bold'>Customer Water Details</h1>
      <div className="sm:absolute right-[10%] top-[7%] flex gap-2">
        <input
          type="text"
          placeholder="Search by name, phone, or address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-2 border-gray-800 rounded-3xl px-3 py-1"
        />
        <button onClick={handleSearch} className="border-2 border-gray-800 rounded-3xl px-4 py-1">Search</button>
      </div>
      <div className="flex flex-col items-center gap-5">
        <div className='flex gap-4'>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yy"
            className="border-2 border-gray-800 px-5 py-1 rounded-3xl"
            maxDate={new Date()}
          />
          <span>Select Date</span>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-wrap gap-5 ">
            {renderCustomerDetails()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ownerwaterdetails;
