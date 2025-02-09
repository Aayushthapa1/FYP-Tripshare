import React from "react";

export default function FeatureCard({ icon: Icon, title, description }) {
  console.log(Icon);
  return (
    <div className="group p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
  <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors duration-300">
    {Icon ? <Icon className="h-6 w-6 text-green-500" /> : <div className="h-6 w-6 bg-gray-500"></div>}  {/* Fallback */}
  </div>
  <h3 className="mt-6 text-xl font-semibold text-gray-900">{title}</h3>
  <p className="mt-4 text-gray-600 leading-relaxed">{description}</p>
</div>

  );
}
