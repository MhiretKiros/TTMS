package com.amlakie.usermanagment.repository;

import com.amlakie.usermanagment.entity.Car;
import com.amlakie.usermanagment.entity.CarInspection;
import com.amlakie.usermanagment.entity.OrganizationCar;
import com.amlakie.usermanagment.entity.organization.OrganizationCarInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationCarInspectionRepository extends JpaRepository<OrganizationCarInspection, Long> {
    List<OrganizationCarInspection> findByOrganizationCar_PlateNumber(String plateNumber);
    Optional<OrganizationCarInspection> findFirstByOrganizationCarOrderByInspectionDateDesc(OrganizationCar organizationCar); // Corrected method
    boolean existsByOrganizationCar_PlateNumber(String plateNumber); // Corrected method


}
