import { getSellerDashboard } from "../../api/api";
import { 
  fetchDashboardStart, 
  fetchDashboardSuccess, 
  fetchDashboardFailure 
} from '../reducer/dashboardReducer';

export const fetchDashboardData = (token) => async (dispatch) => {
  try {
    dispatch(fetchDashboardStart());
    
    const response = await getSellerDashboard(token);
    
    if (response.status === 1) {
      dispatch(fetchDashboardSuccess(response.data));
      return { success: true, data: response.data };
    } else {
      throw new Error(response.message || 'Failed to fetch dashboard data');
    }
  } catch (error) {
    dispatch(fetchDashboardFailure(error.message || 'Failed to fetch dashboard data'));
    return { success: false, error: error.message };
  }
};
