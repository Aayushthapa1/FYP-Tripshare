// import { useState } from 'react';

// const DriverRegistrationForm = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     // Personal Info Part 1
//     fullName: '',
//     address: '',
//     email: '',
//     gender: '',
//     dateOfBirth: '',
//     citizenshipNumber: '',
    
//     // Personal Info Part 2
//     phoneNumber: '',
//     alternativePhone: '',
//     emergencyContact: '',
//     bloodGroup: '',
    
//     // Vehicle Info
//     vehicleType: '',
//     numberPlate: '',
//     productionYear: '',
//     licenseNumber: '',
//     licenseExpiry: '',
//   });

//   const [vehiclePhotos, setVehiclePhotos] = useState({
//     vehicle: null,
//     vehicleDetail: null,
//     ownerDetail: null,
//     renewalDetail: null
//   });

//   const [photoPreview, setPhotoPreview] = useState({
//     vehicle: null,
//     vehicleDetail: null,
//     ownerDetail: null,
//     renewalDetail: null
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleFileUpload = (e, type) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Update the file state
//       setVehiclePhotos(prev => ({
//         ...prev,
//         [type]: file
//       }));

//       // Create preview URL
//       const previewUrl = URL.createObjectURL(file);
//       setPhotoPreview(prev => ({
//         ...prev,
//         [type]: previewUrl
//       }));
//     }
//   };

//   const renderPhotoUploadSection = (type, label) => (
//     <div className="mt-4 p-4 border border-gray-200 rounded-lg">
//       <p className="text-sm text-gray-600 mb-2">{label}</p>
      
//       {photoPreview[type] ? (
//         <div className="relative">
//           <img 
//             src={photoPreview[type]} 
//             alt={`${type} preview`} 
//             className="w-full h-48 object-cover rounded-lg mb-2"
//           />
//           <button
//             onClick={() => {
//               setVehiclePhotos(prev => ({ ...prev, [type]: null }));
//               setPhotoPreview(prev => ({ ...prev, [type]: null }));
//             }}
//             className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
//           >
//             ✕
//           </button>
//         </div>
//       ) : (
//         <div className="relative">
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => handleFileUpload(e, type)}
//             className="hidden"
//             id={`file-${type}`}
//           />
//           <label
//             htmlFor={`file-${type}`}
//             className="w-full flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-gray-50"
//           >
//             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//               <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//               </svg>
//               <p className="mb-2 text-sm text-gray-500">
//                 <span className="font-semibold">Click to upload</span> or drag and drop
//               </p>
//               <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
//             </div>
//           </label>
//         </div>
//       )}
//     </div>
//   );

//   const renderPersonalInfo1 = () => (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold text-gray-800">Personal Information (1/2)</h2>
//       <div className="space-y-3">
//         <input
//           type="text"
//           name="fullName"
//           placeholder="Full Name"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.fullName}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="address"
//           placeholder="Address"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.address}
//           onChange={handleInputChange}
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.email}
//           onChange={handleInputChange}
//         />
//         <select
//           name="gender"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.gender}
//           onChange={handleInputChange}
//         >
//           <option value="">Select Gender</option>
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//           <option value="other">Other</option>
//         </select>
//         <input
//           type="date"
//           name="dateOfBirth"
//           placeholder="Date of Birth"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.dateOfBirth}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="citizenshipNumber"
//           placeholder="Citizenship Number"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.citizenshipNumber}
//           onChange={handleInputChange}
//         />
//       </div>
//     </div>
//   );

