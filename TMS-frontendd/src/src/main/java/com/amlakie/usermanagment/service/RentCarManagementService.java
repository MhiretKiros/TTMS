package com.amlakie.usermanagment.service;

import com.amlakie.usermanagment.dto.AssignmentRequest;
import com.amlakie.usermanagment.dto.CarReqRes;
import com.amlakie.usermanagment.dto.RentCarReqRes;
import com.amlakie.usermanagment.entity.AssignmentHistory;
import com.amlakie.usermanagment.entity.Car;
import com.amlakie.usermanagment.entity.RentCar;
import com.amlakie.usermanagment.repository.AssignmentHistoryRepository;
import com.amlakie.usermanagment.repository.RentCarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RentCarManagementService {

    @Autowired
    private RentCarRepository rentCarRepository;

    public RentCarReqRes registerRentCar(RentCarReqRes registrationRequest) {
        RentCarReqRes response = new RentCarReqRes();
        try {
            RentCar rentCar = new RentCar();
            // Set all fields from registrationRequest to rentCar
            rentCar.setFrameNo(registrationRequest.getFrameNo());
            rentCar.setCompanyName(registrationRequest.getCompanyName());
            rentCar.setVehiclesUsed(registrationRequest.getVehiclesUsed());
            rentCar.setBodyType(registrationRequest.getBodyType());
            rentCar.setModel(registrationRequest.getModel());
            rentCar.setMotorNumber(registrationRequest.getMotorNumber());
            rentCar.setProYear(registrationRequest.getProYear());
            rentCar.setCc(registrationRequest.getCc());
            rentCar.setDepartment(registrationRequest.getDepartment());
            rentCar.setVehiclesType(registrationRequest.getVehiclesType());
            rentCar.setPlateNumber(registrationRequest.getPlateNumber());
            rentCar.setColor(registrationRequest.getColor());
            rentCar.setDoor(registrationRequest.getDoor());
            rentCar.setCylinder(registrationRequest.getCylinder());
            rentCar.setFuelType(registrationRequest.getFuelType());
            rentCar.setStatus(registrationRequest.getVehiclesStatus());
            rentCar.setOtherDescription(registrationRequest.getOtherDescription());
            rentCar.setRadio(registrationRequest.getRadio());
            rentCar.setAntena(registrationRequest.getAntena());
            rentCar.setKrik(registrationRequest.getKrik());
            rentCar.setKrikManesha(registrationRequest.getKrikManesha());
            rentCar.setTyerStatus(registrationRequest.getTyerStatus());
            rentCar.setGomaMaficha(registrationRequest.getGomaMaficha());
            rentCar.setMefcha(registrationRequest.getMefcha());
            rentCar.setReserveTayer(registrationRequest.getReserveTayer());
            rentCar.setGomaGet(registrationRequest.getGomaGet());
            rentCar.setPinsa(registrationRequest.getPinsa());
            rentCar.setKacavite(registrationRequest.getKacavite());
            rentCar.setFireProtection(registrationRequest.getFireProtection());
            rentCar.setSource(registrationRequest.getSource());
            rentCar.setVehiclesDonorName(registrationRequest.getVehiclesDonorName());
            rentCar.setDateOfIn(registrationRequest.getDateOfIn());
            rentCar.setDateOfOut(registrationRequest.getDateOfOut());
            rentCar.setVehiclesPhoto(registrationRequest.getVehiclesPhoto());
            rentCar.setVehiclesUserName(registrationRequest.getVehiclesUserName());
            rentCar.setPosition(registrationRequest.getPosition());
            rentCar.setLibre(registrationRequest.getLibre());
            rentCar.setTransmission(registrationRequest.getTransmission());
            rentCar.setDataAntollerNatue(registrationRequest.getDataAntollerNatue());
            rentCar.setKm(registrationRequest.getKm());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            rentCar.setCreatedBy(authentication.getName());

            RentCar savedCar = rentCarRepository.save(rentCar);
            response.setRentCar(savedCar);
            response.setMessage("Rent Car Registered Successfully");
            response.setCodStatus(200);
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public RentCarReqRes getAllRentCars() {
        RentCarReqRes response = new RentCarReqRes();
        try {
            List<RentCar> cars = rentCarRepository.findAll();
            response.setRentCarList(cars);
            response.setCodStatus(200);
            response.setMessage("All rent cars retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public RentCarReqRes getRentCarById(Long id) {
        RentCarReqRes response = new RentCarReqRes();
        try {
            Optional<RentCar> car = rentCarRepository.findById(id);
            if (car.isPresent()) {
                response.setRentCar(car.get());
                response.setCodStatus(200);
                response.setMessage("Rent car retrieved successfully");
            } else {
                response.setCodStatus(404);
                response.setMessage("Rent car not found");
            }
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public RentCarReqRes updateRentCar(Long id, RentCarReqRes updateRequest) {
        RentCarReqRes response = new RentCarReqRes();
        try {
            Optional<RentCar> carOptional = rentCarRepository.findById(id);
            if (carOptional.isPresent()) {
                RentCar existingCar = carOptional.get();
                // Update all fields from updateRequest to existingCar
                existingCar.setFrameNo(updateRequest.getFrameNo());
                existingCar.setCompanyName(updateRequest.getCompanyName());
                existingCar.setVehiclesUsed(updateRequest.getVehiclesUsed());
                existingCar.setBodyType(updateRequest.getBodyType());
                existingCar.setModel(updateRequest.getModel());
                existingCar.setMotorNumber(updateRequest.getMotorNumber());
                existingCar.setProYear(updateRequest.getProYear());
                existingCar.setCc(updateRequest.getCc());
                existingCar.setDepartment(updateRequest.getDepartment());
                existingCar.setVehiclesType(updateRequest.getVehiclesType());
                existingCar.setPlateNumber(updateRequest.getPlateNumber());
                existingCar.setColor(updateRequest.getColor());
                existingCar.setDoor(updateRequest.getDoor());
                existingCar.setCylinder(updateRequest.getCylinder());
                existingCar.setFuelType(updateRequest.getFuelType());
                existingCar.setStatus(updateRequest.getVehiclesStatus());
                existingCar.setOtherDescription(updateRequest.getOtherDescription());
                existingCar.setRadio(updateRequest.getRadio());
                existingCar.setAntena(updateRequest.getAntena());
                existingCar.setKrik(updateRequest.getKrik());
                existingCar.setKrikManesha(updateRequest.getKrikManesha());
                existingCar.setTyerStatus(updateRequest.getTyerStatus());
                existingCar.setGomaMaficha(updateRequest.getGomaMaficha());
                existingCar.setMefcha(updateRequest.getMefcha());
                existingCar.setReserveTayer(updateRequest.getReserveTayer());
                existingCar.setGomaGet(updateRequest.getGomaGet());
                existingCar.setPinsa(updateRequest.getPinsa());
                existingCar.setKacavite(updateRequest.getKacavite());
                existingCar.setFireProtection(updateRequest.getFireProtection());
                existingCar.setSource(updateRequest.getSource());
                existingCar.setVehiclesDonorName(updateRequest.getVehiclesDonorName());
                existingCar.setDateOfIn(updateRequest.getDateOfIn());
                existingCar.setDateOfOut(updateRequest.getDateOfOut());
                existingCar.setVehiclesPhoto(updateRequest.getVehiclesPhoto());
                existingCar.setVehiclesUserName(updateRequest.getVehiclesUserName());
                existingCar.setPosition(updateRequest.getPosition());
                existingCar.setLibre(updateRequest.getLibre());
                existingCar.setTransmission(updateRequest.getTransmission());
                existingCar.setDataAntollerNatue(updateRequest.getDataAntollerNatue());
                existingCar.setKm(updateRequest.getKm());

                RentCar updatedCar = rentCarRepository.save(existingCar);
                response.setRentCar(updatedCar);
                response.setCodStatus(200);
                response.setMessage("Rent car updated successfully");
            } else {
                response.setCodStatus(404);
                response.setMessage("Rent car not found");
            }
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public RentCarReqRes deleteRentCar(Long id) {
        RentCarReqRes response = new RentCarReqRes();
        try {
            if (rentCarRepository.existsById(id)) {
                rentCarRepository.deleteById(id);
                response.setCodStatus(200);
                response.setMessage("Rent car deleted successfully");
            } else {
                response.setCodStatus(404);
                response.setMessage("Rent car not found");
            }
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public RentCarReqRes searchRentCars(String query) {
        RentCarReqRes response = new RentCarReqRes();
        try {
            List<RentCar> cars = rentCarRepository
                    .findByPlateNumberContainingOrCompanyNameContainingOrModelContainingOrVehiclesUserNameContaining(
                            query, query, query, query);
            response.setRentCarList(cars);
            response.setCodStatus(200);
            response.setMessage("Search results retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public RentCarReqRes updateAssignmentHistory(Long id, AssignmentRequest updateRequest) {
        RentCarReqRes response = new RentCarReqRes();
        try {
            AssignmentHistory history = assignmentHistoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment history not found"));

            // Update history fields
            history.setAssignedDate( LocalDateTime.now());
            history.setRentalType(updateRequest.getRentalType());
            history.setPlateNumber(updateRequest.getPlateNumber());
            history.setStatus(updateRequest.getStatus());


            // Update car if changed
            RentCar cars = rentCarRepository.findById(updateRequest.getCarId())
                    .orElseThrow(() -> new RuntimeException("Car not found"));
            history.setCars(cars);

            assignmentHistoryRepository.save(history);

            // Update car status
            cars.setStatus("Assigned");
            rentCarRepository.save(cars);

            response.setCodStatus(200);
            response.setMessage("Assignment created successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }


    public RentCarReqRes updateStatus(String plateNumber, RentCarReqRes updateRequest) {
        RentCarReqRes response = new RentCarReqRes();
        try {
            Optional<RentCar> carOptional = rentCarRepository.findByPlateNumber(plateNumber);
            if (carOptional.isPresent()) {
                RentCar existingCar = carOptional.get();
                existingCar.setStatus(updateRequest.getStatus());


                RentCar updatedCar = rentCarRepository.save(existingCar);
                response.setRentCar(updatedCar);
                response.setCodStatus(200);
                response.setMessage("Car status updated successfully");
            } else {
                response.setCodStatus(404);
                response.setMessage("Car not found");
            }
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    // Add these methods to CarManagementService
    @Autowired
    private AssignmentHistoryRepository assignmentHistoryRepository;

    public RentCarReqRes getApprovedCars() {
        RentCarReqRes response = new RentCarReqRes();
        try {
            List<RentCar> cars = rentCarRepository.findByStatus("Approved");
            response.setRentCarList(cars);
            response.setCodStatus(200);
            response.setMessage("Approved cars retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public RentCarReqRes createAssignment(AssignmentRequest request) {
        RentCarReqRes response = new RentCarReqRes();
        try {
            // Create assignment history
            AssignmentHistory history = new AssignmentHistory();
            history.setRequestLetterNo(request.getRequestLetterNo());
            history.setRequestDate(LocalDateTime.parse(request.getRequestDate()));
            history.setAssignedDate(LocalDateTime.parse(request.getAssignedDate()));
            history.setRequesterName(request.getRequesterName());
            history.setRentalType(request.getRentalType());
            history.setPosition(request.getPosition());
            history.setDepartment(request.getDepartment());
            history.setPhoneNumber(request.getPhoneNumber());
            history.setPlateNumber(request.getPlateNumber());
            history.setTravelWorkPercentage(request.getTravelWorkPercentage());
            history.setShortNoticePercentage(request.getShortNoticePercentage());
            history.setMobilityIssue(request.getMobilityIssue());
            history.setGender(request.getGender());
            history.setTotalPercentage(request.getTotalPercentage());

            RentCar cars = rentCarRepository.findById(request.getCarId())
                    .orElseThrow(() -> new RuntimeException("Car not found"));
            history.setCars(cars);

            assignmentHistoryRepository.save(history);

            // Update car status
            cars.setStatus("Assigned");
            rentCarRepository.save(cars);

            response.setCodStatus(200);
            response.setMessage("Assignment created successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }
}