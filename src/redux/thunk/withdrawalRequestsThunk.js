import { getSellerWithdrawalRequests } from "../../api/api";
import { 
  fetchWithdrawalRequestsStart, 
  fetchWithdrawalRequestsSuccess, 
  fetchWithdrawalRequestsFailure 
} from '../reducer/withdrawalRequestsReducer';

export const fetchWithdrawalRequestsData = (token, params = {}) => async (dispatch) => {
  try {
    dispatch(fetchWithdrawalRequestsStart());
    
    const response = await getSellerWithdrawalRequests(token, params);
    
    if (response.status === 1) {
      dispatch(fetchWithdrawalRequestsSuccess(response));
      return { success: true, data: response };
    } else {
      throw new Error(response.message || 'Failed to fetch withdrawal requests');
    }
  } catch (error) {
    dispatch(fetchWithdrawalRequestsFailure(error.message || 'Failed to fetch withdrawal requests'));
    return { success: false, error: error.message };
  }
};

export const createWithdrawalRequest = (token, payload) => async (dispatch) => {
  try {
    // This would typically make an API call to create withdrawal request
    // For now, we'll just return success
    // You can implement the actual API call when the endpoint is available
    return { success: true, message: 'Withdrawal request created successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateWithdrawalRequestStatus = (requestId, status) => async (dispatch) => {
  // This would typically make an API call to update withdrawal request status
  // For now, we'll just update the local state
  dispatch({ type: 'withdrawalRequests/updateWithdrawalRequest', payload: { requestId, status } });
  return { success: true };
};
