package com.amlakie.usermanagment.controller;

import com.amlakie.usermanagment.dto.CarReqRes;
import com.amlakie.usermanagment.dto.ReqRes;
import com.amlakie.usermanagment.service.CarManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class CarManagementController {

    @Autowired
    private CarManagementService carManagementService;

    /**
     * Register a new user.
     *
     * @param registrationRequest The registration request containing user details.
     * @return A response indicating the result of the registration.
     */
    @PostMapping("/auth/car/register")
    public CarReqRes registerCar(@RequestBody CarReqRes registrationRequest) {
        return carManagementService.registerCar(registrationRequest);
    }
    @GetMapping("/auth/car/all")
    public ResponseEntity<CarReqRes> getAllCars() {
        return ResponseEntity.ok(carManagementService.getAllCars());
    }

    @GetMapping("/auth/car/{id}")
    public ResponseEntity<CarReqRes> getCarById(@PathVariable Long id) {
        return ResponseEntity.ok(carManagementService.getCarById(id));
    }

    @PutMapping("/auth/car/update/{id}")
    public ResponseEntity<CarReqRes> updateCar(@PathVariable Long id, @RequestBody CarReqRes updateRequest) {
        return ResponseEntity.ok(carManagementService.updateCar(id, updateRequest));
    }

    @DeleteMapping("/auth/car/delete/{id}")
    public ResponseEntity<CarReqRes> deleteCar(@PathVariable Long id) {
        return ResponseEntity.ok(carManagementService.deleteCar(id));
    }

    @GetMapping("/auth/car/search")
    public ResponseEntity<CarReqRes> searchCars(@RequestParam String query) {
        return ResponseEntity.ok(carManagementService.searchCars(query));
    }
}
