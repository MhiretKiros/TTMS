package com.amlakie.usermanagment.repository;

import com.amlakie.usermanagment.entity.AssignmentHistory;
import com.amlakie.usermanagment.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// src/main/java/com/amlakie/usermanagment/repository/AssignmentHistoryRepository.java
public interface AssignmentHistoryRepository extends JpaRepository<AssignmentHistory, Long> {
    List<AssignmentHistory> findByStatus(String requestStatus);

    List<AssignmentHistory> findByCar(Car carToDelete);
}
