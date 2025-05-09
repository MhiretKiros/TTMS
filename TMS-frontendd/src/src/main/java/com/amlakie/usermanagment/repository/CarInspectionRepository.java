package com.amlakie.usermanagment.repository;

import com.amlakie.usermanagment.entity.Car;
import com.amlakie.usermanagment.entity.CarInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarInspectionRepository extends JpaRepository<CarInspection, Long> {
    List<CarInspection> findByCar_PlateNumber(String plateNumber);
    Optional<CarInspection> findFirstByCarOrderByInspectionDateDesc(Car car);

    // Check for existence by traversing the 'car' relationship
    boolean existsByCar_PlateNumber(String plateNumber);
}
