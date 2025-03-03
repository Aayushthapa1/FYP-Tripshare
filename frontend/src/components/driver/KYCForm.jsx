import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitKYC } from '../Slices/driverSlice';

const KYCForm = () => {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.driver);
    const [formData, setFormData] = useState(new FormData());

    const handleFileChange = (e) => {
        const files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            formData.append(e.target.name, files[i]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(submitKYC(formData));
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <input type="text" name="fullName" required />
            <input type="email" name="email" required />
            
            {/* Document Uploads */}
            <input type="file" name="photo" onChange={handleFileChange} required />
            <input type="file" name="frontPhoto" onChange={handleFileChange} required />
            <input type="file" name="backPhoto" onChange={handleFileChange} required />
            
            {status === 'loading' && <p>Submitting...</p>}
            {error && <p className="error">{error}</p>}
            <button type="submit">Submit KYC</button>
        </form>
    );
};

export default KYCForm;