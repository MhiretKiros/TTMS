package com.amlakie.usermanagment.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TravelRequestDTO {
    @NotEmpty(message = "At least one traveler is required")
    private List<@NotBlank(message = "Traveler name cannot be blank") String> travelers;

    private Long id;
    private String startingPlace;
    private String destinationPlace;
    private String travelReason;
    private String carType;
    private Double travelDistance;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startingDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime returnDate;

    private String department;
    private String jobStatus;
    private String claimantName;
    private String teamLeaderName;
    private String approvement;

    // Service provider fields
    private String serviceProviderName;
    private String assignedCarType;
    private String assignedDriver;
    private String vehicleDetails;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime actualStartingDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime actualReturnDate;

    private Double startingKilometers;
    private Double endingKilometers;
    private Double kmDifference;
    private String cargoType;
    private Double cargoWeight;
    private Integer numberOfPassengers;

    private String authorizerName;
    private String assemblerName;
    private String tripExplanation;
    private Double accountNumber;
}