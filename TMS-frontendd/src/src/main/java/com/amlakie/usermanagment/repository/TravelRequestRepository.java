package com.amlakie.usermanagment.repository;

import com.amlakie.usermanagment.entity.TravelRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelRequestRepository extends JpaRepository<TravelRequest, Long> {
    List<TravelRequest> findByStatus(TravelRequest.RequestStatus status);

    List<TravelRequest> findByAssignedDriverAndStatus(String driverName, TravelRequest.RequestStatus requestStatus);
}