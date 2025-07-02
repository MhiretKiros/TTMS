'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { AssignmentHistory, CarAssignmentFilters } from '../types';
import insaprofile from '../images/insaprofile.png';

const styles = StyleSheet.create({
  page: {
    paddingTop: 100,
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
    paddingBottom: 15,
    marginBottom: 15,
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
  assignmentCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'solid',
    borderRadius: 3,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9'
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    paddingBottom: 3
  },
  assignmentTitle: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  assignmentStatus: {
    fontSize: 10,
    color: '#555'
  },
  assignmentDetails: {
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
  carItem: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#3c8dbc'
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

function renderAssignmentDetails(assignment: AssignmentHistory) {
  const fields = [
    { label: 'Request Letter No', value: assignment.requestLetterNo },
    { label: 'Requester Name', value: assignment.requesterName },
    { label: 'Position', value: assignment.position },
    { label: 'Department', value: assignment.department },
    { label: 'Phone Number', value: assignment.phoneNumber },
    { label: 'Rental Type', value: assignment.rentalType },
    { label: 'Travel Work Percentage', value: assignment.travelWorkPercentage },
    { label: 'Short Notice Percentage', value: assignment.shortNoticePercentage },
    { label: 'Mobility Issue', value: assignment.mobilityIssue },
    { label: 'Gender', value: assignment.gender },
    { label: 'Total Percentage', value: assignment.totalPercentage },
    { label: 'Status', value: assignment.status },
    { label: 'Assigned Date', value: new Date(assignment.assignedDate).toLocaleDateString() },
    { label: 'All Plate Numbers', value: assignment.allPlateNumbers },
    { label: 'All Car Models', value: assignment.allCarModels },
  ];

  return (
    <View style={styles.assignmentDetails}>
      {fields.map((f, idx) => (
        <View key={idx} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{f.label}:</Text>
          <Text style={styles.detailValue}>{String(f.value)}</Text>
        </View>
      ))}
    </View>
  );
}

function renderCarDetails(car: any) {
  const fields = [
    { label: 'Plate Number', value: car.plateNumber },
    { label: 'Owner Name', value: car.ownerName },
    { label: 'Owner Phone', value: car.ownerPhone },
    { label: 'Model', value: car.model },
    { label: 'Car Type', value: car.carType },
    { label: 'Manufacture Year', value: car.manufactureYear },
    { label: 'Motor Capacity', value: car.motorCapacity },
    { label: 'Fuel Type', value: car.fuelType },
    { label: 'Status', value: car.status },
    { label: 'Registered Date', value: new Date(car.registeredDate).toLocaleDateString() },
    { label: 'Parking Location', value: car.parkingLocation },
  ];

  return (
    <View style={styles.carItem}>
      {fields.map((f, idx) => (
        <View key={idx} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{f.label}:</Text>
          <Text style={styles.detailValue}>{String(f.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const AssignmentReportPDF = ({ assignments, filters }: { assignments: AssignmentHistory[], filters: CarAssignmentFilters }) => {
  const currentDate = new Date().toLocaleDateString();
  const letterNumber = `INS/REP/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`;

  // Split assignments into pages (1 assignment per page for this example)
  const pages = assignments.map((assignment, index) => ({
    assignment,
    pageNumber: index + 1
  }));

  return (
    <Document>
      {pages.map(({ assignment, pageNumber }) => (
        <Page key={assignment.id} size="A4" style={styles.page} wrap>
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
                  VEHICLE ASSIGNMENT REPORT
                </Text>
              </View>
              
              <View style={[styles.headerTableCell, styles.headerRight]}>
                <Text style={styles.headerInfo}>Letter No: {letterNumber}</Text>
                <Text style={styles.headerInfo}>Date: {currentDate}</Text>
                <Text style={styles.headerInfo}>Page: {pageNumber} of {assignments.length}</Text>
              </View>
            </View>
          </View>

          {/* Only show filter criteria on first page */}
          {pageNumber === 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FILTER CRITERIA</Text>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Date Range:</Text>
                <Text style={styles.filterValue}>{filters.start || 'Not specified'} to {filters.end || 'Not specified'}</Text>
              </View>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Plate Number:</Text>
                <Text style={styles.filterValue}>{filters.plateNumber || 'All'}</Text>
              </View>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Position:</Text>
                <Text style={styles.filterValue}>{filters.position || 'All'}</Text>
              </View>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Status:</Text>
                <Text style={styles.filterValue}>{filters.status || 'All'}</Text>
              </View>
            </View>
          )}

          {/* Assignment details */}
          <View style={styles.section}>
            {pageNumber === 1 && (
              <Text style={styles.sectionTitle}>ASSIGNMENT DETAILS ({assignments.length} records)</Text>
            )}
            <View style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <Text style={styles.assignmentTitle}>Request #{assignment.requestLetterNo}</Text>
                <Text style={styles.assignmentStatus}>{assignment.status}</Text>
              </View>
              
              {renderAssignmentDetails(assignment)}
              
              {assignment.car && (
                <View>
                  <Text style={[styles.detailLabel, { marginTop: 10 }]}>Assigned Car:</Text>
                  {renderCarDetails(assignment.car)}
                </View>
              )}
              
              {assignment.rentCar && (
                <View>
                  <Text style={[styles.detailLabel, { marginTop: 10 }]}>Assigned Rental Car:</Text>
                  {renderCarDetails(assignment.rentCar)}
                </View>
              )}
              
              {assignment.multipleCars?.length > 0 && (
                <View>
                  <Text style={[styles.detailLabel, { marginTop: 10 }]}>Multiple Assigned Cars:</Text>
                  {assignment.multipleCars.map((car, idx) => (
                    <View key={idx}>
                      {renderCarDetails(car)}
                    </View>
                  ))}
                </View>
              )}
            </View>
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

export default function AssignmentExportModal({ 
  assignments = [], 
  onClose, 
  filters 
}: { 
  assignments: AssignmentHistory[], 
  onClose: () => void, 
  filters: CarAssignmentFilters 
}) {
  const hasData = assignments.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Assignment Report Export</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
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
                <p className="text-sm font-medium text-gray-600">Plate Number</p>
                <p>{filters.plateNumber || 'All'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Position</p>
                <p>{filters.position || 'All'}</p>
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
                Assignment Records ({assignments.length} found)
              </h4>
            </div>
            
            {hasData ? (
              <div className="space-y-4">
                {assignments.slice(0, 3).map((assignment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start border-b pb-2 mb-2">
                      <div>
                        <h5 className="font-bold text-lg">Request #{assignment.requestLetterNo}</h5>
                        <p className="text-sm text-gray-600">{assignment.requesterName} - {assignment.department}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assignment.status === 'Assigned' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'In_transfer' ? 'bg-blue-100 text-blue-800' :
                        assignment.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Position</p>
                        <p>{assignment.position}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Assigned Date</p>
                        <p>{new Date(assignment.assignedDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Plate Numbers</p>
                        <p>{assignment.allPlateNumbers}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Car Models</p>
                        <p>{assignment.allCarModels}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {assignments.length > 3 && (
                  <div className="text-center text-gray-500 py-4 border-t">
                    + {assignments.length - 3} more records will be included in the export
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No assignments found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filters to find matching assignments.</p>
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
            document={<AssignmentReportPDF assignments={assignments} filters={filters} />}
            fileName={`assignment_report_${new Date().toISOString().slice(0, 10)}.pdf`}
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