import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { RcSearchPage } from './pages/RcSearchPage';
import { CarInsurancePage } from './pages/CarInsurancePage';
import { BikeInsurancePage } from './pages/BikeInsurancePage';
import { CheckInsurancePage } from './pages/CheckInsurancePage';
import { ClaimInsurancePage } from './pages/ClaimInsurancePage';
import { HomeTab } from './pages/HomeTab';
import { InsuranceTab } from './pages/InsuranceTab';
import { GarageTab } from './pages/GarageTab';
import { ServicesTab } from './pages/ServicesTab';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables & Custom Styles */
import './theme/variables.css';
import './index.css';

setupIonicReact({
  mode: 'md',
});

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Main Screenshot Dedicated Routes */}
        <Route path="/rc-search" element={<RcSearchPage />} />
        <Route path="/car-insurance" element={<CarInsurancePage />} />
        <Route path="/bike-insurance" element={<BikeInsurancePage />} />
        <Route path="/check-insurance" element={<CheckInsurancePage />} />
        <Route path="/claim-insurance" element={<ClaimInsurancePage />} />

        {/* Other Pages */}
        <Route path="/home" element={<HomeTab />} />
        <Route path="/insurance" element={<InsuranceTab />} />
        <Route path="/garage" element={<GarageTab />} />
        <Route path="/services" element={<ServicesTab />} />

        {/* Fallback redirects */}
        <Route path="/rc-status" element={<Navigate to="/rc-search" replace />} />
        <Route path="/challans" element={<Navigate to="/home" replace />} />
        <Route path="/vault" element={<Navigate to="/garage" replace />} />
        <Route path="/exam" element={<Navigate to="/services" replace />} />
        <Route path="/" element={<Navigate to="/rc-search" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
