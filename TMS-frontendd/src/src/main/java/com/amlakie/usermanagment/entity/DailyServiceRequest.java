package com.amlakie.usermanagment.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// DailyServiceRequest.java (Entity)
@Entity
@Table(name = "daily_service_requests")
@Data
public class DailyServiceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @ElementCollection
    @CollectionTable(name = "daily_service_travelers", joinColumns = @JoinColumn(name = "request_id"))
    private List<String> travelers = new ArrayList<>();

    @Column(nullable = false)
    private String startingPlace;

    @Column(nullable = false)
    private String endingPlace;

    @Column(nullable = false)
    private String claimantName;

    private String driverName;
    private Double startKm;
    private Double endKm;
    private Double kmDifference;
    private String carType;
    private String plateNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    public enum RequestStatus {
        PENDING, ASSIGNED, COMPLETED
    }
}