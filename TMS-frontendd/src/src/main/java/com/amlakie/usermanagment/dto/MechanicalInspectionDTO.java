package com.amlakie.usermanagment.dto;

import com.amlakie.usermanagment.dto.organization.OrganizationMechanicalInspectionDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MechanicalInspectionDTO  {
    // Using primitive boolean implies it cannot be null
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
    // No need for @NotNull with primitive boolean,
    // as they default to false if not provided in JSON
    // (unless you configure Jackson differently).
}