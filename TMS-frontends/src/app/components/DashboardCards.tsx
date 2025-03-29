'use client'

import { useRouter } from 'next/navigation'

export default function DashboardCards() {
    const router = useRouter()

    const cards = [
        { title: 'HR Manager', bgColor: 'bg-blue-500', btnColor: 'bg-blue-700', path: '/hr-manager' },
        { title: 'Payroll', bgColor: 'bg-yellow-500', btnColor: 'bg-yellow-700', path: '/payroll' },
        { title: 'Procurement', bgColor: 'bg-green-500', btnColor: 'bg-green-700', path: '/procurement' },
        { title: 'Lookup', bgColor: 'bg-red-500', btnColor: 'bg-red-700', path: '/lookup' },
        { title: 'TMS', bgColor: 'bg-orange-500', btnColor: 'bg-orange-700', path: '/tms-modules' }, // <-- TMS module route
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`${card.bgColor} text-white p-4 rounded-lg shadow-md`}>
                    <h2 className="text-lg font-semibold">{card.title}</h2>
                    <button
                        className={`mt-2 ${card.btnColor} px-3 py-1.5 rounded text-sm hover:opacity-90 transition-opacity`}
                        onClick={() => router.push(card.path)} // <-- Navigate to the module
                    >
                        View Details
                    </button>
                </div>
            ))}
        </div>
    )
}
