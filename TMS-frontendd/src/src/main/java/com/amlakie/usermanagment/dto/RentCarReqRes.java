package com.amlakie.usermanagment.dto;

import com.amlakie.usermanagment.entity.RentCar;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class RentCarReqRes {
    private int codStatus;
    private String message;
    private String error;
    private String token;
    private String refreshedToken;
    private String expirationTime;
    private RentCar rentCar;
    private List<RentCar> rentCarList;

    // Rent Car fields
    private String frameNo;
    private String companyName;
    private String vehiclesUsed;
    private String bodyType;
    private String model;
    private String motorNumber;
    private String proYear;
    private String cc;
    private String department;
    private String vehiclesType;
    private String plateNumber;
    private String color;
    private String door;
    private String cylinder;
    private String fuelType;
    private String vehiclesStatus;
    private String otherDescription;
    private String radio;
    private String antena;
    private String krik;
    private String krikManesha;
    private String tyerStatus;
    private String gomaMaficha;
    private String mefcha;
    private String reserveTayer;
    private String gomaGet;
    private String pinsa;
    private String kacavite;
    private String fireProtection;
    private String source;
    private String vehiclesDonorName;
    private LocalDate dateOfIn;
    private LocalDate dateOfOut;
    private String vehiclesPhoto;
    private String vehiclesUserName;
    private String position;
    private String libre;
    private String transmission;
    private String dataAntollerNatue;
    private String km;
    private String status;
}