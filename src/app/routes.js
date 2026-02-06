import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Program_Details from './pages/Program_Details';
import Demand_Forecast from './pages/Demand_Forecast';
import Program_Flow_Map from './pages/Program_Flow_Map';
import Capacity from './pages/Capacity';
import Expiry_Summary from './pages/Expiry_Summary';
import Heatmaps from './pages/Heatmaps';
import Monthly_Demand_Supply from './pages/Monthly_Demand_Supply';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Program_Details },
      { path: 'demand_forecast', Component: Demand_Forecast },
      { path: 'program_flow_map', Component: Program_Flow_Map },
      { path: 'capacity', Component: Capacity },
      { path: 'expiry_summary', Component: Expiry_Summary },
      { path: 'heatmaps', Component: Heatmaps },
      { path: 'monthly_demand_supply', Component: Monthly_Demand_Supply },
      { path: '*', Component: NotFound },
    ],
  },
]);
