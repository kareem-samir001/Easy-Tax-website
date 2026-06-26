import { useState } from 'react';
import Header from '../components/Header';
import { inputStyle, buttonColor } from "./storageStyles";

function Suppliers() {
    const [showModal, setShowModal] = useState(false);
    const [shipments, setShipments] = useState(() => {
        const storedShipments = localStorage.getItem('shipments');
        return storedShipments ? JSON.parse(storedShipments) : [];
    });
    const [editId, setEditId] = useState(null);
    const [hoveredRowId, setHoveredRowId] = useState(null); // لتأثير الـ Hover على الصفوف

    // حالات حقول الإدخال
    const [supplierName, setSupplierName] = useState('');
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [currentCost, setCurrentCost] = useState(0);
    const [date, setDate] = useState('');
    const [unitPrice, setUnitPrice] = useState(0);
    const [notes, setNotes] = useState('');

    const resetForm = () => {
        setSupplierName('');
        setProductName('');
        setQuantity(0);
        setCurrentCost(0);
        setDate('');
        setUnitPrice(0);
        setNotes('');
        setEditId(null);
    };

    const handleSaveShipment = () => {
        if (!supplierName || !productName || !quantity || !currentCost || !date || !unitPrice || !notes) {
            alert("من فضلك ادخل بيانات الشحنة")
            return;
        }

        let updatedShipments;
        if (editId !== null) {
            updatedShipments = shipments.map((ship) =>
                ship.id === editId
                    ? {
                        ...ship,
                        supplier: supplierName,
                        product: productName,
                        quantity: Number(quantity),
                        currentCost: Number(currentCost),
                        date: date,
                        unitPrice: Number(unitPrice),
                        notes: notes
                    }
                    : ship
            );
        } else {
            const newShipment = {
                id: Date.now(),
                supplier: supplierName,
                product: productName,
                quantity: Number(quantity),
                currentCost: Number(currentCost),
                date: date,
                unitPrice: Number(unitPrice),
                notes: notes
            };
            updatedShipments = [...shipments, newShipment];
        }

        setShipments(updatedShipments);
        localStorage.setItem('shipments', JSON.stringify(updatedShipments));
        resetForm();
        setShowModal(false);
    };

    const modifyShipmentData = (shipment) => {
        setSupplierName(shipment.supplier);
        setProductName(shipment.product);
        setQuantity(shipment.quantity);
        setCurrentCost(shipment.currentCost);
        setDate(shipment.date);
        setUnitPrice(shipment.unitPrice);
        setNotes(shipment.notes);
        setEditId(shipment.id);
        setShowModal(true);
    };

    const handleDeleteShipment = (id) => {
        if (window.confirm("هل أنت متأكد من حذف هذه الشحنة؟")) {
            const updatedShipments = shipments.filter(ship => ship.id !== id);
            setShipments(updatedShipments);
            localStorage.setItem('shipments', JSON.stringify(updatedShipments));
        }
    };

    // ====== كائنات الستايل الجديدة (المطابقة لملف تيجارة المرفق) ======
    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        fontSize: '13px',
        marginTop: '8px',
    };

    const thCustomStyle = {
        fontSize: '11px',
        fontWeight: '700',
        color: '#505050', // var(--text3)
        textAlign: 'right',
        padding: '12px 14px',
        borderBottom: '1px solid #ffffff10', // var(--border)
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        backgroundColor: '#111111', // var(--bg1)
    };

    const tdCustomStyle = (isHovered, isLast) => ({
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : '1px solid #ffffff10', // var(--border)
        color: '#f0f0f0', // var(--text1)
        verticalAlign: 'middle',
        backgroundColor: isHovered ? '#191919' : 'transparent', // var(--bg2) عند عمل Hover
        transition: 'background 0.15s ease'
    });

    const actionButtonStyle = {
        backgroundColor: "#1e1e1e",
        color: "#a0a0a0",
        border: "1px solid #ffffff22",
        borderRadius: "6px", // btn-sm border-radius
        padding: "5px 10px", // btn-sm padding
        fontSize: "12px",    // btn-sm font-size
        cursor: "pointer",
        fontFamily: "cairo, sans-serif",
        fontWeight: "600",
        marginLeft: "6px",
        transition: "all 0.15s ease"
    };

    return (
        <>
            <Header title="الموردون" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%', margin: '0 auto' }}>
                <p style={{ color: '#909090', fontFamily: 'cairo, sans-serif' }}>سجل الشحنات والموردون</p>
                <button
                    style={{ backgroundColor: "#22c97a", color: "#000", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "cairo, sans-serif", fontSize: "14px", fontWeight: "700" }}
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    شحنة جديدة +
                </button>
            </div>

            <div style={{ width: '98%', margin: '20px auto', overflowX: 'auto' }}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thCustomStyle}>المورد</th>
                            <th style={thCustomStyle}>المنتج </th>
                            <th style={thCustomStyle}>الكمية</th>
                            <th style={thCustomStyle}>التكلفة الحالية</th>
                            <th style={thCustomStyle}>التاريخ</th>
                            <th style={thCustomStyle}>سعر الوحدة</th>
                            <th style={thCustomStyle}>ملاحظات</th>
                            <th style={{ ...thCustomStyle, textAlign: 'center' }}>العمليات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map((ship, index) => {
                            const isLast = index === shipments.length - 1;
                            const isHovered = hoveredRowId === ship.id;

                            return (
                                <tr
                                    key={ship.id}
                                    onMouseEnter={() => setHoveredRowId(ship.id)}
                                    onMouseLeave={() => setHoveredRowId(null)}
                                >
                                    <td style={tdCustomStyle(isHovered, isLast)}>{ship.supplier}</td>
                                    <td style={tdCustomStyle(isHovered, isLast)}>{ship.product}</td>
                                    <td style={tdCustomStyle(isHovered, isLast)}>{ship.quantity}</td>
                                    <td style={tdCustomStyle(isHovered, isLast)}>{ship.currentCost}</td>
                                    <td style={tdCustomStyle(isHovered, isLast)}>{ship.date}</td>
                                    <td style={tdCustomStyle(isHovered, isLast)}>{ship.unitPrice}</td>
                                    <td style={tdCustomStyle(isHovered, isLast)}>{ship.notes}</td>
                                    <td style={{ ...tdCustomStyle(isHovered, isLast), textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <button
                                                style={actionButtonStyle}
                                                onClick={() => modifyShipmentData(ship)}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = "#000000"; e.target.style.color = "white" }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = "#1e1e1e"; e.target.style.color = "#a0a0a0" }}
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                style={actionButtonStyle}
                                                onClick={() => handleDeleteShipment(ship.id)}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = "#e05555"; e.target.style.color = "white" }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = "#1e1e1e"; e.target.style.color = "#a0a0a0" }}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {shipments.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#888', backgroundColor: 'transparent', fontFamily: 'cairo, sans-serif' }}>لا توجد شحنات مسجلة حالياً.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* المودال الخاص بالإصدارات يظل كما هو دون تغيير */}
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
                            {editId !== null ? 'تعديل الشحنة' : 'إضافة الشحنة'}
                        </h3>

                        {[
                            { label: "المورد", val: supplierName, set: setSupplierName, type: "text", ph: "اسم المورد..." },
                            { label: "المنتج", val: productName, set: setProductName, type: "text", ph: "اسم المنتج..." },
                            { label: "الكمية", val: quantity, set: setQuantity, type: "number", ph: "0" },
                            { label: "التكلفة الحالية", val: currentCost, set: setCurrentCost, type: "number", ph: "0" },
                            { label: "التاريخ", val: date, set: setDate, type: "date", ph: " تاريخ الشحنة" },
                            { label: "سعر الوحدة", val: unitPrice, set: setUnitPrice, type: "number", ph: "10" },
                            { label: "ملاحظات", val: notes, set: setNotes, type: "text", ph: "ملاحظات إضافية" },
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
                            }} onClick={() => { setShowModal(false); resetForm(); }}>إلغاء</button>

                            <button style={{
                                backgroundColor: buttonColor, color: "#000", padding: "10px 24px",
                                border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "cairo, sans-serif", fontWeight: "700"
                            }} onClick={handleSaveShipment}>
                                {editId !== null ? 'حفظ التعديلات' : 'إضافة الشحنة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Suppliers;