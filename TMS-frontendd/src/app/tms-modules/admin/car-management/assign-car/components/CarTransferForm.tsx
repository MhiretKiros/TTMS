"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import "@sweetalert2/theme-material-ui/material-ui.css";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface Car {
  id: string; // Combined ID format "car-123" or "rent-456"
  originalId: number; // Original numeric ID from backend
  plateNumber: string;
  model: string;
  status: string;
  isRentCar: boolean;
}

interface FormData {
  transferDate: string;
  transferNumber: string;
  oldPlateNumber: string;
  oldKmReading: string;
  designatedOfficial: string;
  driverName: string;
  transferReason: string;
  oldFuelLiters: string;
  newPlateNumber: string;
  newKmReading: string;
  currentDesignatedOfficial: string;
  newFuelLiters: string;
  verifyingBodyName: string;
  authorizingOfficerName: string;
  assignmentHistoryId: string;
}

interface CarTransferFormProps {
  initialData?: Partial<FormData>;
  onClose?: () => void;
  onSuccess?: () => void;
}

/* ------------------------------------------------------------------
   PDF Document Component (unchanged)
------------------------------------------------------------------ */
const TransferPDFDocument = ({ formData }: { formData: FormData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>VEHICLE TRANSFER FORM</Text>
        <Text style={styles.subtitle}>Official Document</Text>
      </View>

      {/* Transfer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transfer Information</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Transfer Date:</Text>
            <Text style={styles.value}>{formData.transferDate}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Transfer Number:</Text>
            <Text style={styles.value}>{formData.transferNumber}</Text>
          </View>
        </View>
      </View>

      {/* Original Vehicle Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Original Vehicle Details</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Plate Number:</Text>
            <Text style={styles.value}>{formData.oldPlateNumber}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>KM Reading:</Text>
            <Text style={styles.value}>{formData.oldKmReading}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Designated Official:</Text>
            <Text style={styles.value}>{formData.designatedOfficial}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Driver's Name:</Text>
            <Text style={styles.value}>{formData.driverName}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Fuel Level:</Text>
            <Text style={styles.value}>{formData.oldFuelLiters}</Text>
          </View>
        </View>
        <View style={styles.fullWidth}>
          <Text style={styles.label}>Transfer Reason:</Text>
          <Text style={styles.value}>{formData.transferReason}</Text>
        </View>
      </View>

      {/* Substitute Vehicle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assigned Substitute Vehicle</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>New Plate Number:</Text>
            <Text style={styles.value}>{formData.newPlateNumber}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>KM Reading:</Text>
            <Text style={styles.value}>{formData.newKmReading}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Current Official:</Text>
            <Text style={styles.value}>{formData.currentDesignatedOfficial}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Fuel Level:</Text>
            <Text style={styles.value}>{formData.newFuelLiters}</Text>
          </View>
        </View>
      </View>

      {/* Verification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verification & Authorization</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Verifying Body:</Text>
            <Text style={styles.value}>{formData.verifyingBodyName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Authorizing Officer:</Text>
            <Text style={styles.value}>{formData.authorizingOfficerName}</Text>
          </View>
        </View>
      </View>

      {/* Signatures */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <Text>Driver's Signature</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Receiving Official</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Authorizing Officer</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

/* ------------------------------------------------------------------
   PDF Styles (unchanged)
------------------------------------------------------------------ */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  column: {
    width: "50%",
    paddingRight: 10,
  },
  fullWidth: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },
  value: {
    fontSize: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
  },
  signatureBox: {
    width: "30%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 10,
    textAlign: "center",
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: "center",
    color: "#999",
  },
});

