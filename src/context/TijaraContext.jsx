import { createContext, useReducer, useEffect, useContext } from "react";
import { dataAPI } from "../api";
import toast from "react-hot-toast";

// eslint-disable-next-line react-refresh/only-export-components
export const TijaraContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useTijara = () => useContext(TijaraContext);

const initialState = {
  products: [],
  sales: [],
  expenses: [],
  suppliers: [],
  isLoading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      // Handle potential Xano pagination format where the array is inside an 'items' property
      const getArray = (data) =>
        Array.isArray(data) ? data : data?.items || [];

      return {
        ...state,
        products: getArray(action.payload.products),
        sales: getArray(action.payload.sales),
        expenses: getArray(action.payload.expenses),
        suppliers: getArray(action.payload.suppliers),
        isLoading: false,
        error: null,
      };
    case "FETCH_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.payload] };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p,
        ),
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    case "ADD_SALE":
      return { ...state, sales: [...state.sales, action.payload] };
    case "ADD_EXPENSE":
      return { ...state, expenses: [...state.expenses, action.payload] };
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    case "ADD_SUPPLIER":
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case "UPDATE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s,
        ),
      };
    case "DELETE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.filter((s) => s.id !== action.payload),
      };
    default:
      return state;
  }
}

export const TijaraProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = async () => {
    dispatch({ type: "FETCH_INIT" });
    try {
      const [productsRes, salesRes, expensesRes, suppliersRes] =
        await Promise.all([
          dataAPI.getProducts(),
          dataAPI.getSales(),
          dataAPI.getExpenses(),
          dataAPI.getSuppliers(),
        ]);

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          products: productsRes,
          sales: salesRes,
          expenses: expensesRes,
          suppliers: suppliersRes,
        },
      });
    } catch (err) {
      dispatch({
        type: "FETCH_FAILURE",
        payload: err.message || "Failed to fetch data",
      });
      toast.error("فشل في تحميل البيانات من الخادم");
    }
  };

  useEffect(() => {
    // Only fetch if we have an auth token
    if (localStorage.getItem("authToken")) {
      fetchData();
    } else {
      // If no token, maybe we shouldn't fetch. We'll set loading to false.
      dispatch({ type: "FETCH_FAILURE", payload: "Not authenticated" });
    }
  }, []);

  const addProduct = async (productData) => {
    try {
      const newProduct = await dataAPI.addProduct(productData);
      if (!newProduct || typeof newProduct !== "object" || !newProduct.id) {
        throw new Error(
          "فشل الخادم في إرجاع بيانات المنتج. تأكد من إعداد Xano (Add Record & Response) بشكل صحيح.",
        );
      }
      dispatch({ type: "ADD_PRODUCT", payload: newProduct });
      toast.success("تمت إضافة المنتج بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في إضافة المنتج");
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      await dataAPI.updateProduct(id, updates);
      dispatch({ type: "UPDATE_PRODUCT", payload: { id, updates } });
      toast.success("تم تحديث المنتج بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في تحديث المنتج");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await dataAPI.deleteProduct(id);
      dispatch({ type: "DELETE_PRODUCT", payload: id });
      toast.success("تم حذف المنتج بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في حذف المنتج");
    }
  };

  const addSale = async (saleData, productId, updatedQuantity) => {
    try {
      // First update the product quantity
      await dataAPI.updateProduct(productId, { quantity: updatedQuantity });
      dispatch({
        type: "UPDATE_PRODUCT",
        payload: { id: productId, updates: { quantity: updatedQuantity } },
      });

      // Then record the sale
      const newSale = await dataAPI.addSale(saleData);
      if (!newSale || typeof newSale !== "object" || !newSale.id) {
        throw new Error(
          "فشل الخادم في إرجاع المبيعات. تأكد من إعداد Xano بشكل صحيح.",
        );
      }
      dispatch({ type: "ADD_SALE", payload: newSale });
    } catch (err) {
      console.error(err);
      throw err; // Let caller handle toast or do it here
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const newExpense = await dataAPI.addExpense(expenseData);
      if (!newExpense || typeof newExpense !== "object" || !newExpense.id) {
        throw new Error(
          "فشل الخادم في إرجاع بيانات المصروف. تأكد من إعداد Xano بشكل صحيح.",
        );
      }
      dispatch({ type: "ADD_EXPENSE", payload: newExpense });
      toast.success("تمت إضافة المصروف بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في إضافة المصروف");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await dataAPI.deleteExpense(id);
      dispatch({ type: "DELETE_EXPENSE", payload: id });
      toast.success("تم حذف المصروف بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في حذف المصروف");
    }
  };

  const addSupplier = async (supplierData) => {
    try {
      const newSupplier = await dataAPI.addSupplier(supplierData);
      if (!newSupplier || typeof newSupplier !== "object" || !newSupplier.id) {
        throw new Error(
          "فشل الخادم في إرجاع بيانات المورد. تأكد من إعداد Xano بشكل صحيح.",
        );
      }
      dispatch({ type: "ADD_SUPPLIER", payload: newSupplier });
      toast.success("تمت إضافة الشحنة بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في إضافة الشحنة");
    }
  };

  const updateSupplier = async (id, updates) => {
    try {
      await dataAPI.updateSupplier(id, updates);
      dispatch({ type: "UPDATE_SUPPLIER", payload: { id, updates } });
      toast.success("تم تحديث الشحنة بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في تحديث الشحنة");
    }
  };

  const deleteSupplier = async (id) => {
    try {
      await dataAPI.deleteSupplier(id);
      dispatch({ type: "DELETE_SUPPLIER", payload: id });
      toast.success("تم حذف الشحنة بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في حذف الشحنة");
    }
  };

  return (
    <TijaraContext.Provider
      value={{
        state,
        dispatch,
        fetchData,
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        addExpense,
        deleteExpense,
        addSupplier,
        updateSupplier,
        deleteSupplier,
      }}
    >
      {children}
    </TijaraContext.Provider>
  );
};
