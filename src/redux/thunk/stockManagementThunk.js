import { getStockManagement, updateStock } from "../../api/api";
import { 
  fetchStockStart, 
  fetchStockSuccess, 
  fetchStockFailure,
  updateStockStart,
  updateStockSuccess,
  updateStockFailure
} from '../reducer/stockManagementReducer';

export const fetchStockData = (token, params = {}) => async (dispatch) => {
  try {
    dispatch(fetchStockStart());
    
    const response = await getStockManagement(token, params);
    
    if (response.status === 1) {
      dispatch(fetchStockSuccess(response));
      return { success: true, data: response };
    } else {
      throw new Error(response.message || 'Failed to fetch stock data');
    }
  } catch (error) {
    dispatch(fetchStockFailure(error.message || 'Failed to fetch stock data'));
    return { success: false, error: error.message };
  }
};

export const updateStockData = (token, payload) => async (dispatch) => {
  try {
    dispatch(updateStockStart());
    
    const response = await updateStock(token, payload);
    
    if (response.status === 1) {
      dispatch(updateStockSuccess({
        productId: payload.product_id,
        variantId: payload.variant_id,
        newStock: payload.stock
      }));
      return { success: true, data: response };
    } else {
      throw new Error(response.message || 'Failed to update stock');
    }
  } catch (error) {
    dispatch(updateStockFailure(error.message || 'Failed to update stock'));
    return { success: false, error: error.message };
  }
};
