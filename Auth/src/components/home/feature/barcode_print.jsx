import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { ChevronDown, Check, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";

// Placeholder imports for style preview images
import barcodeStyle1 from "../../../assets/type-1.png";
import barcodeStyle2 from "../../../assets/type-2.png";
import qrcodeStyle1 from "../../../assets/type-4.png";
import qrcodeStyle2 from "../../../assets/type-5.png";

const labelStyles = [
    // QR Styles
    {
        id: 1,
        type: 'qr',
        name: 'QR Horizontal',
        layout: 'flex-row items-start items-center space-x-4',
        columns: 2,
        qrSize: 80,
        textAlign: 'text-left',
        preview: qrcodeStyle2
    },
    {
        id: 2,
        type: 'qr',
        name: 'QR Vertical',
        layout: 'flex-col items-center space-y-3',
        columns: 3,
        qrSize: 100,
        textAlign: 'text-center',
        preview: qrcodeStyle1
    },
    // Barcode Styles
    {
        id: 3,
        type: 'barcode',
        name: 'Barcode Type 1',
        layout: 'flex-col items-center space-y-2',
        columns: 3,
        barcodeHeight: 50,
        size: 12,
        textAlign: 'text-center',
        preview: barcodeStyle1
    },
    {
        id: 4,
        type: 'barcode',
        name: 'Barcode Type 2',
        layout: 'flex-col items-center space-y-2',
        columns: 3,
        barcodeHeight: 40,
        size: 12,
        textAlign: 'text-center',
        preview: barcodeStyle2
    }
];


const LabelGenerator = () => {
    const [uploadedData, setUploadedData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [selectedStyle, setSelectedStyle] = useState(labelStyles[0]);
    const [paperType, setPaperType] = useState("label");
    const [qrType, setQrType] = useState("raster");
    const [isOpen, setIsOpen] = useState(false); // Manage dropdown open/close
    const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState("3M Asia Pacific 21314 (A4)"); // Default selected item
    const [selectedBarcode, setSelectedBarcode] = useState("Code 128");

    const items = [
        "3M Asia Pacific 21312 (A4)",
        "3M Asia Pacific 21314 (A4)",
        "3M Asia Pacific 21315 (A4)",
        "3M Asia Pacific 21316 (A4)",
    ]; // List of items for the dropdown

    const barcode = [
        "Code 128",
        "EAN-13",
    ]

    const toggleDropdown = () => setIsOpen(!isOpen); // Toggle dropdown visibility

    const handleSelectItem = (item) => {
        setSelectedItem(item); // Update selected item
        setIsOpen(false); // Close dropdown after selection
    };

    const toggleBarcodeDropdown = () => setIsBarcodeOpen(!isBarcodeOpen);

    const handleSelectBarcode = (item) => {
        setSelectedBarcode(item); // Update selected item
        setIsOpen(false); // Close dropdown after selection
    };

    const validateData = (rawData) => {
        const validData = [];
        const errorMessages = [];
        const seenCodes = new Set();

        rawData.forEach((row, index) => {
            const title = row["Title"]?.trim() || "";
            const description = row["Description"]?.trim() || "";
            const code = row["Code"]?.toString().trim() || "";

            if (!title || !description || !code) {
                errorMessages.push(`Row ${index + 1}: Missing required fields`);
                return;
            }

            if (!/^\d+$/.test(code)) {
                errorMessages.push(`Row ${index + 1}: Code must be numeric`);
                return;
            }

            if (seenCodes.has(code)) {
                errorMessages.push(`Row ${index + 1}: Duplicate Code (${code})`);
                return;
            }
            seenCodes.add(code);

            validData.push({
                id: index + 1,
                name: title,
                category: description,
                url: `https://example.com/product/${code}`,
                code: code,
            });
        });

        return { validData, errorMessages };
    };

    const handleFileDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);

            const { validData, errorMessages } = validateData(parsedData);
            setErrors(errorMessages);
            setUploadedData(validData);
        };

        reader.readAsBinaryString(file);
    }, []);

    const handlePrint = (data) => {
        const pdfContent = document.getElementById("pdf-content");
        const printWindow = window.open("", "_blank");

        // Calculate rows and columns based on A4 dimensions
        const columns = selectedStyle.columns;
        const rowHeight = 297 / (Math.ceil(data.length / columns)); // 297mm A4 height

        printWindow.document.write(`
        <html>
          <head>
            <title>Print Labels</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 5mm;
                width: 210mm;
                min-height: 297mm;
                box-sizing: border-box;
              }
              .print-grid {
                display: grid;
                grid-template-columns: repeat(${columns}, 1fr);
                grid-auto-rows: ${rowHeight}mm;
                gap: 2mm;
                width: 100%;
                height: 100%;
              }
              .label {
                break-inside: avoid;
                page-break-inside: avoid;
                overflow: hidden;
                display: flex;
                ${selectedStyle.type === 'qr' ? 'padding: 2mm;' : 'padding: 1mm;'}
                box-sizing: border-box;
                border: 1px solid #000;
              }
              .qr-code {
                flex-shrink: 0;
              }
              .label-content {
                flex: 1;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <div class="print-grid">
              ${pdfContent.innerHTML}
            </div>
          </body>
        </html>
      `);
        printWindow.document.close();
        printWindow.print();
    };


    return (
        <div className="flex h-screen">

            <div className="w-[45%] h-screen flex print:hidden">
                <div className="overflow-y-auto py-10 px-10" >
                    <div className="max-w-2xl">
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-4">Paper Type</h2>
                            <div className="flex gap-8">
                                {/* Label Sheet */}
                                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setPaperType("label")}>
                                    <div
                                        className={`w-4 h-4 rounded-full border ${paperType === "label" ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                            } flex items-center justify-center`}
                                    >
                                        {paperType === "label" && <Check size={12} className="text-white" />}
                                    </div>
                                    Label Sheet
                                </label>

                                {/* Thermal Label */}
                                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setPaperType("thermal")}>
                                    <div
                                        className={`w-4 h-4 rounded-full border ${paperType === "thermal" ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                            } flex items-center justify-center`}
                                    >
                                        {paperType === "thermal" && <Check size={12} className="text-white" />}
                                    </div>
                                    Thermal Label
                                </label>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                                Use vector graphics for printed labels, PDFs, and other high resolution designs to avoid blurring.
                            </p>
                        </div>

                        <div className="relative text-sm mb-6">
                            {/* Dropdown Button */}
                            <button
                                className="w-full px-4 py-2 text-left border rounded-lg flex items-center justify-between bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
                                onClick={toggleDropdown}
                                aria-haspopup="true"
                                aria-expanded={isOpen ? "true" : "false"}
                            >
                                <span>{selectedItem}</span>
                                <ChevronDown
                                    className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isOpen && (
                                <div
                                    className="absolute left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10 transition-all duration-200"
                                    role="menu"
                                    aria-labelledby="dropdown-button"
                                >
                                    <ul className="max-h-60 overflow-y-auto">
                                        {items.map((item, index) => (
                                            <li
                                                key={index}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-200 transition ease-in-out duration-200"
                                                onClick={() => handleSelectItem(item)}
                                                role="menuitem"
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <LabelDesign selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />

                        {/* <div className="mb-6">
                            <h2 className="text-lg font-medium mb-4">Barcode Type</h2>
                            <div className="flex gap-8 items-baseline">
                                <div className="relative text-sm mb-6">
                                    
                                    <button
                                        className="w-full px-4 py-2 text-left border rounded-lg flex items-center justify-between bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
                                        onClick={toggleBarcodeDropdown}
                                        aria-haspopup="true"
                                        aria-expanded={isBarcodeOpen ? "true" : "false"}
                                    >
                                        <span>{selectedBarcode}</span>
                                        <ChevronDown
                                            className={`h-5 w-5 transition-transform duration-200 ${isBarcodeOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                
                                    {isBarcodeOpen && (
                                        <div
                                            className="absolute left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10 transition-all duration-200"
                                            role="menu"
                                            aria-labelledby="dropdown-button"
                                        >
                                            <ul className="max-h-60 overflow-y-auto">
                                                {barcode.map((item, index) => (
                                                    <li
                                                        key={index}
                                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-200 transition ease-in-out duration-200"
                                                        onClick={() => handleSelectBarcode(item)}
                                                        role="menuitem"
                                                    >
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                              
                                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setQrType("raster")}>
                                    <div
                                        className={`w-4 h-4 rounded-full border ${qrType === "raster" ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                            } flex items-center justify-center`}
                                    >
                                        {qrType === "raster" && <Check size={12} className="text-white" />}
                                    </div>
                                    Raster
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setQrType("vector")}>
                                    <div
                                        className={`w-4 h-4 rounded-full border ${qrType === "vector" ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                            } flex items-center justify-center`}
                                    >
                                        {qrType === "vector" && <Check size={12} className="text-white" />}
                                    </div>
                                    Vector
                                </label>
                            </div>

                        </div> */}

                        <div>
                            <DataTable
                                uploadedData={uploadedData}
                                errors={errors}
                                onFileDrop={handleFileDrop}
                            />
                        </div>
                        <div className="mt-6">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            onClick={handlePrint}>
                            Print
                        </button>
                        </div>
                        
                    </div>
                </div>
            </div>
            <div className="w-[55%] h-screen overflow-y-auto print:hidden">
                <PDFViewer data={uploadedData} selectedStyle={selectedStyle} />
            </div>
        </div>
    );
};

const LabelDesign = ({ selectedStyle, setSelectedStyle }) => (
    <div className="mb-12">
        <label className="block text-lg font-medium mb-2">Label Style</label>
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
            {labelStyles.map((style) => (
                <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`shrink-0 border-2 p-1 rounded-lg w-[200px] h-[120px] flex items-center justify-center ${selectedStyle.id === style.id ? "border-blue-500 border-2" : ""
                        }`}
                >
                    <img
                        src={style.preview}
                        alt={style.name}
                        className="w-full h-full object-contain"
                    />
                </button>
            ))}
        </div>
    </div>
);

const PDFViewer = ({ data, selectedStyle }) => {
    
    // Frontend preview styling (not critical for print)
    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="max-w-[794px] mx-auto">
                {/* Frontend preview container (scaled down) */}
                <div
                    id="pdf-content"
                    className="bg-white shadow-lg mx-auto"
                    style={{
                        // Approx A4 width in pixels for screen
                        minHeight: '1123px', // Approx A4 height in pixels for screen
                        padding: '10px',
                        transformOrigin: 'top left',
                    }}
                >
                    <div
                        className="grid gap-2"
                        style={{
                            gridTemplateColumns: `repeat(${selectedStyle.columns}, 1fr)`,
                            width: '100%',
                        }}
                    >
                        {data.map((product) => (
                            selectedStyle.type === 'qr' ? (
                                <div
                                    key={product.id}
                                    className={`border label flex items-center p-4 ${selectedStyle.layout}`}

                                >
                                    <QRCodeSVG
                                        value={product.code}
                                        size={selectedStyle.qrSize}
                                        className="qr-code border border-gray-200"
                                    />
                                    <div className={`label-content ml-4 ${selectedStyle.textAlign}`}>
                                        <h3 className="text-xs font-bold leading-tight">{product.name}</h3>
                                        <p className="text-xs">{product.category}</p>
                                        <p className="text-xs">SKU: {product.code}</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    key={product.id}
                                    className={`label border flex flex-col items-center p-4 ${selectedStyle.layout}`}
                                // Fixed height for screen preview
                                >

                                    <div className={`${selectedStyle.textAlign} mt-1 w-full`}>
                                        <h3 className="text-xs font-bold">{product.name}</h3>
                                        {selectedStyle.name === "Barcode Type 2" && (
                                            <p className="text-xs">{product.category}</p>
                                        )}
                                    </div>
                                    <Barcode
                                        value={product.code}
                                        height={selectedStyle.barcodeHeight}
                                        width={1.5}
                                        fontSize={selectedStyle.size}
                                        margin={0}
                                    />

                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// Data Table Component
const DataTable = ({ uploadedData, errors, onFileDrop }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFileDrop,
        accept: ".xlsx, .csv",
    });

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Product Data</h2>
                <button className="text-blue-500 font-medium text-sm">Download Template</button>
            </div>

            <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer hover:bg-gray-50"
            >
                <input {...getInputProps()} />
                <p className="text-gray-600 text-sm">
                    {isDragActive ? "Drop Excel/CSV file here" : "Drag & drop spreadsheet or click to upload"}
                </p>
            </div>

            {errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
                    <h3 className="font-medium mb-2">Validation Errors:</h3>
                    <ul className="list-disc ml-5">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-left">Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploadedData.map((item, index) => (
                            <tr key={index} className="border-t text-sm">
                                <td className="px-4 py-2">{item.name}</td>
                                <td className="px-4 py-2">{item.category}</td>
                                <td className="px-4 py-2">{item.code}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LabelGenerator;