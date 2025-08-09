// app/tms-modules/admin/vehicle-map-view/page.tsx
"use client";

export default function VehicleMapView() {
  return (
    <div className="w-full h-[calc(100vh-64px)]"> {/* Adjust 64px if your header height differs */}
      <iframe
        src="http://172.20.137.176:3000/admin"
        className="w-full h-full border-0"
        title="Vehicle Map View"
      />
    </div>
  );
}
