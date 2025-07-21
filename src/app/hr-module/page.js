// src/app/hr/page.js
"use client";

import { useRouter } from "next/navigation";

export default function HRModule() {
    const router = useRouter();

    return (
        <div className="p-4">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="mr-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold">HR Management Module</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">HR Functions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <h3 className="font-medium">Employee Management</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage all employee records</p>
                    </div>
                    <div className="border p-4 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <h3 className="font-medium">Recruitment</h3>
                        <p className="text-sm text-gray-600 mt-1">Post jobs and track applicants</p>
                    </div>
                    <div className="border p-4 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <h3 className="font-medium">Performance Reviews</h3>
                        <p className="text-sm text-gray-600 mt-1">Conduct employee evaluations</p>
                    </div>
                    <div className="border p-4 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <h3 className="font-medium">Training & Development</h3>
                        <p className="text-sm text-gray-600 mt-1">Organize employee training</p>
                    </div>
                </div>
            </div>
        </div>
    );
}