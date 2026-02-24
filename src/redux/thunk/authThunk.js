import { loginSeller } from "../../api/api";
import { loginStart, loginSuccess, loginFailure } from '../reducer/userReducer';

export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    
    const response = await loginSeller(credentials);
    
    if (response.status === 1 && response.data) {
      dispatch(loginSuccess({
        user: response.data.user,
        access_token: response.data.access_token
      }));
      
      return { success: true, data: response.data };
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error) {
    dispatch(loginFailure(error.message || 'Login failed'));
    return { success: false, error: error.message };
  }
};

export const logoutUser = () => (dispatch) => {
  // Clear localStorage
  localStorage.removeItem('sellerToken');
  localStorage.removeItem('sellerData');
  
  // Dispatch logout action
  dispatch({ type: 'user/logout' });
};
