import React, { useState } from "react";
import icon from "../Assets/icon.png";
import Avatar from "react-initials-avatar";
import Ownerwaterdetails from "./Ownerwaterdetails";
import Ownerpaymentdetails from "./Ownerpaymentdetails";

function Owner() {
  const [position, setposition] = useState("100vw");
  const [activeComponent, setActiveComponent] = useState(null);

  const handlenav = () => {
    if (position === "100vw") {
      setposition("0vw");
    } else {
      setposition("100vw");
    }
  };

  const handlemain = () => {
    setActiveComponent(<Ownerwaterdetails />);
  };

  const handlemain1 = () => {
    setActiveComponent(<Ownerpaymentdetails />);
  };

  return (
    <div className="flex flex-col ">
      <div className="w-full h-[20%] bg-blue-950 flex justify-between items-center p-5">
        <img src={icon} alt="" className="w-20 object-cover" />
        <div className="flex flex-col gap-5">
          <button onClick={handlenav}>
            <Avatar
              name="Anant"
              size={150}
              bgColor="#FFD700"
              textColor="#fff"
              className="w-14 h-14 text-center bg-slate-50 text-3xl border-4 border-gray-800 py-1 rounded-full"
            />
          </button>
        </div>
      </div>
      <div id="main" className="w-full h-full flex overflow-x-hidden relative p-5">
        {activeComponent ? (
          <div className="w-full h-full">{activeComponent}</div>
        ) : (
          <div className="w-[100vw] h-[88vh] flex flex-col  gap-10">
            <button
              onClick={handlemain}
              className="w-50 h-50 p-8 text-center text-wrap border-y-2 text-3xl border-gray-900"
            >
              Customer Water Details
            </button>
            <button
              onClick={handlemain1}
              className="w-50 h-50 p-8 text-center text-wrap border-y-2 text-3xl border-gray-900"
            >
              Customer Payment Details
            </button>
          </div>
        )}
        <div
          className="absolute right-0 top-[0%] transition-transform duration-[2500ms] ease-out h-[80vh] z-50 w-4/5 sm:w-[30vw] bg-blue-950 top-12 flex flex-col items-center py-12"
          style={{ transform: `translateX(${position})` }}
        >
          <Avatar
            name="Anant"
            size={50}
            bgColor="#FFD700"
            textColor="#fff"
            className="w-24 h-24 bg-slate-50 text-3xl border-4 border-gray-800 rounded-full text-center py-5"
          />
        </div>
      </div>
    </div>
  );
}

export default Owner;
