package com.amlakie.usermanagment.service;

import com.amlakie.usermanagment.dto.organization.*;
import com.amlakie.usermanagment.entity.OrganizationCar;
import com.amlakie.usermanagment.entity.organization.*;
import com.amlakie.usermanagment.entity.organization.enums.InspectionStatusType;
import com.amlakie.usermanagment.entity.organization.enums.ServiceStatusType;
import com.amlakie.usermanagment.repository.OrganizationCarInspectionRepository;
import com.amlakie.usermanagment.repository.OrganizationCarRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrganizationCarInspectionService {

    private static final Logger log = LoggerFactory.getLogger(OrganizationCarInspectionService.class);

    private static final String CAR_STATUS_PENDING_INSPECTION = "PendingInspection";
    private static final String CAR_STATUS_INSPECTED_READY = "InspectedAndReady";
    private static final String CAR_STATUS_INSPECTION_REJECTED = "InspectionRejected";
    private static final String CAR_STATUS_UNKNOWN = "Unknown";

    private final OrganizationCarInspectionRepository orgCarInspectionRepository;
    private final OrganizationCarRepository orgCarRepository;

    @Autowired
    public OrganizationCarInspectionService(
            OrganizationCarInspectionRepository orgCarInspectionRepository,
            OrganizationCarRepository orgCarRepository
    ) {
        this.orgCarInspectionRepository = orgCarInspectionRepository;
        this.orgCarRepository = orgCarRepository;
    }

    @Transactional
    public OrganizationCarInspectionReqRes createInspection(OrganizationCarInspectionReqRes request) {
        if (request == null || request.getPlateNumber() == null || request.getPlateNumber().trim().isEmpty()) {
            log.warn("Organization car inspection request was null or missing plate number.");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization car inspection request is invalid or missing plate number");
        }

        final String plateNumber = request.getPlateNumber();
        OrganizationCar orgCar = orgCarRepository.findByPlateNumber(plateNumber)
                .orElseGet(() -> createNewOrganizationCar(plateNumber));

        applyInspectionBusinessLogic(request);

        OrganizationCarInspection organizationCarInspection = mapRequestToEntity(request);
        organizationCarInspection.setOrganizationCar(orgCar);
        OrganizationCarInspection savedInspection;
        try {
            savedInspection = orgCarInspectionRepository.save(organizationCarInspection);
            log.info("Successfully created inspection with id {} for car plate number {}", savedInspection.getId(), plateNumber);
            updateCarAfterInspection(savedInspection);
        } catch (DataAccessException e) {
            log.error("Database error saving organization car inspection for plate number {}: {}", plateNumber, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving organization car inspection", e);
        } catch (Exception e) {
            log.error("Unexpected error during inspection creation or car update for plate number {}: {}", plateNumber, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error processing inspection and updating car", e);
        }

        OrganizationCarInspectionReqRes orgResponse = mapEntityToResponse(savedInspection);
        if (orgResponse != null) {
            orgResponse.setCodStatus(HttpStatus.CREATED.value());
            orgResponse.setMessage("Inspection created successfully");
        } else {
            log.error("Mapping saved entity ID {} to response returned null!", savedInspection.getId());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to map created inspection to response");
        }
        return orgResponse;
    }

    private OrganizationCar createNewOrganizationCar(String plateNumber) {
        log.info("OrganizationCar with plate number {} not found. Creating new entry.", plateNumber);
        OrganizationCar newCar = new OrganizationCar();
        newCar.setPlateNumber(plateNumber);
        newCar.setOwnerName("Unknown");
        newCar.setCarType("Unknown");
        newCar.setOwnerPhone("0000000000");
        newCar.setModel("UNKNOWN");
        newCar.setFuelType("UNKNOWN");
        newCar.setCreatedBy("SYSTEM_AUTO_CREATE");
        newCar.setParkingLocation("UNKNOWN");
        newCar.setMotorCapacity("UNKNOWN");
        newCar.setTotalKm("0");
        newCar.setRegisteredDate(LocalDateTime.now());
        newCar.setStatus(CAR_STATUS_PENDING_INSPECTION);
        newCar.setManufactureYear("0");
        newCar.setKmPerLiter("0.0");
        newCar.setInspected(false);

        try {
            return orgCarRepository.save(newCar);
        } catch (DataAccessException e) {
            log.error("Database error saving new organization car with plate number {}: {}", plateNumber, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save new organization car details", e);
        }
    }

    private void applyInspectionBusinessLogic(OrganizationCarInspectionReqRes request) {
        if (request == null) return;

        if (request.getMechanicalDetails() != null && !checkMechanicalPass(request.getMechanicalDetails())) {
            log.info("Mechanical check failed for plate {}. Setting status to Rejected.", request.getPlateNumber());
            request.setInspectionStatus(OrganizationCarInspectionReqRes.InspectionStatus.Rejected);
            String failureNote = "Inspection failed due to critical mechanical issues.";
            request.setNotes(request.getNotes() == null || request.getNotes().isEmpty() ? failureNote : request.getNotes() + " " + failureNote);
        }

        if (request.getInspectionStatus() != OrganizationCarInspectionReqRes.InspectionStatus.Rejected) {
            int calculatedBodyScore = calculateBodyScore(request.getBodyDetails());
            int calculatedInteriorScore = calculateInteriorScore(request.getInteriorDetails());
            request.setBodyScore(calculatedBodyScore);
            request.setInteriorScore(calculatedInteriorScore);

            if (calculatedBodyScore < 70 || calculatedInteriorScore < 70) {
                log.info("Scores below threshold for plate {}. Setting status to Rejected.", request.getPlateNumber());
                request.setInspectionStatus(OrganizationCarInspectionReqRes.InspectionStatus.Rejected);
            }
        } else {
            log.debug("Inspection already rejected mechanically, setting scores to 0 for plate {}", request.getPlateNumber());
            request.setBodyScore(0);
            request.setInteriorScore(0);
        }

        if (request.getInspectionStatus() == OrganizationCarInspectionReqRes.InspectionStatus.Approved) {
            request.setServiceStatus(OrganizationCarInspectionReqRes.ServiceStatus.Ready);
        } else if (request.getInspectionStatus() == OrganizationCarInspectionReqRes.InspectionStatus.ConditionallyApproved) {
            request.setServiceStatus(OrganizationCarInspectionReqRes.ServiceStatus.ReadyWithWarning);
        } else {
            request.setServiceStatus(OrganizationCarInspectionReqRes.ServiceStatus.Pending);
        }
    }

    private boolean checkMechanicalPass(@NotNull(message = "Mechanical inspection details are required") @Valid OrganizationMechanicalInspectionDTO mechanical) {
        if (mechanical == null) {
            log.warn("checkMechanicalPass called with null MechanicalDetailsDTO.");
            return true; // Or false, depending on how null should be treated
        }
        return mechanical.isEngineCondition() &&
                mechanical.isEnginePower() &&
                mechanical.isSuspension() &&
                mechanical.isBrakes() &&
                mechanical.isSteering() &&
                mechanical.isGearbox();
    }

    private int calculateBodyScore(@NotNull(message = "Body inspection details are required") @Valid BodyInspectionDTO bodyDetails) {
        if (bodyDetails == null) {
            log.warn("calculateBodyScore called with null BodyDetailsDTO.");
            return 100; // Or 0, depending on how null should be treated
        }
        int score = 100;
        score -= calculatePointsDeducted(bodyDetails.getBodyCollision());
        score -= calculatePointsDeducted(bodyDetails.getBodyScratches());
        score -= calculatePointsDeducted(bodyDetails.getPaintCondition());
        score -= calculatePointsDeducted(bodyDetails.getBreakages());
        score -= calculatePointsDeducted(bodyDetails.getCracks());
        return Math.max(0, score);
    }

    private int calculateInteriorScore(@NotNull(message = "Interior inspection details are required") @Valid InteriorInspectionDTO interiorDetails) {
        if (interiorDetails == null) {
            log.warn("calculateInteriorScore called with null InteriorDetailsDTO.");
            return 100; // Or 0, depending on how null should be treated
        }
        int score = 100;
        score -= calculatePointsDeducted(interiorDetails.getEngineExhaust());
        score -= calculatePointsDeducted(interiorDetails.getSeatComfort());
        score -= calculatePointsDeducted(interiorDetails.getSeatFabric());
        score -= calculatePointsDeducted(interiorDetails.getFloorMat());
        score -= calculatePointsDeducted(interiorDetails.getRearViewMirror());
        score -= calculatePointsDeducted(interiorDetails.getCarTab());
        score -= calculatePointsDeducted(interiorDetails.getMirrorAdjustment());
        score -= calculatePointsDeducted(interiorDetails.getDoorLock());
        score -= calculatePointsDeducted(interiorDetails.getVentilationSystem());
        score -= calculatePointsDeducted(interiorDetails.getDashboardDecoration());
        score -= calculatePointsDeducted(interiorDetails.getSeatBelt());
        score -= calculatePointsDeducted(interiorDetails.getSunshade());
        score -= calculatePointsDeducted(interiorDetails.getWindowCurtain());
        score -= calculatePointsDeducted(interiorDetails.getInteriorRoof());
        score -= calculatePointsDeducted(interiorDetails.getCarIgnition());
        score -= calculatePointsDeducted(interiorDetails.getFuelConsumption());
        score -= calculatePointsDeducted(interiorDetails.getHeadlights());
        score -= calculatePointsDeducted(interiorDetails.getRainWiper());
        score -= calculatePointsDeducted(interiorDetails.getTurnSignalLight());
        score -= calculatePointsDeducted(interiorDetails.getBrakeLight());
        score -= calculatePointsDeducted(interiorDetails.getLicensePlateLight());
        score -= calculatePointsDeducted(interiorDetails.getClock());
        score -= calculatePointsDeducted(interiorDetails.getRpm());
        score -= calculatePointsDeducted(interiorDetails.getBatteryStatus());
        score -= calculatePointsDeducted(interiorDetails.getChargingIndicator());
        return Math.max(0, score);
    }

    private int calculatePointsDeducted(@NotNull @Valid ItemConditionDTO condition) {
        if (condition == null || !condition.getProblem()) {
            return 0;
        }
        if (condition.getSeverity() == null) {
            log.warn("Severity is null for a problem item. Applying default deduction.");
            return 5;
        }
        // Ensure OrganizationCarInspectionReqRes.ProblemDetailDTO.Severity enum exists
        switch (condition.getSeverity()) {
            case HIGH:
                return 20;
            case MEDIUM:
                return 10;
            case LOW:
                return 5;
            case NONE:
            default:
                log.warn("Unexpected or NONE severity '{}' found for a problem item. Applying default deduction.", condition.getSeverity());
                return 5;
        }
    }

    @Transactional
    protected void updateCarAfterInspection(OrganizationCarInspection orgInspection) {
        if (orgInspection == null || orgInspection.getOrganizationCar() == null) {
            log.warn("Cannot update car status - inspection or associated car is null.");
            return;
        }

        OrganizationCar car = orgInspection.getOrganizationCar();
        String currentCarStatus = car.getStatus();
        String newCarStatus = currentCarStatus;
        boolean needsSave = false;
        if (orgInspection.getId() != null) { // Ensure the inspection has an ID
            if (car.getLatestInspectionId() == null || !car.getLatestInspectionId().equals(orgInspection.getId())) {
                log.info("Updating latestInspectionId for car plate {} to inspection ID {}", car.getPlateNumber(), orgInspection.getId());
                car.setLatestInspectionId(orgInspection.getId());
                needsSave = true;
            }
        }
        String inspectionStatusStr = String.valueOf(orgInspection.getInspectionStatus());
        if (!car.isInspected()) {
            log.info("Marking car plate {} as inspected (boolean flag).", car.getPlateNumber());
            car.setInspected(true);
            needsSave = true;
        }

        // Use OrganizationCarInspectionReqRes.InspectionStatus for comparison
        if (OrganizationCarInspectionReqRes.InspectionStatus.Approved.name().equals(inspectionStatusStr)) {
            newCarStatus = CAR_STATUS_INSPECTED_READY;
        } else if (OrganizationCarInspectionReqRes.InspectionStatus.Rejected.name().equals(inspectionStatusStr)) {
            newCarStatus = CAR_STATUS_INSPECTION_REJECTED;
        } else if (OrganizationCarInspectionReqRes.InspectionStatus.ConditionallyApproved.name().equals(inspectionStatusStr)) {
            newCarStatus = CAR_STATUS_INSPECTED_READY; // Example
        } else {
            log.warn("Unknown inspection status '{}' found for inspection ID {}. Car string status not updated.", inspectionStatusStr, orgInspection.getId());
        }

        if (!Objects.equals(currentCarStatus, newCarStatus)) {
            log.info("Updating string status for car plate {} from '{}' to '{}'", car.getPlateNumber(), currentCarStatus, newCarStatus);
            car.setStatus(newCarStatus);
            needsSave = true;
        } else {
            log.debug("Car string status ('{}') for plate {} remains unchanged after inspection ID {}.", currentCarStatus, car.getPlateNumber(), orgInspection.getId());
        }

        if (needsSave) {
            try {
                orgCarRepository.save(car);
                log.info("Successfully saved updates (status/inspected flag) for car plate {}", car.getPlateNumber());
            } catch (DataAccessException e) {
                log.error("Database error updating car plate {} after inspection: {}", car.getPlateNumber(), e.getMessage(), e);
                throw new RuntimeException("Failed to save car updates after inspection for plate " + car.getPlateNumber(), e);
            }
        } else {
            log.debug("No changes required for car plate {} after inspection ID {}.", car.getPlateNumber(), orgInspection.getId());
        }
    }

    @Transactional(readOnly = true)
    public OrganizationCarInspectionListResponse getAllInspections() {
        List<OrganizationCarInspection> orgInspections;
        try {
            orgInspections = orgCarInspectionRepository.findAll();
        } catch (DataAccessException e) {
            log.error("Database error retrieving all car inspections: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving inspections: Database error.", e);
        }
        List<OrganizationCarInspectionReqRes> orgInspectionDTOs = orgInspections.stream()
                .map(this::mapEntityToResponse)
                .filter(Objects::nonNull) // Add null filter for safety
                .collect(Collectors.toList());

        OrganizationCarInspectionListResponse response = new OrganizationCarInspectionListResponse();
        response.setInspections(orgInspectionDTOs);
        response.setCodStatus(HttpStatus.OK.value());
        response.setMessage("Inspections retrieved successfully");
        return response;
    }

    @Transactional(readOnly = true)
    public OrganizationCarInspectionReqRes getInspectionById(Long id) {
        try {
            OrganizationCarInspection orgInspection = orgCarInspectionRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inspection with id " + id + " not found"));
            log.debug("Retrieved inspection with id: {}", id);

            OrganizationCarInspectionReqRes response = mapEntityToResponse(orgInspection);
            if (response == null) { // Should not happen if entity is found, but good practice
                log.error("mapEntityToResponse returned null for a found inspection ID {}", id);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error mapping inspection to response");
            }
            response.setCodStatus(HttpStatus.OK.value());
            response.setMessage("Inspection retrieved successfully");
            return response;
        } catch (ResponseStatusException e) {
            log.warn("Failed to find inspection with id {}: {}", id, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.error("Database error retrieving inspection with id {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving inspection", e);
        }
    }

    @Transactional
    public OrganizationCarInspectionReqRes updateInspection(Long id, OrganizationCarInspectionReqRes request) {
        try {
            OrganizationCarInspection existingInspection = orgCarInspectionRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inspection with id " + id + " not found for update"));

            applyInspectionBusinessLogic(request);
            updateExistingEntityFromRequest(existingInspection, request);

            OrganizationCarInspection savedInspection = orgCarInspectionRepository.save(existingInspection);
            log.info("Successfully updated inspection with id: {}", id);
            updateCarAfterInspection(savedInspection);

            OrganizationCarInspectionReqRes response = mapEntityToResponse(savedInspection);
            if (response == null) {
                log.error("mapEntityToResponse returned null for updated inspection ID {}", id);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error mapping updated inspection to response");
            }
            response.setCodStatus(HttpStatus.OK.value());
            response.setMessage("Inspection updated successfully");
            return response;
        } catch (ResponseStatusException e) {
            log.warn("Failed to update inspection with id {}: {}", id, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.error("Database error updating inspection with id {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating inspection", e);
        }
    }

    @Transactional
    public void deleteInspection(Long id) {
        try {
            Optional<OrganizationCarInspection> inspectionOpt = orgCarInspectionRepository.findById(id);
            if (inspectionOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Inspection with id " + id + " not found for deletion.");
            }
            orgCarInspectionRepository.deleteById(id);
            log.info("Successfully deleted inspection with id: {}", id);

            inspectionOpt.ifPresent(inspection -> {
                if (inspection.getOrganizationCar() != null) {
                    OrganizationCar car = inspection.getOrganizationCar();
                    boolean carNeedsSave = false;
                    if (!CAR_STATUS_PENDING_INSPECTION.equals(car.getStatus())) {
                        log.info("Reverting status for car plate {} to PendingInspection after deleting inspection {}", car.getPlateNumber(), id);
                        car.setStatus(CAR_STATUS_PENDING_INSPECTION);
                        carNeedsSave = true;
                    }
                    if (carNeedsSave) {
                        try {
                            orgCarRepository.save(car);
                            log.info("Successfully reverted status for car plate {} after deleting inspection {}", car.getPlateNumber(), id);
                        } catch (Exception e) {
                            log.error("Failed to revert status for car plate {} after deleting inspection {}", car.getPlateNumber(), id, e);
                        }
                    }
                }
            });
        } catch (ResponseStatusException e) {
            log.warn("Failed to delete inspection with id {}: {}", id, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.error("Database error deleting inspection with id {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting inspection, potentially due to related data.", e);
        }
    }

    @Transactional(readOnly = true)
    public OrganizationCarInspectionListResponse getInspectionsByPlateNumber(String plateNumber) {
        if (plateNumber == null || plateNumber.trim().isEmpty()) {
            log.warn("Attempted to get inspections with null or empty plate number.");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plate number cannot be empty");
        }
        List<OrganizationCarInspection> inspections;
        try {
            inspections = orgCarInspectionRepository.findByOrganizationCar_PlateNumber(plateNumber); // Corrected repository method name
            log.info("Retrieved {} inspections for plate number: {}", inspections.size(), plateNumber);
        } catch (DataAccessException e) {
            log.error("Database error retrieving inspections for plate number {}: {}", plateNumber, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving inspections by plate number", e);
        }
        List<OrganizationCarInspectionReqRes> orgInspectionDTOs = inspections.stream()
                .map(this::mapEntityToResponse)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        OrganizationCarInspectionListResponse response = new OrganizationCarInspectionListResponse();
        response.setInspections(orgInspectionDTOs);
        response.setCodStatus(HttpStatus.OK.value());
        response.setMessage("Inspections retrieved successfully for plate number: " + plateNumber);
        return response;
    }

    private OrganizationCarInspection mapRequestToEntity(OrganizationCarInspectionReqRes request) {
        if (request == null) return null;
        OrganizationCarInspection inspection = new OrganizationCarInspection();
        inspection.setInspectionDate(request.getInspectionDate());
        inspection.setInspectorName(request.getInspectorName());
        inspection.setInspectionStatus(request.getInspectionStatus() != null ? InspectionStatusType.valueOf(request.getInspectionStatus().name()) : null);
        inspection.setServiceStatus(request.getServiceStatus() != null ? ServiceStatusType.valueOf(request.getServiceStatus().name()) : null);
        inspection.setBodyScore(request.getBodyScore());
        inspection.setInteriorScore(request.getInteriorScore());
        inspection.setNotes(request.getNotes());

        if (request.getMechanicalDetails() != null) {
            inspection.setMechanicalDetails(mapOrgMechanicalDTOtoEntity(request.getMechanicalDetails()));
            if (inspection.getMechanicalDetails() != null) {
                inspection.getMechanicalDetails().setOrganizationCarInspection(inspection);
            }
        }
        if (request.getBodyDetails() != null) {
            inspection.setBodyDetails(mapOrgBodyDTOtoEntity(request.getBodyDetails()));
            if (inspection.getBodyDetails() != null) {
                inspection.getBodyDetails().setOrgCarInspection(inspection);
            }
        }
        if (request.getInteriorDetails() != null) {
            inspection.setInteriorDetails(mapOrgInteriorDTOtoEntity(request.getInteriorDetails()));
            if (inspection.getInteriorDetails() != null) {
                inspection.getInteriorDetails().setOrgCarInspection(inspection);
            }
        }
        return inspection;
    }

    private void updateExistingEntityFromRequest(OrganizationCarInspection existingInspection, OrganizationCarInspectionReqRes request) {
        if (request == null || existingInspection == null) {
            log.warn("Attempted to update inspection with null request or entity.");
            return;
        }
        existingInspection.setInspectionDate(request.getInspectionDate());
        existingInspection.setInspectorName(request.getInspectorName());
        existingInspection.setInspectionStatus(request.getInspectionStatus() != null ? InspectionStatusType.valueOf(request.getInspectionStatus().name()) : null);
        existingInspection.setServiceStatus(request.getServiceStatus() != null ? ServiceStatusType.valueOf(request.getServiceStatus().name()) : null);
        existingInspection.setBodyScore(request.getBodyScore());
        existingInspection.setInteriorScore(request.getInteriorScore());
        existingInspection.setNotes(request.getNotes());

        if (request.getMechanicalDetails() != null) {
            if (existingInspection.getMechanicalDetails() == null) {
                existingInspection.setMechanicalDetails(new OrganizationMechanicalInspection());
                existingInspection.getMechanicalDetails().setOrganizationCarInspection(existingInspection);
            }
            updateOrgMechanicalFromDTO(existingInspection.getMechanicalDetails(), request.getMechanicalDetails());
        }
        if (request.getBodyDetails() != null) {
            if (existingInspection.getBodyDetails() == null) {
                existingInspection.setBodyDetails(new OrganizationBodyInspection());
                existingInspection.getBodyDetails().setOrgCarInspection(existingInspection);
            }
            updateOrgBodyFromDTO(existingInspection.getBodyDetails(), request.getBodyDetails());
        }
        if (request.getInteriorDetails() != null) {
            if (existingInspection.getInteriorDetails() == null) {
                existingInspection.setInteriorDetails(new OrganizationInteriorInspection());
                existingInspection.getInteriorDetails().setOrgCarInspection(existingInspection);
            }
            updateOrgInteriorFromDTO(existingInspection.getInteriorDetails(), request.getInteriorDetails());
        }
    }

    // --- Corrected DTO -> Entity Update Helpers ---
    private void updateOrgMechanicalFromDTO(OrganizationMechanicalInspection entity, @NotNull @Valid OrganizationMechanicalInspectionDTO dto) {
        if (dto == null || entity == null) {
            log.warn("Attempted to update mechanical details with null entity or DTO.");
            return;
        }
        log.debug("Updating OrganizationMechanicalInspection entity from DTO.");
        entity.setEngineCondition(dto.isEngineCondition());
        entity.setEnginePower(dto.isEnginePower());
        entity.setSuspension(dto.isSuspension());
        entity.setBrakes(dto.isBrakes());
        entity.setSteering(dto.isSteering());
        entity.setGearbox(dto.isGearbox());
        entity.setMileage(dto.isMileage());
        entity.setFuelGauge(dto.isFuelGauge());
        entity.setTempGauge(dto.isTempGauge());
        entity.setOilGauge(dto.isOilGauge());
        log.debug("Finished updating OrganizationMechanicalInspection entity.");
    }

    private void updateOrgBodyFromDTO(OrganizationBodyInspection entity, @NotNull @Valid BodyInspectionDTO dto) {
        if (dto == null || entity == null) {
            log.warn("Attempted to update body details with null entity or DTO.");
            return;
        }
        log.debug("Updating OrganizationBodyInspection entity from DTO.");
        entity.setBodyCollision(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getBodyCollision()));
        entity.setBodyScratches(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getBodyScratches()));
        entity.setPaintCondition(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getPaintCondition()));
        entity.setBreakages(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getBreakages()));
        entity.setCracks(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getCracks()));
        log.debug("Finished updating OrganizationBodyInspection entity.");
    }

    private void updateOrgInteriorFromDTO(OrganizationInteriorInspection entity, @NotNull @Valid InteriorInspectionDTO dto) {
        if (dto == null || entity == null) {
            log.warn("Attempted to update interior details with null entity or DTO.");
            return;
        }
        log.debug("Updating OrganizationInteriorInspection entity from DTO.");
        entity.setEngineExhaust(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getEngineExhaust()));
        entity.setSeatComfort(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getSeatComfort()));
        entity.setSeatFabric(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getSeatFabric()));
        entity.setFloorMat(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getFloorMat()));
        entity.setRearViewMirror(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getRearViewMirror()));
        entity.setCarTab(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getCarTab()));
        entity.setMirrorAdjustment(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getMirrorAdjustment()));
        entity.setDoorLock(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getDoorLock()));
        entity.setVentilationSystem(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getVentilationSystem()));
        entity.setDashboardDecoration(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getDashboardDecoration()));
        entity.setSeatBelt(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getSeatBelt()));
        entity.setSunshade(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getSunshade()));
        entity.setWindowCurtain(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getWindowCurtain()));
        entity.setInteriorRoof(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getInteriorRoof()));
        entity.setCarIgnition(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getCarIgnition()));
        entity.setFuelConsumption(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getFuelConsumption()));
        entity.setHeadlights(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getHeadlights()));
        entity.setRainWiper(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getRainWiper()));
        entity.setTurnSignalLight(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getTurnSignalLight()));
        entity.setBrakeLight(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getBrakeLight()));
        entity.setLicensePlateLight(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getLicensePlateLight()));
        entity.setClock(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getClock()));
        entity.setRpm(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getRpm()));
        entity.setBatteryStatus(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getBatteryStatus()));
        entity.setChargingIndicator(mapProblemDetailDTO_To_OrganizationItemConditionEntity(dto.getChargingIndicator()));
        log.debug("Finished updating OrganizationInteriorInspection entity.");
    }

    // --- Corrected DTO -> Entity Mapping Helpers (for new entities) ---
    private OrganizationMechanicalInspection mapOrgMechanicalDTOtoEntity(@NotNull(message = "Mechanical inspection details are required") @Valid OrganizationMechanicalInspectionDTO dto) {
        if (dto == null) {
            log.debug("MechanicalDetailsDTO is null, returning null OrganizationMechanicalInspection entity.");
            return null;
        }
        log.debug("Mapping MechanicalDetailsDTO to OrganizationMechanicalInspection entity.");
        OrganizationMechanicalInspection entity = new OrganizationMechanicalInspection();
        updateOrgMechanicalFromDTO(entity, dto);
        return entity;
    }

    private OrganizationBodyInspection mapOrgBodyDTOtoEntity(@NotNull(message = "Body inspection details are required") @Valid BodyInspectionDTO dto) {
        if (dto == null) {
            log.debug("BodyDetailsDTO is null, returning null OrganizationBodyInspection entity.");
            return null;
        }
        log.debug("Mapping BodyDetailsDTO to OrganizationBodyInspection entity.");
        OrganizationBodyInspection entity = new OrganizationBodyInspection();
        updateOrgBodyFromDTO(entity, dto);
        return entity;
    }

    private OrganizationInteriorInspection mapOrgInteriorDTOtoEntity(@NotNull(message = "Interior inspection details are required") @Valid InteriorInspectionDTO dto) {
        if (dto == null) {
            log.debug("InteriorDetailsDTO is null, returning null OrganizationInteriorInspection entity.");
            return null;
        }
        log.debug("Mapping InteriorDetailsDTO to OrganizationInteriorInspection entity.");
        OrganizationInteriorInspection entity = new OrganizationInteriorInspection();
        updateOrgInteriorFromDTO(entity, dto);
        return entity;
    }

    private OrganizationItemCondition mapProblemDetailDTO_To_OrganizationItemConditionEntity(@NotNull @Valid ItemConditionDTO dto) {
        if (dto == null) {
            return null;
        }
        OrganizationItemCondition entity = new OrganizationItemCondition();
        entity.setProblem(dto.getProblem());
        entity.setSeverity(dto.getSeverity() != null ? dto.getSeverity().name() : null);
        entity.setNotes(dto.getNotes());
        return entity;
    }

    private OrganizationCarInspectionReqRes mapEntityToResponse(OrganizationCarInspection inspection) {
        if (inspection == null) {
            log.warn("mapEntityToResponse called with null inspection.");
            return null;
        }
        OrganizationCarInspectionReqRes response = new OrganizationCarInspectionReqRes();
        response.setId(inspection.getId());
        response.setPlateNumber(inspection.getOrganizationCar() != null ? inspection.getOrganizationCar().getPlateNumber() : null);
        response.setInspectionDate(inspection.getInspectionDate());
        response.setInspectorName(inspection.getInspectorName());

        try {
            response.setInspectionStatus(inspection.getInspectionStatus() != null ? OrganizationCarInspectionReqRes.InspectionStatus.valueOf(String.valueOf(inspection.getInspectionStatus())) : null);
        } catch (IllegalArgumentException e) {
            log.warn("Could not map inspectionStatus value '{}' from entity ID {} to DTO enum", inspection.getInspectionStatus(), inspection.getId(), e);
            response.setInspectionStatus(null);
        }
        try {
            response.setServiceStatus(inspection.getServiceStatus() != null ? OrganizationCarInspectionReqRes.ServiceStatus.valueOf(String.valueOf(inspection.getServiceStatus())) : null);
        } catch (IllegalArgumentException e) {
            log.warn("Could not map serviceStatus value '{}' from entity ID {} to DTO enum", inspection.getServiceStatus(), inspection.getId(), e);
            response.setServiceStatus(null);
        }

        response.setBodyScore(inspection.getBodyScore());
        response.setInteriorScore(inspection.getInteriorScore());
        response.setNotes(inspection.getNotes());

        // Map the IDs of the detail entities if they exist
        // This assumes your OrganizationCarInspectionReqRes DTO has fields like:
        // private Long mechanicalId;
        // private Long bodyId;
        // private Long interiorId;
        if (inspection.getMechanicalDetails() != null) {
            response.setMechanicalId(inspection.getMechanicalDetails().getId()); // Assuming setMechanicalId exists
        }
        if (inspection.getBodyDetails() != null) {
            response.setBodyId(inspection.getBodyDetails().getId()); // Assuming setBodyId exists
        }
        if (inspection.getInteriorDetails() != null) {
            response.setInteriorId(inspection.getInteriorDetails().getId()); // Assuming setInteriorId exists
        }

        // Continue mapping the full detail DTOs
        response.setMechanicalDetails(mapMechanicalEntityToDTO(inspection.getMechanicalDetails()));
        response.setBodyDetails(mapBodyEntityToDTO(inspection.getBodyDetails()));
        response.setInteriorDetails(mapInteriorEntityToDTO(inspection.getInteriorDetails()));
        return response;
    }

    private @NotNull(message = "Mechanical inspection details are required") @Valid OrganizationMechanicalInspectionDTO mapMechanicalEntityToDTO(OrganizationMechanicalInspection entity) {
        if (entity == null) return null;
        OrganizationMechanicalInspectionDTO dto = new OrganizationMechanicalInspectionDTO();
        dto.setEngineCondition(entity.isEngineCondition());
        dto.setEnginePower(entity.isEnginePower());
        dto.setSuspension(entity.isSuspension());
        dto.setBrakes(entity.isBrakes());
        dto.setSteering(entity.isSteering());
        dto.setGearbox(entity.isGearbox());
        dto.setMileage(entity.isMileage());
        dto.setFuelGauge(entity.isFuelGauge());
        dto.setTempGauge(entity.isTempGauge());
        dto.setOilGauge(entity.isOilGauge());
        return dto;
    }

    private @NotNull(message = "Body inspection details are required") @Valid BodyInspectionDTO mapBodyEntityToDTO(OrganizationBodyInspection entity) {
        if (entity == null) return null;
        BodyInspectionDTO dto = new BodyInspectionDTO();
        dto.setBodyCollision(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getBodyCollision()));
        dto.setBodyScratches(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getBodyScratches()));
        dto.setPaintCondition(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getPaintCondition()));
        dto.setBreakages(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getBreakages()));
        dto.setCracks(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getCracks()));
        return dto;
    }

    private @NotNull(message = "Interior inspection details are required") @Valid InteriorInspectionDTO mapInteriorEntityToDTO(OrganizationInteriorInspection entity) {
        if (entity == null) return null;
        InteriorInspectionDTO dto = new InteriorInspectionDTO();
        dto.setEngineExhaust(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getEngineExhaust()));
        dto.setSeatComfort(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getSeatComfort()));
        dto.setSeatFabric(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getSeatFabric()));
        dto.setFloorMat(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getFloorMat()));
        dto.setRearViewMirror(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getRearViewMirror()));
        dto.setCarTab(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getCarTab()));
        dto.setMirrorAdjustment(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getMirrorAdjustment()));
        dto.setDoorLock(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getDoorLock()));
        dto.setVentilationSystem(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getVentilationSystem()));
        dto.setDashboardDecoration(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getDashboardDecoration()));
        dto.setSeatBelt(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getSeatBelt()));
        dto.setSunshade(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getSunshade()));
        dto.setWindowCurtain(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getWindowCurtain()));
        dto.setInteriorRoof(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getInteriorRoof()));
        dto.setCarIgnition(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getCarIgnition()));
        dto.setFuelConsumption(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getFuelConsumption()));
        dto.setHeadlights(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getHeadlights()));
        dto.setRainWiper(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getRainWiper()));
        dto.setTurnSignalLight(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getTurnSignalLight()));
        dto.setBrakeLight(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getBrakeLight()));
        dto.setLicensePlateLight(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getLicensePlateLight()));
        dto.setClock(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getClock()));
        dto.setRpm(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getRpm()));
        dto.setBatteryStatus(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getBatteryStatus()));
        dto.setChargingIndicator(mapOrganizationItemCondition_To_ProblemDetailDTO(entity.getChargingIndicator()));
        return dto;
    }

    private @NotNull(message = "Body collision details are required") @Valid ItemConditionDTO mapOrganizationItemCondition_To_ProblemDetailDTO(OrganizationItemCondition entity) {
        if (entity == null) return null;
        ItemConditionDTO dto = new ItemConditionDTO();
        dto.setProblem(entity.isProblem());
        try {
            dto.setSeverity(entity.getSeverity() != null ? ItemConditionDTO.Severity.valueOf(entity.getSeverity()) : null);
        } catch (IllegalArgumentException e) {
            log.warn("Could not map severity value '{}' from OrganizationItemCondition (ID: {}) to DTO enum", entity.getSeverity(), entity.getId() != null ? entity.getId() : "N/A", e);
            dto.setSeverity(null);
        }
        dto.setNotes(entity.getNotes());
        return dto;
    }
}