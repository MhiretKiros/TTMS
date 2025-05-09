package com.amlakie.usermanagment.repository;

import com.amlakie.usermanagment.entity.Car;
import com.amlakie.usermanagment.entity.RentCar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentCarRepository extends JpaRepository<RentCar, Long> {
    Optional<RentCar> findByPlateNumber(String plateNumber);
    Optional<RentCar> findByFrameNo(String frameNo);
    List<RentCar> findByPlateNumberContainingOrCompanyNameContainingOrModelContainingOrVehiclesUserNameContaining(
            String plateNumber, String companyName, String model, String vehiclesUserName);
    boolean existsByPlateNumber(String plateNumber);
    boolean existsByFrameNo(String frameNo);
    List<RentCar> findByStatus(String requestStatus);

}