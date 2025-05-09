// C:/TMS-backendd/src/main/java/com/amlakie/usermanagment/dto/CarDto.java
package com.amlakie.usermanagment.dto;

import lombok.Data;
import java.time.LocalDateTime; // Import if you include date fields

@Data // Lombok annotation for getters, setters, toString, etc.
public class CarDto {

    // --- Fields from Car entity that the frontend needs ---
    private Long id;
    private String plateNumber;
    private String ownerName;
    private String ownerPhone;
    private String model;
    private String carType;
    private int manufactureYear; // Keep as int if that's correct
    private String motorCapacity;
    private float kmPerLiter; // Keep as float if that's correct
    private String totalKm;
    private String fuelType;
    private String status;
    private String parkingLocation;
    private boolean inspected; // From Car entity
    // Add other fields like registeredDate, createdBy if the frontend needs them

    // --- The NEW field required by the frontend ---
    private Long latestInspectionId;
}