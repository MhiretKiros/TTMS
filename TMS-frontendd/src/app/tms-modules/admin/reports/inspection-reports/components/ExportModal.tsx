// ExportModal.tsx
'use client';

import React from 'react';
import { Inspection, InspectionReportFilters } from '../types';
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
  inspectionCard: { border: '1px solid #eee', borderRadius: 3, padding: 10, marginBottom: 10, backgroundColor: '#f9f9f9' },
  inspectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, borderBottom: '1px solid #ddd', paddingBottom: 3 },
  plateNumber: { fontSize: 11, fontWeight: 'bold' },
  inspectionStatus: { fontSize: 10, color: '#555' },
  inspectionDetails: { flexDirection: 'column', marginTop: 5 },
  detailRow: { flexDirection: 'row', marginBottom: 3 },
  detailLabel: { width: '40%', fontSize: 9, fontWeight: 'bold', color: '#666' },
  detailValue: { width: '60%', fontSize: 9 },
  subSection: { marginLeft: 10, marginTop: 5 },
  subSectionTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 3 },
  footer: { marginTop: 20, fontSize: 8, textAlign: 'center', color: '#666', borderTop: '1px solid #ddd', paddingTop: 10 }
});

const renderMechanicalDetails = (mechanical: any) => (
  <View style={styles.subSection}>
    <Text style={styles.subSectionTitle}>Mechanical Inspection:</Text>
    {Object.entries(mechanical).map(([key, value]) => (
      <View key={key} style={styles.detailRow}>
        <Text style={styles.detailLabel}>{key}:</Text>
        <Text style={styles.detailValue}>
          {typeof value === 'boolean' ? (value ? '✅ Pass' : '❌ Fail') : String(value)}
        </Text>
      </View>
    ))}
  </View>
);

const renderBodyDetails = (body: any) => (
  <View style={styles.subSection}>
    <Text style={styles.subSectionTitle}>Body Inspection:</Text>
    {Object.entries(body).map(([key, value]) => (
      <View key={key} style={styles.detailRow}>
        <Text style={styles.detailLabel}>{key}:</Text>
        <Text style={styles.detailValue}>
          {value.problem ? `❌ Problem (${value.severity})` : '✅ OK'}
          {value.notes && ` - Notes: ${value.notes}`}
        </Text>
      </View>
    ))}
  </View>
);

const renderInteriorDetails = (interior: any) => (
  <View style={styles.subSection}>
    <Text style={styles.subSectionTitle}>Interior Inspection:</Text>
    {Object.entries(interior).map(([key, value]) => (
      <View key={key} style={styles.detailRow}>
        <Text style={styles.detailLabel}>{key}:</Text>
        <Text style={styles.detailValue}>
          {value.problem ? `❌ Problem (${value.severity})` : '✅ OK'}
          {value.notes && ` - Notes: ${value.notes}`}
        </Text>
      </View>
    ))}
  </View>
);

const InspectionReportPDF = ({ inspections, filters }: { inspections: Inspection[], filters: InspectionReportFilters }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>VEHICLE INSPECTION REPORT</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
        
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
            <Text style={styles.filterLabel}>Status:</Text>
            <Text style={styles.filterValue}>{filters.status || 'All'}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INSPECTION DETAILS ({inspections.length} records)</Text>
          {inspections.map((inspection, index) => (
            <View key={index} style={styles.inspectionCard}>
              <View style={styles.inspectionHeader}>
                <Text style={styles.plateNumber}>{inspection.plateNumber}</Text>
                <Text style={styles.inspectionStatus}>
                  {inspection.inspectionStatus} (Body: {inspection.bodyScore}%, Interior: {inspection.interiorScore}%)
                </Text>
              </View>
              
              <View style={styles.inspectionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Inspection Date:</Text>
                  <Text style={styles.detailValue}>{new Date(inspection.inspectionDate).toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Inspector:</Text>
                  <Text style={styles.detailValue}>{inspection.inspectorName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Service Status:</Text>
                  <Text style={styles.detailValue}>{inspection.serviceStatus}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes:</Text>
                  <Text style={styles.detailValue}>{inspection.notes || 'None'}</Text>
                </View>
                
                {renderMechanicalDetails(inspection.mechanical)}
                {renderBodyDetails(inspection.body)}
                {renderInteriorDetails(inspection.interior)}
              </View>
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

export default function ExportModal({ 
  inspections = [], 
  onClose, 
  filters 
}: { 
  inspections: Inspection[], 
  onClose: () => void, 
  filters: InspectionReportFilters 
}) {
  const hasData = inspections.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Inspection Report Export</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
                <p className="text-sm font-medium text-gray-600">Plate Number</p>
                <p>{filters.plateNumber || 'All'}</p>
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
                Inspection Records ({inspections.length} found)
              </h4>
            </div>
            
            {hasData ? (
              <div className="space-y-4">
                {inspections.slice(0, 3).map((inspection, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start border-b pb-2 mb-2">
                      <div>
                        <h5 className="font-bold text-lg">{inspection.plateNumber}</h5>
                        <p className="text-sm text-gray-600">
                          {new Date(inspection.inspectionDate).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        inspection.inspectionStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                        inspection.inspectionStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inspection.inspectionStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Inspector</p>
                        <p>{inspection.inspectorName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Scores</p>
                        <p>Body: {inspection.bodyScore}% | Interior: {inspection.interiorScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Service Status</p>
                        <p>{inspection.serviceStatus}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Notes</p>
                        <p>{inspection.notes || 'None'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {inspections.length > 3 && (
                  <div className="text-center text-gray-500 py-4 border-t">
                    + {inspections.length - 3} more records will be included in the export
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No inspections found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filters to find matching inspections.</p>
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
            document={<InspectionReportPDF inspections={inspections} filters={filters} />}
            fileName={`inspection_report_${new Date().toISOString().slice(0, 10)}.pdf`}
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