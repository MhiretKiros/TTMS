package com.amlakie.usermanagment.controller;

import com.amlakie.usermanagment.dto.AssignmentRequest;
import com.amlakie.usermanagment.dto.CarReqRes;
import com.amlakie.usermanagment.dto.OrganizationCarReqRes;
import com.amlakie.usermanagment.service.CarManagementService;
import jakarta.validation.Valid;
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
    @PutMapping("/auth/car/status/{plateNumber}")
    public ResponseEntity<CarReqRes> updateStatus(@PathVariable String plateNumber, @RequestBody CarReqRes updateRequest) {
        return ResponseEntity.ok(carManagementService.updateStatus(plateNumber, updateRequest));
    }

    // Add these new endpoints to CarManagementController
    @PostMapping("/auth/car/assign")
    public ResponseEntity<CarReqRes> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(carManagementService.createAssignment(request));
    }

    @GetMapping("/auth/car/approved")
    public ResponseEntity<CarReqRes> getApprovedCars() {
        return ResponseEntity.ok(carManagementService.getApprovedCars());
    }


    // Assignment History Endpoints
    @GetMapping("/auth/assignment/all")
    public ResponseEntity<CarReqRes> getAllAssignmentHistories() {
        return ResponseEntity.ok(carManagementService.getAllAssignmentHistories());
    }

    @GetMapping("/auth/assignments/pending")
    public ResponseEntity<CarReqRes> getPendingCars() {
        return ResponseEntity.ok(carManagementService.getPendingRequests());
    }

    @PutMapping("/auth/car/assignments/update/{id}")
    public ResponseEntity<CarReqRes> updateAssignmentHistory(@PathVariable Long id, @RequestBody AssignmentRequest updateRequest) {
        return ResponseEntity.ok(carManagementService.updateAssignmentHistory(id, updateRequest));
    }

    @GetMapping("/auth/assignment/{id}")
    public ResponseEntity<CarReqRes> getAssignmentHistoryById(@PathVariable Long id) {
        return ResponseEntity.ok(carManagementService.getAssignmentHistoryById(id));
    }



    @DeleteMapping("/auth/assignment/delete/{id}")
    public ResponseEntity<CarReqRes> deleteAssignmentHistory(@PathVariable Long id) {
        return ResponseEntity.ok(carManagementService.deleteAssignmentHistory(id));
    }
}