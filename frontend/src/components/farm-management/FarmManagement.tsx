import React from 'react';
import { Outlet } from 'react-router-dom';

const FarmManagement = () => (
  <div className="w-full h-full flex flex-col px-4 py-4">
    <Outlet />
  </div>
);

export default FarmManagement;