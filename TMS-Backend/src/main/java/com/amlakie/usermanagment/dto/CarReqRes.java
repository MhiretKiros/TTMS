package com.amlakie.usermanagment.dto;


import com.amlakie.usermanagment.entity.Car;
import lombok.Data;

import java.util.List;

@Data
public class CarReqRes {
    private int codStatus;
    private String message;
    private String error;
    private String token;
    private String refreshedToken;
    private String expirationTime;
    private Car car;
    private List<Car> carList;

    // Car fields
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
}