/* ------------------------------------------------------------------
   Main Component
------------------------------------------------------------------ */
const CarTransferForm: React.FC<CarTransferFormProps> = ({
  initialData = {},
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    transferDate: getTodayDateString(),
    transferNumber: "",
    oldPlateNumber: initialData.oldPlateNumber || "",
    oldKmReading: initialData.oldKmReading || "",
    designatedOfficial: initialData.designatedOfficial || "",
    driverName: initialData.driverName || "",
    transferReason: "",
    oldFuelLiters: "",
    newPlateNumber: "",
    newKmReading: "",
    currentDesignatedOfficial: "",
    newFuelLiters: "",
    verifyingBodyName: "",
    authorizingOfficerName: "",
    assignmentHistoryId: initialData.assignmentHistoryId?.toString() || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);

  /* ------------------------------------------------------------------
     Fetch cars in transfer (UNCHANGED)
  ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        const [regularCarsResponse, rentCarsResponse] = await Promise.all([
          axios.get("${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/in-transfer"),
          axios.get("${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/in-transfer"),
        ]);

        const regularCars: Car[] =
          regularCarsResponse.data?.carList?.map((car: any) => ({
            id: `car-${car.id}`,
            originalId: car.id,
            plateNumber: car.plateNumber,
            model: car.model,
            status: car.status,
            isRentCar: false,
          })) || [];

        const rentCars: Car[] =
          rentCarsResponse.data?.rentCarList?.map((car: any) => ({
            id: `rent-${car.id}`,
            originalId: car.id,
            plateNumber: car.plateNumber,
            model: car.model,
            status: car.status,
            isRentCar: true,
          })) || [];

        setAvailableCars([...regularCars, ...rentCars]);
      } catch (error) {
        console.error("Error fetching available cars:", error);
      }
    };

    fetchAvailableCars();
  }, []);

  /* ------------------------------------------------------------------
     Filter dropdown results (UNCHANGED)
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      setFilteredCars(
        availableCars.filter(
          (car) =>
            car.plateNumber.toLowerCase().includes(term) ||
            car.model.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredCars(availableCars);
    }
  }, [searchTerm, availableCars]);

  /* ------------------------------------------------------------------
     Handlers (mostly unchanged)
  ------------------------------------------------------------------ */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewPlateNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const selectCar = (car: Car) => {
    setFormData((prev) => ({ ...prev, newPlateNumber: car.plateNumber }));
    setSearchTerm(car.plateNumber);
    setShowDropdown(false);
  };

  /* ------------------------------------------------------------------
     Utility requests (UNCHANGED except where noted)
  ------------------------------------------------------------------ */
  const updateCarStatus = async (
    plateNumber: string,
    status: string,
    isRentCar: boolean = false
  ) => {
    const endpoint = isRentCar
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/status/${plateNumber}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/status/${plateNumber}`;

    try {
      await axios.put(endpoint, { status });
    } catch (error) {
      console.error(`Error updating ${isRentCar ? "rent car" : "car"} status:`, error);
      throw error;
    }
  };

  const updateAssignmentHistory = async () => {
    try {
      const newCar = availableCars.find(
        (car) => car.plateNumber === formData.newPlateNumber
      );
      if (!newCar) throw new Error("Selected car not found");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/assignments/update/${formData.assignmentHistoryId}`,
        {
          status: "Completed",
          carIds: [newCar.originalId],
          plateNumber: newCar.plateNumber,
          allCarModels: newCar.model,
          numberOfCar: "1/1",
        }
      );
    } catch (error) {
      console.error("Error updating assignment history:", error);
      throw error;
    }
  };

  /* ------------------------------------------------------------------
     NEW: update VehicleAcceptance.assignmentHistoryId by plate
  ------------------------------------------------------------------ */
  const updateAcceptanceAssignment = async (plateNumber: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicle-acceptance/plate/${plateNumber}`,
        {
          assignmentHistoryId:
            formData.assignmentHistoryId && formData.assignmentHistoryId !== ""
              ? parseInt(formData.assignmentHistoryId, 10)
              : null,
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error updating VehicleAcceptance:", error);
      throw error;
    }
  };

  /* ------------------------------------------------------------------
     Submit handler (updated with NEW call)
  ------------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      /* Step 1: save transfer info */
      const transferPayload = {
        ...formData,
        assignmentHistoryId:
          formData.assignmentHistoryId && formData.assignmentHistoryId !== ""
            ? parseInt(formData.assignmentHistoryId, 10)
            : null,
      };

      const transferResponse = await axios.post(
        "${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transfers",
        transferPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (![200, 201].includes(transferResponse.status)) {
        throw new Error("Failed to save transfer info");
      }

      /* Step 2: locate new car */
      const newCar = availableCars.find(
        (car) => car.plateNumber === formData.newPlateNumber
      );
      if (!newCar) throw new Error("Selected car not found");

      /* Step 3: update assignment history & car statuses */
      await updateAssignmentHistory();
      await updateCarStatus(formData.oldPlateNumber, "In_transfer");
      await updateCarStatus(formData.newPlateNumber, "Assigned", newCar.isRentCar);

      /* Step 4: NEW → update assignmentHistoryId on VehicleAcceptance */
      await updateAcceptanceAssignment(formData.newPlateNumber);

      /* Step 5: success UI */
      Swal.fire({
        title: "Success!",
        text: "Transfer completed successfully and vehicle statuses updated",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Error during transfer:", error);
      let errorMessage = "An unexpected error occurred";
      if (error.response) {
        errorMessage = error.response.data.message || error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Swal.fire({ title: "Error!", text: errorMessage, icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------
     Render JSX (unchanged except hidden assignmentHistoryId input)
  ------------------------------------------------------------------ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8 border border-gray-200"
    >
      {/* Header + PDF button */}
      <div className="flex justify-between items-center p-8 pb-4">
        <h2 className="text-3xl font-bold text-blue-600">Vehicle Transfer Form</h2>
        <PDFDownloadLink
          document={<TransferPDFDocument formData={formData} />}
          fileName="vehicle_transfer.pdf"
        >
          {({ loading }) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                "Preparing PDF..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download PDF
                </>
              )}
            </motion.button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Form */}
       <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
        <input 
          type="hidden" 
          name="assignmentHistoryId" 
          value={formData.assignmentHistoryId} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }}>
            <div className="form-group">
              <label htmlFor="transferDate" className="text-sm font-medium text-gray-700 mb-2 block">Transfer Date:</label>
              <input
                type="date"
                id="transferDate"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleChange}
                className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
              />
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <div className="form-group">
              <label htmlFor="transferNumber" className="text-sm font-medium text-gray-700 mb-2 block">Transfer Number:</label>
              <input
                type="text"
                id="transferNumber"
                name="transferNumber"
                value={formData.transferNumber}
                onChange={handleChange}
                className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                placeholder="e.g., Form #123"
              />
            </div>
          </motion.div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Original Vehicle Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldPlateNumber" className="text-sm font-medium text-gray-700 mb-1 block">Old Plate Number:</label><input type="text" id="oldPlateNumber" name="oldPlateNumber" value={formData.oldPlateNumber} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" readOnly /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldKmReading" className="text-sm font-medium text-gray-700 mb-1 block">Old KM Reading:</label><input type="number" id="oldKmReading" name="oldKmReading" value={formData.oldKmReading} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="designatedOfficial" className="text-sm font-medium text-gray-700 mb-1 block">The Designated Official:</label><input type="text" id="designatedOfficial" name="designatedOfficial" value={formData.designatedOfficial} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="driverName" className="text-sm font-medium text-gray-700 mb-1 block">Driver's Name:</label><input type="text" id="driverName" name="driverName" value={formData.driverName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2"><div className="form-group"><label htmlFor="transferReason" className="text-sm font-medium text-gray-700 mb-1 block">Transfer Reason:</label><textarea id="transferReason" name="transferReason" value={formData.transferReason} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all min-h-[100px] resize-vertical" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldFuelLiters" className="text-sm font-medium text-gray-700 mb-1 block">Old Fuel:</label><input type="text" id="oldFuelLiters" name="oldFuelLiters" value={formData.oldFuelLiters} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Assigned Substitute Vehicle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}>
              <div className="form-group relative">
                <label htmlFor="newPlateNumber" className="text-sm font-medium text-gray-700 mb-1 block">New Plate Number:</label>
                <input
                  type="text"
                  id="newPlateNumber"
                  name="newPlateNumber"
                  value={searchTerm}
                  onChange={handleNewPlateNumberChange}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                  placeholder="Search for a car..."
                />
                {showDropdown && filteredCars.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredCars.map((car) => (
                      <div
                        key={car.id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                        onClick={() => selectCar(car)}
                      >
                        <span>{car.plateNumber}</span>
                        <span className="text-sm text-gray-500">{car.model}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="newKmReading" className="text-sm font-medium text-gray-700 mb-1 block">New KM Reading:</label><input type="number" id="newKmReading" name="newKmReading" value={formData.newKmReading} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="currentDesignatedOfficial" className="text-sm font-medium text-gray-700 mb-1 block">Current Designated Official:</label><input type="text" id="currentDesignatedOfficial" name="currentDesignatedOfficial" value={formData.currentDesignatedOfficial} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="newFuelLiters" className="text-sm font-medium text-gray-700 mb-1 block">New Fuel:</label><input type="text" id="newFuelLiters" name="newFuelLiters" value={formData.newFuelLiters} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Verification & Authorization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="verifyingBodyName" className="text-sm font-medium text-gray-700 mb-1 block">Verifying Body Name:</label><input type="text" id="verifyingBodyName" name="verifyingBodyName" value={formData.verifyingBodyName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="authorizingOfficerName" className="text-sm font-medium text-gray-700 mb-1 block">Authorizing Officer Name:</label><input type="text" id="authorizingOfficerName" name="authorizingOfficerName" value={formData.authorizingOfficerName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          {onClose && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-medium text-gray-700 transition-all bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Cancel
              </button>
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium text-white transition-all ${isSubmitting ? 'bg-blue-400' : 'bg-[#3c8dbc] hover:bg-[#367fa9]'} focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:ring-opacity-50`}
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};

export default CarTransferForm;





 
  