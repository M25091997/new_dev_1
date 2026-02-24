import { getSellerOrders } from "../../api/api";
import { 
  fetchOrdersStart, 
  fetchOrdersSuccess, 
  fetchOrdersFailure 
} from '../reducer/ordersReducer';

export const fetchOrdersData = (token, params = {}) => async (dispatch) => {
  try {
    dispatch(fetchOrdersStart());
    
    const response = await getSellerOrders(token, params);
    
    if (response.status === 1) {
      dispatch(fetchOrdersSuccess(response));
      return { success: true, data: response };
    } else {
      throw new Error(response.message || 'Failed to fetch orders');
    }
  } catch (error) {
    dispatch(fetchOrdersFailure(error.message || 'Failed to fetch orders'));
    return { success: false, error: error.message };
  }
};

export const updateOrderStatus = (orderId, status) => async (dispatch) => {
  // This would typically make an API call to update order status
  // For now, we'll just update the local state
  dispatch({ type: 'orders/updateOrderStatus', payload: { orderId, status } });
  return { success: true };
};
