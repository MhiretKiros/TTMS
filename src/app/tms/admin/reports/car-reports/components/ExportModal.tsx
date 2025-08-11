'use client';

import insaprofile from '../images/insaprofile.png';
import React, { useState } from 'react';
import { Car, CarReportFilters } from '../types';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';

// Updated styles with increased margin between header and body
const styles = StyleSheet.create({
  page: {
    paddingTop: 100,  // Increased from 80 to give more space
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    position: 'relative',
    fontSize: 10,
    lineHeight: 1.4
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 15,  // Increased padding
    marginBottom: 20,   // Increased margin
    flexDirection: 'column'
  },
  headerTable: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid'
  },
  headerTableCell: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    //verticalAlign: 'top' as 'top'
  },
  headerLeft: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  headerRight: {
    width: '20%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    textAlign: 'right'
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3
  },
  headerSubtitle: {
    fontSize: 10,
    marginBottom: 3
  },
  headerInfo: {
    fontSize: 8,
    marginBottom: 3
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 10,
    flexDirection: 'column',
    fontSize: 8,
    textAlign: 'center'
  },
  section: {
    marginBottom: 25,
    breakInside: 'avoid'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    paddingBottom: 3
  },
  filterItem: {
    flexDirection: 'row',
    marginBottom: 8
  },
  filterLabel: {
    width: 100,
    fontWeight: 'bold'
  },
  filterValue: {
    flex: 1
  },
  carCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'solid',
    borderRadius: 3,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9'
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    paddingBottom: 3
  },
  carPlate: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  carType: {
    fontSize: 10,
    color: '#555'
  },
  carDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5
  },
  detailItem: {
    width: '50%',
    marginBottom: 5
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666'
  },
  detailValue: {
    fontSize: 9
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center'
  }
});

interface CarDetailField {
  label: string;
  value: string | number | boolean | undefined;
}

const getCarDetails = (car: Car): CarDetailField[] => {
  const commonFields: CarDetailField[] = [
    { label: 'Plate Number', value: car.plateNumber },
    { label: 'Car Type', value: car.carType },
    { label: 'Model', value: car.model },
    { label: 'Manufacture Year', value: car.manufactureYear },
    { label: 'Status', value: car.status },
    { label: 'Fuel Type', value: car.fuelType },
    { label: 'Parking Location', value: car.parkingLocation },
    { label: 'Inspected', value: car.inspected !== undefined ? (car.inspected ? 'Yes' : 'No') : undefined },
    { 
      label: 'Registered Date', 
      value: car.registeredDate 
        ? new Date(car.registeredDate).toLocaleDateString() 
        : car.dateOfIn 
          ? new Date(car.dateOfIn).toLocaleDateString() 
          : undefined 
    },
    { label: 'Owner Name', value: car.ownerName },
    { label: 'Owner Phone', value: car.ownerPhone },
    { label: 'Motor Capacity', value: car.motorCapacity || (car as any).cc },
    { label: 'KM Per Liter', value: car.kmPerLiter },
    { label: 'Total KM', value: car.totalKm || (car as any).km },
    { label: 'Color', value: car.color },
    { label: 'Company Name', value: car.companyName },
    { label: 'Frame No', value: car.frameNo },
    { label: 'Motor Number', value: car.motorNumber },
    { label: 'Transmission', value: car.transmission },
    { label: 'Date Of In', value: car.dateOfIn ? new Date(car.dateOfIn).toLocaleDateString() : undefined },
    { label: 'Date Of Out', value: car.dateOfOut ? new Date(car.dateOfOut).toLocaleDateString() : undefined },
    { label: 'Driver Name', value: car.driverName },
    { label: 'Driver Attributes', value: car.driverAttributes },
    { label: 'Driver Address', value: car.driverAddress },
    { label: 'Load Capacity', value: car.loadCapacity },
    { label: 'Department', value: (car as any).department },
    { label: 'Position', value: (car as any).position },
    { label: 'Created By', value: car.createdBy },
    { label: 'Created At', value: car.createdAt ? new Date(car.createdAt).toLocaleDateString() : undefined },
  ];

  const rentalFields: CarDetailField[] = car.carType === 'Rental' ? [
    { label: 'Vehicles Used', value: (car as any).vehiclesUsed },
    { label: 'Body Type', value: (car as any).bodyType },
    { label: 'Other Description', value: (car as any).otherDescription },
    { label: 'Radio', value: (car as any).radio },
    { label: 'Antena', value: (car as any).antena },
    { label: 'Krik', value: (car as any).krik },
    { label: 'Krik Manesha', value: (car as any).krikManesha },
    { label: 'Tyer Status', value: (car as any).tyerStatus },
    { label: 'Goma Maficha', value: (car as any).gomaMaficha },
    { label: 'Mefcha', value: (car as any).mefcha },
    { label: 'Reserve Tayer', value: (car as any).reserveTayer },
    { label: 'Goma Get', value: (car as any).gomaGet },
    { label: 'Pinsa', value: (car as any).pinsa },
    { label: 'Kacavite', value: (car as any).kacavite },
    { label: 'Fire Protection', value: (car as any).fireProtection },
    { label: 'Source', value: (car as any).source },
    { label: 'Vehicles Donor Name', value: (car as any).vehiclesDonorName },
    { label: 'Vehicles Photo', value: (car as any).vehiclesPhoto },
    { label: 'Vehicles User Name', value: (car as any).vehiclesUserName },
    { label: 'Libre', value: (car as any).libre },
    { label: 'Data Antoller Nature', value: (car as any).dataAntollerNatue },
  ] : [];

  const orgFields: CarDetailField[] = car.carType === 'Organization' || car.ownerName ? [
    { label: 'Latest Inspection ID', value: (car as any).latestInspectionId },
    { 
      label: 'Inspections', 
      value: (car as any).inspections && Array.isArray((car as any).inspections) 
        ? (car as any).inspections.map((i: any) =>
            `#${i.id} by ${i.inspectorName} on ${i.inspectionDate ? new Date(i.inspectionDate).toLocaleDateString() : ''} (${i.inspectionStatus})`
          ).join('; ') 
        : undefined 
    },
  ] : [];

  const allFields = [...commonFields, ...rentalFields, ...orgFields];
  
  const seen = new Set();
  return allFields.filter(field => {
    if (field.value === undefined || field.value === null || seen.has(field.label)) {
      return false;
    }
    seen.add(field.label);
    return true;
  });
};

