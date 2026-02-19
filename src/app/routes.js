import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Program_Details from './pages/Program_Details';
import Demand_Forecast from './pages/Demand_Forecast';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';
import Program_Drilldown from './pages/Program_Drilldown';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Program_Details },
      { path: 'demand_forecast', Component: Demand_Forecast },
      { path: 'program_flow_map', Component: ComingSoon },
      { path: 'capacity', Component: ComingSoon },
      { path: 'expiry_summary', Component: ComingSoon },
      { path: 'heatmaps', Component: ComingSoon },
      { path: 'monthly_demand_supply', Component: ComingSoon },
      { path: 'programs/:programId', Component: Program_Drilldown },
      { path: '*', Component: NotFound },
    ],
  },
]);