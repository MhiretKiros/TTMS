package com.amlakie.usermanagment.service;

import com.amlakie.usermanagment.dto.TravelRequestDTO;
import com.amlakie.usermanagment.entity.TravelRequest;
import com.amlakie.usermanagment.exception.InvalidRequestException;
import com.amlakie.usermanagment.exception.ResourceNotFoundException;
import com.amlakie.usermanagment.repository.TravelRequestRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TravelRequestService {

    private final TravelRequestRepository travelRequestRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public TravelRequestService(TravelRequestRepository travelRequestRepository) {
        this.travelRequestRepository = travelRequestRepository;
    }

    @Transactional
    public TravelRequest createRequest(TravelRequestDTO requestDTO) throws InvalidRequestException {
        validateRequest(requestDTO);
        TravelRequest request = mapToEntity(requestDTO);
        request.setCreatedAt(LocalDateTime.now());
        request.setCreatedBy("admin"); // TODO: Replace with authenticated username from security context
        return travelRequestRepository.save(request);
    }

    public List<TravelRequest> getRequestsForUser() {
        return travelRequestRepository.findAll(); // Filter by user if needed
    }

    public List<TravelRequest> getRequestsForManager() {
        // Fetch only the requests with "APPROVED" status for manager
        return travelRequestRepository.findByStatus(TravelRequest.RequestStatus.APPROVED);
    }

    public List<TravelRequest> getRequestsForCorporator() {
        return travelRequestRepository.findAll(); // Could apply role-based filtering here
    }

    public TravelRequest getRequestById(Long id) throws ResourceNotFoundException {
        return travelRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Travel request not found with id: " + id));
    }

    @Transactional
    public TravelRequest updateRequestStatus(Long id, TravelRequest.RequestStatus status)
            throws ResourceNotFoundException, InvalidRequestException {
        TravelRequest request = getRequestById(id);

        if (request.getStatus() == TravelRequest.RequestStatus.COMPLETED) {
            throw new InvalidRequestException("Cannot change status of a completed request");
        }

        request.setStatus(status);
        return travelRequestRepository.save(request);
    }

    @Transactional
    public TravelRequest completeRequest(Long id, TravelRequestDTO serviceData)
            throws ResourceNotFoundException, InvalidRequestException {
        TravelRequest request = getRequestById(id);

        // Change this validation to check for COMPLETED status
        if (request.getStatus() != TravelRequest.RequestStatus.COMPLETED) {
            throw new InvalidRequestException("Only COMPLETED requests can be finished");
        }

        validateServiceData(serviceData);
        updateRequestWithServiceData(request, serviceData);
        request.setStatus(TravelRequest.RequestStatus.FINISHED);

        return travelRequestRepository.save(request);
    }

    @Transactional
    public TravelRequest fuelRequest(Long id, TravelRequestDTO serviceData)
            throws ResourceNotFoundException, InvalidRequestException {
        TravelRequest request = getRequestById(id);

        // Change this validation to check for COMPLETED status
        if (request.getStatus() != TravelRequest.RequestStatus.ASSIGNED) {
            throw new InvalidRequestException("Only ASSIGNED requests can be finished");
        }

        validateFuelData(serviceData);
        updateFuelWithServiceData(request, serviceData);
        request.setStatus(TravelRequest.RequestStatus.COMPLETED);

        return travelRequestRepository.save(request);
    }

    @Transactional
    public TravelRequest fuelReturn(Long id, TravelRequestDTO serviceData)
            throws ResourceNotFoundException, InvalidRequestException {
        TravelRequest request = getRequestById(id);

        // Change this validation to check for COMPLETED status
        if (request.getStatus() != TravelRequest.RequestStatus.FINISHED) {
            throw new InvalidRequestException("Only FINISHED requests can be ended");
        }

        validateFuelReturnData(serviceData);
        updateFuelReturnWithServiceData(request, serviceData);
        request.setStatus(TravelRequest.RequestStatus.SUCCESED);

        return travelRequestRepository.save(request);
    }

    // ===================== PRIVATE HELPERS ===========================

    private void validateFuelData(TravelRequestDTO dto) throws InvalidRequestException {

        if (isBlank(dto.getAuthorizerName())) {
            throw new InvalidRequestException("Authorizer name is required");
        }

        if (dto.getAccountNumber() == null) {
            throw new InvalidRequestException("Account date is required");
        }
    }

    private void validateFuelReturnData(TravelRequestDTO dto) throws InvalidRequestException {

        if (isBlank(dto.getAssemblerName())) {
            throw new InvalidRequestException("Assembler name is required");
        }

        if (dto.getTripExplanation() == null) {
            throw new InvalidRequestException("somethind legend is required");
        }
    }

    private void validateRequest(TravelRequestDTO dto) throws InvalidRequestException {
        if (isBlank(dto.getStartingPlace())) {
            throw new InvalidRequestException("Starting place is required");
        }

        if (isBlank(dto.getDestinationPlace())) {
            throw new InvalidRequestException("Destination place is required");
        }

        if (dto.getTravelers() == null || dto.getTravelers().isEmpty()) {
            throw new InvalidRequestException("At least one traveler is required");
        }

        if (dto.getStartingDate() == null) {
            throw new InvalidRequestException("Starting date is required");
        }

        if (dto.getStartingDate().isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("Starting date cannot be in the past");
        }

        if (dto.getReturnDate() != null && dto.getReturnDate().isBefore(dto.getStartingDate())) {
            throw new InvalidRequestException("Return date cannot be before starting date");
        }
    }

    @Transactional
    public TravelRequest updateServiceProviderInfo(Long id, TravelRequestDTO serviceData)
            throws ResourceNotFoundException, InvalidRequestException {
        TravelRequest request = getRequestById(id);

        if (request.getStatus() != TravelRequest.RequestStatus.PENDING) {
            throw new InvalidRequestException("Only pending requests can be updated with service info");
        }

        request.setServiceProviderName(serviceData.getServiceProviderName());
        request.setAssignedCarType(serviceData.getAssignedCarType());
        request.setAssignedDriver(serviceData.getAssignedDriver());
        request.setVehicleDetails(serviceData.getVehicleDetails());
        request.setStatus(TravelRequest.RequestStatus.APPROVED);

        return travelRequestRepository.save(request);
    }

    public List<TravelRequest> getRequestsForDriver(String driverName) {
        if (driverName != null && !driverName.isEmpty()) {
            return travelRequestRepository.findByAssignedDriverAndStatus(
                    driverName,
                    TravelRequest.RequestStatus.COMPLETED
            );
        }
        return travelRequestRepository.findByStatus(TravelRequest.RequestStatus.COMPLETED);
    }

    private void validateTripCompletionData(TravelRequestDTO dto) throws InvalidRequestException {
        if (dto.getActualStartingDate() == null) {
            throw new InvalidRequestException("Actual starting date is required");
        }

        if (dto.getActualReturnDate() == null) {
            throw new InvalidRequestException("Actual return date is required");
        }

        if (dto.getStartingKilometers() == null || dto.getStartingKilometers() < 0) {
            throw new InvalidRequestException("Valid starting kilometers required");
        }

        if (dto.getEndingKilometers() == null || dto.getEndingKilometers() < 0) {
            throw new InvalidRequestException("Valid ending kilometers required");
        }

        if (dto.getEndingKilometers() < dto.getStartingKilometers()) {
            throw new InvalidRequestException("Ending km cannot be less than starting km");
        }
    }

    private void validateServiceData(TravelRequestDTO dto) throws InvalidRequestException {
        if (isBlank(dto.getServiceProviderName())) {
            throw new InvalidRequestException("Service provider name is required");
        }

        if (isBlank(dto.getAssignedDriver())) {
            throw new InvalidRequestException("Driver name is required");
        }

        if (dto.getActualStartingDate() == null) {
            throw new InvalidRequestException("Actual starting date is required");
        }

        if (dto.getActualReturnDate() == null) {
            throw new InvalidRequestException("Actual return date is required");
        }

        if (dto.getStartingKilometers() == null || dto.getStartingKilometers() < 0) {
            throw new InvalidRequestException("Valid starting kilometers required");
        }

        if (dto.getEndingKilometers() == null || dto.getEndingKilometers() < 0) {
            throw new InvalidRequestException("Valid ending kilometers required");
        }

        if (dto.getEndingKilometers() < dto.getStartingKilometers()) {
            throw new InvalidRequestException("Ending km cannot be less than starting km");
        }
    }

    private TravelRequest mapToEntity(TravelRequestDTO dto) {
        TravelRequest entity = new TravelRequest();
        entity.setStartingPlace(dto.getStartingPlace());
        entity.setDestinationPlace(dto.getDestinationPlace());
        entity.setTravelReason(dto.getTravelReason());
        entity.setCarType(dto.getCarType());
        entity.setTravelDistance(dto.getTravelDistance());
        entity.setStartingDate(dto.getStartingDate());
        entity.setReturnDate(dto.getReturnDate());
        entity.setDepartment(dto.getDepartment());
        entity.setJobStatus(dto.getJobStatus());
        entity.setClaimantName(dto.getClaimantName());
        entity.setTeamLeaderName(dto.getTeamLeaderName());
        entity.setApprovement(dto.getApprovement());
        entity.setAccountNumber(dto.getAccountNumber());

        if (dto.getTravelers() != null) {
            dto.getTravelers().forEach(entity::addTraveler); // Adds travelers to entity
        }

        return entity;
    }

    private void updateFuelWithServiceData(TravelRequest request, TravelRequestDTO dto) {
        request.setAuthorizerName(dto.getAuthorizerName());
        request.setAccountNumber(dto.getAccountNumber());
    }

    private void updateFuelReturnWithServiceData(TravelRequest request, TravelRequestDTO dto) {
        request.setAssemblerName(dto.getAssemblerName());
        request.setTripExplanation(dto.getTripExplanation());
    }

    private void updateRequestWithServiceData(TravelRequest request, TravelRequestDTO dto) {
        request.setServiceProviderName(dto.getServiceProviderName());
        request.setAssignedCarType(dto.getAssignedCarType());
        request.setAssignedDriver(dto.getAssignedDriver());
        request.setVehicleDetails(dto.getVehicleDetails());
        request.setActualStartingDate(dto.getActualStartingDate());
        request.setActualReturnDate(dto.getActualReturnDate());
        request.setStartingKilometers(dto.getStartingKilometers());
        request.setEndingKilometers(dto.getEndingKilometers());

        if (dto.getStartingKilometers() != null && dto.getEndingKilometers() != null) {
            request.setKmDifference(dto.getEndingKilometers() - dto.getStartingKilometers());
        }

        request.setCargoType(dto.getCargoType());
        request.setCargoWeight(dto.getCargoWeight());
        request.setNumberOfPassengers(dto.getNumberOfPassengers());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
