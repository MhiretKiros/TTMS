package com.amlakie.usermanagment.controller;

import com.amlakie.usermanagment.dto.CarInspectionReqRes;
import com.amlakie.usermanagment.dto.CarInspectionListResponse;
import com.amlakie.usermanagment.exception.ResourceNotFoundException; // Assuming you have this
import com.amlakie.usermanagment.service.CarInspectionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.net.URI;

@RestController
@RequestMapping("/api/inspections")
public class CarInspectionController {

    @Autowired
    private CarInspectionService inspectionService;

    @PostMapping("/create")
    public ResponseEntity<CarInspectionReqRes> createInspection(@Valid @RequestBody CarInspectionReqRes request) {
        CarInspectionReqRes createdInspection = inspectionService.createInspection(request);

        // Build the URI for the Location header
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdInspection.getId()) // Assuming your DTO has getId()
                .toUri();

        // Return 201 Created status with Location header and response body
        return ResponseEntity.created(location).body(createdInspection);
    }

    @GetMapping("/get-all")
    public ResponseEntity<CarInspectionListResponse> getAllInspections() {
        // OK is appropriate here
        return ResponseEntity.ok(inspectionService.getAllInspections());
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<CarInspectionReqRes> getInspectionById(@PathVariable Long id) {
        try {
            // Assuming service throws ResourceNotFoundException if not found
            CarInspectionReqRes inspection = inspectionService.getInspectionById(id);
            return ResponseEntity.ok(inspection);
        } catch (ResourceNotFoundException e) {
            // Return 404 if the resource is not found
            return ResponseEntity.notFound().build();
        }
        // Consider adding a catch block for other potential exceptions -> 500 Internal Server Error
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CarInspectionReqRes> updateInspection(
            @PathVariable Long id,
            @Valid @RequestBody CarInspectionReqRes request) { // Add @Valid
        try {
            // Assuming service throws ResourceNotFoundException if ID doesn't exist
            CarInspectionReqRes updatedInspection = inspectionService.updateInspection(id, request);
            return ResponseEntity.ok(updatedInspection);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
        // Add catch blocks for validation errors (if not handled globally) or other exceptions
    }

    @GetMapping("/by-plate/{plateNumber}")
    public ResponseEntity<CarInspectionListResponse> getInspectionsByPlateNumber(
            @PathVariable String plateNumber) {
        // OK is generally fine even if the list is empty
        return ResponseEntity.ok(inspectionService.getInspectionsByPlateNumber(plateNumber));
        // Alternatively, you could check if the list is empty and return 404,
        // but that's less common for collection endpoints based on criteria.
    }
}
