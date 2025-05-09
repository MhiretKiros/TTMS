package com.amlakie.usermanagment.dto;

import com.amlakie.usermanagment.entity.OrganizationCar;
import lombok.Data;

import java.util.List;

@Data
public class OrganizationCarReqRes {
    private int codStatus;
    private String message;
    private String error;
    private String token;
    private String refreshedToken;

    private String expirationTime;
    private OrganizationCar organizationCar;
    private List<OrganizationCar> organizationCarList;

    // Organization Car fields
    private String plateNumber;
    private String ownerName;
    private String ownerPhone;
    private String model;
    private String carType;
    private String manufactureYear;
    private String motorCapacity;
    private String kmPerLiter;
    private String totalKm;
    private String fuelType;
    private String status;
    private String parkingLocation;
    private String driverName;
    private String driverAttributes;
    private String driverAddress;
    private String loadCapacity;
}