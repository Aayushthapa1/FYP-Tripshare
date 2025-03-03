import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingKYC, updateVerificationStatus } from '../../Slices/driverSlice';

const AdminKYCList = () => {
    const dispatch = useDispatch();
    const { pendingKYCs } = useSelector((state) => state.driver);

    useEffect(() => {
        dispatch(fetchPendingKYC());
    }, [dispatch]);

    const handleVerification = (driverId, status) => {
        const reason = status === 'rejected' ? prompt('Enter rejection reason:') : '';
        dispatch(updateVerificationStatus({ driverId, status, reason }));
    };

    return (
        <div className="kyc-list">
            {pendingKYCs.map((kyc) => (
                <div key={kyc._id} className="kyc-item">
                    <div>{kyc.fullName}</div>
                    <div>{kyc.email}</div>
                    <div>
                        <button onClick={() => handleVerification(kyc._id, 'approved')}>
                            Approve
                        </button>
                        <button onClick={() => handleVerification(kyc._id, 'rejected')}>
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminKYCList;