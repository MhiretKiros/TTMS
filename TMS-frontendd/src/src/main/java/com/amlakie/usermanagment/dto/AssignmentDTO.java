// AssignmentDTO.java (for PATCH /assign)
package com.amlakie.usermanagment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignmentDTO {
    @NotBlank(message = "Driver name is required")
    private String driverName;

    @NotBlank(message = "Car type is required")
    private String carType;

    @NotBlank(message = "Plate number is required")
    private String plateNumber;
}