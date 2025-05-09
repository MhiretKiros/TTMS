package com.amlakie.usermanagment.dto.organization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Automatically generates: getters, setters, toString(), equals(), and hashCode()
@NoArgsConstructor // Generates a constructor with no arguments
@AllArgsConstructor // Generates a constructor with all arguments
public class InspectionStatusUpdateRequest {

    @NotNull(message = "Car ID must be provided.")
    private Long carId;

    @NotBlank(message = "Inspection result cannot be empty.")
    // Consider using an Enum for inspectionResult for better type safety (see point 2)
    private String inspectionResult;
}