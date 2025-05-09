package com.amlakie.usermanagment.entity.organization;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
public class OrganizationMechanicalInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean engineCondition;
    private boolean enginePower;
    private boolean suspension;
    private boolean brakes;
    private boolean steering;
    private boolean gearbox;
    private boolean mileage;
    private boolean fuelGauge;
    private boolean tempGauge;
    private boolean oilGauge;

    // This is the OWNING side of the bidirectional relationship.
    // The foreign key 'organization_car_inspection_id' will be in THIS table.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_car_inspection_id") // Explicitly define the foreign key column name
    @ToString.Exclude // Prevent StackOverflowError in toString()
    @EqualsAndHashCode.Exclude // Prevent StackOverflowError in equals/hashCode
    private OrganizationCarInspection organizationCarInspection; // Corrected field name convention

    // The 'mappedBy' side belongs on the OrganizationCarInspection entity.
    // You should remove the other field (`orgCarInspection`) that had `mappedBy` here.

}