'use client'

import { useState } from 'react'

const employees = [
    { name: 'John Doe', department: 'Engineering', position: 'Software Engineer', salary: '$100,000' },
    { name: 'Jane Smith', department: 'Management', position: 'Project Manager', salary: '$120,000' },
    { name: 'Bob Johnson', department: 'Economics', position: 'Economist', salary: '$90,000' },
    { name: 'Alice Brown', department: 'Marketing', position: 'Marketing Specialist', salary: '$80,000' },
    { name: 'Charlie Davis', department: 'Others', position: 'Administrative Assistant', salary: '$50,000' },
]

export default function EmployeeTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 3

    const totalPages = Math.ceil(employees.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const visibleEmployees = employees.slice(startIndex, startIndex + rowsPerPage)

    return (
        <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Employee Table</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Department
                            </th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Salary
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleEmployees.map((employee, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b border-gray-200">{employee.name}</td>
                                <td className="py-2 px-4 border-b border-gray-200">{employee.department}</td>
                                <td className="py-2 px-4 border-b border-gray-200">{employee.position}</td>
                                <td className="py-2 px-4 border-b border-gray-200">{employee.salary}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <button
                    className={`bg-gray-800 text-white px-4 py-2 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className={`bg-gray-800 text-white px-4 py-2 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    )
}