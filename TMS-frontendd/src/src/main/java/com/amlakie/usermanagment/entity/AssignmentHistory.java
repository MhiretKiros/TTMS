package com.amlakie.usermanagment.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

// src/main/java/com/amlakie/usermanagment/entity/AssignmentHistory.java
@Entity
@Table(name = "assignment_history")
@Data
public class AssignmentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String requestLetterNo;

    @Column(nullable = false)
    private LocalDateTime requestDate;

    @Column(nullable = false)
    private String requesterName;

    @Column(nullable = false)
    private String rentalType;

    @Column(nullable = false)
    private String position;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String travelWorkPercentage;

    @Column(nullable = false)
    private String shortNoticePercentage;

    @Column(nullable = false)
    private String mobilityIssue;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private int totalPercentage;

    @Column(nullable = false)
    private String status;

    @Column(nullable = true)
    private String plateNumber;

    @Column(nullable = true)
    private String numberOfCar;

    @Column(nullable = true)
    private String model;

    @ManyToOne
    @JoinColumn(name = "car_id", nullable = true)
    private Car car;

    @ManyToOne
    @JoinColumn(name = "rent_car_id", nullable = true)
    private RentCar rentCar;  // Changed from 'cars' to 'rentCar' for clarity

    @Column(nullable = false)
    private LocalDateTime assignedDate;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "assignment_multiple_cars",
            joinColumns = @JoinColumn(name = "assignment_id"),
            inverseJoinColumns = @JoinColumn(name = "car_id")
    )
    private Set<Car> multipleCars = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "assignment_multiple_rent_cars",
            joinColumns = @JoinColumn(name = "assignment_id"),
            inverseJoinColumns = @JoinColumn(name = "rent_car_id")
    )
    private Set<RentCar> multipleRentCars = new HashSet<>();

    @Column(nullable = true, length = 1000)
    private String allPlateNumbers;  // Simple string field, not a collection

    @Column(nullable = true, length = 1000)
    private String allCarModels;  // Simple string field, not a collection
}