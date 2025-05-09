package com.amlakie.usermanagment.service;

import com.amlakie.usermanagment.dto.OrganizationCarReqRes;
import com.amlakie.usermanagment.entity.OrganizationCar;
import com.amlakie.usermanagment.repository.OrganizationCarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrganizationCarManagementService {

    @Autowired
    private OrganizationCarRepository organizationCarRepository;

    public OrganizationCarReqRes registerOrganizationCar(OrganizationCarReqRes registrationRequest) {
        OrganizationCarReqRes response = new OrganizationCarReqRes();
        try {
            OrganizationCar organizationCar = new OrganizationCar();
            organizationCar.setPlateNumber(registrationRequest.getPlateNumber());
            organizationCar.setOwnerName(registrationRequest.getOwnerName());
            organizationCar.setOwnerPhone(registrationRequest.getOwnerPhone());
            organizationCar.setModel(registrationRequest.getModel());
            organizationCar.setCarType(registrationRequest.getCarType());
            organizationCar.setManufactureYear(registrationRequest.getManufactureYear());
            organizationCar.setMotorCapacity(registrationRequest.getMotorCapacity());
            organizationCar.setKmPerLiter(registrationRequest.getKmPerLiter());
            organizationCar.setTotalKm(registrationRequest.getTotalKm());
            organizationCar.setFuelType(registrationRequest.getFuelType());
            organizationCar.setStatus(registrationRequest.getStatus());
            organizationCar.setParkingLocation(registrationRequest.getParkingLocation());
            organizationCar.setDriverName(registrationRequest.getDriverName());
            organizationCar.setDriverAttributes(registrationRequest.getDriverAttributes());
            organizationCar.setDriverAddress(registrationRequest.getDriverAddress());
            organizationCar.setLoadCapacity(registrationRequest.getLoadCapacity());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            organizationCar.setCreatedBy(authentication.getName());

            OrganizationCar savedCar = organizationCarRepository.save(organizationCar);
            response.setOrganizationCar(savedCar);
            response.setMessage("Organization Car Registered Successfully");
            response.setCodStatus(200);

        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public OrganizationCarReqRes getAllOrganizationCars() {
        OrganizationCarReqRes response = new OrganizationCarReqRes();
        try {
            List<OrganizationCar> cars = organizationCarRepository.findAll();
            response.setOrganizationCarList(cars);
            response.setCodStatus(200);
            response.setMessage("All organization cars retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public OrganizationCarReqRes getOrganizationCarById(Long id) {
        OrganizationCarReqRes response = new OrganizationCarReqRes();
        try {
            Optional<OrganizationCar> car = organizationCarRepository.findById(id);
            if (car.isPresent()) {
                response.setOrganizationCar(car.get());
                response.setCodStatus(200);
                response.setMessage("Organization car retrieved successfully");
            } else {
                response.setCodStatus(404);
                response.setMessage("Organization car not found");
            }
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public OrganizationCarReqRes updateOrganizationCar(Long id, OrganizationCarReqRes updateRequest) {
        OrganizationCarReqRes response = new OrganizationCarReqRes();
        try {
            Optional<OrganizationCar> carOptional = organizationCarRepository.findById(id);
            if (carOptional.isPresent()) {
                OrganizationCar existingCar = carOptional.get();
                existingCar.setPlateNumber(updateRequest.getPlateNumber());
                existingCar.setOwnerName(updateRequest.getOwnerName());
                existingCar.setOwnerPhone(updateRequest.getOwnerPhone());
                existingCar.setModel(updateRequest.getModel());
                existingCar.setCarType(updateRequest.getCarType());
                existingCar.setManufactureYear(updateRequest.getManufactureYear());
                existingCar.setMotorCapacity(updateRequest.getMotorCapacity());
                existingCar.setKmPerLiter(updateRequest.getKmPerLiter());
                existingCar.setTotalKm(updateRequest.getTotalKm());
                existingCar.setFuelType(updateRequest.getFuelType());
                existingCar.setStatus(updateRequest.getStatus());
                existingCar.setParkingLocation(updateRequest.getParkingLocation());
                existingCar.setDriverName(updateRequest.getDriverName());
                existingCar.setDriverAttributes(updateRequest.getDriverAttributes());
                existingCar.setDriverAddress(updateRequest.getDriverAddress());
                existingCar.setLoadCapacity(updateRequest.getLoadCapacity());

                OrganizationCar updatedCar = organizationCarRepository.save(existingCar);
                response.setOrganizationCar(updatedCar);
                response.setCodStatus(200);
                response.setMessage("Organization car updated successfully");
            } else {
                response.setCodStatus(404);
                response.setMessage("Organization car not found");
            }
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public OrganizationCarReqRes deleteOrganizationCar(Long id) {
        OrganizationCarReqRes response = new OrganizationCarReqRes();
        try {
            if (organizationCarRepository.existsById(id)) {
                organizationCarRepository.deleteById(id);
                response.setCodStatus(200);
                response.setMessage("Organization car deleted successfully");
            } else {
                response.setCodStatus(404);
                response.setMessage("Organization car not found");
            }
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public OrganizationCarReqRes searchOrganizationCars(String query) {
        OrganizationCarReqRes response = new OrganizationCarReqRes();
        try {
            List<OrganizationCar> cars = organizationCarRepository
                    .findByPlateNumberContainingOrOwnerNameContainingOrModelContainingOrDriverNameContaining(
                            query, query, query, query);
            response.setOrganizationCarList(cars);
            response.setCodStatus(200);
            response.setMessage("Search results retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public OrganizationCarReqRes updateStatus(String plateNumber, OrganizationCarReqRes updateRequest) {
        OrganizationCarReqRes response = new OrganizationCarReqRes();
        try {
            Optional<OrganizationCar> carOptional = organizationCarRepository.findByPlateNumber(plateNumber);
            if (carOptional.isPresent()) {
                OrganizationCar existingCar = carOptional.get();
                existingCar.setStatus(updateRequest.getStatus());
                OrganizationCar updatedCar = organizationCarRepository.save(existingCar);
                response.setOrganizationCar(updatedCar);
                response.setCodStatus(200);
                response.setMessage("Organization car Status Updated successfully");
            } else {
                response.setCodStatus(404);
                response.setMessage("Organization car not found");
            }
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }
}