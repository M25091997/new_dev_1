import { getSellerCategoriesAuth } from "../../api/api";
import { 
  fetchCategoriesStart, 
  fetchCategoriesSuccess, 
  fetchCategoriesFailure,
  fetchSelectedCategoriesStart,
  fetchSelectedCategoriesSuccess,
  fetchSelectedCategoriesFailure
} from '../reducer/categoriesReducer';

export const fetchCategoriesData = (token, params = {}) => async (dispatch) => {
  try {
    dispatch(fetchCategoriesStart());
    
    const response = await getSellerCategoriesAuth(token, params);
    
    if (response.status === 1) {
      dispatch(fetchCategoriesSuccess(response.data || response));
      return { success: true, data: response.data || response };
    } else {
      throw new Error(response.message || 'Failed to fetch categories');
    }
  } catch (error) {
    dispatch(fetchCategoriesFailure(error.message || 'Failed to fetch categories'));
    return { success: false, error: error.message };
  }
};

export const fetchSelectedCategoriesData = (token, params = {}) => async (dispatch) => {
  try {
    dispatch(fetchSelectedCategoriesStart());
    
    const response = await getSellerCategoriesAuth(token, params);
    
    if (response.status === 1) {
      dispatch(fetchSelectedCategoriesSuccess(response.data || response));
      return { success: true, data: response.data || response };
    } else {
      throw new Error(response.message || 'Failed to fetch selected categories');
    }
  } catch (error) {
    dispatch(fetchSelectedCategoriesFailure(error.message || 'Failed to fetch selected categories'));
    return { success: false, error: error.message };
  }
};
