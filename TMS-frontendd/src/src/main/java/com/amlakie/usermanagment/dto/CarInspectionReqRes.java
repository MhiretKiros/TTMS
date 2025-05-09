package com.amlakie.usermanagment.dto;

import com.amlakie.usermanagment.dto.organization.OrganizationCarInspectionReqRes;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CarInspectionReqRes {
    private Integer codStatus; // Use Integer for nullability
    private String message;
    private String error;
    private Long id;
    @NotBlank(message = "Plate number is required")
    private String plateNumber;

    @NotNull(message = "Inspection date is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime inspectionDate;

    @NotBlank(message = "Inspector name is required")
    @Size(min = 2, message = "Inspector name must be at least 2 characters")
    private String inspectorName;

    @NotNull(message = "Inspection status is required")
    private InspectionStatus inspectionStatus;

    @NotNull(message = "Service status is required")
    private ServiceStatus serviceStatus;

    @NotNull(message = "Body score is required")
    @Min(value = 0, message = "Body score cannot be negative")
    @Max(value = 100, message = "Body score cannot exceed 100")
    private Integer bodyScore;

    @NotNull(message = "Interior score is required")
    @Min(value = 0, message = "Interior score cannot be negative")
    @Max(value = 100, message = "Interior score cannot exceed 100")
    private Integer interiorScore;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    @NotNull(message = "Mechanical inspection details are required")
    @Valid
    private MechanicalInspectionDTO mechanical;

    @NotNull(message = "Body inspection details are required")
    @Valid
    private BodyInspectionDTO body;

    @NotNull(message = "Interior inspection details are required")
    @Valid
    private InteriorInspectionDTO interior;

    public enum InspectionStatus {
        Approved, Rejected, ConditionallyApproved
    }
    public enum ServiceStatus {
        Ready, Pending, ReadyWithWarning,NotReady
    }
}