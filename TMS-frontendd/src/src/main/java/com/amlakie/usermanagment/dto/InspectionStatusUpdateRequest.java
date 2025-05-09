package com.amlakie.usermanagment.dto;

// You might want to add validation annotations if needed
// import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.NotBlank;

public class InspectionStatusUpdateRequest {

    // @NotNull // Example validation: Ensure carId is provided
    private Long carId;

    // @NotBlank // Example validation: Ensure inspectionResult is not empty
    private String inspectionResult; // Assuming the result is stored as a String

    // --- Getters ---

    public Long getCarId() {
        return carId;
    }

    public String getInspectionResult() {
        return inspectionResult;
    }

    // --- Setters ---

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public void setInspectionResult(String inspectionResult) {
        this.inspectionResult = inspectionResult;
    }

    // --- Optional: toString() for logging ---
    @Override
    public String toString() {
        return "InspectionStatusUpdateRequest{" +
                "carId=" + carId +
                ", inspectionResult='" + inspectionResult + '\'' +
                '}';
    }

    // --- Optional: Constructors (if needed, though Jackson usually doesn't require them) ---
    // public InspectionStatusUpdateRequest() {}
    //
    // public InspectionStatusUpdateRequest(Long carId, String inspectionResult) {
    //     this.carId = carId;
    //     this.inspectionResult = inspectionResult;
    // }
}