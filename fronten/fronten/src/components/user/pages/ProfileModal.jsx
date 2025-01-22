// // src/components/users/ProfileModal.jsx
// import React, { useState } from 'react';
// import { X } from 'lucide-react';

// export default function ProfileModal({ isOpen, onClose }) {
//   if (!isOpen) return null;

//   // Active tab: "personal" | "payment" | "preferences"
//   const [activeTab, setActiveTab] = useState("personal");

//   // Fake data for the user’s personal info
//   const [personalInfo, setPersonalInfo] = useState({
//     firstName: "Aayush",
//     lastName: "Thapa",
//     email: "aayush134056@gmail.com",
//     address: "Itahari",
//     phone: "+977 98*******"
//   });

//   // Fake data for Payment Methods
//   const [paymentMethods, setPaymentMethods] = useState([
//     { id: 1, type: "Visa", last4: "1234", expiry: "12/24" },
//     { id: 2, type: "PayPal", email: "aayush@paypal.com" }
//   ]);

//   // Fake data for Ride Preferences
//   const [ridePreferences, setRidePreferences] = useState({
//     nonSmoking: true,
//     extraBaggage: false,
//     musicPreference: "Any",
//   });

//   // Handlers for saving changes
//   const handleSavePersonal = () => {
//     alert("Personal info saved (not really)!");
//     // In real code: call your API or update context with personalInfo
//   };
//   const handleSavePayment = () => {
//     alert("Payment methods updated (not really)!");
//     // In real code: call your API or update context
//   };
//   const handleSavePreferences = () => {
//     alert("Ride preferences saved (not really)!");
//     // In real code: call your API or update context
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
//       <div className="relative bg-white w-full max-w-2xl mx-auto p-6 rounded-lg shadow-lg">
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
//         >
//           <X className="w-5 h-5" />
//         </button>

//         {/* User Header (avatar, name, rating) */}
//         <div className="flex items-center mb-4">
//           <img
//             src="https://via.placeholder.com/80"
//             alt="User Avatar"
//             className="w-16 h-16 rounded-full object-cover mr-4"
//           />
//           <div>
//             <h2 className="text-xl font-bold">{`${personalInfo.firstName} ${personalInfo.lastName}`}</h2>
//             <p className="text-gray-500">{personalInfo.email}</p>
//             <p className="text-green-600">★ 4.9 (124 rides)</p>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex space-x-6 border-b mb-4">
//           <button
//             onClick={() => setActiveTab("personal")}
//             className={`pb-2 ${
//               activeTab === "personal"
//                 ? "border-green-500 text-green-600 border-b-2"
//                 : "text-gray-600"
//             }`}
//           >
//             Personal Information
//           </button>
//           <button
//             onClick={() => setActiveTab("payment")}
//             className={`pb-2 ${
//               activeTab === "payment"
//                 ? "border-green-500 text-green-600 border-b-2"
//                 : "text-gray-600"
//             }`}
//           >
//             Payment Methods
//           </button>
//           <button
//             onClick={() => setActiveTab("preferences")}
//             className={`pb-2 ${
//               activeTab === "preferences"
//                 ? "border-green-500 text-green-600 border-b-2"
//                 : "text-gray-600"
//             }`}
//           >
//             Ride Preferences
//           </button>
//         </div>

//         {/* ===================
//             TAB: Personal Info
//            =================== */}
//         {activeTab === "personal" && (
//           <div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               {/* First Name */}
//               <div>
//                 <label className="block text-gray-700 mb-1">First Name</label>
//                 <input
//                   type="text"
//                   value={personalInfo.firstName}
//                   onChange={(e) =>
//                     setPersonalInfo({ ...personalInfo, firstName: e.target.value })
//                   }
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>
//               {/* Last Name */}
//               <div>
//                 <label className="block text-gray-700 mb-1">Last Name</label>
//                 <input
//                   type="text"
//                   value={personalInfo.lastName}
//                   onChange={(e) =>
//                     setPersonalInfo({ ...personalInfo, lastName: e.target.value })
//                   }
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>
//               {/* Email */}
//               <div>
//                 <label className="block text-gray-700 mb-1">Email</label>
//                 <input
//                   type="email"
//                   value={personalInfo.email}
//                   onChange={(e) =>
//                     setPersonalInfo({ ...personalInfo, email: e.target.value })
//                   }
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>
//               {/* Phone */}
//               <div>
//                 <label className="block text-gray-700 mb-1">Phone</label>
//                 <input
//                   type="text"
//                   value={personalInfo.phone}
//                   onChange={(e) =>
//                     setPersonalInfo({ ...personalInfo, phone: e.target.value })
//                   }
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>
//               {/* Address */}
//               <div className="md:col-span-2">
//                 <label className="block text-gray-700 mb-1">Address</label>
//                 <input
//                   type="text"
//                   value={personalInfo.address}
//                   onChange={(e) =>
//                     setPersonalInfo({ ...personalInfo, address: e.target.value })
//                   }
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={handleSavePersonal}
//               className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
//             >
//               Save Changes
//             </button>
//           </div>
//         )}

//         {/* =====================
//             TAB: Payment Methods
//            ===================== */}
//         {activeTab === "payment" && (
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
//             <p className="text-gray-600 mb-4">
//               Add or update your credit cards, PayPal, etc.
//             </p>
//             <div className="space-y-3 mb-4">
//               {paymentMethods.map((pm) => (
//                 <div
//                   key={pm.id}
//                   className="p-3 border rounded flex items-center justify-between"
//                 >
//                   <div>
//                     <p className="font-medium text-gray-700">
//                       {pm.type === "Visa"
//                         ? `${pm.type} **** ${pm.last4}`
//                         : `${pm.type} (${pm.email})`}
//                     </p>
//                     {pm.expiry && (
//                       <p className="text-sm text-gray-500">Expires: {pm.expiry}</p>
//                     )}
//                   </div>
//                   <button className="text-red-500 hover:underline">Remove</button>
 
