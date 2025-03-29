package com.amlakie.usermanagment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

@Entity
@Table(name = "cars")
@Data
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String plateNumber;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String ownerPhone;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private String carType;

    @Column(nullable = false)
    private String manufactureYear;

    @Column(nullable = false)
    private String motorCapacity;

    @Column(nullable = false)
    private String kmPerLiter;

    @Column(nullable = false)
    private String totalKm;

    @Column(nullable = false)
    private String fuelType;

    @Column(nullable = false)
    private String status = "Pending";

    @Column(nullable = false)
    private LocalDateTime registeredDate = LocalDateTime.now();

    @Column(nullable = false)
    private String parkingLocation;

    @Column(nullable = false)
    private String createdBy;
}