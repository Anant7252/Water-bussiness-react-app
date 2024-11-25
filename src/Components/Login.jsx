import React, { createContext, useEffect, useState } from "react";
import { gsap } from "gsap";
import icon from "../Assets/icon.png";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, collection, getDocs, doc, updateDoc,getDoc,setDoc} from 'firebase/firestore';
import { app ,db,auth} from '../firebase';
import { useNavigate } from "react-router-dom";

function Login() {
  const [isOwner, setIsOwner] = useState(true);
  const [isCustomer, setIsCustomer] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [usernameExists, setUsernameExists] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const animateBox = () => {
      if (isOwner) {
        gsap.fromTo(
          ".owner-box",
          { x: -400, opacity: 0 },
          { x: 0, opacity: 1, duration: 2 }
        );
      } else if (isCustomer) {
        gsap.fromTo(
          ".customer-box",
          { x: -400, opacity: 0 },
          { x: 0, opacity: 1, duration: 2 }
        );
      }
    };
    setTimeout(animateBox, 50);
  }, [isOwner, isCustomer]);

  useEffect(() => {
    const animateBox = () => {
      if (!isOwner) {
        gsap.fromTo(
          ".owner-box1",
          { x: 400, opacity: 0 },
          { x: 0, opacity: 1, duration: 2 }
        );
      } else if (!isCustomer) {
        gsap.fromTo(
          ".customer-box1",
          { x: 400, opacity: 0 },
          { x: 0, opacity: 1, duration: 2 }
        );
      }
    };
    setTimeout(animateBox, 50);
  }, [isOwner, isCustomer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(isOwner ? "/owner" : "/customer");
    } catch (error) {
      console.error("Error logging in", error.message);
    }
  };

  const checkUsernameExists = async () => {
    try {
      const userType = isOwner ? "owners" : "customers";
      const collectionRef = collection(db, userType);
      const querySnapshot = await getDocs(collectionRef);
  
      // Check if username exists by comparing with user-entered username
      setUsernameExists(
        querySnapshot.docs.some((doc) => doc.data().username === username)
      );
    } catch (error) {
      console.error("Error checking username existence:", error.message);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    await checkUsernameExists();
  
    if (usernameExists) {
      alert("Username already exists, please choose another one.");
      return;
    }
  
    if (!ownerUsername) {
      alert("Please enter a valid owner username.");
      return;
    }
  
    console.log("Looking for owner username:", ownerUsername);
  
    try {
      // Attempt to retrieve the owner's document by querying the 'owners' collection
      const ownersCollection = collection(db, "owners");
      const querySnapshot = await getDocs(ownersCollection);
  
      const ownerDoc = querySnapshot.docs.find(
        (doc) => doc.data().username === ownerUsername
      );
  
      // Check if the owner document exists
      if (!ownerDoc) {
        alert("The owner username you entered does not exist.");
        return;
      }
  
      console.log("Owner found:", ownerDoc.data());
  
      // Proceed with customer registration if the owner exists
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
  
      const customerData = {
        ownerUsername,
        name,
        email,
        phoneNumber,
        address,
      };
  
      const customersCollectionRef = collection(
        db,
        `owners/${ownerDoc.id}/customers`
      );
      await setDoc(doc(customersCollectionRef, user.uid), customerData);
  
      navigate("/customer");
    } catch (error) {
      console.error("Error registering customer:", error.message);
    }
  };
  
  
  
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <div className="w-full h-[15vh] bg-blue-950 flex px-5 py-2">
        <img src={icon} alt="Icon" className="w-24 h-20" />
      </div>
      <div className="w-full h-[85vh] bg-zinc-900 flex items-center justify-center">
        <div className="sm:w-[50vw] w-[80%] h-[75vh] bg-white border-2 border-gray-600 rounded-3xl flex sm:flex-row flex-col justify-between overflow-hidden">
          <div className="sm:w-[70%] w-full h-full sm-h-full p-3 overflow-y-scroll bg-red-100">
            {isOwner ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-xl gap-5">
                <h1>Owner Login</h1>
                <form className="flex flex-col gap-2" onSubmit={handleLogin}>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Phone number"
                    className="border-2 border-black rounded-2xl px-4 py-1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <label htmlFor="ownernumber">Email or Phone Number</label>
                  <input
                    type="email"
                    id="ownernumber"
                    placeholder="Phone number"
                    className="border-2 border-black rounded-2xl px-4 py-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    className="border-2 border-black rounded-2xl px-4 py-1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="flex justify-between">
                    <button type="submit" className="border-2 border-gray-900 px-5 py-2 rounded-3xl bg-blue-800 text-white hover:bg-white hover:text-black tansition-all ease-in duration-1000 hover:scale-110">
                      Login
                    </button>
                    <button type="button" className="border-2 border-gray-900 px-5 py-2 rounded-3xl bg-blue-800 text-white hover:bg-white hover:text-black tansition-all ease-in duration-1000 hover:scale-110" onClick={handleRegister}>
                      Register
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 flex-shrink">
                <h1>Customer Login</h1>
                <form className="flex flex-col " onSubmit={handleLogin}>
                  <label htmlFor="owner-username">Owner Username</label>
                  <input
                    type="text"
                    id="owner-username"
                    placeholder="Owner Username"
                    className="border-2 border-black rounded-2xl px-4 "
                    value={ownerUsername}
                    onChange={(e) => {setOwnerUsername(e.target.value);localStorage.setItem("ownerusername",e.target.value);}}
                    required
                  />
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Username"
                    className="border-2 border-black rounded-2xl px-4 "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <label htmlFor="username">Email or Phone Number</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Email or Phone number"
                    className="border-2 border-black rounded-2xl px-4 "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    placeholder="Phone Number"
                    className="border-2 border-black rounded-2xl px-4 "
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <label htmlFor="address">Address</label>
                  <textarea
                    name="address"
                    id="address"
                    placeholder="Address"
                    className="border-2 border-black rounded-2xl px-4 "
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  ></textarea>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    className="border-2 border-black rounded-2xl px-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="flex justify-between mt-2">
                    <button type="submit" className="border-2 border-gray-900 px-5 py-2 rounded-3xl bg-blue-800 text-white hover:bg-white hover:text-black tansition-all ease-in duration-1000 hover:scale-110">
                      Login
                    </button>
                    <button type="button" className="border-2 border-gray-900 px-5 py-2 rounded-3xl bg-blue-800 text-white hover:bg-white hover:text-black tansition-all ease-in duration-1000 hover:scale-110" onClick={handleRegister}>
                      Register
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          <div className="sm:w-[30%] w-full sm:h-full h-[20%] flex flex-col items-center justify-center bg-zinc-800">
            <button
              className="border-2 border-gray-900 px-5 py-2 rounded-3xl bg-blue-800 text-white hover:bg-white hover:text-black tansition-all ease-in duration-1000"
              onClick={() => {
                setIsOwner(!isOwner);
                setIsCustomer(!isCustomer);
              }}
            >
              {isOwner ? "Switch to Customer Login" : "Switch to Owner Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;



