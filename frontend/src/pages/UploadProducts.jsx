import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

export default function UploadProducts() {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [progress, setProgress] = useState(0);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            validateAndSetFile(droppedFile);
        }
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
            setStatus('idle');
            setProgress(0);
        } else {
            alert("Please upload a valid CSV or Excel file.");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Mocked axios request since backend is not fully implemented yet
            // await axios.post('/api/v1/products/bulk-upload', formData, {
            //   onUploadProgress: (progressEvent) => {
            //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            //     setProgress(percentCompleted);
            //   }
            // });

            // Simulate network request
            for (let i = 0; i <= 100; i += 10) {
                setProgress(i);
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            setStatus('success');
            setFile(null);
        } catch (error) {
            setStatus('error');
            console.error(error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('uploadProducts')}</h1>

            <div
                className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
                    } ${status === 'success' ? 'border-green-500 bg-green-50' : ''} ${status === 'error' ? 'border-red-500 bg-red-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {status === 'success' ? (
                    <div className="flex flex-col items-center text-green-600">
                        <CheckCircle className="w-16 h-16 mb-4" />
                        <p className="text-xl font-medium">{t('uploadSuccess')}</p>
                    </div>
                ) : status === 'error' ? (
                    <div className="flex flex-col items-center text-red-600">
                        <AlertCircle className="w-16 h-16 mb-4" />
                        <p className="text-xl font-medium">{t('uploadError')}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-4 px-4 py-2 bg-red-100 rounded-lg font-medium hover:bg-red-200"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 text-blue-800 rounded-lg">
                                    <FileSpreadsheet className="w-5 h-5" />
                                    <span className="font-medium">{file.name}</span>
                                    <span className="text-sm opacity-70">({(file.size / 1024).toFixed(2)} KB)</span>
                                </div>

                                {status === 'idle' && (
                                    <button
                                        onClick={handleUpload}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transform transition active:scale-95"
                                    >
                                        {t('uploadBtn')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-lg text-gray-600 mb-6 max-w-sm">
                                    {t('dragAndDropHere')}
                                </p>
                                <label className="cursor-pointer px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition">
                                    {t('selectFile')}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        )}

                        {status === 'uploading' && (
                            <div className="w-full max-w-md mt-8">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>{t('uploading')}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
