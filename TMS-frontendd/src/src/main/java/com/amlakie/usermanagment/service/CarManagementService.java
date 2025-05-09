package com.amlakie.usermanagment.service;

import com.amlakie.usermanagment.dto.AssignmentRequest;
import com.amlakie.usermanagment.dto.CarReqRes;
import com.amlakie.usermanagment.dto.RentCarReqRes;
import com.amlakie.usermanagment.entity.AssignmentHistory;
import com.amlakie.usermanagment.entity.Car;
import com.amlakie.usermanagment.entity.RentCar;
import com.amlakie.usermanagment.entity.TravelRequest;
import com.amlakie.usermanagment.repository.AssignmentHistoryRepository;
import com.amlakie.usermanagment.repository.CarRepository;
import com.amlakie.usermanagment.repository.RentCarRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CarManagementService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    RentCarRepository rentCarRepository;

    public CarReqRes registerCar(CarReqRes registrationRequest) {
        CarReqRes response = new CarReqRes();
        try {
            Car car = new Car();
            car.setPlateNumber(registrationRequest.getPlateNumber());
            car.setOwnerName(registrationRequest.getOwnerName());
            car.setOwnerPhone(registrationRequest.getOwnerPhone());
            car.setModel(registrationRequest.getModel());
            car.setCarType(registrationRequest.getCarType());
            car.setManufactureYear(Integer.parseInt(registrationRequest.getManufactureYear()));
            car.setMotorCapacity(registrationRequest.getMotorCapacity());
            car.setKmPerLiter(Float.parseFloat(registrationRequest.getKmPerLiter()));
            car.setTotalKm(registrationRequest.getTotalKm());
            car.setFuelType(registrationRequest.getFuelType());
            car.setStatus(registrationRequest.getStatus());
            car.setParkingLocation(registrationRequest.getParkingLocation());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            car.setCreatedBy(authentication.getName());

            Car savedCar = carRepository.save(car);
            response.setCar(savedCar);
            response.setMessage("Car Registered Successfully");
            response.setCodStatus(200);
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public CarReqRes getAllCars() {
        CarReqRes response = new CarReqRes();
        try {
            List<Car> cars = carRepository.findAll();
            response.setCarList(cars);
            response.setCodStatus(200);
            response.setMessage("All cars retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public CarReqRes getCarById(Long id) {
        CarReqRes response = new CarReqRes();
        try {
            Optional<Car> car = carRepository.findById(id);
            if (car.isPresent()) {
                response.setCar(car.get());
                response.setCodStatus(200);
                response.setMessage("Car retrieved successfully");
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

    public CarReqRes updateCar(Long id, CarReqRes updateRequest) {
        CarReqRes response = new CarReqRes();
        try {
            Optional<Car> carOptional = carRepository.findById(id);
            if (carOptional.isPresent()) {
                Car existingCar = carOptional.get();
                existingCar.setPlateNumber(updateRequest.getPlateNumber());
                existingCar.setOwnerName(updateRequest.getOwnerName());
                existingCar.setOwnerPhone(updateRequest.getOwnerPhone());
                existingCar.setModel(updateRequest.getModel());
                existingCar.setCarType(updateRequest.getCarType());
                existingCar.setManufactureYear(Integer.parseInt(updateRequest.getManufactureYear()));
                existingCar.setMotorCapacity(updateRequest.getMotorCapacity());
                existingCar.setKmPerLiter(Float.parseFloat(updateRequest.getKmPerLiter()));
                existingCar.setTotalKm(updateRequest.getTotalKm());
                existingCar.setFuelType(updateRequest.getFuelType());
                existingCar.setStatus(updateRequest.getStatus());
                existingCar.setParkingLocation(updateRequest.getParkingLocation());

                Car updatedCar = carRepository.save(existingCar);
                response.setCar(updatedCar);
                response.setCodStatus(200);
                response.setMessage("Car updated successfully");
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

    public CarReqRes deleteCar(Long id) {
        CarReqRes response = new CarReqRes();
        try {
            if (carRepository.existsById(id)) {
                carRepository.deleteById(id);
                response.setCodStatus(200);
                response.setMessage("Car deleteddddd successfully");
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

    public CarReqRes searchCars(String query) {
        CarReqRes response = new CarReqRes();
        try {
            List<Car> cars = carRepository.findByPlateNumberContainingOrOwnerNameContainingOrModelContaining(
                    query, query, query);
            response.setCarList(cars);
            response.setCodStatus(200);
            response.setMessage("Search results retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public CarReqRes updateStatus(String plateNumber, CarReqRes updateRequest) {
        CarReqRes response = new CarReqRes();
        try {
            Optional<Car> carOptional = carRepository.findByPlateNumber(plateNumber);
            if (carOptional.isPresent()) {
                Car existingCar = carOptional.get();
                existingCar.setStatus(updateRequest.getStatus());


                Car updatedCar = carRepository.save(existingCar);
                response.setCar(updatedCar);
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

    public CarReqRes getApprovedCars() {
        CarReqRes response = new CarReqRes();
        try {
            List<Car> cars = carRepository.findByStatus("Approved");
            response.setCarList(cars);
            response.setCodStatus(200);
            response.setMessage("Approved cars retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }


    @Transactional
    public CarReqRes createAssignment(AssignmentRequest request) {
        CarReqRes response = new CarReqRes();
        try {
            // Validate required fields
            if (request.getRequestLetterNo() == null || request.getRequestLetterNo().isEmpty()) {
                throw new IllegalArgumentException("Request letter number is required");
            }

            // Convert string date to LocalDateTime
            LocalDateTime requestDateTime = LocalDate.parse(request.getRequestDate())
                    .atStartOfDay();

            // Create new assignment history
            AssignmentHistory history = new AssignmentHistory();
            history.setRequestLetterNo(request.getRequestLetterNo());
            history.setRequestDate(requestDateTime);
            history.setAssignedDate(requestDateTime);
            history.setRequesterName(request.getRequesterName());
            history.setRentalType(request.getRentalType());
            history.setPosition(request.getPosition());
            history.setDepartment(request.getDepartment());
            history.setPhoneNumber(request.getPhoneNumber());
            history.setTravelWorkPercentage(request.getTravelWorkPercentage());
            history.setShortNoticePercentage(request.getShortNoticePercentage());
            history.setMobilityIssue(request.getMobilityIssue());
            history.setGender(request.getGender());
            history.setTotalPercentage(request.getTotalPercentage());
            history.setStatus(request.getStatus());

            // Set number of cars based on position
            if ("Level 1".equals(request.getPosition())) {
                history.setModel(request.getModel());
                history.setNumberOfCar(request.getNumberOfCar());
            } else {
                history.setNumberOfCar("1");
            }


            // Set number of cars based on positio

            // Process all vehicle assignments
            List<String> allPlateNumbers = new ArrayList<>();
            List<String> allCarModels = new ArrayList<>();

            try {
                // Handle single regular car assignment
                if (request.getCarId() != null) {
                    Car car = carRepository.findById(request.getCarId())
                            .orElseThrow(() -> new RuntimeException("Regular car not found with ID: " + request.getCarId()));
                    history.setCar(car);
                    allPlateNumbers.add(car.getPlateNumber());
                    allCarModels.add(car.getModel());
                }

                // Handle multiple regular cars
                if (request.getCarIds() != null && !request.getCarIds().isEmpty()) {
                    Set<Car> cars = new HashSet<>(carRepository.findAllById(request.getCarIds()));
                    if (cars.size() != request.getCarIds().size()) {
                        throw new RuntimeException("One or more regular cars not found");
                    }
                    history.setMultipleCars(cars);
                    cars.forEach(car -> {
                        allPlateNumbers.add(car.getPlateNumber());
                        allCarModels.add(car.getModel());
                    });
                }

                // Handle single rent car assignment
                if (request.getRentCarId() != null) {
                    RentCar rentCar = rentCarRepository.findById(request.getRentCarId())
                            .orElseThrow(() -> new RuntimeException("Rent car not found with ID: " + request.getRentCarId()));
                    history.setRentCar(rentCar);
                    allPlateNumbers.add(rentCar.getPlateNumber());
                    allCarModels.add(rentCar.getModel());
                }

                // Handle multiple rent cars
                if (request.getRentCarIds() != null && !request.getRentCarIds().isEmpty()) {
                    Set<Car> rentCars = new HashSet<>(carRepository.findAllById(request.getRentCarIds()));
                    if (rentCars.size() != request.getRentCarIds().size()) {
                        throw new RuntimeException("One or more rent cars not found");
                    }
                    history.setMultipleCars(rentCars);
                    rentCars.forEach(rentCar -> {
                        allPlateNumbers.add(rentCar.getPlateNumber());
                        allCarModels.add(rentCar.getModel());
                    });
                }

                // Set combined vehicle information
                if (!allPlateNumbers.isEmpty()) {
                    history.setAllPlateNumbers(String.join(", ", allPlateNumbers));
                    history.setAllCarModels(String.join(", ", allCarModels));
                }

                // Save the assignment
                assignmentHistoryRepository.save(history);

            } catch (Exception e) {
                // Explicitly set rollback-only if needed
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                throw e; // Re-throw the exception
            }

            // Prepare success response
            response.setCodStatus(200);
            response.setMessage("Assignment created successfully");
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("assignmentId", history.getId());
            responseData.put("totalVehiclesAssigned", allPlateNumbers.size());
            responseData.put("plateNumbers", history.getAllPlateNumbers());
            responseData.put("carModels", history.getAllCarModels());

        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    @Transactional
    public CarReqRes updateAssignmentHistory(Long id, AssignmentRequest updateRequest) {
        CarReqRes response = new CarReqRes();
        try {
            AssignmentHistory history = assignmentHistoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment history not found"));

            // Update basic information
            history.setAssignedDate(LocalDateTime.now());
            history.setStatus(updateRequest.getStatus());

            // Clear existing vehicle assignments if new ones are provided
            if (updateRequest.getCarId() != null || updateRequest.getCarIds() != null) {
                history.setCar(null);
                history.setMultipleCars(new HashSet<>());
            }
            if (updateRequest.getRentCarId() != null || updateRequest.getRentCarIds() != null) {
                history.setRentCar(null);
                history.setMultipleRentCars(new HashSet<>());
            }

            // Process vehicle assignments
            List<String> allPlateNumbers = new ArrayList<>();
            List<String> allCarModels = new ArrayList<>();

            // Handle single regular car assignment
            if (updateRequest.getCarId() != null) {
                Car car = carRepository.findById(updateRequest.getCarId())
                        .orElseThrow(() -> new RuntimeException("Regular car not found"));
                history.setCar(car);
                allPlateNumbers.add(car.getPlateNumber());
                allCarModels.add(car.getModel());
            }

            // Handle multiple regular cars
            if (updateRequest.getCarIds() != null && !updateRequest.getCarIds().isEmpty()) {
                Set<Car> cars = new HashSet<>(carRepository.findAllById(updateRequest.getCarIds()));
                if (cars.size() != updateRequest.getCarIds().size()) {
                    throw new RuntimeException("One or more regular cars not found");
                }
                history.setMultipleCars(cars);
                cars.forEach(car -> {
                    allPlateNumbers.add(car.getPlateNumber());
                    allCarModels.add(car.getModel());
                });
            }

            // Handle single rent car assignment
            if (updateRequest.getRentCarId() != null) {
                RentCar rentCar = rentCarRepository.findById(updateRequest.getRentCarId())
                        .orElseThrow(() -> new RuntimeException("Rent car not found"));
                history.setRentCar(rentCar);
                allPlateNumbers.add(rentCar.getPlateNumber());
                allCarModels.add(rentCar.getModel());
            }

            // Handle multiple rent cars
            if (updateRequest.getRentCarIds() != null && !updateRequest.getRentCarIds().isEmpty()) {
                Set<RentCar> rentCars = new HashSet<>(rentCarRepository.findAllById(updateRequest.getRentCarIds()));
                if (rentCars.size() != updateRequest.getRentCarIds().size()) {
                    throw new RuntimeException("One or more rent cars not found");
                }
                history.setMultipleRentCars(rentCars);
                rentCars.forEach(rentCar -> {
                    allPlateNumbers.add(rentCar.getPlateNumber());
                    allCarModels.add(rentCar.getModel());
                });
            }

            // Update combined vehicle information if any vehicles were assigned
            if (!allPlateNumbers.isEmpty()) {
                history.setPlateNumber(String.join(", ", allPlateNumbers));
                history.setAllPlateNumbers(String.join(", ", allPlateNumbers));
                history.setAllCarModels(String.join(", ", allCarModels));

                // Update number of cars for Level 1 positions
                if ("Level 1".equals(history.getPosition())) {
                    int totalCars = (history.getCar() != null ? 1 : 0) +
                            (history.getMultipleCars() != null ? history.getMultipleCars().size() : 0) +
                            (history.getRentCar() != null ? 1 : 0) +
                            (history.getMultipleRentCars() != null ? history.getMultipleRentCars().size() : 0);
                    history.setNumberOfCar(String.valueOf(totalCars));
                }
            }

            assignmentHistoryRepository.save(history);

            response.setCodStatus(200);
            response.setMessage("Assignment updated successfully");
            response.setAssignmentHistory(history);

        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public CarReqRes getAllAssignmentHistories() {
        CarReqRes response = new CarReqRes();
        try {
            List<AssignmentHistory> histories = assignmentHistoryRepository.findAll();
            response.setAssignmentHistoryList(histories);
            response.setCodStatus(200);
            response.setMessage("All assignment histories retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public CarReqRes getPendingRequests() {
        CarReqRes response = new CarReqRes();
        try {
            List<AssignmentHistory> histories = assignmentHistoryRepository.findByStatus("Pending");
            response.setAssignmentHistoryList(histories);
            response.setCodStatus(200);
            response.setMessage("Pending requests retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public CarReqRes getAssignmentHistoryById(Long id) {
        CarReqRes response = new CarReqRes();
        try {
            AssignmentHistory history = assignmentHistoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment history not found"));

            response.setAssignmentHistory(history);
            response.setCodStatus(200);
            response.setMessage("Assignment history retrieved successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public CarReqRes deleteAssignmentHistory(Long id) {
        CarReqRes response = new CarReqRes();
        try {
            AssignmentHistory history = assignmentHistoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment history not found"));

            // Release the associated car
            Car car = history.getCar();
            car.setStatus("Approved");
            carRepository.save(car);

            // Delete the history
            assignmentHistoryRepository.delete(history);

            response.setCodStatus(200);
            response.setMessage("Assignment history deleted successfully");
        } catch (Exception e) {
            response.setCodStatus(500);
            response.setError(e.getMessage());
        }
        return response;
    }


}