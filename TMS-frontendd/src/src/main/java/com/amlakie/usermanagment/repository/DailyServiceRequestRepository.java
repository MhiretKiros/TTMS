package com.amlakie.usermanagment.repository;

import com.amlakie.usermanagment.entity.DailyServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// DailyServiceRequestRepository.java
public interface DailyServiceRequestRepository extends JpaRepository<DailyServiceRequest, Long> {
    List<DailyServiceRequest> findByStatus(DailyServiceRequest.RequestStatus status);
    List<DailyServiceRequest> findByDriverNameAndStatus(String driverName, DailyServiceRequest.RequestStatus status);
}