package com.amlakie.usermanagment.controller;

import com.amlakie.usermanagment.dto.AssignmentRequest;
import com.amlakie.usermanagment.dto.CarReqRes;
import com.amlakie.usermanagment.dto.OrganizationCarReqRes;
import com.amlakie.usermanagment.dto.RentCarReqRes;
import com.amlakie.usermanagment.service.RentCarManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/rent-car")
public class RentCarManagementController {

    @Autowired
    private RentCarManagementService rentCarManagementService;

    @PostMapping("/register")
    public RentCarReqRes registerRentCar(@RequestBody RentCarReqRes registrationRequest) {
        return rentCarManagementService.registerRentCar(registrationRequest);
    }

    @GetMapping("/all")
    public ResponseEntity<RentCarReqRes> getAllRentCars() {
        return ResponseEntity.ok(rentCarManagementService.getAllRentCars());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentCarReqRes> getRentCarById(@PathVariable Long id) {
        return ResponseEntity.ok(rentCarManagementService.getRentCarById(id));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RentCarReqRes> updateRentCar(@PathVariable Long id, @RequestBody RentCarReqRes updateRequest) {
        return ResponseEntity.ok(rentCarManagementService.updateRentCar(id, updateRequest));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RentCarReqRes> deleteRentCar(@PathVariable Long id) {
        return ResponseEntity.ok(rentCarManagementService.deleteRentCar(id));
    }

    @GetMapping("/search")
    public ResponseEntity<RentCarReqRes> searchRentCars(@RequestParam String query) {
        return ResponseEntity.ok(rentCarManagementService.searchRentCars(query));
    }

    @PutMapping("/status/{plateNumber}")
    public ResponseEntity<RentCarReqRes> updateStatus(@PathVariable String plateNumber, @RequestBody RentCarReqRes updateRequest) {
        return ResponseEntity.ok(rentCarManagementService.updateStatus(plateNumber, updateRequest));
    }

    // Add these new endpoints to CarManagementController
    @PostMapping("/assign")
    public ResponseEntity<RentCarReqRes> createAssignment(@RequestBody AssignmentRequest assignmentRequest) {
        return ResponseEntity.ok(rentCarManagementService.createAssignment(assignmentRequest));
    }

    @PutMapping("/assignments/update/{id}")
    public ResponseEntity<RentCarReqRes> updateAssignmentHistory(@PathVariable Long id, @RequestBody AssignmentRequest updateRequest) {
        return ResponseEntity.ok(rentCarManagementService.updateAssignmentHistory(id, updateRequest));
    }

    @GetMapping("/approved")
    public ResponseEntity<RentCarReqRes> getApprovedCars() {
        return ResponseEntity.ok(rentCarManagementService.getApprovedCars());
    }

    @PutMapping("/update/{platenumber}")
    public ResponseEntity<RentCarReqRes> updateStatus(@PathVariable Long id, @RequestBody RentCarReqRes updateRequest) {
        return ResponseEntity.ok(rentCarManagementService.updateRentCar(id, updateRequest));
    }

}