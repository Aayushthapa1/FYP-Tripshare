// import React, { useState } from "react";
// import axios from "axios";

// const MultiStepForm = ({ onClose, userId }) => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     fullName: "",
//     address: "",
//     email: "",
//     gender: "",
//     dob: "",
//     citizenshipNumber: "",
//     licenseNumber: "",
//     vehicleType: "",
//     numberPlate: "",
//     productionYear: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const nextStep = () => setStep(step + 1);
//   const prevStep = () => setStep(step - 1);

//   const handleSubmit = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         "/api/drivers/kyc",
//         { ...formData, userId },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       console.log("KYC Submitted:", response.data);
//       onClose(); // Close the form after submission
//     } catch (error) {
//       console.error("Error submitting KYC:", error);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//         >
//           &times;
//         </button>
//         <h2 className="text-xl font-bold mb-4">KYC Application</h2>
//         {step === 1 && (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Personal Information</h3>
//             <input
//               type="text"
//               name="fullName"
//               placeholder="Full Name"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//             <input
//               type="text"
//               name="address"
//               placeholder="Address"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//             <select
//               name="gender"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             >
//               <option value="">Select Gender</option>
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//             </select>
//             <input
//               type="date"
//               name="dob"
//               placeholder="Date of Birth"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//             <input
//               type="text"
//               name="citizenshipNumber"
//               placeholder="Citizenship Number"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//             <button
//               onClick={nextStep}
//               className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
//             >
//               Next
//             </button>
//           </div>
//         )}
//         {step === 2 && (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">License Information</h3>
//             <input
//               type="text"
//               name="licenseNumber"
//               placeholder="License Number"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={prevStep}
//                 className="w-1/2 bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={nextStep}
//                 className="w-1/2 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//         {step === 3 && (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Vehicle Information</h3>
//             <select
//               name="vehicleType"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             >
//               <option value="">Select Vehicle Type</option>
//               <option value="Car">Car</option>
//               <option value="Bike">Bike</option>
//               <option value="Electric">Electric</option>
//             </select>
//             <input
//               type="text"
//               name="numberPlate"
//               placeholder="Number Plate"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//             <input
//               type="text"
//               name="productionYear"
//               placeholder="Production Year"
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={prevStep}
//                 className="w-1/2 bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="w-1/2 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MultiStepForm;