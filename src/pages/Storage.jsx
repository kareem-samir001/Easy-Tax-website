import { useState } from "react";
import StatCard from "../components/StatCard";
import Header from "../components/Header";
import { useTijara } from "../context/TijaraContext";
import { thStyles, generalStyles, inputStyle, buttonColor } from "./storageStyles.js";


function Storage() {
    const { state, addProduct: contextAddProduct, updateProduct: contextUpdateProduct, deleteProduct: contextDeleteProduct } = useTijara();
    const { products, isLoading, error } = state;

    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [buyingPrice, setBuyingPrice] = useState('')
    const [sellingPrice, setSellingPrice] = useState('')
    const [unit, setUnit] = useState('')
    const [minimumQuantity, setMinimumQuantity] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState(null)

    // Function to add or update a product via Context
    const handleSaveProduct = async () => {
        if (!name || quantity === '' || buyingPrice === '' || sellingPrice === '' || !unit || minimumQuantity === '') {
            alert('يرجى ملء جميع الحقول')
            return
        }

        const productData = {
            name, 
            quantity: Number(quantity),
            buyingPrice: Number(buyingPrice),
            sellingPrice: Number(sellingPrice),
            minimumQuantity: Number(minimumQuantity),
            status: Number(quantity) < Number(minimumQuantity) ? 'ناقص' : 'متاح',
            unit
        }

        if (editId !== null) {
            await contextUpdateProduct(editId, productData)
            setEditId(null)
        } else {
            await contextAddProduct(productData)
        }

        setName(''); setQuantity(''); setBuyingPrice('');
        setSellingPrice(''); setUnit(''); setMinimumQuantity('');
        setShowModal(false);
    }

    const totalValue = products.reduce((t, p) => t + ((p.quantity || 0) * (p.buyingPrice || 0)), 0)
    const lowProducts = products.filter(p => (p.quantity || 0) < (p.minimumQuantity || 0)).length

    const deleteItem = async (id) => {
        await contextDeleteProduct(id)
    }

    const modifyItem = (product) => {
        setName(product.name || '');
        setQuantity(product.quantity || '');
        setBuyingPrice(product.buyingPrice || '');
        setSellingPrice(product.sellingPrice || '');
        setUnit(product.unit || '');
        setMinimumQuantity(product.minimumQuantity || '');
        setEditId(product.id)
        setShowModal(true)
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
                <div style={{ color: '#22c97a', fontSize: '24px', fontFamily: 'cairo, sans-serif' }}>جاري التحميل...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
                <div style={{ color: '#ef4444', fontSize: '20px', fontFamily: 'cairo, sans-serif' }}>حدث خطأ: {error}</div>
            </div>
        );
    }

    return (
        <>
            <Header title="المخزن" buttonText="+ إضافة منتج" onButtonClick={() => { setEditId(null); setShowModal(true) }} />

            {/* Stats */}
            <div style={{ display: "flex", gap: "16px", width: "94%", margin: "20px auto" }}>
                <StatCard title="إجمالي المنتجات" value={products.length} />
                <StatCard title="إجمالي قيمة المخزن" value={totalValue.toLocaleString()} unit="جنيه" />
                <StatCard
                    title="منتجات قليلة"
                    value={lowProducts}
                    valueColor={lowProducts > 0 ? '#f05c5c' : '#fff'}
                    accent={lowProducts > 0 ? 'red' : 'green'}
                />
            </div>

            {/* Table */}
            <div style={{ padding: "0 28px" }}>
                <div style={{ maxHeight: "560px", overflowY: "auto", borderRadius: "12px", margin: "0 auto", width: "97%" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#0f0f0f", borderRadius: "12px", overflow: "hidden" }}>
                    <thead>
                        <tr>
                            {["اسم المنتج", "الكمية", "سعر الشراء", "سعر البيع", "الوحدة", "الحد الأدنى", "الإجمالي", "الحالة"].map(h => (
                                <th key={h} style={{ ...thStyles, position: "sticky", top: 0, zIndex: 1 }}>{h}</th>
                            ))}
                            <th style={{ ...thStyles, position: "sticky", top: 0, zIndex: 1 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: "center", padding: "60px", color: "#5a5a5a", fontFamily: "cairo, sans-serif", fontSize: "18px" }}>
                                    لا توجد منتجات بعد — أضف منتجك الأول!
                                </td>
                            </tr>
                        ) : products.map((p, i) => (
                            <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#0f0f0f" : "#111" }}>
                                <td style={generalStyles}>{p.name}</td>
                                <td style={generalStyles}>{p.quantity} {p.unit}</td>
                                <td style={generalStyles}>{p.buyingPrice}ج / {p.unit}</td>
                                <td style={generalStyles}>{p.sellingPrice}ج / {p.unit}</td>
                                <td style={generalStyles}>{p.unit}</td>
                                <td style={generalStyles}>{p.minimumQuantity} {p.unit}</td>
                                <td style={generalStyles}>{((p.quantity || 0) * (p.buyingPrice || 0)).toLocaleString()}ج</td>
                                <td style={generalStyles}>
                                    <span style={{
                                        backgroundColor: (p.quantity || 0) < (p.minimumQuantity || 0) ? '#3a1a1a' : '#0f2a1a',
                                        color: (p.quantity || 0) < (p.minimumQuantity || 0) ? '#ff6b6b' : '#22c97a',
                                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px"
                                    }}>{(p.quantity || 0) < (p.minimumQuantity || 0) ? 'ناقص' : 'متاح'}</span>
                                </td>
                                <td style={generalStyles}>
                                    <button style={{
                                        backgroundColor: "#1e1e1e", color: "#a0a0a0",
                                        border: "1px solid #ffffff22", borderRadius: "8px",
                                        padding: "8px 16px", cursor: "pointer",
                                        fontFamily: "cairo, sans-serif", fontSize: "13px", fontWeight: "600", marginLeft: "8px"
                                    }} onClick={() => modifyItem(p)}
                                        onMouseEnter={(e) => { e.target.style.backgroundColor = "#000000"; e.target.style.color = "white" }}
                                        onMouseLeave={(e) => { e.target.style.backgroundColor = "#1e1e1e"; e.target.style.color = "#a0a0a0" }}>
                                        تعديل
                                    </button>
                                    <button style={{
                                        backgroundColor: "#1e1e1e", color: "#a0a0a0",
                                        border: "1px solid #ffffff22", borderRadius: "8px",
                                        padding: "8px 16px", cursor: "pointer",
                                        fontFamily: "cairo, sans-serif", fontSize: "13px", fontWeight: "600"
                                    }} onClick={() => deleteItem(p.id)}
                                        onMouseEnter={(e) => { e.target.style.backgroundColor = "#e05555"; e.target.style.color = "white" }}
                                        onMouseLeave={(e) => { e.target.style.backgroundColor = "#1e1e1e"; e.target.style.color = "#a0a0a0" }}>
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        borderRadius: '12px', backgroundColor: "#111", padding: "28px",
                        width: "460px", maxWidth: "90vw", border: "1px solid #222",
                        display: "grid", gap: "14px", gridTemplateColumns: "1fr 1fr"
                    }}>
                        <h3 style={{ color: "white", gridColumn: "1 / -1", textAlign: "right", margin: 0, fontFamily: "cairo, sans-serif" }}>
                            {editId !== null ? 'تعديل منتج' : 'إضافة منتج جديد'}
                        </h3>

                        {[
                            { label: "اسم المنتج", val: name, set: setName, type: "text", ph: "مثال: أرز، سكر..." },
                            { label: "الكمية الحالية", val: quantity, set: setQuantity, type: "number", ph: "0" },
                            { label: "سعر الشراء (جنيه)", val: buyingPrice, set: setBuyingPrice, type: "number", ph: "0" },
                            { label: "سعر البيع (جنيه)", val: sellingPrice, set: setSellingPrice, type: "number", ph: "0" },
                            { label: "الوحدة", val: unit, set: setUnit, type: "text", ph: "كيلو، قطعة..." },
                            { label: "الحد الأدنى للمخزن", val: minimumQuantity, set: setMinimumQuantity, type: "number", ph: "10" },
                        ].map(({ label, val, set, type, ph }) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ color: "#888", fontSize: "11px", textAlign: "right", fontFamily: "cairo, sans-serif" }}>{label}</label>
                                <input type={type} style={inputStyle} placeholder={ph} value={val} onChange={(e) => set(e.target.value)} />
                            </div>
                        ))}

                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                            <button style={{
                                backgroundColor: "#1e1e1e", color: "#aaa", padding: "10px 20px",
                                border: "1px solid #333", borderRadius: "8px", cursor: "pointer", fontFamily: "cairo, sans-serif"
                            }} onClick={() => { setShowModal(false); setEditId(null) }}>إلغاء</button>
                            <button style={{
                                backgroundColor: buttonColor, color: "#000", padding: "10px 24px",
                                border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "cairo, sans-serif", fontWeight: "700"
                            }} onClick={handleSaveProduct}>
                                {editId !== null ? 'حفظ التعديلات' : 'إضافة المنتج'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Storage