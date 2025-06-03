'use client';

import React from 'react';
import { Car, CarReportFilters } from '../types';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 12, color: '#333' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 3 },
  filterItem: { flexDirection: 'row', marginBottom: 5 },
  filterLabel: { width: '30%', fontSize: 10, fontWeight: 'bold' },
  filterValue: { width: '70%', fontSize: 10 },
  carCard: { border: '1px solid #eee', borderRadius: 3, padding: 10, marginBottom: 10, backgroundColor: '#f9f9f9' },
  carHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, borderBottom: '1px solid #ddd', paddingBottom: 3 },
  carPlate: { fontSize: 11, fontWeight: 'bold' },
  carType: { fontSize: 10, color: '#555' },
  carDetails: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  detailItem: { width: '50%', marginBottom: 5 },
  detailLabel: { fontSize: 9, fontWeight: 'bold', color: '#666' },
  detailValue: { fontSize: 9 },
  footer: { marginTop: 20, fontSize: 8, textAlign: 'center', color: '#666', borderTop: '1px solid #ddd', paddingTop: 10 }
});

// Helper to render all fields for a car, grouped by car type
function renderCarDetails(car: any) {
  // Common fields for all cars
  const commonFields = [
    { label: 'Plate Number', value: car.plateNumber },
    { label: 'Car Type', value: car.carType || car.vehiclesType },
    { label: 'Model', value: car.model },
    { label: 'Manufacture Year', value: car.manufactureYear || car.proYear },
    { label: 'Status', value: car.status },
    { label: 'Fuel Type', value: car.fuelType },
    { label: 'Parking Location', value: car.parkingLocation },
    { label: 'Inspected', value: car.inspected !== undefined ? (car.inspected ? 'Yes' : 'No') : undefined },
    { label: 'Registered Date', value: car.registeredDate ? new Date(car.registeredDate).toLocaleDateString() : car.dateOfIn },
    { label: 'Owner Name', value: car.ownerName },
    { label: 'Owner Phone', value: car.ownerPhone },
    { label: 'Motor Capacity', value: car.motorCapacity || car.cc },
    { label: 'KM Per Liter', value: car.kmPerLiter },
    { label: 'Total KM', value: car.totalKm || car.km },
    { label: 'Color', value: car.color },
    { label: 'Company Name', value: car.companyName },
    { label: 'Frame No', value: car.frameNo },
    { label: 'Motor Number', value: car.motorNumber },
    { label: 'Transmission', value: car.transmission },
    { label: 'Date Of In', value: car.dateOfIn },
    { label: 'Date Of Out', value: car.dateOfOut },
    { label: 'Driver Name', value: car.driverName },
    { label: 'Driver Attributes', value: car.driverAttributes },
    { label: 'Driver Address', value: car.driverAddress },
    { label: 'Load Capacity', value: car.loadCapacity },
    { label: 'Department', value: car.department },
    { label: 'Position', value: car.position },
    { label: 'Created By', value: car.createdBy },
    { label: 'Created At', value: car.createdAt ? new Date(car.createdAt).toLocaleDateString() : undefined },
  ];

  // Rental car specific fields
  const rentalFields = [
    { label: 'Vehicles Used', value: car.vehiclesUsed },
    { label: 'Body Type', value: car.bodyType },
    { label: 'Other Description', value: car.otherDescription },
    { label: 'Radio', value: car.radio },
    { label: 'Antena', value: car.antena },
    { label: 'Krik', value: car.krik },
    { label: 'Krik Manesha', value: car.krikManesha },
    { label: 'Tyer Status', value: car.tyerStatus },
    { label: 'Goma Maficha', value: car.gomaMaficha },
    { label: 'Mefcha', value: car.mefcha },
    { label: 'Reserve Tayer', value: car.reserveTayer },
    { label: 'Goma Get', value: car.gomaGet },
    { label: 'Pinsa', value: car.pinsa },
    { label: 'Kacavite', value: car.kacavite },
    { label: 'Fire Protection', value: car.fireProtection },
    { label: 'Source', value: car.source },
    { label: 'Vehicles Donor Name', value: car.vehiclesDonorName },
    { label: 'Vehicles Photo', value: car.vehiclesPhoto },
    { label: 'Vehicles User Name', value: car.vehiclesUserName },
    { label: 'Libre', value: car.libre },
    { label: 'Data Antoller Nature', value: car.dataAntollerNatue },
  ];

  // Organization car specific fields
  const orgFields = [
    { label: 'Latest Inspection ID', value: car.latestInspectionId },
    { label: 'Inspections', value: car.inspections && Array.isArray(car.inspections) ? car.inspections.map((i: any) =>
      `#${i.id} by ${i.inspectorName} on ${i.inspectionDate ? new Date(i.inspectionDate).toLocaleDateString() : ''} (${i.inspectionStatus})`
    ).join('; ') : undefined },
    { label: 'Driver Name', value: car.driverName },
    { label: 'Driver Attributes', value: car.driverAttributes },
    { label: 'Driver Address', value: car.driverAddress },
    { label: 'Load Capacity', value: car.loadCapacity },
  ];

  // Only show fields that have a value
  let fields = [...commonFields];

  // Add rental fields if it's a rental car
  if ((car.carType || car.vehiclesType) === 'Rental') {
    fields = [...fields, ...rentalFields];
  }
  // Add org fields if it's an organization car
  if ((car.carType || car.vehiclesType) === 'Organization' || car.ownerName) {
    fields = [...fields, ...orgFields];
  }

  // Remove duplicates by label
  const seen = new Set();
  fields = fields.filter(f => {
    if (!f.value || seen.has(f.label)) return false;
    seen.add(f.label);
    return true;
  });

  return (
    <View style={styles.carDetails}>
      {fields.map((f, idx) => (
        <View key={idx} style={styles.detailItem}>
          <Text style={styles.detailLabel}>{f.label}:</Text>
          <Text style={styles.detailValue}>{String(f.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const CarReportPDF = ({ cars, filters }: { cars: Car[], filters: CarReportFilters }) => {
  const filteredCars = Array.isArray(cars) ? cars : [];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>VEHICLE INVENTORY REPORT</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FILTER CRITERIA</Text>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Date Range:</Text>
            <Text style={styles.filterValue}>{filters.start || 'Not specified'} to {filters.end || 'Not specified'}</Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Car Type:</Text>
            <Text style={styles.filterValue}>{filters.carType || 'All'}</Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Model:</Text>
            <Text style={styles.filterValue}>{filters.model || 'All'}</Text>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Status:</Text>
            <Text style={styles.filterValue}>{filters.status || 'All'}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VEHICLE DETAILS ({filteredCars.length} records)</Text>
          {filteredCars.map((car, index) => (
            <View key={index} style={styles.carCard}>
              <View style={styles.carHeader}>
                <Text style={styles.carPlate}>{car.plateNumber}</Text>
                <Text style={styles.carType}>{car.carType || car.vehiclesType}</Text>
              </View>
              {renderCarDetails(car)}
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text>End of Report - Confidential</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function ExportModal({ cars = [], onClose, filters }: { cars: Car[], onClose: () => void, filters: CarReportFilters }) {
  const filteredCars = Array.isArray(cars) ? cars : [];
  const hasData = filteredCars.length > 0;

  // Helper for popup layout (not PDF)
  function renderPopupCarDetails(car: any) {
    // Use the same logic as PDF for fields
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCarDetails(car).props.children.map((item: any, idx: number) => (
          <div key={idx} className="flex">
            <span className="w-40 font-medium text-gray-600">{item.props.children[0].props.children}</span>
            <span>{item.props.children[1].props.children}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Vehicle Report Export</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Filter Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p>{filters.start || 'Not specified'} to {filters.end || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Car Type</p>
                <p>{filters.carType || 'All'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Model</p>
                <p>{filters.model || 'All'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p>{filters.status || 'All'}</p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-700">
                Vehicle Records ({filteredCars.length} found)
              </h4>
            </div>
            {hasData ? (
              <div className="space-y-4">
                {filteredCars.slice(0, 5).map((car, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start border-b pb-2 mb-2">
                      <div>
                        <h5 className="font-bold text-lg">{car.plateNumber}</h5>
                        <p className="text-sm text-gray-600">{car.carType || car.vehiclesType}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        car.status === 'InspectedAndReady' ? 'bg-green-100 text-green-800' :
                        car.status === 'In_transfer' ? 'bg-blue-100 text-blue-800' :
                        car.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {car.status}
                      </span>
                    </div>
                    {renderPopupCarDetails(car)}
                  </div>
                ))}
                {filteredCars.length > 5 && (
                  <div className="text-center text-gray-500 py-4 border-t">
                    + {filteredCars.length - 5} more records will be included in the export
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No vehicles found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filters to find matching vehicles.</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <PDFDownloadLink
            document={<CarReportPDF cars={filteredCars} filters={filters} />}
            fileName={`vehicle_report_${new Date().toISOString().slice(0, 10)}.pdf`}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              hasData ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!hasData}
          >
            {({ loading }) => (
              loading ? 'Preparing PDF...' : 'Download PDF Report'
            )}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}