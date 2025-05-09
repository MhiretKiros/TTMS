package com.amlakie.usermanagment.controller;

import com.amlakie.usermanagment.dto.organization.OrganizationCarInspectionListResponse;
import com.amlakie.usermanagment.dto.organization.OrganizationCarInspectionReqRes;
import com.amlakie.usermanagment.exception.ResourceNotFoundException; // Assuming you have this
import com.amlakie.usermanagment.service.OrganizationCarInspectionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.net.URI;

@RestController
@RequestMapping("/api/org-inspections")
public class OrganizationCarInspectionController {

    @Autowired
    private OrganizationCarInspectionService OrgInspectionService;

    @PostMapping("/create")
    public ResponseEntity<OrganizationCarInspectionReqRes> createOrgInspection(@RequestBody OrganizationCarInspectionReqRes request) {
        OrganizationCarInspectionReqRes createdInspection = OrgInspectionService.createInspection(request);

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
    public ResponseEntity<OrganizationCarInspectionListResponse> getAllInspections() {
        // OK is appropriate here
        return ResponseEntity.ok(OrgInspectionService.getAllInspections());
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<OrganizationCarInspectionReqRes> getInspectionById(@PathVariable Long id) {
        try {
            // Assuming service throws ResourceNotFoundException if not found
            OrganizationCarInspectionReqRes inspection = OrgInspectionService.getInspectionById(id);
            return ResponseEntity.ok(inspection);
        } catch (ResourceNotFoundException e) {
            // Return 404 if the resource is not found
            return ResponseEntity.notFound().build();
        }
        // Consider adding a catch block for other potential exceptions -> 500 Internal Server Error
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<OrganizationCarInspectionReqRes> updateInspection(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationCarInspectionReqRes request) { // Add @Valid
        try {
            // Assuming service throws ResourceNotFoundException if ID doesn't exist
            OrganizationCarInspectionReqRes updatedInspection = OrgInspectionService.updateInspection(id, request);
            return ResponseEntity.ok(updatedInspection);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
        // Add catch blocks for validation errors (if not handled globally) or other exceptions
    }

    @GetMapping("/by-plate/{plateNumber}")
    public ResponseEntity<OrganizationCarInspectionListResponse> getInspectionsByPlateNumber(
            @PathVariable String plateNumber) {
        // OK is generally fine even if the list is empty
        return ResponseEntity.ok(OrgInspectionService.getInspectionsByPlateNumber(plateNumber));
        // Alternatively, you could check if the list is empty and return 404,
        // but that's less common for collection endpoints based on criteria.
    }
}
