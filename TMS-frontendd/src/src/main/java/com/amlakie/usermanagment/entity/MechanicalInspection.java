package com.amlakie.usermanagment.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class MechanicalInspection {

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
    @OneToOne(mappedBy = "mechanical", fetch = FetchType.LAZY) // 'mappedBy' refers to the field name in CarInspection
    private CarInspection carInspection;
}