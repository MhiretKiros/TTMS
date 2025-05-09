package com.amlakie.usermanagment.dto.organization;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor; // Often useful with @NotNull fields

@Data
@NoArgsConstructor
@AllArgsConstructor // Can be helpful if you want to create instances with all fields
public class OrganizationMechanicalInspectionDTO {
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
}