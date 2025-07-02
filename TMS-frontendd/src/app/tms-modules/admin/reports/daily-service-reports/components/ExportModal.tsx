'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { DailyService, DailyServiceReportFilters } from '../types';
import insaprofile from '../images/insaprofile.png';

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
    verticalAlign: 'top' as 'top'
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
  serviceCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'solid',
    borderRadius: 3,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9'
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    paddingBottom: 3
  },
  claimantName: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  serviceStatus: {
    fontSize: 10,
    color: '#555'
  },
  serviceDetails: {
    flexDirection: 'column',
    marginTop: 5
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 3
  },
  detailLabel: {
    width: '40%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666'
  },
  detailValue: {
    width: '60%',
    fontSize: 9
  },
  travelersSection: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderTopStyle: 'solid',
    paddingTop: 5
  },
  travelerItem: {
    flexDirection: 'row',
    marginBottom: 2
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

const DailyServiceReportPDF = ({ services, filters }: { services: DailyService[], filters: DailyServiceReportFilters }) => {
  const currentDate = new Date().toLocaleDateString();
  const letterNumber = `INS/REP/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`;

  // Split services into pages (3 services per page)
  const pages = [];
  for (let i = 0; i < services.length; i += 3) {
    pages.push(services.slice(i, i + 3));
  }

  return (
    <Document>
      {pages.map((pageServices, pageIndex) => (
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
                  DAILY SERVICE REPORT
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
              <Text style={styles.sectionTitle}>_</Text>
              <Text style={styles.sectionTitle}>FILTER CRITERIA</Text>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Date Range:</Text>
                <Text style={styles.filterValue}>{filters.start || 'Not specified'} to {filters.end || 'Not specified'}</Text>
              </View>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Claimant Name:</Text>
                <Text style={styles.filterValue}>{filters.claimantName || 'All'}</Text>
              </View>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Status:</Text>
                <Text style={styles.filterValue}>{filters.status || 'All'}</Text>
              </View>
              {filters.plateNumber && (
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>Plate Number:</Text>
                  <Text style={styles.filterValue}>{filters.plateNumber}</Text>
                </View>
              )}
            </View>
          )}

          {/* Service details */}
          <View style={styles.section}>
            {pageIndex === 0 && (
              <Text style={styles.sectionTitle}>SERVICE DETAILS ({services.length} records)</Text>
            )}
            {pageServices.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.claimantName}>{service.claimantName}</Text>
                  <Text style={styles.serviceStatus}>
                    {service.status} (Distance: {service.kmDifference || 0}km)
                  </Text>
                </View>
                
                <View style={styles.serviceDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service ID:</Text>
                    <Text style={styles.detailValue}>{service.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date & Time:</Text>
                    <Text style={styles.detailValue}>
                      {service.dateTime ? new Date(service.dateTime).toLocaleString() : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Driver:</Text>
                    <Text style={styles.detailValue}>{service.driverName || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>From:</Text>
                    <Text style={styles.detailValue}>{service.startingPlace || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>To:</Text>
                    <Text style={styles.detailValue}>{service.endingPlace || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Car Type:</Text>
                    <Text style={styles.detailValue}>{service.carType || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plate Number:</Text>
                    <Text style={styles.detailValue}>{service.plateNumber || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Start KM:</Text>
                    <Text style={styles.detailValue}>{service.startKm ?? 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>End KM:</Text>
                    <Text style={styles.detailValue}>{service.endKm ?? 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>KM Difference:</Text>
                    <Text style={styles.detailValue}>{service.kmDifference ?? 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created At:</Text>
                    <Text style={styles.detailValue}>
                      {service.createdAt ? new Date(service.createdAt).toLocaleString() : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completed At:</Text>
                    <Text style={styles.detailValue}>
                      {service.completedAt ? new Date(service.completedAt).toLocaleString() : 'N/A'}
                    </Text>
                  </View>
                  
                  {service.travelers && service.travelers.length > 0 && (
                    <View style={styles.travelersSection}>
                      <Text style={[styles.detailLabel, { marginBottom: 3 }]}>Travelers:</Text>
                      {service.travelers.map((traveler, idx) => (
                        <View key={idx} style={styles.travelerItem}>
                          <Text style={[styles.detailValue, { width: '100%' }]}>
                            {idx + 1}. {traveler}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
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

export default function ExportModal({ 
  services, 
  onClose, 
  filters 
}: { 
  services: DailyService[], 
  onClose: () => void, 
  filters: DailyServiceReportFilters 
}) {
  const hasData = services.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Daily Service Report Export</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p>{filters.start || 'Not specified'} to {filters.end || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Claimant Name</p>
                <p>{filters.claimantName || 'All'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p>{filters.status || 'All'}</p>
              </div>
              {filters.plateNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Plate Number</p>
                  <p>{filters.plateNumber}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-700">
                Daily Service Records ({services.length} found)
              </h4>
            </div>
            
            {hasData ? (
              <div className="space-y-4">
                {services.slice(0, 3).map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start border-b pb-2 mb-2">
                      <div>
                        <h5 className="font-bold text-lg">#{service.id} - {service.claimantName}</h5>
                        <p className="text-sm text-gray-600">
                          {service.dateTime ? new Date(service.dateTime).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        service.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        service.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
                        service.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Driver</p>
                        <p>{service.driverName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">From</p>
                        <p>{service.startingPlace || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">To</p>
                        <p>{service.endingPlace || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">KM Difference</p>
                        <p>{service.kmDifference ? `${service.kmDifference} km` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Car Type</p>
                        <p>{service.carType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Plate Number</p>
                        <p>{service.plateNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Start KM</p>
                        <p>{service.startKm ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">End KM</p>
                        <p>{service.endKm ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Created At</p>
                        <p>{service.createdAt ? new Date(service.createdAt).toLocaleString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed At</p>
                        <p>{service.completedAt ? new Date(service.completedAt).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>

                    {service.travelers && service.travelers.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h6 className="text-sm font-medium text-gray-600 mb-2">Travelers:</h6>
                        <ul className="list-disc pl-5 space-y-1">
                          {service.travelers.map((traveler, idx) => (
                            <li key={idx} className="text-sm">
                              {idx + 1}. {traveler}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                
                {services.length > 3 && (
                  <div className="text-center text-gray-500 py-4 border-t">
                    + {services.length - 3} more records will be included in the export
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No services found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filters to find matching services.</p>
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
          <PDFDownloadLink
            document={<DailyServiceReportPDF services={services} filters={filters} />}
            fileName={`daily_service_report_${new Date().toISOString().slice(0, 10)}.pdf`}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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