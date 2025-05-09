package com.amlakie.usermanagment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

// DailyServiceRequestDTO.java
@Data
public class DailyServiceRequestDTO {

    private LocalDateTime dateTime;

    @NotEmpty(message = "At least one traveler is required")
    private List<@NotBlank String> travelers;


    private String startingPlace;

    private String endingPlace;

    private String claimantName;

    private String driverName;
    private Double startKm;
    private Double endKm;
    private String carType;
    private String plateNumber;
}