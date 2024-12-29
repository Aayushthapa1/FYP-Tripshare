import React from 'react';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/home/HeroSection';
import FeaturesSection from './components/home/FeaturesSection';
import HowItWorks from './components/home/HowItWorks';
import Footer from './components/layout/Footer';
import Features from './components/Feature/Feature';
import PopularRoutes from './components/home/PopularRoutes';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <Features />
      <PopularRoutes />
      <Footer />
    </div>
  );
}

export default App;
// src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';  // Import the AuthProvider
// import Navbar from './components/layout/Navbar';
// import HeroSection from './components/home/HeroSection';
// import FeaturesSection from './components/home/FeaturesSection';
// import HowItWorks from './components/home/HowItWorks';
// import Footer from './components/layout/Footer';
// import Features from './components/Feature/Feature';

// import ProtectedRoute from './components/utils/ProtectedRoute';  // Import ProtectedRoute

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="min-h-screen bg-gray-50">
//           <Navbar />
//           <Switch>
//             <Route exact path="/" component={HeroSection} />
         

//             <Route path="/features" component={FeaturesSection} />
//             <Route path="/how-it-works" component={HowItWorks} />
//             <ProtectedRoute path="/features-page" component={Features} />
//             <Footer />
//           </Switch>
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
