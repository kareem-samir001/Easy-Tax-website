import { createPortal } from "react-dom";
import { useState } from "react";
import { dataAPI } from "../api";
import toast from "react-hot-toast";

// 📥 دالة مساعدة لتنزيل أي محتوى كملف على جهاز المستخدم
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 🧾 تحويل مصفوفة objects لصيغة CSV سطر عناوين + سطور بيانات
function arrayToCSV(rows) {
    // 🛡️ حماية: لو البيانات مش Array فعلاً (مثلاً غلاف {data: [...]}) بنفكها بأمان
    if (rows && !Array.isArray(rows)) {
        if (Array.isArray(rows.data)) {
            rows = rows.data;
        } else {
            const values = Object.values(rows);
            const foundArray = values.find(v => Array.isArray(v));
            rows = foundArray || [];
        }
    }
    if (!rows || rows.length === 0) return "";
    const headers = Object.keys(rows[0] || {});
    const escapeCell = (val) => {
        if (val === null || val === undefined) return "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };
    const headerLine = headers.map(escapeCell).join(",");
    const dataLines = rows.map(row => headers.map(h => escapeCell(row[h])).join(","));
    return [headerLine, ...dataLines].join("\r\n");
}

function Export({ onClose }) {
    const [isFirstButtonHovered, setIsFirstButtonHovered] = useState(false);
    const [isSecondButtonHovered, setIsSecondButtonHovered] = useState(false);
    const [loadingCSV, setLoadingCSV] = useState(false);
    const [loadingJSON, setLoadingJSON] = useState(false);

    // 🗃️ جلب كل بيانات البيزنس من الـ API مرة واحدة
    const fetchAllData = async () => {
        const [products, sales, expenses, suppliers] = await Promise.all([
            dataAPI.getProducts(),
            dataAPI.getSales(),
            dataAPI.getExpenses(),
            dataAPI.getSuppliers(),
        ]);
        return { products, sales, expenses, suppliers };
    };

    const handleExportCSV = async () => {
        setLoadingCSV(true);
        try {
            const { products, sales, expenses, suppliers } = await fetchAllData();

            // كل قسم بياناته بيتحط تحت عنوان واضح داخل نفس ملف الـ CSV
            const sections = [
                { title: "المنتجات", rows: products },
                { title: "المبيعات", rows: sales },
                { title: "المصروفات", rows: expenses },
                { title: "الموردون", rows: suppliers },
            ];

            const csvParts = sections.map(({ title, rows }) => {
                const csv = arrayToCSV(rows);
                return `${title}\r\n${csv || "لا توجد بيانات"}`;
            });

            // \uFEFF في الأول عشان Excel يقرأ الحروف العربية صح (UTF-8 BOM)
            const fullCSV = "\uFEFF" + csvParts.join("\r\n\r\n");
            const dateStr = new Date().toISOString().split("T")[0];
            downloadFile(fullCSV, `بيانات-البيزنس-${dateStr}.csv`, "text/csv;charset=utf-8;");
            toast.success("تم تحميل الملف بنجاح");
        } catch (error) {
            console.error("CSV export failed:", error);
            console.error("تفاصيل الخطأ:", error.message);
            toast.error("حصل خطأ أثناء تصدير البيانات: " + error.message);
        } finally {
            setLoadingCSV(false);
        }
    };

    const handleExportJSON = async () => {
        setLoadingJSON(true);
        try {
            const data = await fetchAllData();
            const jsonStr = JSON.stringify(data, null, 2);
            const dateStr = new Date().toISOString().split("T")[0];
            downloadFile(jsonStr, `نسخة-احتياطية-${dateStr}.json`, "application/json;charset=utf-8;");
            toast.success("تم تحميل النسخة الاحتياطية بنجاح");
        } catch (error) {
            console.error("JSON export failed:", error);
            toast.error("حصل خطأ أثناء تصدير البيانات");
        } finally {
            setLoadingJSON(false);
        }
    };

    return createPortal(
        <>



            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.7)", // خليناها أغمق شوية لعزل أفضل
                    zIndex: 99999 // رفعنا الـ zIndex لضمان الظهور فوق أي شيء
                }}
            />

            {/* Modal */}
            <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "16px",
                padding: "28px",
                width: "440px",
                maxWidth: "90vw",
                zIndex: 100000,
                direction: "rtl",
                fontFamily: "cairo, sans-serif",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)" // إضافة ظل ليفصل المودال عن الخلفية
            }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <h2 style={{ color: "#f2f2f2", fontSize: "17px", fontWeight: "700", margin: 0 }}>
                        تصدير البيانات
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", color: "#555",
                            fontSize: "20px", cursor: "pointer", lineHeight: 1
                        }}

                    >✕</button>
                </div>
                <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
                    اختر الطريقة التي تناسبك لتحميل بيانات عملك
                </p>

                {/* Excel Option */}
                <div style={{
                    background: "#111", border: "1px solid #2a2a2a",
                    borderRadius: "12px", padding: "16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: "10px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: "#1a3a1a", border: "1px solid #22c97a22",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "20px"
                        }}>📊</div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ color: "#f2f2f2", fontSize: "14px", fontWeight: "700" }}>
                                ملف Excel (CSV)
                            </div>
                            <div style={{ color: "#555", fontSize: "12px", marginTop: "3px" }}>
                                تحميل بياناتك على شكل ملف Excel بصيغة CSV
                            </div>
                        </div>
                    </div>
                    <button
                        disabled={loadingCSV}
                        onClick={handleExportCSV}
                        style={{
                            background: loadingCSV ? "#555" : (isFirstButtonHovered ? "#19985d" : "#28d085"),
                            color: "#000",
                            border: "none", borderRadius: "8px",
                            padding: "8px 14px", cursor: loadingCSV ? "not-allowed" : "pointer",
                            fontFamily: "cairo, sans-serif", fontSize: "12px", fontWeight: "700",
                        }}
                        onMouseEnter={() => setIsFirstButtonHovered(true)}
                        onMouseLeave={() => setIsFirstButtonHovered(false)}>
                        {loadingCSV ? "جاري التحميل..." : "تحميل"}
                    </button>
                </div>

                {/* JSON Option */}
                <div style={{
                    background: "#111", border: "1px solid #2a2a2a",
                    borderRadius: "12px", padding: "16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: "#1a1a2e", border: "1px solid #4ea8f522",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "20px"
                        }}>🗂️</div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ color: "#f2f2f2", fontSize: "14px", fontWeight: "700" }}>
                                نسخة احتياطية كاملة (JSON)
                            </div>
                            <div style={{ color: "#555", fontSize: "12px", marginTop: "3px" }}>
                                تحميل جميع بياناتك على شكل ملف JSON
                            </div>
                        </div>
                    </div>
                    <button
                        disabled={loadingJSON}
                        onClick={handleExportJSON}
                        style={{
                            background: loadingJSON ? "#555" : (isSecondButtonHovered ? "#3573a9" : "#4ea8f5"),
                            color: "#000",
                            border: "none", borderRadius: "8px",
                            padding: "8px 14px", cursor: loadingJSON ? "not-allowed" : "pointer",
                            fontFamily: "cairo, sans-serif", fontSize: "12px", fontWeight: "700",
                        }}
                        onMouseEnter={() => setIsSecondButtonHovered(true)}
                        onMouseLeave={() => setIsSecondButtonHovered(false)}>
                        {loadingJSON ? "جاري التحميل..." : "تحميل"}
                    </button>
                </div>
            </div>
        </>,
        document.body
    )
}

export default Export;