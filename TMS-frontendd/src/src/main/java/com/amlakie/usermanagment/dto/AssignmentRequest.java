package com.amlakie.usermanagment.dto;

import lombok.Data;
import java.util.List;

import java.time.LocalDateTime;

// src/main/java/com/amlakie/usermanagment/dto/AssignmentRequest.java
@Data
// AssignmentRequest.java
public class AssignmentRequest {
    private String requestLetterNo;
    private String requestDate; // As string from frontend
    private String requesterName;
    private String rentalType;
    private String position;
    private String department;
    private String phoneNumber;
    private String plateNumber;
    private String travelWorkPercentage;
    private String shortNoticePercentage;
    private String mobilityIssue;
    private String gender;
    private int totalPercentage;
    private String status;
    private String model;
    private Long carId; // Only ID instead of full object
    private Long rentCarId;
    private String assignedDate;
    private String numberOfCar;

    private List<Long> carIds; // For multiple regular cars
    private List<Long> rentCarIds; // For multiple rent cars

    // Getters and setters
}