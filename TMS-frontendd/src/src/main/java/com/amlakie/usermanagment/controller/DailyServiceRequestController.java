package com.amlakie.usermanagment.controller;

import com.amlakie.usermanagment.dto.AssignmentDTO;
import com.amlakie.usermanagment.dto.CompletionDTO;
import com.amlakie.usermanagment.dto.DailyServiceRequestDTO;
import com.amlakie.usermanagment.entity.DailyServiceRequest;
import com.amlakie.usermanagment.entity.TravelRequest;
import com.amlakie.usermanagment.service.DailyServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// DailyServiceRequestController.java
@RestController
@RequestMapping("/api/daily-requests")
public class DailyServiceRequestController {
    private final DailyServiceRequestService service;

    @Autowired
    public DailyServiceRequestController(DailyServiceRequestService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public ResponseEntity<DailyServiceRequest> createRequest(@Valid @RequestBody DailyServiceRequestDTO dto) {
        return ResponseEntity.ok(service.createRequest(dto));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<DailyServiceRequest>> getPendingRequests() {
        return ResponseEntity.ok(service.getPendingRequests());
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<DailyServiceRequest> assignRequest(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentDTO dto) {  // Use AssignmentDTO
        return ResponseEntity.ok(service.assignRequest(id, dto));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<DailyServiceRequest> completeRequest(
            @PathVariable Long id,
            @Valid @RequestBody CompletionDTO dto) {  // Use CompletionDTO
        return ResponseEntity.ok(service.completeRequest(id, dto));
    }


    @GetMapping("/driver")
    public ResponseEntity<List<DailyServiceRequest>> getDriverRequests(
            @RequestParam(required = false) String driverName) {
        List<DailyServiceRequest> requests = service.getRequestsForDriver(driverName);
        return ResponseEntity.ok(requests);
    }
}