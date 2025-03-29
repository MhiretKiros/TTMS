package com.amlakie.usermanagment.service;

import com.amlakie.usermanagment.dto.CarReqRes;
import com.amlakie.usermanagment.entity.Car;
import com.amlakie.usermanagment.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CarManagementService {

    @Autowired
    private CarRepository carRepository;

    public CarReqRes registerCar(CarReqRes registrationRequest) {
        CarReqRes response = new CarReqRes();
        try {
            Car car = new Car();
            car.setPlateNumber(registrationRequest.getPlateNumber());
            car.setOwnerName(registrationRequest.getOwnerName());
            car.setOwnerPhone(registrationRequest.getOwnerPhone());
            car.setModel(registrationRequest.getModel());
            car.setCarType(registrationRequest.getCarType());
            car.setManufactureYear(registrationRequest.getManufactureYear());
            car.setMotorCapacity(registrationRequest.getMotorCapacity());
            car.setKmPerLiter(registrationRequest.getKmPerLiter());
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
                existingCar.setManufactureYear(updateRequest.getManufactureYear());
                existingCar.setMotorCapacity(updateRequest.getMotorCapacity());
                existingCar.setKmPerLiter(updateRequest.getKmPerLiter());
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
                response.setMessage("Car deleted successfully");
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
}
