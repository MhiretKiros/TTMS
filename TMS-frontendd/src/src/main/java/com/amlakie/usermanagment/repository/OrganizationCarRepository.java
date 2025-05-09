package com.amlakie.usermanagment.repository;

import com.amlakie.usermanagment.entity.Car;
import com.amlakie.usermanagment.entity.OrganizationCar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationCarRepository extends JpaRepository<OrganizationCar, Long> {
    Optional<OrganizationCar> findByPlateNumber(String plateNumber);
    List<OrganizationCar> findByPlateNumberContainingOrOwnerNameContainingOrModelContainingOrDriverNameContaining(
            String plateNumber, String ownerName, String model, String driverName);
    boolean existsByPlateNumber(String plateNumber);
    List<OrganizationCar> findByStatus(String requestStatus);
}