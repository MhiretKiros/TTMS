// ExportModal.tsx
'use client';

import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { VehicleTransfer, VehicleAcceptance, CarReportsFilters } from '../types';

// Professional PDF styles with perfect spacing
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4
  },
  header: {
    marginBottom: 30,
    textAlign: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 20
  },
  section: {
    marginBottom: 25,
    breakInside: 'avoid'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1px solid #000',
    paddingBottom: 3
  },
  filterContainer: {
    marginBottom: 20
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
  card: {
    marginBottom: 25,
    breakInside: 'avoid'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  cardDate: {
    fontSize: 9
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start'
  },
  detailLabel: {
    width: 120,
    fontWeight: 'bold'
  },
  detailValue: {
    flex: 1
  },
  inspectionContainer: {
    marginTop: 10,
    marginBottom: 10
  },
  inspectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  inspectionItem: {
    marginBottom: 4,
    flexDirection: 'row'
  },
  passed: {
    color: '#28a745',
    marginRight: 5
  },
  failed: {
    color: '#dc3545',
    marginRight: 5
  },
  signatureContainer: {
    marginTop: 15
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  transferContainer: {
    marginTop: 15,
    marginLeft: 15,
    paddingTop: 10,
    borderTop: '1px solid #eee'
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 9,
    paddingTop: 10,
    borderTop: '1px solid #eee'
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center'
  }
});

const CarReportPDF = ({ 
  acceptances, 
  transfers, 
  filters 
}: { 
  acceptances: VehicleAcceptance[], 
  transfers: VehicleTransfer[], 
  filters: CarReportsFilters 
}) => {
  const transfersByAssignmentId = transfers.reduce((acc, transfer) => {
    if (!acc[transfer.assignmentHistoryId]) {
      acc[transfer.assignmentHistoryId] = [];
    }
    acc[transfer.assignmentHistoryId].push(transfer);
    return acc;
  }, {} as Record<number, VehicleTransfer[]>);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>VEHICLE ACCEPTANCE & TRANSFER REPORT</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FILTER CRITERIA</Text>
          <View style={styles.filterContainer}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Date Range:</Text>
              <Text style={styles.filterValue}>{filters.start || 'Not specified'} to {filters.end || 'Not specified'}</Text>
            </View>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Plate Number:</Text>
              <Text style={styles.filterValue}>{filters.plateNumber || 'All'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            VEHICLE RECORDS ({acceptances.length} acceptances, {transfers.length} transfers)
          </Text>
          
          {acceptances.map((acceptance) => {
            const relatedTransfers = acceptance.assignmentHistoryId 
              ? transfersByAssignmentId[acceptance.assignmentHistoryId] || []
              : [];
            
            return (
              <View key={acceptance.id} style={styles.card} wrap={false}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>ACCEPTANCE: {acceptance.plateNumber}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(acceptance.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Car Type:</Text>
                  <Text style={styles.detailValue}>{acceptance.carType}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>KM:</Text>
                  <Text style={styles.detailValue}>{acceptance.km}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Inspection Summary:</Text>
                  <Text style={styles.detailValue}>
                    {Object.values(acceptance.inspectionItems).filter(v => v).length}/
                    {Object.values(acceptance.inspectionItems).length} passed
                  </Text>
                </View>
                
                <View style={styles.inspectionContainer}>
                  <Text style={styles.inspectionTitle}>Inspection Details:</Text>
                  {Object.entries(acceptance.inspectionItems).map(([item, passed]) => (
                    <View key={item} style={styles.inspectionItem}>
                      <Text style={passed ? styles.passed : styles.failed}>
                        {passed ? '✓' : '✗'}
                      </Text>
                      <Text>{item}</Text>
                    </View>
                  ))}
                </View>
                
                {acceptance.attachments?.length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Attachments:</Text>
                    <Text style={styles.detailValue}>
                      {acceptance.attachments.join(', ')}
                    </Text>
                  </View>
                )}
                
                {acceptance.physicalContent?.length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Physical Content:</Text>
                    <Text style={styles.detailValue}>
                      {acceptance.physicalContent.join(', ')}
                    </Text>
                  </View>
                )}
                
                {acceptance.notes?.length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <Text style={styles.detailValue}>
                      {acceptance.notes.join(', ')}
                    </Text>
                  </View>
                )}
                
                <View style={styles.signatureContainer}>
                  <Text style={styles.inspectionTitle}>Signatures:</Text>
                  {acceptance.signatures.map((signature, idx) => (
                    <View key={idx} style={styles.signatureRow}>
                      <Text>{signature.role}: {signature.name}</Text>
                      <Text>Date: {signature.date}</Text>
                    </View>
                  ))}
                </View>
                
                {relatedTransfers.length > 0 && (
                  <View style={styles.transferContainer}>
                    <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>
                      Associated Transfers ({relatedTransfers.length}):
                    </Text>
                    {relatedTransfers.map((transfer) => (
                      <View key={transfer.transferId} style={{ marginBottom: 15 }}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>TRANSFER #{transfer.transferNumber}</Text>
                          <Text style={styles.cardDate}>
                            {new Date(transfer.transferDate).toLocaleDateString()}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>From Official:</Text>
                          <Text style={styles.detailValue}>{transfer.designatedOfficial}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>To Official:</Text>
                          <Text style={styles.detailValue}>{transfer.currentDesignatedOfficial}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Driver:</Text>
                          <Text style={styles.detailValue}>{transfer.driverName}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>KM Change:</Text>
                          <Text style={styles.detailValue}>
                            {transfer.oldKmReading} → {transfer.newKmReading}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Fuel Change:</Text>
                          <Text style={styles.detailValue}>
                            {transfer.oldFuelLiters} → {transfer.newFuelLiters}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Reason:</Text>
                          <Text style={styles.detailValue}>{transfer.transferReason}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        <View style={styles.footer}>
          <Text>End of Report - Total Acceptances: {acceptances.length} | Total Transfers: {transfers.length}</Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

const AcceptanceDetails = ({ acceptance, expanded, onToggle }: { 
  acceptance: VehicleAcceptance, 
  expanded: boolean, 
  onToggle: () => void 
}) => {
  const inspectionItems = Object.entries(acceptance.inspectionItems);
  const showItems = expanded ? inspectionItems : inspectionItems.slice(0, 3);
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start border-b pb-2 mb-2">
        <div>
          <h5 className="font-bold text-lg">Acceptance: {acceptance.plateNumber}</h5>
          <p className="text-sm text-gray-600">
            {new Date(acceptance.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Car Type</p>
          <p>{acceptance.carType}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">KM</p>
          <p>{acceptance.km}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Inspection Items</p>
          <p>
            {Object.values(acceptance.inspectionItems).filter(v => v).length}/
            {Object.values(acceptance.inspectionItems).length} passed
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Assignment History ID</p>
          <p>{acceptance.assignmentHistoryId || 'N/A'}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h6 className="text-sm font-medium text-gray-600 mb-2">Inspection Details:</h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {showItems.map(([item, passed]) => (
            <div key={item} className="flex items-center">
              <span className={`mr-1 ${passed ? 'text-green-500' : 'text-red-500'}`}>
                {passed ? '✓' : '✗'}
              </span>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        {inspectionItems.length > 3 && (
          <button 
            onClick={onToggle}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {expanded ? 'Show Less' : `Show All ${inspectionItems.length} Items`}
          </button>
        )}
      </div>
      
      {acceptance.attachments?.length > 0 && (
        <div className="mt-4">
          <h6 className="text-sm font-medium text-gray-600 mb-1">Attachments:</h6>
          <p className="text-sm">{acceptance.attachments.join(', ')}</p>
        </div>
      )}
      
      {acceptance.physicalContent?.length > 0 && (
        <div className="mt-2">
          <h6 className="text-sm font-medium text-gray-600 mb-1">Physical Content:</h6>
          <p className="text-sm">{acceptance.physicalContent.join(', ')}</p>
        </div>
      )}
      
      {acceptance.notes?.length > 0 && (
        <div className="mt-2">
          <h6 className="text-sm font-medium text-gray-600 mb-1">Notes:</h6>
          <p className="text-sm">{acceptance.notes.join(', ')}</p>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <h6 className="text-sm font-medium text-gray-600 mb-2">Signatures:</h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {acceptance.signatures.map((signature, idx) => (
            <div key={idx} className="text-sm">
              <p className="font-medium">{signature.role}</p>
              <p>Name: {signature.name}</p>
              <p>Date: {signature.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TransferDetails = ({ transfer }: { 
  transfer: VehicleTransfer
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-green-50 shadow-sm">
      <div className="flex justify-between items-start border-b pb-2 mb-2">
        <div>
          <h5 className="font-bold text-lg">Transfer #{transfer.transferNumber}</h5>
          <p className="text-sm text-gray-600">
            {new Date(transfer.transferDate).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Transfer ID</p>
          <p>{transfer.transferId}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">From Official</p>
          <p>{transfer.designatedOfficial}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">To Official</p>
          <p>{transfer.currentDesignatedOfficial}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Driver</p>
          <p>{transfer.driverName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">KM Change</p>
          <p>{transfer.oldKmReading} → {transfer.newKmReading}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Fuel Change</p>
          <p>{transfer.oldFuelLiters} → {transfer.newFuelLiters}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Reason</p>
          <p>{transfer.transferReason}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Verifying Body</p>
          <p>{transfer.verifyingBodyName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Authorizing Officer</p>
          <p>{transfer.authorizingOfficerName}</p>
        </div>
      </div>
    </div>
  );
};

export default function ExportModal({ 
  acceptances, 
  transfers, 
  onClose, 
  filters 
}: { 
  acceptances: VehicleAcceptance[], 
  transfers: VehicleTransfer[], 
  onClose: () => void, 
  filters: CarReportsFilters 
}) {
  const hasData = acceptances.length > 0 || transfers.length > 0;
  const [expandedAcceptances, setExpandedAcceptances] = useState<Record<number, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const toggleAcceptance = (id: number) => {
    setExpandedAcceptances(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const displayedAcceptances = showAll ? acceptances : acceptances.slice(0, 2);
  const displayedTransfers = showAll ? transfers : transfers.slice(0, 2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Detailed Vehicle Report Export</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p>{filters.start || 'Not specified'} to {filters.end || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Plate Number</p>
                <p>{filters.plateNumber || 'All'}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-700">
                Vehicle Records ({acceptances.length} acceptances, {transfers.length} transfers)
              </h4>
              {acceptances.length > 2 && (
                <button 
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  {showAll ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
            
            {hasData ? (
              <div className="space-y-4">
                {displayedAcceptances.map((acceptance) => {
                  const relatedTransfers = transfers.filter(
                    t => t.assignmentHistoryId === acceptance.assignmentHistoryId
                  );
                  
                  return (
                    <div key={acceptance.id} className="space-y-4">
                      <AcceptanceDetails 
                        acceptance={acceptance} 
                        expanded={!!expandedAcceptances[acceptance.id]}
                        onToggle={() => toggleAcceptance(acceptance.id)}
                      />
                      
                      {relatedTransfers.length > 0 && (
                        <div className="ml-8 space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium text-gray-700">
                              Associated Transfers ({relatedTransfers.length})
                            </h5>
                            {relatedTransfers.length > 2 && !showAll && (
                              <button 
                                onClick={() => setShowAll(true)}
                                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                              >
                                Show All {relatedTransfers.length} Transfers
                              </button>
                            )}
                          </div>
                          {(showAll ? relatedTransfers : relatedTransfers.slice(0, 2)).map(transfer => (
                            <TransferDetails 
                              key={transfer.transferId}
                              transfer={transfer}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {!showAll && (acceptances.length > 2 || transfers.length > 2) && (
                  <div className="text-center text-gray-500 py-4 border-t">
                    + {Math.max(acceptances.length - 2, 0)} more acceptances and {Math.max(transfers.length - 2, 0)} more transfers available
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No vehicle records found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filters to find matching records.</p>
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
              document={<CarReportPDF acceptances={acceptances} transfers={transfers} filters={filters} />}
              fileName={`vehicle_report_${new Date().toISOString().slice(0, 10)}.pdf`}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#3c8dbc] hover:bg-[#367fa9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c8dbc]"
            >
              {({ loading }) => (
                loading ? 'Preparing PDF...' : 'Download PDF Report'
              )}
            </PDFDownloadLink>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
            >
              Download PDF Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}