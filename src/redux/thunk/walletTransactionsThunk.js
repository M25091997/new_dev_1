import { getSellerWalletTransactions } from "../../api/api";
import { 
  fetchWalletTransactionsStart, 
  fetchWalletTransactionsSuccess, 
  fetchWalletTransactionsFailure 
} from '../reducer/walletTransactionsReducer';

export const fetchWalletTransactionsData = (token, params = {}) => async (dispatch) => {
  try {
    dispatch(fetchWalletTransactionsStart());
    
    const response = await getSellerWalletTransactions(token, params);
    
    if (response.status === 1) {
      dispatch(fetchWalletTransactionsSuccess(response));
      return { success: true, data: response };
    } else {
      throw new Error(response.message || 'Failed to fetch wallet transactions');
    }
  } catch (error) {
    dispatch(fetchWalletTransactionsFailure(error.message || 'Failed to fetch wallet transactions'));
    return { success: false, error: error.message };
  }
};
