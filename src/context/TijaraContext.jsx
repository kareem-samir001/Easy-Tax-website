import { createContext, useReducer, useEffect, useContext } from 'react';
import { dataAPI } from '../api';
import toast from 'react-hot-toast';

// eslint-disable-next-line react-refresh/only-export-components
export const TijaraContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useTijara = () => useContext(TijaraContext);

const initialState = {
  products: [],
  sales: [],
  expenses: [],
  isLoading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products || [],
        sales: action.payload.sales || [],
        expenses: action.payload.expenses || [],
        isLoading: false,
        error: null,
      };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    default:
      return state;
  }
}

export const TijaraProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = async () => {
    dispatch({ type: 'FETCH_INIT' });
    try {
      const [productsRes, salesRes, expensesRes] = await Promise.all([
        dataAPI.getProducts(),
        dataAPI.getSales(),
        dataAPI.getExpenses(),
      ]);
      
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          products: productsRes,
          sales: salesRes,
          expenses: expensesRes,
        },
      });
    } catch (err) {
      dispatch({ type: 'FETCH_FAILURE', payload: err.message || 'Failed to fetch data' });
      toast.error('فشل في تحميل البيانات من الخادم');
    }
  };

  useEffect(() => {
    // Only fetch if we have an auth token
    if (localStorage.getItem('authToken')) {
      fetchData();
    } else {
      // If no token, maybe we shouldn't fetch. We'll set loading to false.
      dispatch({ type: 'FETCH_FAILURE', payload: 'Not authenticated' });
    }
  }, []);

  const addProduct = async (productData) => {
    try {
      const newProduct = await dataAPI.addProduct(productData);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      toast.success('تمت إضافة المنتج بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('خطأ في إضافة المنتج');
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      await dataAPI.updateProduct(id, updates);
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } });
      toast.success('تم تحديث المنتج بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('خطأ في تحديث المنتج');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await dataAPI.deleteProduct(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      toast.success('تم حذف المنتج بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('خطأ في حذف المنتج');
    }
  };

  const addSale = async (saleData, productId, updatedQuantity) => {
    try {
      // First update the product quantity
      await dataAPI.updateProduct(productId, { quantity: updatedQuantity });
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, updates: { quantity: updatedQuantity } } });

      // Then record the sale
      const newSale = await dataAPI.addSale(saleData);
      dispatch({ type: 'ADD_SALE', payload: newSale });
      
    } catch (err) {
      console.error(err);
      throw err; // Let caller handle toast or do it here
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const newExpense = await dataAPI.addExpense(expenseData);
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      toast.success('تمت إضافة المصروف بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('خطأ في إضافة المصروف');
    }
  };

  const deleteExpense = async (id) => {
    try {
      await dataAPI.deleteExpense(id);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      toast.success('تم حذف المصروف بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('خطأ في حذف المصروف');
    }
  };

  return (
    <TijaraContext.Provider value={{
      state,
      dispatch,
      fetchData,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      addExpense,
      deleteExpense
    }}>
      {children}
    </TijaraContext.Provider>
  );
};
