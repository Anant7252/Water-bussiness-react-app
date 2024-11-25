import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { collection, getFirestore, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebase';
import icon from '../Assests/icon.png';

const auth = getAuth(app);
const db = getFirestore(app);

function Customer() {
  const [ownerid, setOwnerId] = useState("");
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    const user = auth.currentUser;
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in", user.uid);
        const owner = localStorage.getItem("ownerusername");

        const customersRef = collection(db, 'owners');
        const q = query(customersRef, where("username", "==", owner));
        getDocs(q)
          .then((querySnapshot) => {
            if (querySnapshot.empty) {
              console.log("No user found");
            } else {
              querySnapshot.forEach((doc) => {
                console.log("user id", doc.id, "userdata", doc.data());
                setOwnerId(doc.id);
              });
            }
          })
          .catch((error) => {
            console.log("Error fetching owner data", error);
          });
      } else {
        console.log("No user found");
        setLoading(false);  
      }
    });

  }, []); 

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!ownerid) return;

      const customersRef = doc(db, 'owners', ownerid, 'customers', auth.currentUser.uid);
      try {
        const customerdoc = await getDoc(customersRef);
        if (customerdoc.exists()) {
          const customerdata = customerdoc.data();
          setDetails(customerdata);
        }
        setLoading(false);  
      } catch (error) {
        console.log("Error fetching customer data", error);
        setLoading(false);  
      }
    };

    fetchCustomerData();
  }, [ownerid]); 

  const renderdetails = (key) => {
    return details[key] !== undefined ? details[key] : "Not Available";
  };

  const renderWaterDetails = () => {
    const waterDetails = details.waterDetails;
  
    if (!waterDetails) {
      return <p>No water details available</p>;
    }
  
    // Sort dates in descending order
    const sortedDates = Object.keys(waterDetails).sort((a, b) => new Date(b) - new Date(a));
  
    return sortedDates.map((date) => {
      const dateDetails = waterDetails[date];
      return (
        <div className="w-full h-full flex flex-col gap-4" key={date}>
          <div>
            <div className="w-full flex justify-between">
              <h2 className="w-full border-2 border-gray-900 text-center p-2">Date: {date}</h2>
              <h1 className="w-full border-2 border-gray-900 text-center p-2">
                {dateDetails.normalCount || 0}
              </h1>
              <h1 className="w-full border-2 border-gray-900 text-center p-2">
                {dateDetails.coldCount || 0}
              </h1>
            </div>
          </div>
        </div>
      );
    });
  };
  
  
  
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className='w-full h-[12%] flex bg-blue-950'>
        <img src={icon} alt="" />
      </div>
      <div>
        {loading ? (
          <h1>Loading...</h1>
        ) : (
          <>
            <div className='flex justify-between p-5'>
              <h1 className="sm:text-3xl text-xl text-blue-950">Name: <strong>{renderdetails("name")}</strong></h1>
              <h1 className="sm:text-3xl text-xl text-blue-950">Payment:&#8377;{renderdetails("payment")}</h1>
            </div>

            <div className='w-full h-full overflow-x-hidden overflow-y-scroll'>
              <h1 className='sm:text-3xl text-xl text-blue-950 font-bold mb-5 '>Water Details</h1>
              <div className='w-full border-t-2 border-gray-900 sm:text-xl'>
                <div className='flex justify-between'>
                  <h1 className='w-full border-2 border-gray-900 text-center p-2 font-bold '>Date</h1>
                  <h1 className='w-full border-2 border-gray-900 text-center p-2'>Normal Water</h1>
                  <h1 className='w-full border-2 border-gray-900 text-center p-2'>Cold Water</h1>
                </div>
              {renderWaterDetails()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Customer;