//   const renderPersonalInfo2 = () => (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold text-gray-800">Personal Information (2/2)</h2>
//       <div className="space-y-3">
//         <input
//           type="tel"
//           name="phoneNumber"
//           placeholder="Phone Number"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.phoneNumber}
//           onChange={handleInputChange}
//         />
//         <input
//           type="tel"
//           name="alternativePhone"
//           placeholder="Alternative Phone"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.alternativePhone}
//           onChange={handleInputChange}
//         />
//         <input
//           type="tel"
//           name="emergencyContact"
//           placeholder="Emergency Contact"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.emergencyContact}
//           onChange={handleInputChange}
//         />
//         <select
//           name="bloodGroup"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.bloodGroup}
//           onChange={handleInputChange}
//         >
//           <option value="">Select Blood Group</option>
//           <option value="A+">A+</option>
//           <option value="A-">A-</option>
//           <option value="B+">B+</option>
//           <option value="B-">B-</option>
//           <option value="O+">O+</option>
//           <option value="O-">O-</option>
//           <option value="AB+">AB+</option>
//           <option value="AB-">AB-</option>
//         </select>
//       </div>
//     </div>
//   );

//   const renderVehicleInfo = () => (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold text-gray-800">Vehicle Information</h2>
//       <div className="space-y-3">
//         <input
//           type="text"
//           name="vehicleType"
//           placeholder="Vehicle Type"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.vehicleType}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="numberPlate"
//           placeholder="Number Plate"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.numberPlate}
//           onChange={handleInputChange}
//         />
//         <input
//           type="number"
//           name="productionYear"
//           placeholder="Production Year"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.productionYear}
//           onChange={handleInputChange}
//         />
//         <input
//           type="text"
//           name="licenseNumber"
//           placeholder="License Number"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.licenseNumber}
//           onChange={handleInputChange}
//         />
//         <input
//           type="date"
//           name="licenseExpiry"
//           placeholder="License Expiry Date"
//           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           value={formData.licenseExpiry}
//           onChange={handleInputChange}
//         />
        
//         {renderPhotoUploadSection('vehicle', 'Vehicle Photo')}
//         {renderPhotoUploadSection('vehicleDetail', 'Vehicle Detail Photo')}
//         {renderPhotoUploadSection('ownerDetail', 'Owner Detail Photo')}
//         {renderPhotoUploadSection('renewalDetail', 'Renewal Detail Photo')}
//       </div>
//     </div>
//   );

//   const handleSubmit = () => {
//     // Create FormData object to handle file uploads
//     const submitData = new FormData();
    
//     // Append all form data
//     Object.keys(formData).forEach(key => {
//       submitData.append(key, formData[key]);
//     });
    
//     // Append all files
//     Object.keys(vehiclePhotos).forEach(key => {
//       if (vehiclePhotos[key]) {
//         submitData.append(`photo_${key}`, vehiclePhotos[key]);
//       }
//     });

//     // Log the FormData (for demonstration)
//     console.log('Form submitted with files:', {
//       formData,
//       files: Object.fromEntries(
//         Object.entries(vehiclePhotos).map(([key, value]) => [
//           key,
//           value ? value.name : null
//         ])
//       )
//     });

//     // Here you would typically send the FormData to your server
//     // fetch('/api/submit', {
//     //   method: 'POST',
//     //   body: submitData
//     // });
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4">
//       <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
//         <div className="mb-6">
//           <div className="flex justify-between mb-4">
//             <div
//               className={`h-2 w-1/3 ${
//                 step >= 1 ? 'bg-green-500' : 'bg-gray-200'
//               } rounded-full`}
//             />
//             <div
//               className={`h-2 w-1/3 ${
//                 step >= 2 ? 'bg-green-500' : 'bg-gray-200'
//               } rounded-full mx-1`}
//             />
//             <div
//               className={`h-2 w-1/3 ${
//                 step >= 3 ? 'bg-green-500' : 'bg-gray-200'
//               } rounded-full`}
//             />
//           </div>
//         </div>

//         {step === 1 && renderPersonalInfo1()}
//         {step === 2 && renderPersonalInfo2()}
//         {step === 3 && renderVehicleInfo()}

//         <div className="flex justify-between mt-6">
//           {step > 1 && (
//             <button
//               onClick={() => setStep(step - 1)}
//               className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//             >
//               Previous
//             </button>
//           )}
//           {step < 3 ? (
//             <button
//               onClick={() => setStep(step + 1)}
//               className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-auto"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               onClick={handleSubmit}
//               className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-auto"
//             >
//               Submit
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverRegistrationForm;