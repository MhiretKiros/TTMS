import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import image from '../image.jpg';

interface FOCFormData {
  plateNumber: string;
  receivedBy: string;
  assignedOfficial: string;
  driverName: string;
  entryKm: number;
  entryFuel: number;
  KmDrivenInWorkShop: number;
  purposeAndDestination: string;
  oilUsed: {
    type: string;
    amount: number;
  }[];
  fuelUsed: number;
  exitDate: string;
  exitKm: number;
  dispatchOfficer: string;
  mechanicName: string;
  headMechanicName: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 80,
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
    verticalAlign: 'top'
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
  logo: {
    width: 50,
    height: 50
  },
  organization: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
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
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  label: {
    width: '40%',
    fontWeight: 'bold'
  },
  value: {
    width: '60%'
  },
  fullWidthText: {
    width: '100%',
    marginBottom: 10
  },
  notificationSection: {
    marginBottom: 25,
    breakInside: 'avoid',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5
  },
  oilTable: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid'
  },
  oilTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold'
  },
  oilTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid'
  },
  oilTableCell: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    borderRightStyle: 'solid',
    width: '50%'
  },
  oilTableLastCell: {
    padding: 5,
    width: '50%'
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40
  },
  signatureBox: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 5,
    textAlign: 'center'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 10
  },
  content: {
    marginTop: 30
  }
});

const FOCReportPDF = ({ formData }: { formData: FOCFormData }) => {
  const currentDate = new Date().toLocaleDateString();
  const letterNumber = `INS/REP/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View fixed style={styles.header}>
          <View style={styles.headerTable}>
            <View style={[styles.headerTableCell, styles.headerLeft]}>
              <PDFImage src={image.src} style={styles.logo} />
            </View>
            
            <View style={[styles.headerTableCell, styles.headerCenter]}>
              <Text style={styles.headerTitle}>
                INFORMATION NETWORK SECURITY ADMINISTRATION
              </Text>
              <Text style={styles.headerSubtitle}>
                NEZEK Notification: Vehicle Arrivals and Departures for Maintenance
              </Text>
            </View>
            
            <View style={[styles.headerTableCell, styles.headerRight]}>
              <Text style={styles.headerInfo}>Letter No: {letterNumber}</Text>
              <Text style={styles.headerInfo}>Date: {currentDate}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Plate Number:</Text>
              <Text style={styles.value}>{formData.plateNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Driver Name:</Text>
              <Text style={styles.value}>{formData.driverName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Entry Km:</Text>
              <Text style={styles.value}>{formData.entryKm}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Entry Fuel:</Text>
              <Text style={styles.value}>{formData.entryFuel}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Km Driven In Workshop:</Text>
              <Text style={styles.value}>{formData.KmDrivenInWorkShop}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purpose and Destination</Text>
            <Text style={styles.value}>{formData.purposeAndDestination}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oil and Fuel Usage</Text>
            
            {/* Oil Usage Table */}
            {formData.oilUsed && formData.oilUsed.length > 0 && (
              <View style={styles.oilTable}>
                <View style={styles.oilTableHeader}>
                  <Text style={styles.oilTableCell}>Oil Type</Text>
                  <Text style={styles.oilTableLastCell}>Amount (Liters)</Text>
                </View>
                {formData.oilUsed.map((oil, index) => (
                  <View key={index} style={styles.oilTableRow}>
                    <Text style={styles.oilTableCell}>{oil.type || 'N/A'}</Text>
                    <Text style={styles.oilTableLastCell}>{oil.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.row}>
              <Text style={styles.label}>Fuel Used:</Text>
              <Text style={styles.value}>{formData.fuelUsed.toFixed(2)} Liters</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exit Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Exit Date:</Text>
              <Text style={styles.value}>{formData.exitDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Exit Km:</Text>
              <Text style={styles.value}>{formData.exitKm}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personnel</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Dispatch Officer:</Text>
              <Text style={styles.value}>{formData.dispatchOfficer}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mechanic Name:</Text>
              <Text style={styles.value}>{formData.mechanicName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Head Mechanic Name:</Text>
              <Text style={styles.value}>{formData.headMechanicName}</Text>
            </View>
          </View>

          <View style={styles.notificationSection}>
            <Text style={styles.sectionTitle}>Notification</Text>
            <Text style={styles.fullWidthText}>
              This form must be prepared in three copies. One copy should be submitted to the NEZEK Administration Team, the second to the Maintenance and Inspection Team, and the third to the Transport Dispatch Team.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View fixed style={styles.footer}>
          <Text>Generated on: {currentDate}</Text>
          <Text>INSA Fuel Management System</Text>
        </View>
      </Page>
    </Document>
  );
};

export default FOCReportPDF;