import React from "react";

const DriverList = ({ drivers }) => {

  console.log(drivers);
  console.log(drivers.length);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Phone</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {drivers.length > 0 ? (
            drivers.map((driver) => (
              <tr key={driver.id} className="text-center">
                <td className="py-2 px-4 border-b">{driver.id}</td>
                <td className="py-2 px-4 border-b">{driver.name}</td>
                <td className="py-2 px-4 border-b">{driver.email}</td>
                <td className="py-2 px-4 border-b">{driver.phone}</td>
                <td className="py-2 px-4 border-b">
                  {driver.status === "verified" ? (
                    <span className="text-green-600 font-semibold">Verified</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Pending</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-4 text-center text-gray-500">
                No drivers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DriverList;
