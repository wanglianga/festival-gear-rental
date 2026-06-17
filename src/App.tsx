import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/common/BottomNav';
import { useAppStore } from './store/useAppStore';
import { cn } from './lib/utils';

import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { RentConfirmPage } from './pages/RentConfirmPage';
import { VoucherPage } from './pages/VoucherPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';

import { StaffHomePage } from './pages/StaffHomePage';
import { StaffScanPage } from './pages/StaffScanPage';
import { StaffReturnPage } from './pages/StaffReturnPage';
import { StaffLockerPage } from './pages/StaffLockerPage';
import { StaffTransferPage } from './pages/StaffTransferPage';

function App() {
  const { brightMode } = useAppStore();

  return (
    <BrowserRouter>
      <div className={cn(
        'min-h-screen transition-colors duration-300',
        brightMode ? 'bg-white' : 'bg-festival-dark'
      )}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/rent/:id" element={<RentConfirmPage />} />
          <Route path="/voucher/:orderId" element={<VoucherPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/staff" element={<StaffHomePage />} />
          <Route path="/staff/scan" element={<StaffScanPage />} />
          <Route path="/staff/return" element={<StaffReturnPage />} />
          <Route path="/staff/locker" element={<StaffLockerPage />} />
          <Route path="/staff/transfer" element={<StaffTransferPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
