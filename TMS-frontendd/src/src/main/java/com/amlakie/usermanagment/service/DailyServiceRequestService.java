package com.amlakie.usermanagment.service;

import com.amlakie.usermanagment.dto.AssignmentDTO;
import com.amlakie.usermanagment.dto.CompletionDTO;
import com.amlakie.usermanagment.dto.DailyServiceRequestDTO;
import com.amlakie.usermanagment.entity.DailyServiceRequest;
import com.amlakie.usermanagment.entity.TravelRequest;
import com.amlakie.usermanagment.exception.InvalidRequestException;
import com.amlakie.usermanagment.exception.ResourceNotFoundException;
import com.amlakie.usermanagment.repository.DailyServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// DailyServiceRequestService.java
@Service
public class DailyServiceRequestService {
    private final DailyServiceRequestRepository repository;

    @Autowired
    public DailyServiceRequestService(DailyServiceRequestRepository repository) {
        this.repository = repository;
    }

    public DailyServiceRequest createRequest(DailyServiceRequestDTO dto) {
        DailyServiceRequest request = new DailyServiceRequest();
        request.setDateTime(dto.getDateTime());
        request.setTravelers(dto.getTravelers());
        request.setStartingPlace(dto.getStartingPlace());
        request.setEndingPlace(dto.getEndingPlace());
        request.setClaimantName(dto.getClaimantName());
        return repository.save(request);
    }

    public List<DailyServiceRequest> getPendingRequests() {
        return repository.findByStatus(DailyServiceRequest.RequestStatus.PENDING);
    }

    public DailyServiceRequest assignRequest(Long id, AssignmentDTO dto) {
        DailyServiceRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (request.getStatus() != DailyServiceRequest.RequestStatus.PENDING) {
            throw new InvalidRequestException("Only pending requests can be assigned");
        }

        request.setDriverName(dto.getDriverName());
        request.setCarType(dto.getCarType());
        request.setPlateNumber(dto.getPlateNumber());
        request.setStatus(DailyServiceRequest.RequestStatus.ASSIGNED);
        return repository.save(request);
    }

    public DailyServiceRequest completeRequest(Long id, CompletionDTO dto) {
        DailyServiceRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (request.getStatus() != DailyServiceRequest.RequestStatus.ASSIGNED) {
            throw new InvalidRequestException("Only assigned requests can be completed");
        }

        request.setStartKm(dto.getStartKm());
        request.setEndKm(dto.getEndKm());
        request.setKmDifference(dto.getEndKm() - dto.getStartKm());
        request.setStatus(DailyServiceRequest.RequestStatus.COMPLETED);
        return repository.save(request);
    }


    public List<DailyServiceRequest> getRequestsForDriver(String driverName) {
        if (driverName != null && !driverName.isEmpty()) {
            return repository.findByDriverNameAndStatus(
                    driverName,
                    DailyServiceRequest.RequestStatus.ASSIGNED
            );
        }
        return repository.findByStatus(DailyServiceRequest.RequestStatus.ASSIGNED);
    }
}