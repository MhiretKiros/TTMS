package com.amlakie.usermanagment.repository;
import com.amlakie.usermanagment.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    Optional<Car> findByPlateNumber(String plateNumber);
    List<Car> findByPlateNumberContainingOrOwnerNameContainingOrModelContaining(
            String plateNumber, String ownerName, String model);
    boolean existsByPlateNumber(String plateNumber);
}
