package com.amlakie.usermanagment.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "travel_requests")
@Data
@JsonIgnoreProperties
public class TravelRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String startingPlace;

    @Column(nullable = false)
    private String destinationPlace;

    @OneToMany(mappedBy = "travelRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Traveler> travelers = new ArrayList<>();

    @Column(nullable = false, length = 500)
    private String travelReason;

    @Column
    private String carType;

    @Column
    private Double travelDistance;

    @Column(nullable = false)
    private LocalDateTime startingDate;

    @Column
    private LocalDateTime returnDate;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String jobStatus;

    @Column(nullable = false)
    private String claimantName;

    @Column(nullable = false)
    private String teamLeaderName;

    @Column
    private String approvement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column
    private String serviceProviderName;

    @Column
    private String assignedCarType;

    @Column
    private String assignedDriver;

    @Column
    private String vehicleDetails;

    @Column
    private LocalDateTime actualStartingDate;

    @Column
    private LocalDateTime actualReturnDate;

    @Column
    private Double startingKilometers;

    @Column
    private Double endingKilometers;

    @Column
    private Double kmDifference;

    @Column
    private String cargoType;

    @Column
    private Double cargoWeight;

    @Column
    private Integer numberOfPassengers;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private String createdBy;

    private String authorizerName;

    private String assemblerName;

    @Column(length = 500)
    private String tripExplanation;

    @Column
    private Double accountNumber;

    public void addTraveler(String travelerName) {
        Traveler traveler = new Traveler();
        traveler.setName(travelerName);
        traveler.setTravelRequest(this);
        this.travelers.add(traveler);
    }

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED,ASSIGNED,COMPLETED, SUCCESED, FINISHED
    }
}