const renderCarDetails = (car: Car) => {
  const fields = getCarDetails(car);
  
  return (
    <View style={styles.carDetails}>
      {fields.map((field, idx) => (
        <View key={`${car.id}-${idx}`} style={styles.detailItem}>
          <Text style={styles.detailLabel}>{field.label}:</Text>
          <Text style={styles.detailValue}>{String(field.value)}</Text>
        </View>
      ))}
    </View>
  );
};

const CarReportPDF = ({ cars, filters }: { cars: Car[]; filters: CarReportFilters }) => {
  const filteredCars = Array.isArray(cars) ? cars : [];
  const currentDate = new Date().toLocaleDateString();
  const letterNumber = `INS/REP/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`;

  // Split cars into pages (5 cars per page)
  const pages = [];
  for (let i = 0; i < filteredCars.length; i += 5) {
    pages.push(filteredCars.slice(i, i + 5));
  }

  return (
    <Document>
      {pages.map((pageCars, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap>
          {/* Header - appears on every page */}
          <View fixed style={styles.header}>
            <View style={styles.headerTable}>
              <View style={[styles.headerTableCell, styles.headerLeft]}>
                <Image src={insaprofile.src} style={{ width: 50, height: 50 }} />
              </View>
              
              <View style={[styles.headerTableCell, styles.headerCenter]}>
                <Text style={styles.headerTitle}>
                  INFORMATION NETWORK SECURITY ADMINISTRATION
                </Text>
                
                <Text style={styles.headerSubtitle}>
                  VEHICLE INVENTORY REPORT
                </Text>
              </View>
              
              <View style={[styles.headerTableCell, styles.headerRight]}>
                <Text style={styles.headerInfo}>Letter No: {letterNumber}</Text>
                <Text style={styles.headerInfo}>Date: {currentDate}</Text>
                <Text style={styles.headerInfo}>Page: {pageIndex + 1} of {pages.length}</Text>
              </View>
            </View>
          </View>

          {/* Only show filter criteria on first page */}
          {pageIndex === 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FILTER CRITERIA</Text>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Date Range:</Text>
                <Text style={styles.filterValue}>
                  {filters.start ? new Date(filters.start).toLocaleDateString() : 'Not specified'} to{' '}
                  {filters.end ? new Date(filters.end).toLocaleDateString() : 'Not specified'}
                </Text>
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
          )}

          {/* Vehicle details */}
          <View style={styles.section}>
            {pageIndex === 0 && (
              <Text style={styles.sectionTitle}>
                VEHICLE DETAILS ({filteredCars.length} records)
              </Text>
            )}
            {pageCars.map((car, index) => (
              <View key={`${car.id}-${index}`} style={styles.carCard}>
                <View style={styles.carHeader}>
                  <Text style={styles.carPlate}>{car.plateNumber}</Text>
                  <Text style={styles.carType}>{car.carType}</Text>
                </View>
                {renderCarDetails(car)}
              </View>
            ))}
          </View>
          
          {/* Footer - appears on every page */}
          <View fixed style={styles.footer}>
            <Text>INFORMATION NETWORK SECURITY ADMINISTRATION</Text>
            <Text>Make sure whether the letter is correct or not before use</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

interface ExportModalProps {
  cars?: Car[];
  onClose: () => void;
  filters: CarReportFilters;
}

export default function ExportModal({ cars = [], onClose, filters }: ExportModalProps) {
  const filteredCars = Array.isArray(cars) ? cars : [];
  const hasData = filteredCars.length > 0;

  const renderPopupCarDetails = (car: Car) => {
    const fields = getCarDetails(car);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, idx) => (
          <div key={`${car.id}-${idx}`} className="flex">
            <span className="w-40 font-medium text-gray-600">{field.label}</span>
            <span>{String(field.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Vehicle Report Export</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
            >
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
                <p>
                  {filters.start ? new Date(filters.start).toLocaleDateString() : 'Not specified'} to{' '}
                  {filters.end ? new Date(filters.end).toLocaleDateString() : 'Not specified'}
                </p>
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
                  <div key={`${car.id}-${index}`} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start border-b pb-2 mb-2">
                      <div>
                        <h5 className="font-bold text-lg">{car.plateNumber}</h5>
                        <p className="text-sm text-gray-600">{car.carType}</p>
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
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          {hasData ? (
          <PDFDownloadLink
            document={<CarReportPDF cars={filteredCars} filters={filters} />}
            fileName={`vehicle_report_${new Date().toISOString().slice(0, 10)}.pdf`}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {({ loading }) => (
              loading ? 'Preparing PDF...' : 'Download PDF Report'
            )}
          </PDFDownloadLink>
        ) : (
          <button
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
            disabled
          >
            Download PDF Report
          </button>
        )}
        </div>
      </div>
    </div>
  );
}